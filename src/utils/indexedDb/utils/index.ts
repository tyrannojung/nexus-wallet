import base64url from 'base64url';

import { AuthenticatorAttestationResponse, PublicKeyCredentialJSON } from '../types';

export const arrayBufferToBase64URL = (buffer: ArrayBuffer): string => base64url(Buffer.from(buffer));
const base64URLToArrayBuffer = (base64: string): ArrayBuffer => Uint8Array.from(base64url.toBuffer(base64)).buffer;

// 넣어 줄 때, PublicKeyCredential 타입 을 string 형식의 json으로 바꿔줌
export const publicKeyCredentialToJSON = (cred: PublicKeyCredential): PublicKeyCredentialJSON | null => {
  if (!cred) return null;
  const response = cred.response as AuthenticatorAttestationResponse;
  return {
    id: cred.id,
    type: cred.type,
    rawId: arrayBufferToBase64URL(cred.rawId),
    response: {
      attestationObject: arrayBufferToBase64URL(response.attestationObject),
      clientDataJSON: arrayBufferToBase64URL(response.clientDataJSON),
      transports: typeof response.getTransports === 'function' ? response.getTransports() : [],
    },
    authenticatorAttachment: cred.authenticatorAttachment ?? undefined,
    clientExtensionResults: cred.getClientExtensionResults(),
  };
};

// 꺼내올 때, json 을 PublicKeyCredential 객체 타입으로 바꿔서 보내줌
export const jsonToPublicKeyCredential = (json: PublicKeyCredentialJSON): PublicKeyCredential | null => {
  if (!json) return null;
  const response = {
    attestationObject: base64URLToArrayBuffer(json.response.attestationObject),
    clientDataJSON: base64URLToArrayBuffer(json.response.clientDataJSON),
    getTransports: () => json.response.transports,
  } as AuthenticatorAttestationResponse;

  return {
    id: json.id,
    type: json.type,
    rawId: base64URLToArrayBuffer(json.rawId),
    response,
    authenticatorAttachment: json.authenticatorAttachment,
    getClientExtensionResults: () => json.clientExtensionResults,
  } as PublicKeyCredential;
};
