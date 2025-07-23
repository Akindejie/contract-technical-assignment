// Wallet context and provider for managing Ethereum wallet connection state in the app

'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  WalletState,
  connectWallet,
  disconnectWallet,
  switchNetwork,
} from '@/lib/web3/provider';

// Define the shape of the wallet context
interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Create the React context for wallet state
const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

// WalletProvider manages wallet connection state and provides it to the app
export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  // State for wallet connection details
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    provider: null,
    signer: null,
  });
  // Loading and error state for async wallet actions
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount, check if wallet is already connected (e.g., after page reload)
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === 'undefined' || !window.ethereum) return;

      try {
        // Request current accounts from MetaMask
        const accounts = (await window.ethereum.request({
          method: 'eth_accounts',
        })) as string[];
        if (accounts.length > 0) {
          await handleConnect(); // Auto-connect if already authorized
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkConnection();
  }, []);

  // Listen for account and network changes in MetaMask
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    // Handle account change (e.g., user switches account in MetaMask)
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        setWalletState(disconnectWallet()); // No accounts, disconnect
      } else if (walletState.address !== accounts[0]) {
        await handleConnect(); // Reconnect with new account
      }
    };

    // Handle network change (e.g., user switches chain in MetaMask)
    const handleChainChanged = async () => {
      if (walletState.isConnected) {
        await handleConnect(); // Reconnect to update chainId
      }
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);

    // Cleanup listeners on unmount
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged
        );
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [walletState.address, walletState.isConnected]);

  // Connect to wallet (MetaMask)
  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newWalletState = await connectWallet();
      setWalletState(newWalletState);
    } catch (error: unknown) {
      // Show a user-friendly error message
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet and clear state
  const handleDisconnect = () => {
    setWalletState(disconnectWallet());
    setError(null);
  };

  // Switch Ethereum network (chain) in MetaMask
  const handleSwitchNetwork = async (chainId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await switchNetwork(chainId);
      // The chainChanged event will trigger a reconnection
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to switch network';
      setError(errorMessage);
      console.error('Network switch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Provide wallet state and actions to children via context
  const contextValue: WalletContextType = {
    ...walletState,
    connect: handleConnect,
    disconnect: handleDisconnect,
    switchNetwork: handleSwitchNetwork,
    isLoading,
    error,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to access wallet context in components
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
