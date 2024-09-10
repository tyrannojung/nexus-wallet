import {
  CredentialRequestOptionsLargeBlob,
  AuthenticationExtensionsClientOutputsLargeBlob,
} from '@/types/webauthnLargeBlob';
import { createWebAuthnRequestOptions, checkLargeBlobSupport } from '@/utils/webauthn/utils/webauthnUtils';
import { RP_IDENTIFIER } from '@/constant';
import { Member } from '@/types/member';
import { wallet } from '@/utils/viem';
import { memberIndexedDb } from '@/utils/indexedDb';
import { walletCreateOperation, bundlerSend } from '@/utils/accountAbstraction/bundler';
import { decodeAndSetupUserOperation } from '@/utils/accountAbstraction';
import { WebauthnSignInData } from '@/types/webauthn';
import { AccountType, UserOperationReceipt, UserOperation } from '@/types/accountAbstraction';
import { processUserOperations } from '@/utils/accountAbstraction/utils/getReceiptData';

interface SignInResult {
  fidoData?: WebauthnSignInData;
  accountAbstractionData?: UserOperationReceipt[];
  largeBlobSupport?: boolean;
}

export const handleSignInWrite = async (
  regCredential: PublicKeyCredential,
  member: Member,
): Promise<SignInResult | null> => {
  try {
    const updatedMember = { ...member };
    console.log('🚀 ~ updatedMember:', updatedMember);

    const userOperation = await walletCreateOperation(AccountType.R1, updatedMember);
    const valueBeforeSigning = userOperation.signature;
    // 16진수 문자열을 Buffer로 변환
    const bufferChallenge = Buffer.from(valueBeforeSigning.slice(2), 'hex');
    // Buffer를 ArrayBuffer로 변환
    const arrayBufferChallenge = bufferChallenge.buffer.slice(
      bufferChallenge.byteOffset,
      bufferChallenge.byteOffset + bufferChallenge.byteLength,
    );
    // 해당 챌린지를 fido에 서명 요청한다.
    console.log('arrayBufferChallenge===', arrayBufferChallenge);

    const createPrivateKey = wallet.createPrivateKey(); // main os entropy를 통해 eoa 생성해주는 함수
    const getPublicKey = wallet.getPublicKeyFromPrivateKey(createPrivateKey);
    updatedMember.eoa = getPublicKey;

    const blobBits = new TextEncoder().encode(createPrivateKey);
    const blob = Uint8Array.from(blobBits);
    const requestOptions = createWebAuthnRequestOptions(
      RP_IDENTIFIER,
      arrayBufferChallenge,
      regCredential.rawId,
      blob.buffer,
    );

    // fido 상호 작용
    const getCredential = (await navigator.credentials.get(requestOptions)) as PublicKeyCredential;

    const largeBlobSupport = checkLargeBlobSupport(getCredential);
    if (!largeBlobSupport) {
      return { largeBlobSupport: false };
    }

    const userOpk1 = await walletCreateOperation(AccountType.K1, updatedMember, createPrivateKey); // secp256k1-AA 생성
    const signInData = await decodeAndSetupUserOperation(getCredential, userOperation);
    const userOpr1 = signInData.userOperation; // secp256r1-AA 생성
    const userOperations: UserOperation[] = [userOpk1, userOpr1];
    const bundlerData = await bundlerSend(userOperations);
    const userOpReceipts = await processUserOperations(bundlerData);

    console.log('🚀 ~ userOpReceipt:', userOpReceipts);

    if (userOpReceipts.length > 0) {
      const updatedMemberInfo = await memberIndexedDb.updateMemberInfo({ eoa: getPublicKey });
      if (updatedMemberInfo) {
        return {
          largeBlobSupport: true,
          fidoData: signInData,
          accountAbstractionData: userOpReceipts,
        };
      }
    }
  } catch (err) {
    return null;
  }
  return null;
};

export const handleSignInRead = async (regCredential: PublicKeyCredential): Promise<boolean> => {
  try {
    const requestOptions: CredentialRequestOptionsLargeBlob = {
      publicKey: {
        challenge: new Uint8Array([9, 0, 1, 2]),
        allowCredentials: [
          {
            id: regCredential.rawId, // 이미 생성된 자격 증명의 ID 사용
            transports: (
              regCredential.response as AuthenticatorAttestationResponse
            ).getTransports() as AuthenticatorTransport[],
            type: 'public-key',
          },
        ],
        rpId: RP_IDENTIFIER,
        userVerification: 'required',
        extensions: {
          largeBlob: {
            read: true,
          },
        },
      },
    };

    const getCredential = (await navigator.credentials.get(requestOptions)) as PublicKeyCredential;
    console.log('getCredential ===', getCredential);

    const extensionResults =
      getCredential.getClientExtensionResults() as AuthenticationExtensionsClientOutputsLargeBlob;

    console.log('========extensionResults read===========');
    console.log(extensionResults);

    if (extensionResults.largeBlob && extensionResults.largeBlob.blob) {
      const blobBits = new Uint8Array(extensionResults.largeBlob.blob);

      console.log('Retrieved LargeBlob Data:', new TextDecoder().decode(blobBits));
      return true;
    }
    console.log('Failed to read large blob.');
    return false;
  } catch (err) {
    console.error('Error during credential retrieval:', err);
    return false;
  }
};
