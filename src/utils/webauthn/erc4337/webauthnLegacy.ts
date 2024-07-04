'use server';

import { GenerateRegistrationOptionsOpts, generateRegistrationOptions } from '@simplewebauthn/server';
import { ORIGIN } from '@/constant';

// 계정 생성 옵션
const generateWebAuthnRegistrationOptions = async (name: string) => {
  const opts: GenerateRegistrationOptionsOpts = {
    rpName: 'SimpleWebAuthn Example',
    rpID: ORIGIN,
    userName: name,
    timeout: 60000,
    attestationType: 'direct',
    excludeCredentials: [],
    authenticatorSelection: {
      residentKey: 'discouraged',
    },
    /**
     * Support the two most common algorithms: ES256, and RS256
     */
    supportedAlgorithmIDs: [-7, -257],
  };

  const options = await generateRegistrationOptions(opts);
  console.log(options);
};

export default generateWebAuthnRegistrationOptions;
