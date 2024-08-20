import base64url from 'base64url';
import { RegistrationResponseJSON as SimpleWebAuthnRegistrationResponseJSON } from '@simplewebauthn/typescript-types';
import { ethers } from 'ethers';

import decodeRegistrationCredential from '@/utils/accountAbstraction/utils/decodeRegistrationCredential';
import decodeAuthenticationCredential from '@/utils/accountAbstraction/utils/decodeAuthenticationCredential';
import authResponseToSigVerificationInput from '@/utils/accountAbstraction/utils/authResponseToSigVerificationInput';
import { convertToAuthenticationResponseJSON, convertToRegistrationResponseJSON } from './utils/actionUtils';

import { Member } from '@/types/member';
import { storage } from '@/utils/indexedDb';
import { UserOperation } from '@/types/accountAbstraction';
import { bundlerSend } from './bundler';

// export const check = async () => {
//   const challenge = new Uint8Array([1, 2, 3, 4]);
//   const standardBase64 = base64url.encode(Buffer.from(challenge));
//   console.log(`standardBase64: ${standardBase64}`);
//   const challengeBuffer = base64url.toBuffer(standardBase64);
//   const challengeHex = challengeBuffer.toString('hex');
//   const userChallenge = `0x${challengeHex}`;
//   console.log(`userChallenge: ${userChallenge}`); // 0x01020304
// };

export const registerLocalPublicAccount = async (regCredential: PublicKeyCredential): Promise<boolean> => {
  try {
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

    const memberInfo: Member = {
      id: 'testId',
      pubkCoordinates: pubKeyCoordinates,
      email: 'test@test.co.kr',
      name: 'test',
    };
    await storage.setItem('memberInfo', memberInfo);

    // 모든 작업이 성공적으로 완료된 경우 true 반환
    return true;
  } catch (error) {
    console.error('Failed to register local public account:', error);

    // 오류가 발생한 경우 false 반환
    return false;
  }
};

export const createAccountAbstraction = async (getCredential: PublicKeyCredential, userOperation: UserOperation) => {
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

  bundlerSend(updateUserOperation);
};
