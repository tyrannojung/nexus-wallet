export interface Member {
  id: string;
  pubk?: string;
  pubkCoordinates: string[];
  email: string;
  name: string;
}

export enum CryptoType {
  SECP256K1 = 'secp256k1',
  SECP256R1 = 'secp256r1',
}
