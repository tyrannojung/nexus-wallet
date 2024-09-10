import { createWebAuthnCredentialOptions, checkLargeBlobSupport } from '@/utils/webauthn/utils/webauthnUtils';
import { RP_NAME, RP_IDENTIFIER, SIGNATURE_NAME } from '@/constant';
import { decodeAndSetupRegistration } from '@/utils/accountAbstraction';
import { storage, memberIndexedDb } from '@/utils/indexedDb';
import { WebauthnSignUpData } from '@/types/webauthn';
import { Member } from '@/types/member';

interface SignUpResult {
  largeBlobSupport?: boolean;
  regCredential?: PublicKeyCredential;
  signUpData?: WebauthnSignUpData;
}

const handleSignUp = async (): Promise<SignUpResult | null> => {
  try {
    const challenge = new Uint8Array([1, 2, 3, 4]);
    const userId = new Uint8Array([5, 6, 7, 8]);
    const options = createWebAuthnCredentialOptions(
      RP_IDENTIFIER,
      RP_NAME,
      challenge,
      userId,
      SIGNATURE_NAME,
      SIGNATURE_NAME,
    );

    // fido 상호 작용
    const regCredential = (await navigator.credentials.create({ publicKey: options.publicKey })) as PublicKeyCredential;
    const largeBlobSupport = checkLargeBlobSupport(regCredential);
    if (!largeBlobSupport) {
      return { largeBlobSupport: false };
    }

    // 데이터 직렬화
    const signUpData = await decodeAndSetupRegistration(regCredential);

    const memberInfo: Member = {
      id: 'testId',
      pubkCoordinates: [signUpData.xCoordinate, signUpData.yCoordinate],
      email: 'test@test.co.kr',
      name: 'test',
    };
    await memberIndexedDb.updateMemberInfo(memberInfo);

    if (signUpData) {
      await storage.setItem('regCredential', regCredential);
      return {
        largeBlobSupport: true,
        regCredential,
        signUpData,
      };
    }
  } catch (err) {
    return null;
  }
  return null;
};

export default handleSignUp;
