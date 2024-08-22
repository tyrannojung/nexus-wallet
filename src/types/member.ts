export interface Member {
  id: string;
  email: string;
  name: string;
  pubkCoordinates: string[];
  eoa?: string;
  secp256k1Account?: string;
  secp256r1Account?: string;
}
