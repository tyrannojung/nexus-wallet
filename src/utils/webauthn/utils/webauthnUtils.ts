import {
  CredentialCreationOptionsLargeBlob,
  CredentialRequestOptionsLargeBlob,
  AuthenticationExtensionsClientOutputsLargeBlob,
} from '@/types/webauthnLargeBlob';

export const createWebAuthnCredentialOptions = (
  id: string,
  name: string,
  challenge: Uint8Array,
  userId: Uint8Array,
  userName: string,
  displayName: string,
): CredentialCreationOptionsLargeBlob => ({
  publicKey: {
    challenge,
    rp: {
      name,
      id,
    },
    user: {
      id: userId,
      name: userName,
      displayName,
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
});

export const createWebAuthnRequestOptions = (
  id: string,
  challenge: ArrayBuffer,
  credentialId: ArrayBufferLike,
  blobData?: ArrayBuffer,
): CredentialRequestOptionsLargeBlob => ({
  publicKey: {
    challenge,
    allowCredentials: [
      {
        id: credentialId,
        transports: [] as AuthenticatorTransport[],
        type: 'public-key',
      },
    ],
    rpId: id,
    userVerification: 'preferred',
    extensions: {
      largeBlob: {
        write: blobData,
      },
    },
  },
});

export const checkLargeBlobSupport = (credential: PublicKeyCredential): boolean => {
  const extensionResults = credential.getClientExtensionResults() as AuthenticationExtensionsClientOutputsLargeBlob;
  return !!(extensionResults.largeBlob && (extensionResults.largeBlob.supported || extensionResults.largeBlob.written));
};
