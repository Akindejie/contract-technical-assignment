import { ContractAddresses } from '@/types/contracts';

// Contract addresses for different networks
export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  // Localhost (Hardhat)
  31337: {
    financialPlatform:
      process.env.NEXT_PUBLIC_FINANCIAL_PLATFORM_ADDRESS_LOCALHOST ||
      '0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1',
    mockToken:
      process.env.NEXT_PUBLIC_MOCK_TOKEN_ADDRESS_LOCALHOST ||
      '0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44',
  },
  // Sepolia Testnet
  11155111: {
    financialPlatform:
      process.env.NEXT_PUBLIC_FINANCIAL_PLATFORM_ADDRESS_SEPOLIA || '',
    mockToken: process.env.NEXT_PUBLIC_MOCK_TOKEN_ADDRESS_SEPOLIA || '',
  },
};

// Default gas limits for different operations
export const GAS_LIMITS = {
  REGISTER_USER: 200000,
  UPDATE_USER_ROLE: 100000,
  CREATE_TRANSACTION: 1000000,
  REQUEST_APPROVAL: 500000,
  PROCESS_APPROVAL: 120000,
  COMPLETE_TRANSACTION: 150000,
} as const;
