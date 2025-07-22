'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider } from '@/lib/hooks/useWallet';
import { useContractEvents } from '@/lib/hooks/useContractEvents';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      retry: 2,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

function ContractEventsProvider() {
  useContractEvents();
  return null;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <ContractEventsProvider />
        {children}
      </WalletProvider>
    </QueryClientProvider>
  );
};
