import base64url from 'base64url';
import { AuthenticatorAttestationResponseJSON } from '@simplewebauthn/typescript-types';
import { bufferToBase64URLString } from '@/utils/accountAbstraction/utils/bufferToBase64URLString';

// 타입 정의
export interface RegistrationResponseJSON {
  id: string; // Base64URLString
  rawId: string; // Base64URLString
  response: AuthenticatorAttestationResponseJSON;
  authenticatorAttachment?: string; // AuthenticatorAttachment
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
  type: string; // PublicKeyCredentialType
}

// 타입 확장
interface ExtendedAuthenticatorResponse extends AuthenticatorResponse {
  getAuthenticatorData: () => ArrayBuffer;
}

interface ExtendedAuthenticatorAttestationResponse extends ExtendedAuthenticatorResponse {
  attestationObject: ArrayBuffer;
}

// PublicKeyCredential을 RegistrationResponseJSON으로 변환하는 함수
export const convertToRegistrationResponseJSON = (regCredential: PublicKeyCredential): RegistrationResponseJSON => {
  const id = base64url.encode(Buffer.from(regCredential.rawId));
  const rawId = base64url.encode(Buffer.from(regCredential.rawId));
  const extendedResponse = regCredential.response as ExtendedAuthenticatorAttestationResponse;

  const response: AuthenticatorAttestationResponseJSON = {
    clientDataJSON: base64url.encode(Buffer.from(regCredential.response.clientDataJSON)),
    attestationObject: base64url.encode(Buffer.from((regCredential.response as any).attestationObject)),
    authenticatorData: bufferToBase64URLString(extendedResponse.getAuthenticatorData()),
  };

  const authenticatorAttachment = regCredential.authenticatorAttachment || undefined;
  const clientExtensionResults = regCredential.getClientExtensionResults();
  const { type } = regCredential;

  return {
    id,
    rawId,
    response,
    authenticatorAttachment,
    clientExtensionResults,
    type,
  };
};

// 필요한 타입 정의
export interface AuthenticationResponseJSON {
  id: string; // Base64URLString
  rawId: string; // Base64URLString
  response: AuthenticatorAssertionResponseJSON;
  authenticatorAttachment?: AuthenticatorAttachment; // AuthenticatorAttachment 타입과 일치시킴
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
  type: 'public-key'; // "public-key" 리터럴 타입을 사용
}

export interface AuthenticatorAssertionResponseJSON {
  clientDataJSON: string; // Base64URLString
  authenticatorData: string; // Base64URLString
  signature: string; // Base64URLString
  userHandle?: string; // Base64URLString
}

// 기타 필요한 타입들
export interface ClientDataJSON {
  type: string;
  challenge: string;
  origin: string;
  crossOrigin?: boolean;
}

export interface AuthenticatorData {
  rpIdHash: string; // Base64URLString
  flags: number;
  signCount: number;
  attestedCredentialData?: ArrayBuffer;
  extensions?: any;
}

export const convertToAuthenticationResponseJSON = (getCredential: PublicKeyCredential): AuthenticationResponseJSON => {
  const id = base64url.encode(Buffer.from(getCredential.rawId));
  const rawId = base64url.encode(Buffer.from(getCredential.rawId));

  const response = getCredential.response as AuthenticatorAssertionResponse;

  const responseJSON: AuthenticatorAssertionResponseJSON = {
    clientDataJSON: base64url.encode(Buffer.from(response.clientDataJSON)),
    authenticatorData: base64url.encode(Buffer.from(response.authenticatorData)),
    signature: base64url.encode(Buffer.from(response.signature)),
    userHandle: response.userHandle ? base64url.encode(Buffer.from(response.userHandle)) : undefined,
  };

  const authenticatorAttachment = (getCredential.authenticatorAttachment as AuthenticatorAttachment) || undefined;
  const clientExtensionResults = getCredential.getClientExtensionResults();

  // 여기서 type을 "public-key"로 명시적으로 설정
  const type: 'public-key' = 'public-key';

  return {
    id,
    rawId,
    response: responseJSON,
    authenticatorAttachment,
    clientExtensionResults,
    type,
  };
};
