import { NetworkConfig } from '@/types/contracts';

export const NETWORKS: Record<string, NetworkConfig> = {
  localhost: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
  },
  holesky: {
    chainId: 17000,
    name: 'Holesky Testnet',
    rpcUrl: process.env.NEXT_PUBLIC_HOLESKY_RPC_URL || 'https://ethereum-holesky.publicnode.com',
    blockExplorer: 'https://holesky.etherscan.io',
  },
};

export const DEFAULT_NETWORK = 'localhost';

export const SUPPORTED_CHAIN_IDS = Object.values(NETWORKS).map(network => network.chainId); 