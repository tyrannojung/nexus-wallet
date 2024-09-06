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
import { UserOperation } from '@/types/accountAbstraction';
import { estimateUserOperationGas, paymasterSponsorUserOperation, sendUserOperation } from './api';
import { signUserOp } from '@/utils/accountAbstraction/utils/secp256k1Sign';

export async function bundlerOperationk1(publicKey: `0x${string}`, privateKey: `0x${string}`): Promise<UserOperation> {
  const initCode = concat([
    SECP256K1_ADDRESS,
    encodeFunctionData({
      abi: [
        {
          inputs: [
            { name: 'owner', type: 'address' },
            { name: 'salt', type: 'uint256' },
          ],
          name: 'createAccount',
          outputs: [{ name: 'ret', type: 'address' }],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      args: [publicKey, BigInt(0)],
    }),
  ]);

  console.log(initCode);

  const senderAddress = await secp256k1Contract['getAddress(address, uint256)'](publicKey, 0);
  console.log('Calculated sender address:', senderAddress);

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
  userOperation.callData = '0x';
  userOperation.callGasLimit = '0x560c';
  userOperation.verificationGasLimit = '0x98129';
  userOperation.preVerificationGas = '0xEA60';
  userOperation.maxFeePerGas = '0x3B9ACA00';
  userOperation.maxPriorityFeePerGas = '0x3B9ACA00';
  userOperation.paymasterAndData = '0x';
  userOperation.signature =
    '0xa15569dd8f8324dbeabf8073fdec36d4b754f53ce5901e283c6de79af177dc94557fa3c9922cd7af2a96ca94402d35c39f266925ee6407aeb32b31d76978d4ba1c';

  const paymasterResultParam = await paymasterSponsorUserOperation(userOperation);
  console.log('paymaster_result_param====', paymasterResultParam);
  userOperation.paymasterAndData = paymasterResultParam.result;

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

  const userOpHash = await entrypointContract.getUserOpHash(userOperation);
  console.log('userOpHash======', userOpHash);
  userOperation.signature = userOpHash;

  const wallet = new ethers.Wallet(privateKey, provider);
  const operationResult = signUserOp(userOperation, wallet, ENTRYPOINT_ADDRESS, SEPOLIA);

  return operationResult;
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

  const userOpHash = await entrypointContract.getUserOpHash(userOperation);
  console.log('userOpHash======', userOpHash);
  userOperation.signature = userOpHash;

  return userOperation;
}

export async function bundlerSend(value: UserOperation): Promise<any> {
  try {
    const bundlerResultParam = await sendUserOperation(value);
    return bundlerResultParam;
  } catch (err) {
    console.error('Error occurred while sending bundler:', err);
    return false;
  }
}
