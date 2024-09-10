export enum AccountType {
  K1 = 'k1',
  R1 = 'r1',
}

export interface UserOperation {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

export interface UserOperationReceipt {
  userOpHash: string;
  sender: string;
  nonce: string;
  actualGasCost: string;
  actualGasUsed: string;
  success: boolean;
  logs: any[];
  receipt: {
    transactionHash: string;
    blockNumber: string;
    status: string;
  };
}
