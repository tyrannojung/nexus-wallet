// types.ts
export interface AuthenticationExtensionsClientInputsLargeBlob extends AuthenticationExtensionsClientInputs {
  largeBlob?: {
    write?: ArrayBuffer;
    read?: boolean;
    support?: 'preferred' | 'required';
  };
}

export interface AuthenticationExtensionsClientOutputsLargeBlob extends AuthenticationExtensionsClientOutputs {
  largeBlob?: {
    read?: ArrayBuffer;
    written?: boolean;
    supported?: boolean;
    blob?: ArrayBuffer;
  };
}

export interface PublicKeyCredentialRequestOptionsExtendedLargeBlob extends PublicKeyCredentialRequestOptions {
  extensions?: AuthenticationExtensionsClientInputsLargeBlob;
}

export interface PublicKeyCredentialCreationOptionsExtendedLargeBlob extends PublicKeyCredentialCreationOptions {
  extensions?: AuthenticationExtensionsClientInputsLargeBlob;
}

export interface CredentialCreationOptionsLargeBlob {
  publicKey: PublicKeyCredentialCreationOptionsExtendedLargeBlob;
}

export interface CredentialRequestOptionsLargeBlob {
  publicKey: PublicKeyCredentialRequestOptionsExtendedLargeBlob;
}
