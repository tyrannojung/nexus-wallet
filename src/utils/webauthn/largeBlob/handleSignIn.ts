import {
  CredentialRequestOptionsLargeBlob,
  AuthenticationExtensionsClientOutputsLargeBlob,
} from '@/types/webauthnLargeBlob';
import { RP_IDENTIFIER } from '@/constant';
import { Member } from '@/types/member';
import { wallet } from '@/utils/viem';
import { storage } from '@/utils/indexedDb';

export const handleSignInWrite = async (regCredential: PublicKeyCredential): Promise<boolean> => {
  try {
    const createPrivateKey = wallet.createPrivateKey(); // main os entropy를 통해 eoa 생성해주는 함수
    const getPublicKey = wallet.getPublicKeyFromPrivateKey(createPrivateKey);
    const blobBits = new TextEncoder().encode(createPrivateKey);
    const blob = Uint8Array.from(blobBits);
    const requestOptions: CredentialRequestOptionsLargeBlob = {
      publicKey: {
        challenge: new Uint8Array([9, 0, 1, 2]), // 예시 값
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
    console.log('getCredential ===', getCredential);
    const extensionResults =
      getCredential.getClientExtensionResults() as AuthenticationExtensionsClientOutputsLargeBlob;
    console.log('========extensionResults===========');
    console.log(extensionResults);

    if (extensionResults.largeBlob && extensionResults.largeBlob.written) {
      // Large blob 성공적으로 작성됨
      console.log('Large blob was successfully written.');
      // member update
      const existingMemberInfo: Member = await storage.getItem('memberInfo');
      if (existingMemberInfo) {
        const updatedMemberInfo = {
          ...existingMemberInfo,
          pubk: getPublicKey,
        };
        await storage.setItem('memberInfo', updatedMemberInfo);
        return true;
      }
      console.log('Failed to write indexDB blob.');
      return false;
    }
    // Large blob 작성 실패
    console.log('Failed to write large blob.');
    return false;
  } catch (err) {
    console.error('Error during credential retrieval:', err);
    return false;
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
