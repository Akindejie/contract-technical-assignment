import { ContractAddresses } from '@/types/contracts';

// Contract addresses for different networks
export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  // Localhost (Hardhat)
  31337: {
    financialPlatform:
      process.env.NEXT_PUBLIC_FINANCIAL_PLATFORM_ADDRESS_LOCALHOST || '',
    mockToken: process.env.NEXT_PUBLIC_MOCK_TOKEN_ADDRESS_LOCALHOST || '',
  },
  // Holesky Testnet
  17000: {
    financialPlatform:
      process.env.NEXT_PUBLIC_FINANCIAL_PLATFORM_ADDRESS_HOLESKY || '',
    mockToken: process.env.NEXT_PUBLIC_MOCK_TOKEN_ADDRESS_HOLESKY || '',
  },
};

// Default gas limits for different operations
export const GAS_LIMITS = {
  REGISTER_USER: 200000,
  UPDATE_USER_ROLE: 100000,
  CREATE_TRANSACTION: 150000,
  REQUEST_APPROVAL: 100000,
  PROCESS_APPROVAL: 120000,
  COMPLETE_TRANSACTION: 150000,
} as const;
