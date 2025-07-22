import {
  ethers,
  BrowserProvider,
  JsonRpcSigner,
  Contract,
  JsonRpcApiProvider,
} from 'ethers';
import { NETWORKS, SUPPORTED_CHAIN_IDS } from '@/constants/networks';
import { CONTRACT_ADDRESSES } from '@/constants/contracts';
import { FINANCIAL_PLATFORM_ABI, MOCK_TOKEN_ABI } from '@/constants/abis';

// Wallet connection state
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
}

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return (
    typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
  );
};

// Get the current provider
export const getProvider = async (): Promise<BrowserProvider | null> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  if (!window.ethereum) {
    throw new Error('window.ethereum is not available');
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    return provider;
  } catch (error) {
    console.error('Error getting provider:', error);
    return null;
  }
};

// Get the current signer
export const getSigner = async (): Promise<JsonRpcSigner | null> => {
  const provider = await getProvider();
  if (!provider) return null;

  try {
    const signer = await provider.getSigner();
    return signer;
  } catch (error) {
    console.error('Error getting signer:', error);
    return null;
  }
};

// Connect to MetaMask
export const connectWallet = async (): Promise<WalletState> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  if (!window.ethereum) {
    throw new Error('window.ethereum is not available');
  }

  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    const provider = await getProvider();
    if (!provider) throw new Error('Failed to get provider');

    const signer = await getSigner();
    if (!signer) throw new Error('Failed to get signer');

    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    return {
      isConnected: true,
      address,
      chainId,
      provider,
      signer,
    };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

// Disconnect wallet
export const disconnectWallet = (): WalletState => {
  return {
    isConnected: false,
    address: null,
    chainId: null,
    provider: null,
    signer: null,
  };
};

// Switch network
export const switchNetwork = async (chainId: number): Promise<void> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  if (!window.ethereum) {
    throw new Error('window.ethereum is not available');
  }

  const hexChainId = '0x' + chainId.toString(16);

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
  } catch (switchError: unknown) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
      const network = Object.values(NETWORKS).find(
        (n) => n.chainId === chainId
      );
      if (!network) throw new Error('Network not supported');

      try {
        if (!window.ethereum) throw new Error('window.ethereum is not available');
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: hexChainId,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: network.blockExplorer
                ? [network.blockExplorer]
                : undefined,
            },
          ],
        });
      } catch (addError) {
        console.error('Error adding network:', addError);
        throw addError;
      }
    } else {
      console.error('Error switching network:', switchError);
      throw switchError;
    }
  }
};

// Check if current network is supported
export const isSupportedNetwork = (chainId: number): boolean => {
  return SUPPORTED_CHAIN_IDS.includes(chainId);
};

// Get contract instance
export const getContract = (
  contractName: 'financialPlatform' | 'mockToken',
  chainId: number,
  signerOrProvider: JsonRpcSigner | BrowserProvider
): Contract => {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(`Contract addresses not found for chain ID: ${chainId}`);
  }

  const address = addresses[contractName];
  if (!address) {
    throw new Error(
      `${contractName} address not found for chain ID: ${chainId}`
    );
  }

  const abi =
    contractName === 'financialPlatform'
      ? FINANCIAL_PLATFORM_ABI
      : MOCK_TOKEN_ABI;

  return new Contract(address, abi, signerOrProvider);
};

// Format error messages
export const formatError = (error: unknown): string => {
  if (
    error &&
    typeof error === 'object' &&
    'reason' in error &&
    typeof error.reason === 'string'
  ) {
    return error.reason;
  }
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
};

// Format address for display
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format token amount
export const formatTokenAmount = (
  amount: bigint,
  decimals: number = 18
): string => {
  return ethers.formatUnits(amount, decimals);
};

// Parse token amount
export const parseTokenAmount = (
  amount: string,
  decimals: number = 18
): bigint => {
  return ethers.parseUnits(amount, decimals);
};

// Wait for transaction confirmation
export const waitForTransaction = async (
  txHash: string,
  provider: BrowserProvider | JsonRpcApiProvider,
  confirmations: number = 1
): Promise<ethers.TransactionReceipt | null> => {
  try {
    const receipt = await provider.waitForTransaction(txHash, confirmations);
    return receipt;
  } catch (error) {
    console.error('Error waiting for transaction:', error);
    throw error;
  }
};
