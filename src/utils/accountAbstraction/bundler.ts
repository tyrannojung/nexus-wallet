import { ethers } from 'ethers';
import { concat, encodeFunctionData } from 'viem';
import {
  SECP256K1_ADDRESS,
  SECP256R1_ADDRESS,
  ENTRYPOINT_ADDRESS,
  entrypointContract,
  secp256k1Contract,
  secp256r1Contract,
  provider,
} from '@/config';
import { SEPOLIA } from '@/constant/blockchain/chainId';
import { Member } from '@/types/member';
import { AccountType, UserOperation } from '@/types/accountAbstraction';
import { estimateUserOperationGas, paymasterSponsorUserOperation, sendUserOperations } from '@/services/bundlerApi';
import { signUserOp } from '@/utils/accountAbstraction/utils/secp256k1Sign';

function initializeUserOperation(sender: string, initCode: `0x${string}`, type: AccountType): UserOperation {
  const signature =
    type === AccountType.K1
      ? '0xa15569dd8f8324dbeabf8073fdec36d4b754f53ce5901e283c6de79af177dc94557fa3c9922cd7af2a96ca94402d35c39f266925ee6407aeb32b31d76978d4ba1c'
      : '0x';
  return {
    sender,
    nonce: '0x0',
    initCode,
    callData: '0x',
    callGasLimit: '0x560c',
    verificationGasLimit: '0x98129',
    preVerificationGas: '0xEA60',
    maxFeePerGas: '0x3B9ACA00',
    maxPriorityFeePerGas: '0x3B9ACA00',
    paymasterAndData: '0x',
    signature,
  };
}

// preVerificationGas 업데이트 함수
function updatePreVerificationGas(preVerificationGas: string, increment: number): string {
  const decimalValue = parseInt(preVerificationGas, 16);
  const newDecimalValue = decimalValue + increment;
  return `0x${newDecimalValue.toString(16)}`;
}

// Paymaster 및 Bundler 처리 함수
async function processPaymasterAndBundler(userOperation: UserOperation) {
  // 매개변수 값을 함수에서 받아 직접 수정하는건 예측 가능성과 안전성을 떨어 뜨릴 수 있음
  // 매개변수의 재 할당 막는 것이 일반적으로 권장하므로 복사본을 만들어 수정하거나 새로운 객체를 반환하는 방법을 사용할 수 있음
  // userOperation의 복사본 생성
  const updatedUserOperation = { ...userOperation };

  const paymasterResultParam = await paymasterSponsorUserOperation(updatedUserOperation);
  console.log('paymaster_result_param====', paymasterResultParam);
  updatedUserOperation.paymasterAndData = paymasterResultParam.result;

  const bunderResultParam = await estimateUserOperationGas(updatedUserOperation);
  console.log('bunder_result_param====', bunderResultParam);
  updatedUserOperation.callGasLimit = bunderResultParam.result.callGasLimit;
  updatedUserOperation.verificationGasLimit = bunderResultParam.result.verificationGasLimit;
  updatedUserOperation.preVerificationGas = updatePreVerificationGas(
    bunderResultParam.result.preVerificationGas,
    10000,
  );

  return updatedUserOperation;
}

export async function walletCreateOperation(
  accountType: AccountType,
  member: Member,
  privateKey?: `0x${string}`,
): Promise<UserOperation> {
  const abiCoder = new ethers.AbiCoder();
  const pubKey =
    accountType === AccountType.K1
      ? (member.eoa as `0x${string}`)
      : (abiCoder.encode(['uint256[2]'], [member.pubkCoordinates]) as `0x${string}`);

  const initCode = concat([
    accountType === AccountType.K1 ? SECP256K1_ADDRESS : SECP256R1_ADDRESS,
    encodeFunctionData({
      abi: [
        {
          inputs: [
            {
              name: accountType === AccountType.K1 ? 'owner' : 'anPubkCoordinates',
              type: accountType === AccountType.K1 ? 'address' : 'bytes',
            },
            { name: 'salt', type: 'uint256' },
          ],
          name: 'createAccount',
          outputs: [{ name: 'ret', type: 'address' }],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      args: [pubKey, BigInt(0)],
    }),
  ]);

  const senderAddress =
    accountType === AccountType.K1
      ? await secp256k1Contract['getAddress(address, uint256)'](pubKey, 0)
      : await secp256r1Contract['getAddress(bytes, uint256)'](pubKey, 0);

  const initOperation = initializeUserOperation(senderAddress, initCode, accountType);
  // 페이마스터를 추가하고, 번들러 예측 가스비를 추가한 UserOeration
  const userOperation = await processPaymasterAndBundler(initOperation);

  const userOpHash = await entrypointContract.getUserOpHash(userOperation);
  userOperation.signature = userOpHash;

  if (accountType === AccountType.K1) {
    const wallet = new ethers.Wallet(privateKey as `0x${string}`, provider);
    return signUserOp(userOperation, wallet, ENTRYPOINT_ADDRESS, SEPOLIA);
  }
  return userOperation;
}

export async function bundlerOperation(value: Member): Promise<UserOperation> {
  const abiCoder = new ethers.AbiCoder();
  const encodePubkCoordinates = abiCoder.encode(['uint256[2]'], [value.pubkCoordinates]);

  const initCode = concat([
    SECP256R1_ADDRESS,
    encodeFunctionData({
      abi: [
        {
          inputs: [
            { name: 'anPubkCoordinates', type: 'bytes' },
            { name: 'salt', type: 'uint256' },
          ],
          name: 'createAccount',
          outputs: [{ name: 'ret', type: 'address' }],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      args: [encodePubkCoordinates as `0x${string}`, BigInt(0)],
    }),
  ]);

  // create2 결정론적인 주소 생성
  const senderAddress = await secp256r1Contract['getAddress(bytes, uint256)'](encodePubkCoordinates, 0);
  console.log('Calculated sender address:', senderAddress);

  // // 결정론 적인 주소를 통해, 잔고 전송 트랜잭션 생성
  // const to = '0x84207aCCB87EC578Bef5f836aeC875979C1ABA85'; // 내 개인 메타마스크 주소
  // const param = BigInt(1e8); // 0.0000000001 ether를 wei로 변환
  // const data = '0x'; // 빈 데이터

  // const callData = encodeFunctionData({
  //   abi: [
  //     {
  //       inputs: [
  //         { name: 'dest', type: 'address' },
  //         { name: 'value', type: 'uint256' },
  //         { name: 'func', type: 'bytes' },
  //       ],
  //       name: 'execute',
  //       outputs: [],
  //       stateMutability: 'payable', // 변경된 부분
  //       type: 'function',
  //     },
  //   ],
  //   args: [to, param, data],
  // });

  const userOperation: UserOperation = {
    sender: '',
    nonce: '',
    initCode: '',
    callData: '',
    callGasLimit: '',
    verificationGasLimit: '',
    preVerificationGas: '',
    maxFeePerGas: '',
    maxPriorityFeePerGas: '',
    paymasterAndData: '',
    signature: '',
  };

  userOperation.sender = senderAddress;
  userOperation.nonce = '0x0';
  userOperation.initCode = initCode;
  // userOperation.initCode = "0x";
  userOperation.callData = '0x';
  userOperation.callGasLimit = '0x560c';
  userOperation.verificationGasLimit = '0x98129';
  userOperation.preVerificationGas = '0xEA60';
  userOperation.maxFeePerGas = '0x3B9ACA00';
  userOperation.maxPriorityFeePerGas = '0x3B9ACA00';
  userOperation.paymasterAndData = '0x';
  // dummy value
  userOperation.signature = '0x';

  // paymaster 등록을 먼저 한다.
  const paymasterResultParam = await paymasterSponsorUserOperation(userOperation);
  console.log('paymaster_result_param====', paymasterResultParam);
  userOperation.paymasterAndData = paymasterResultParam.result;

  // bundler 가스 추정치를 업데이트 한다.
  const bunderResultParam = await estimateUserOperationGas(userOperation);
  console.log('bunder_result_param====', bunderResultParam);
  userOperation.callGasLimit = bunderResultParam.result.callGasLimit;
  userOperation.verificationGasLimit = bunderResultParam.result.verificationGasLimit;
  userOperation.preVerificationGas = bunderResultParam.result.preVerificationGas;

  // hex 값 업데이트
  console.log('preVerificationGas======', userOperation.preVerificationGas);
  const decimalValue = parseInt(userOperation.preVerificationGas, 16);
  // 10000을 더함
  const newDecimalValue = decimalValue + 10000;
  // 결과를 다시 16진수로 변환
  const newHexValue = `0x${newDecimalValue.toString(16)}`;
  console.log('newHexValue=====', newHexValue);
  userOperation.preVerificationGas = newHexValue;
  // ////////////////////////
  console.log('userOperation===', userOperation);

  const userOpHash = await entrypointContract.getUserOpHash(userOperation);
  console.log('userOpHash======', userOpHash);
  userOperation.signature = userOpHash;
  console.log('userOperation===', userOperation);
  return userOperation;
}

export async function bundlerSend(operations: UserOperation[]): Promise<any> {
  try {
    const bundlerResultParam = await sendUserOperations(operations);
    return bundlerResultParam;
  } catch (err) {
    console.error('Error occurred while sending bundler:', err);
    return false;
  }
}
