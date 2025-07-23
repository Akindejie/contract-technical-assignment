import { ContractAddresses } from '@/types/contracts';

// Contract addresses for different networks
export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  // Localhost (Hardhat)
  31337: {
    financialPlatform:
      process.env.NEXT_PUBLIC_FINANCIAL_PLATFORM_ADDRESS_LOCALHOST ||
      '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
    mockToken:
      process.env.NEXT_PUBLIC_MOCK_TOKEN_ADDRESS_LOCALHOST ||
      '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
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
  REGISTER_USER: 500000,
  UPDATE_USER_ROLE: 100000,
  CREATE_TRANSACTION: 1000000,
  REQUEST_APPROVAL: 500000,
  PROCESS_APPROVAL: 120000,
  COMPLETE_TRANSACTION: 150000,
} as const;
