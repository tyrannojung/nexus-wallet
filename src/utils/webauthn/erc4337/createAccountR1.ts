import {
  CredentialRequestOptionsLargeBlob,
  AuthenticationExtensionsClientOutputsLargeBlob,
} from '@/types/webauthnLargeBlob';
import { RP_IDENTIFIER } from '@/constant';
import { wallet } from '@/utils/viem';
import { createAccountAbstraction } from '@/utils/accountAbstraction';
import { bundlerOperation } from '@/utils/accountAbstraction/bundler';
import { Member } from '@/types/member';

// 계정 추상화 생성 요청
export const createAccountR1 = async (regCredential: PublicKeyCredential, member: Member): Promise<boolean> => {
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

    const createWallet = wallet.createPrivateKey(); // main os entropy를 통해 eoa 생성해주는 함수
    const blobBits = new TextEncoder().encode(createWallet);
    const blob = Uint8Array.from(blobBits);
    const requestOptions: CredentialRequestOptionsLargeBlob = {
      publicKey: {
        challenge: arrayBufferChallenge,
        allowCredentials: [
          {
            id: regCredential.rawId, // 이미 생성된 자격 증명의 ID 사용
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

    const getCredential = (await navigator.credentials.get(requestOptions)) as PublicKeyCredential;
    createAccountAbstraction(getCredential, userOperation);

    console.log('getCredential ===', getCredential);
    const extensionResults =
      getCredential.getClientExtensionResults() as AuthenticationExtensionsClientOutputsLargeBlob;
    console.log('========extensionResults===========');
    console.log(extensionResults);

    if (extensionResults.largeBlob && extensionResults.largeBlob.written) {
      // Large blob 성공적으로 작성됨
      console.log('Large blob was successfully written.');
      return true;
    }
    // Large blob 작성 실패
    console.log('Failed to write large blob.');
    return false;
  } catch (err) {
    console.error('Error during credential retrieval:', err);
    return false;
  }
};
