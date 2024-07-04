// webauthnUtils.ts
import base64url from 'base64url';
import {
  CredentialCreationOptions,
  CredentialRequestOptions,
  AuthenticationExtensionsClientOutputsExtended,
} from '@/types/webauthnPrf';

const handlePrfTest = async (): Promise<void> => {
  try {
    const saltbase = new Uint8Array(32).fill(1);

    const options: CredentialCreationOptions = {
      publicKey: {
        challenge: new Uint8Array([1, 2, 3, 4]),
        rp: {
          name: 'localhost PRF 데모',
          id: 'localhost',
        },
        user: {
          id: new Uint8Array([5, 6, 7, 8]),
          name: 'tyrannojung2',
          displayName: 'tyrannojung2',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          residentKey: 'required',
        },
        extensions: {
          prf: {
            eval: {
              first: new Uint8Array(saltbase).buffer,
            },
          },
        },
      },
    };

    const regCredential = (await navigator.credentials.create({ publicKey: options.publicKey })) as PublicKeyCredential;
    console.log('regCredential ===', regCredential);
    const extensionResults = regCredential.getClientExtensionResults();
    console.log('========extensionResults===========');
    console.log(extensionResults);

    const localRegCredential = JSON.stringify(regCredential);
    const getRegCredential = JSON.parse(localRegCredential);

    // 인증 정보 저장 없이 바로 PRF 평가
    const requestOptions: CredentialRequestOptions = {
      publicKey: {
        challenge: new Uint8Array([9, 0, 1, 2]), // 예시 값
        allowCredentials: [
          {
            id: base64url.toBuffer(getRegCredential.rawId).buffer, // 이미 생성된 자격 증명의 ID 사용
            transports: getRegCredential.response.transports, // 자격 증명의 전송 수단
            type: 'public-key',
          },
        ],
        rpId: 'localhost',
        userVerification: 'required',
        extensions: {
          prf: {
            eval: {
              first: new Uint8Array(saltbase).buffer, // 동일한 salt 사용
            },
          },
        },
      },
    };

    console.log(requestOptions);
    const auth1Credential = (await navigator.credentials.get(requestOptions)) as PublicKeyCredential;

    console.log(auth1Credential);

    const auth1ExtensionResults =
      auth1Credential.getClientExtensionResults() as AuthenticationExtensionsClientOutputsExtended;
    console.log('인증 확장 결과:', auth1ExtensionResults);

    if (auth1ExtensionResults.prf === undefined) {
      return;
    }
    const inputKeyMaterial = new Uint8Array(auth1ExtensionResults.prf.results.first);

    const keyDerivationKey = await crypto.subtle.importKey('raw', inputKeyMaterial, 'HKDF', false, ['deriveKey']);

    console.log('========keyDerivationKey===========');
    console.log(keyDerivationKey);

    // Additional operations with the derived key
    const label = 'pwa_symmetric_key';
    const info = new TextEncoder().encode(label);
    const salt = new Uint8Array();

    const encryptionKey = await crypto.subtle.deriveKey(
      { name: 'HKDF', info, salt, hash: 'SHA-256' },
      keyDerivationKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );

    console.log('========encryptionKey===========');
    console.log(encryptionKey);

    // Example encryption
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const privateKey = 'your-private-key-string'; // Replace with actual private key string

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce },
      encryptionKey,
      new TextEncoder().encode(privateKey),
    );

    console.log('========encrypted===========');
    console.log(encrypted);
    const encryptedBase64 = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(encrypted))));
    console.log('Encrypted Base64:', encryptedBase64);

    // Example decryption to verify
    const encryptedArray = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, encryptionKey, encryptedArray);

    const decodedMessage = new TextDecoder().decode(decrypted);
    console.log(`Decoded message: "${decodedMessage}"`);
  } catch (err) {
    console.error('Error during credential creation or retrieval:', err);
  }
};

export default handlePrfTest;
