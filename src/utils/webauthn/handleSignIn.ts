import {
  CredentialRequestOptionsLargeBlob,
  AuthenticationExtensionsClientOutputsLargeBlob,
} from '@/types/webauthnLargeBlob';
import { RP_IDENTIFIER } from '@/constant';
import { Member } from '@/types/member';
import { wallet } from '@/utils/viem';
import { storage } from '@/utils/indexedDb';
import { bundlerOperation, bundlerSend, bundlerOperationk1 } from '@/utils/accountAbstraction/bundler';
import { decodeAndSetupUserOperation } from '@/utils/accountAbstraction';
import { WebauthnSignInData } from '@/types/webauthn';
import { fetchUserOperationReceipt } from '@/utils/accountAbstraction/api';
import { UserOperationReceipt } from '@/types/accountAbstraction';

interface SignInResult {
  fidoData?: WebauthnSignInData;
  accountAbstractionData?: UserOperationReceipt;
  largeBlobSupport?: boolean;
}

export const handleSignInWrite = async (
  regCredential: PublicKeyCredential,
  member: Member,
): Promise<SignInResult | null> => {
  try {
    const userOperation = await bundlerOperation(member);
    const valueBeforeSigning = userOperation.signature;
    // 16진수 문자열을 Buffer로 변환
    const bufferChallenge = Buffer.from(valueBeforeSigning.slice(2), 'hex');
    // Buffer를 ArrayBuffer로 변환
    const arrayBufferChallenge = bufferChallenge.buffer.slice(
      bufferChallenge.byteOffset,
      bufferChallenge.byteOffset + bufferChallenge.byteLength,
    );
    // 해당 챌린지를 fido에 서명 요청한다.
    console.log('arrayBufferChallenge===', arrayBufferChallenge);

    const createPrivateKey = wallet.createPrivateKey(); // main os entropy를 통해 eoa 생성해주는 함수
    const getPublicKey = wallet.getPublicKeyFromPrivateKey(createPrivateKey);
    const blobBits = new TextEncoder().encode(createPrivateKey);
    const blob = Uint8Array.from(blobBits);
    const requestOptions: CredentialRequestOptionsLargeBlob = {
      publicKey: {
        challenge: arrayBufferChallenge,
        allowCredentials: [
          {
            id: regCredential.rawId,
            transports: [] as AuthenticatorTransport[],
            type: 'public-key',
          },
        ],
        rpId: RP_IDENTIFIER,
        userVerification: 'preferred',
        extensions: {
          largeBlob: {
            write: blob.buffer,
          },
        },
      },
    };
    // fido 상호 작용
    const getCredential = (await navigator.credentials.get(requestOptions)) as PublicKeyCredential;

    // 데이터 직렬화
    const signInData = await decodeAndSetupUserOperation(getCredential, userOperation);
    console.log('🚀 ~ signInData:', signInData);

    // secp256k1 계정 생성
    const userOpk1 = await bundlerOperationk1(getPublicKey, createPrivateKey);

    const bundlerData = await bundlerSend(userOpk1);
    console.log('🚀 ~ bundlerData:', bundlerData);
    //   {
    //     "jsonrpc": "2.0",
    //     "id": 1,
    //     "result": "0xbc9fa4290354bac3389e7505f6ef20a25a9ad5567244e671edd312215be1b89a"
    // }
    const userOpHash = bundlerData.result;

    const fetchReceiptWithTimeout = (hash: string, timeout: number): Promise<UserOperationReceipt | null> =>
      new Promise((resolve, reject) => {
        const start = Date.now();

        const checkReceipt = async () => {
          if (Date.now() - start > timeout) {
            return reject(new Error('Timeout: User operation receipt not found within the expected time.'));
          }

          const receipt = await fetchUserOperationReceipt(hash);
          if (receipt) {
            resolve(receipt); // 결과를 받으면 종료
          } else {
            setTimeout(checkReceipt, 3000); // 3초 대기 후 재귀 호출
          }
        };

        checkReceipt();
      });
    const userOpReceipt = await fetchReceiptWithTimeout(userOpHash, 60000);

    console.log('🚀 ~ userOpReceipt:', userOpReceipt);

    // fido 확장 large blob 체크
    const extensionResults =
      getCredential.getClientExtensionResults() as AuthenticationExtensionsClientOutputsLargeBlob;

    if (extensionResults.largeBlob && extensionResults.largeBlob.written && userOpReceipt) {
      const existingMemberInfo: Member = await storage.getItem('memberInfo');
      if (existingMemberInfo) {
        const updatedMemberInfo = {
          ...existingMemberInfo,
          eoa: getPublicKey,
        };
        await storage.setItem('memberInfo', updatedMemberInfo);
        return {
          largeBlobSupport: true,
          fidoData: signInData,
          accountAbstractionData: userOpReceipt,
        };
      }
    }
    return {
      largeBlobSupport: false,
    };
  } catch (err) {
    return null;
  }
};

export const handleSignInRead = async (regCredential: PublicKeyCredential): Promise<boolean> => {
  try {
    const requestOptions: CredentialRequestOptionsLargeBlob = {
      publicKey: {
        challenge: new Uint8Array([9, 0, 1, 2]),
        allowCredentials: [
          {
            id: regCredential.rawId, // 이미 생성된 자격 증명의 ID 사용
            transports: (
              regCredential.response as AuthenticatorAttestationResponse
            ).getTransports() as AuthenticatorTransport[],
            type: 'public-key',
          },
        ],
        rpId: RP_IDENTIFIER,
        userVerification: 'required',
        extensions: {
          largeBlob: {
            read: true,
          },
        },
      },
    };

    const getCredential = (await navigator.credentials.get(requestOptions)) as PublicKeyCredential;
    console.log('getCredential ===', getCredential);

    const extensionResults =
      getCredential.getClientExtensionResults() as AuthenticationExtensionsClientOutputsLargeBlob;

    console.log('========extensionResults read===========');
    console.log(extensionResults);

    if (extensionResults.largeBlob && extensionResults.largeBlob.blob) {
      const blobBits = new Uint8Array(extensionResults.largeBlob.blob);

      console.log('Retrieved LargeBlob Data:', new TextDecoder().decode(blobBits));
      return true;
    }
    console.log('Failed to read large blob.');
    return false;
  } catch (err) {
    console.error('Error during credential retrieval:', err);
    return false;
  }
};
