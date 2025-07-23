'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider, useWallet } from '@/lib/hooks/useWallet';
import { useContractEvents } from '@/lib/hooks/useContractEvents';
import AppTour from '@/components/onboarding/AppTour';
import { useUser } from '@/lib/hooks/useContract';

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

export const Providers: React.FC<ProvidersProps> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <ProvidersInner>{children}</ProvidersInner>
    </WalletProvider>
  </QueryClientProvider>
);

const ProvidersInner: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isConnected, address } = useWallet();
  const { data: user } = useUser(address || '');
  let userRole: 'Admin' | 'Manager' | 'Regular' | undefined = undefined;
  if (user) {
    if (user.role === 2) userRole = 'Admin';
    else if (user.role === 1) userRole = 'Manager';
    else if (user.role === 0) userRole = 'Regular';
  }
  return (
    <>
      <ContractEventsProvider />
      <AppTour isConnected={isConnected} userRole={userRole} />
      {children}
    </>
  );
};
