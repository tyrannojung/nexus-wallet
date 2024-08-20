import { AuthenticatorAttestationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/typescript-types';
import { ClientDataJSON, decodeClientDataJSON } from './decodeClientDataJSON';
import { decodeAttestationObject } from './decodeAttestationObject';
import { AuthenticatorData, parseAuthData } from './parseAuthData';
import { ParsedAttestationStatement, parseAttestationStatement } from './parseAttestationStatement';

export default function decodeRegistrationCredential(credential: RegistrationResponseJSON): Omit<
  RegistrationResponseJSON,
  'response'
> & {
  response: Omit<AuthenticatorAttestationResponseJSON, 'clientDataJSON' | 'attestationObject'> & {
    clientDataJSON: ClientDataJSON;
    attestationObject: {
      attStmt: ParsedAttestationStatement;
      authData: AuthenticatorData;
    };
  };
} {
  const { response } = credential;

  if (!response.clientDataJSON || !response.attestationObject) {
    throw new Error('The "clientDataJSON" and/or "attestationObject" properties are missing from "response"');
  }

  const clientDataJSON = decodeClientDataJSON(response.clientDataJSON);
  const attestationObject = decodeAttestationObject(response.attestationObject);
  console.log('🚀 ~ attestationObject:', attestationObject);

  const authData = parseAuthData(attestationObject.authData);
  console.log(attestationObject.authData);
  console.log('🚀 ~ authData:', authData);
  const attStmt = parseAttestationStatement(attestationObject.attStmt);
  console.log('🚀 ~ attStmt:', attStmt);

  return {
    ...credential,
    response: {
      ...response,
      clientDataJSON,
      attestationObject: {
        ...attestationObject,
        attStmt,
        authData,
      },
    },
  };
}
