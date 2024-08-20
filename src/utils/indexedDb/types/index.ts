export interface AuthenticatorAttestationResponse extends AuthenticatorResponse {
  attestationObject: ArrayBuffer;
  clientDataJSON: ArrayBuffer;
  getTransports?: () => string[];
}

export interface PublicKeyCredentialJSON {
  id: string;
  type: string;
  rawId: string;
  response: {
    attestationObject: string;
    clientDataJSON: string;
    transports: string[];
  };
  authenticatorAttachment?: string;
  clientExtensionResults: any;
}

export interface Member {
  id: string;
  pubkCoordinates: string[];
  email: string;
  name: string;
}
