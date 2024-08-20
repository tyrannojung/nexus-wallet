import base64url from 'base64url';
import {
  RegistrationResponseJSON as SimpleWebAuthnRegistrationResponseJSON,
  AuthenticatorAttestationResponseJSON,
} from '@simplewebauthn/typescript-types';
import { bufferToBase64URLString } from '@/utils/webauthn/erc4337/utils/bufferToBase64URLString';
import decodeRegistrationCredential from '@/utils/webauthn/erc4337/utils/decodeRegistrationCredential';
import { Member } from '@/utils/indexedDb/types';
import { storage } from '@/utils/indexedDb';

export const check = async () => {
  const challenge = new Uint8Array([1, 2, 3, 4]);
  const standardBase64 = base64url.encode(Buffer.from(challenge));
  console.log(`standardBase64: ${standardBase64}`);
  const challengeBuffer = base64url.toBuffer(standardBase64);
  const challengeHex = challengeBuffer.toString('hex');
  const userChallenge = `0x${challengeHex}`;
  console.log(`userChallenge: ${userChallenge}`); // 0x01020304
};

// 당신의 타입 정의
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
const convertToRegistrationResponseJSON = (regCredential: PublicKeyCredential): RegistrationResponseJSON => {
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

export const registerLocalPublicAccount = async (regCredential: PublicKeyCredential) => {
  console.log('🚀 ~ check2 ~ regCredential:', regCredential);

  const registrationResponseJSON = convertToRegistrationResponseJSON(regCredential);

  // 변환된 객체를 SimpleWebAuthn의 RegistrationResponseJSON으로 캐스팅
  const simpleWebAuthnRegistrationResponseJSON =
    registrationResponseJSON as unknown as SimpleWebAuthnRegistrationResponseJSON;
  const decodedPassKey = decodeRegistrationCredential(simpleWebAuthnRegistrationResponseJSON);

  const pubKeyCoordinates = [
    `0x${base64url
      .toBuffer(decodedPassKey.response.attestationObject.authData.parsedCredentialPublicKey?.x || '')
      .toString('hex')}`,
    `0x${base64url
      .toBuffer(decodedPassKey.response.attestationObject.authData.parsedCredentialPublicKey?.y || '')
      .toString('hex')}`,
  ];

  // const challengeOffsetRegex = new RegExp(
  //   `(.*)${Buffer.from(decodedPassKey.response.clientDataJSON.challenge).toString('hex')}`,
  // );
  // const challengePrefix = challengeOffsetRegex.exec(
  //   base64url.toBuffer(simpleWebAuthnRegistrationResponseJSON.response.clientDataJSON).toString('hex'),
  // )?.[1];

  // const newPush0 = decodedPassKey.response.attestationObject.authData.flagsMask;
  // // const newPush1 = `0x${base64url.toBuffer(simpleWebAuthnRegistrationResponseJSON.response.authenticatorData!).toString('hex')}`;
  // const newPush2 = `0x${base64url.toBuffer(simpleWebAuthnRegistrationResponseJSON.response.clientDataJSON).toString('hex')}`;
  // const newPush3 = '0x01020304'; //  new Uint8Array([9, 0, 1, 2])
  // const newPush4 = Buffer.from(challengePrefix || '', 'hex').length;

  // console.log(`const authenticatorDataFlagMask = "${newPush0}"`);
  // // console.log(`const authenticatorData = "${newPush1}"`);
  // console.log(`const clientData = "${newPush2}"`);
  // console.log(`const clientChallenge = "${newPush3}"`);
  // console.log(`const clientChallengeOffset = "${newPush4}"`);
  // console.log(`const pubKeyCoordinates = ["${pubKeyCoordinates[0]}", "${pubKeyCoordinates[1]}"]`);

  const memberInfo: Member = {
    id: 'testId',
    pubkCoordinates: pubKeyCoordinates,
    email: 'test@test.co.kr',
    name: 'test',
  };

  console.log(memberInfo);
  await storage.setItem('memberInfo', memberInfo);
};
