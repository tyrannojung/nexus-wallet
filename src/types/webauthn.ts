// types.ts
export interface AuthenticationExtensionsClientInputsExtended extends AuthenticationExtensionsClientInputs {
  prf?: {
    eval?: {
      first: ArrayBuffer;
    };
  };
}

export interface AuthenticationExtensionsClientOutputsExtended extends AuthenticationExtensionsClientOutputs {
  prf?: {
    results: {
      first: ArrayBuffer;
    };
  };
}

export interface PublicKeyCredentialRequestOptionsExtended extends PublicKeyCredentialRequestOptions {
  extensions?: AuthenticationExtensionsClientInputsExtended;
}

export interface PublicKeyCredentialCreationOptionsExtended extends PublicKeyCredentialCreationOptions {
  extensions?: AuthenticationExtensionsClientInputsExtended;
}

export interface CredentialCreationOptions {
  publicKey: PublicKeyCredentialCreationOptionsExtended;
}

export interface CredentialRequestOptions {
  publicKey: PublicKeyCredentialRequestOptionsExtended;
}
