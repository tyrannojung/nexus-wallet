import { ethers, Contract } from 'ethers';
import * as CONSTANTS from '@/constant/index';

// 해당 값 변경에 따라 동적으로 선택된다.
const selectNetwork = 'SEPOLIA';
const { ENTRYPOINT_ABI, SECP256K1_ABI, SECP256R1_ABI } = CONSTANTS;

const CHAIN_ID = selectNetwork === 'SEPOLIA' ? CONSTANTS.SEPOLIA : CONSTANTS.ARBITRUM_SEPOLIA;
const PROVIDER = selectNetwork === 'SEPOLIA' ? CONSTANTS.SEPOLIA_PROVIDER : CONSTANTS.ARBITRUM_SEPOLIA_PROVIDER;

const ENTRYPOINT_ADDRESS = CONSTANTS.EntryPoint;

const SECP256K1_ADDRESS =
  selectNetwork === 'SEPOLIA'
    ? CONSTANTS.SepoliaSecp256K1AccountFactory
    : CONSTANTS.ArbitrumSepoliaSecp256K1AccountFactory;

const SECP256R1_ADDRESS =
  selectNetwork === 'SEPOLIA'
    ? CONSTANTS.SepoliaSecp256R1AccountFactory
    : CONSTANTS.ArbitrumSepoliaSecp256R1AccountFactory;

const network = ethers.Network.from(CHAIN_ID);
const getProvider = (url: string) =>
  new ethers.JsonRpcProvider(url, network, {
    staticNetwork: network,
  });

export const provider = getProvider(PROVIDER);
export const entrypointContract = new Contract(ENTRYPOINT_ADDRESS, ENTRYPOINT_ABI.abi, provider);
export const secp256k1Contract = new Contract(SECP256K1_ADDRESS, SECP256K1_ABI.abi, provider);
export const secp256r1Contract = new Contract(SECP256R1_ADDRESS, SECP256R1_ABI.abi, provider);
