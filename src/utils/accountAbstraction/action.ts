import base64url from 'base64url';
import { RegistrationResponseJSON as SimpleWebAuthnRegistrationResponseJSON } from '@simplewebauthn/typescript-types';
import { ethers } from 'ethers';

import decodeRegistrationCredential from '@/utils/accountAbstraction/utils/decodeRegistrationCredential';
import decodeAuthenticationCredential from '@/utils/accountAbstraction/utils/decodeAuthenticationCredential';
import authResponseToSigVerificationInput from '@/utils/accountAbstraction/utils/authResponseToSigVerificationInput';
import { convertToAuthenticationResponseJSON, convertToRegistrationResponseJSON } from './utils/actionUtils';

import { UserOperation } from '@/types/accountAbstraction';
import { WebauthnSignUpData, WebauthnSignInData } from '@/types/webauthn';

export const decodeAndSetupRegistration = async (regCredential: PublicKeyCredential): Promise<WebauthnSignUpData> => {
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

  return {
    keyType: 'Elliptic Curve',
    algorithm: 'Elliptic Curve Digital Signature Algorithm with SHA-256',
    curve: 'NIST P-256',
    xCoordinate: pubKeyCoordinates[0],
    yCoordinate: pubKeyCoordinates[1],
  };
};

export const decodeAndSetupUserOperation = async (
  getCredential: PublicKeyCredential,
  userOperation: UserOperation,
): Promise<WebauthnSignInData> => {
  const authenticationResponseJSON = convertToAuthenticationResponseJSON(getCredential);
  const decodedPassKey = decodeAuthenticationCredential(authenticationResponseJSON);
  const ecVerifyInputs = authResponseToSigVerificationInput({}, authenticationResponseJSON.response);
  // Base64URL 문자열을 Buffer로 변환
  const bufferChallenge = base64url.toBuffer(decodedPassKey.response.clientDataJSON.challenge);
  const challengEncode = base64url.encode(bufferChallenge);
  const challengeOffsetRegex = new RegExp(`(.*)${Buffer.from(challengEncode).toString('hex')}`);
  const challengePrefix = challengeOffsetRegex.exec(
    base64url.toBuffer(authenticationResponseJSON.response.clientDataJSON).toString('hex'),
  )?.[1];
  const authenticatorDataFlagMask = decodedPassKey.response.authenticatorData.flagsMask;
  const authenticatorData = `0x${base64url.toBuffer(authenticationResponseJSON.response.authenticatorData!).toString('hex')}`;
  const clientData = `0x${base64url.toBuffer(authenticationResponseJSON.response.clientDataJSON).toString('hex')}`;
  const clientChallenge = userOperation.signature;
  const clientChallengeOffset = Buffer.from(challengePrefix || '', 'hex').length;
  const { signature } = ecVerifyInputs;
  const abiCoder = new ethers.AbiCoder();
  const challengeUpdate = abiCoder.encode(
    ['bytes1', 'bytes', 'bytes', 'bytes', 'uint256', 'uint256[2]'],
    [authenticatorDataFlagMask, authenticatorData, clientData, clientChallenge, clientChallengeOffset, signature],
  );
  const updateUserOperation: UserOperation = userOperation;
  updateUserOperation.signature = challengeUpdate;
  console.log('userOperation====', updateUserOperation);

  return {
    authenticatorDataFlagMask,
    authenticatorData,
    clientData,
    clientChallenge,
    clientChallengeOffset,
    signature: challengeUpdate,
    userOperation: updateUserOperation,
  };
};

// export const check = async () => {
//   const challenge = new Uint8Array([1, 2, 3, 4]);
//   const standardBase64 = base64url.encode(Buffer.from(challenge));
//   console.log(`standardBase64: ${standardBase64}`);
//   const challengeBuffer = base64url.toBuffer(standardBase64);
//   const challengeHex = challengeBuffer.toString('hex');
//   const userChallenge = `0x${challengeHex}`;
//   console.log(`userChallenge: ${userChallenge}`); // 0x01020304
// };
