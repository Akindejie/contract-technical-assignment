import { NetworkConfig } from '@/types/contracts';

export const NETWORKS: Record<string, NetworkConfig> = {
  localhost: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
  },
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl:
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
      'https://sepolia.infura.io/v3/e7b13f19c0304f39aae6c5927bbfe96a',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
};

export const DEFAULT_NETWORK = 'localhost';

export const SUPPORTED_CHAIN_IDS = Object.values(NETWORKS).map(
  (network) => network.chainId
);
