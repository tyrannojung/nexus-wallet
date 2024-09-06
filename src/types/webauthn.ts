import { UserOperation } from '@/types/accountAbstraction';

export interface WebauthnSignUpData {
  keyType: string;
  algorithm: string;
  curve: string;
  xCoordinate: string;
  yCoordinate: string;
}

export interface WebauthnSignInData {
  authenticatorDataFlagMask: string;
  authenticatorData: string;
  clientData: string;
  clientChallenge: string;
  clientChallengeOffset: number;
  signature: string;
  userOperation: UserOperation;
}
