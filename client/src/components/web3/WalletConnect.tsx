'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useWallet } from '@/lib/hooks/useWallet';
import { NETWORKS } from '@/constants/networks';
import { formatAddress, isSupportedNetwork } from '@/lib/web3/provider';
import { Wallet, ChevronDown, AlertTriangle, CheckCircle } from 'lucide-react';

export const WalletConnect: React.FC = () => {
  const {
    isConnected,
    address,
    chainId,
    connect,
    disconnect,
    switchNetwork,
    isLoading,
    error,
  } = useWallet();

  const currentNetwork = chainId
    ? Object.values(NETWORKS).find((n) => n.chainId === chainId)
    : null;
  const isNetworkSupported = chainId ? isSupportedNetwork(chainId) : false;

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2">
        {error && (
          <Badge variant="destructive" className="text-xs">
            {error}
          </Badge>
        )}
        <Button
          onClick={connect}
          disabled={isLoading}
          size="sm"
          className="wallet-connect-btn"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Network Status */}
      {chainId && (
        <Badge
          variant={isNetworkSupported ? 'default' : 'destructive'}
          className="text-xs"
        >
          {isNetworkSupported ? (
            <CheckCircle className="w-3 h-3 mr-1" />
          ) : (
            <AlertTriangle className="w-3 h-3 mr-1" />
          )}
          {currentNetwork?.name || `Chain ${chainId}`}
        </Badge>
      )}

      {/* Wallet Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            <Wallet className="w-4 h-4 mr-2" />
            {formatAddress(address || '')}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-medium">
            Connected Account
          </div>
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            {address}
          </div>

          <DropdownMenuSeparator />

          <div className="px-2 py-1.5 text-sm font-medium">Switch Network</div>

          {Object.values(NETWORKS).map((network) => (
            <DropdownMenuItem
              key={network.chainId}
              onClick={() => switchNetwork(network.chainId)}
              disabled={chainId === network.chainId || isLoading}
              className="text-xs"
            >
              <div className="flex items-center justify-between w-full">
                <span>{network.name}</span>
                {chainId === network.chainId && (
                  <CheckCircle className="w-3 h-3" />
                )}
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={disconnect}
            className="text-destructive focus:text-destructive"
          >
            Disconnect Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
