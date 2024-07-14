import {
  CredentialCreationOptionsLargeBlob,
  AuthenticationExtensionsClientOutputsLargeBlob,
} from '@/types/webauthnLargeBlob';
import { RP_NAME, RP_IDENTIFIER, SIGNATURE_NAME } from '@/constant';
// import { check2 } from '../erc4337';

const handleSignUp = async (): Promise<PublicKeyCredential | null> => {
  try {
    const options: CredentialCreationOptionsLargeBlob = {
      publicKey: {
        challenge: new Uint8Array([1, 2, 3, 4]),
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
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          residentKey: 'preferred', // 또는 'required'
        },
        extensions: {
          largeBlob: {
            support: 'preferred', // 또는 'required'
          },
        },
        attestation: 'direct',
      },
    };

    const regCredential = (await navigator.credentials.create({ publicKey: options.publicKey })) as PublicKeyCredential;
    console.log('regCredential ===', regCredential);
    // check2(regCredential);

    const extensionResults =
      regCredential.getClientExtensionResults() as AuthenticationExtensionsClientOutputsLargeBlob;
    console.log('========extensionResults===========');
    console.log(extensionResults);

    if (extensionResults.largeBlob && extensionResults.largeBlob.supported) {
      console.log('Large blob is supported for this credential.');
    } else {
      console.log('Large blob is not supported.');
    }

    return regCredential;
  } catch (err) {
    console.error('Error during credential creation or retrieval:', err);
    return null;
  }
};

export default handleSignUp;
