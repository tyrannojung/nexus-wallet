import {
  CredentialCreationOptionsLargeBlob,
  AuthenticationExtensionsClientOutputsLargeBlob,
} from '@/types/webauthnLargeBlob';
import { RP_NAME, RP_IDENTIFIER, SIGNATURE_NAME } from '@/constant';
import { registerLocalPublicAccount } from '@/utils/accountAbstraction';
import { storage } from '@/utils/indexedDb';

const handleSignUp = async (): Promise<PublicKeyCredential | null> => {
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

    const regCredential = (await navigator.credentials.create({ publicKey: options.publicKey })) as PublicKeyCredential;
    registerLocalPublicAccount(regCredential);

    const extensionResults =
      regCredential.getClientExtensionResults() as AuthenticationExtensionsClientOutputsLargeBlob;

    if (extensionResults.largeBlob && extensionResults.largeBlob.supported) {
      console.log('Large blob is supported for this credential.');
      await storage.setItem('regCredential', regCredential);
      return regCredential;
    }
    console.log('Large blob is not supported.');
    return null;
  } catch (err) {
    console.error('Error during credential creation or retrieval:', err);
    return null;
  }
};

export default handleSignUp;
