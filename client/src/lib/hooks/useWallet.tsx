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
  isSupportedNetwork,
} from '@/lib/web3/provider';

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    provider: null,
    signer: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === 'undefined' || !window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
        if (accounts.length > 0) {
          await handleConnect();
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkConnection();
  }, []);

  // Listen for account and network changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        setWalletState(disconnectWallet());
      } else if (walletState.address !== accounts[0]) {
        await handleConnect();
      }
    };

    const handleChainChanged = async (chainId: string) => {
      const newChainId = parseInt(chainId, 16);
      if (walletState.isConnected) {
        await handleConnect();
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged
        );
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [walletState.address, walletState.isConnected]);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newWalletState = await connectWallet();
      setWalletState(newWalletState);
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setWalletState(disconnectWallet());
    setError(null);
  };

  const handleSwitchNetwork = async (chainId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await switchNetwork(chainId);
      // The chainChanged event will trigger a reconnection
    } catch (error: any) {
      setError(error.message || 'Failed to switch network');
      console.error('Network switch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
