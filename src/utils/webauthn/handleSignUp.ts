import {
  CredentialCreationOptionsLargeBlob,
  AuthenticationExtensionsClientOutputsLargeBlob,
} from '@/types/webauthnLargeBlob';
import { RP_NAME, RP_IDENTIFIER, SIGNATURE_NAME } from '@/constant';
import { decodeAndSetupRegistration } from '@/utils/accountAbstraction';
import { storage } from '@/utils/indexedDb';
import { WebauthnSignUpData } from '@/types/webauthn';
import { Member } from '@/types/member';

interface SignUpResult {
  largeBlobSupport?: boolean;
  regCredential?: PublicKeyCredential;
  signUpData?: WebauthnSignUpData;
}

const handleSignUp = async (): Promise<SignUpResult | null> => {
  try {
    const options: CredentialCreationOptionsLargeBlob = {
      publicKey: {
        challenge: new Uint8Array([1, 2, 3, 4]), // 임의 값
        rp: {
          name: RP_NAME,
          id: RP_IDENTIFIER,
        },
        user: {
          id: new Uint8Array([5, 6, 7, 8]),
          name: SIGNATURE_NAME,
          displayName: SIGNATURE_NAME,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' },
        ],
        authenticatorSelection: {
          residentKey: 'preferred',
        },
        extensions: {
          largeBlob: {
            support: 'preferred',
          },
        },
        attestation: 'direct',
      },
    };

    // fido 상호 작용
    const regCredential = (await navigator.credentials.create({ publicKey: options.publicKey })) as PublicKeyCredential;

    // 데이터 직렬화
    const signUpData = await decodeAndSetupRegistration(regCredential);

    const memberInfo: Member = {
      id: 'testId',
      pubkCoordinates: [signUpData.xCoordinate, signUpData.yCoordinate],
      email: 'test@test.co.kr',
      name: 'test',
    };
    await storage.setItem('memberInfo', memberInfo);

    // fido 확장 large blob 체크
    const extensionResults =
      regCredential.getClientExtensionResults() as AuthenticationExtensionsClientOutputsLargeBlob;

    if (extensionResults.largeBlob && extensionResults.largeBlob.supported && signUpData) {
      await storage.setItem('regCredential', regCredential);
      return {
        largeBlobSupport: true,
        regCredential,
        signUpData,
      };
    }
    return {
      largeBlobSupport: false,
    };
  } catch (err) {
    return null;
  }
};

export default handleSignUp;
