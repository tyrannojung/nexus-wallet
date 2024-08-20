import { generatePrivateKey, privateKeyToAccount, generateMnemonic, mnemonicToAccount, english } from 'viem/accounts';

const createPrivateKey = (): `0x${string}` => {
  //  키생성
  const privateKey = generatePrivateKey();
  console.log('🚀 ~ createPrivateKey ~ privateKey:', privateKey);
  return privateKey;
  // 주소 가져오기
};

const getPublicKeyFromPrivateKey = (privateKey: `0x${string}`) => {
  const account = privateKeyToAccount(privateKey);
  console.log('🚀 ~ getPrivateKeyFromAddress ~ account:', account);

  return account.address;
};

const createMnemonic = (): string => {
  // 니모닉 생성
  const mnemonic = generateMnemonic(english);
  return mnemonic;
};

const getAccountFromMnemonic = (mnemonic: string) => {
  const account = mnemonicToAccount(mnemonic);

  return account.address;
};

export const wallet = { createPrivateKey, getPublicKeyFromPrivateKey, createMnemonic, getAccountFromMnemonic };
