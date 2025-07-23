// React Query hooks and custom hooks for interacting with the FinancialPlatform smart contract
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import {
  getContract,
  formatError,
  waitForTransaction,
} from '@/lib/web3/provider';
import { FINANCIAL_PLATFORM_ABI } from '@/constants/abis';
import { GAS_LIMITS } from '@/constants/contracts';
import { User, Transaction, Approval, UserRole } from '@/types/contracts';
import { toast } from 'sonner';

// Query keys for caching and invalidating queries
export const QUERY_KEYS = {
  USER: 'user',
  USERS: 'users',
  TRANSACTION: 'transaction',
  TRANSACTIONS: 'transactions',
  USER_TRANSACTIONS: 'userTransactions',
  APPROVAL: 'approval',
  APPROVALS: 'approvals',
  PENDING_APPROVALS: 'pendingApprovals',
  DASHBOARD_METRICS: 'dashboardMetrics',
  TOKEN_BALANCE: 'tokenBalance',
} as const;

// =====================
// User Management Hooks
// =====================

/**
 * Fetches user data for a given wallet address from the smart contract.
 * Returns null if the user is not registered or if required params are missing.
 */
export const useUser = (address?: string) => {
  const { provider, chainId } = useWallet();
  const userAddress = address || '';

  return useQuery({
    queryKey: [QUERY_KEYS.USER, userAddress, chainId],
    queryFn: async (): Promise<User | null> => {
      console.log('👤 Fetching user data...', {
        provider: !!provider,
        chainId,
        userAddress,
      });
      if (!provider || !chainId || !userAddress) return null;

      try {
        const contract = getContract('financialPlatform', chainId, provider);
        const userData = await contract.getUser(userAddress);

        // Map contract data to User type
        return {
          id: userData.id,
          walletAddress: userData.walletAddress,
          name: userData.name,
          email: userData.email,
          role: Number(userData.role), // Convert BigInt to number for enum comparison
          isActive: userData.isActive,
          createdAt: userData.createdAt,
        };
      } catch (error) {
        console.error('Error fetching user for address:', userAddress, error);
        // If user is not registered, return null
        if (
          error instanceof Error &&
          error.message.includes('User not registered')
        ) {
          console.log('User not registered in contract:', userAddress);
        }
        return null;
      }
    },
    enabled: !!provider && !!chainId && !!userAddress,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Registers a new user on the smart contract.
 * Invalidates user and dashboard queries on success.
 */
export const useRegisterUser = () => {
  const { signer, chainId } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      walletAddress,
      name,
      email,
      role,
    }: {
      walletAddress: string;
      name: string;
      email: string;
      role: UserRole;
    }) => {
      if (!signer || !chainId) throw new Error('Wallet not connected');

      const contract = getContract('financialPlatform', chainId, signer);
      // Call registerUser on the contract
      const tx = await contract.registerUser(walletAddress, name, email, role, {
        gasLimit: GAS_LIMITS.REGISTER_USER,
      });

      await waitForTransaction(tx.hash, signer.provider);
      return tx;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DASHBOARD_METRICS],
      });
      toast.success('User registered successfully');
    },
    onError: (error) => {
      toast.error(formatError(error));
    },
  });
};

/**
 * Updates a user's role on the smart contract.
 * Invalidates user and users queries on success.
 */
export const useUpdateUserRole = () => {
  const { signer, chainId } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      walletAddress,
      role,
    }: {
      walletAddress: string;
      role: UserRole;
    }) => {
      if (!signer || !chainId) throw new Error('Wallet not connected');
      const contract = getContract('financialPlatform', chainId, signer);
      // Call updateUserRole on the contract
      const tx = await contract.updateUserRole(walletAddress, role, {
        gasLimit: GAS_LIMITS.UPDATE_USER_ROLE || 200_000,
      });
      await waitForTransaction(tx.hash, signer.provider);
      return tx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      toast.error(formatError(error));
    },
  });
};

// =========================
// Transaction Management Hooks
// =========================

/**
 * Fetches a single transaction by its ID from the smart contract.
 */
export const useTransaction = (transactionId: number) => {
  const { provider, chainId } = useWallet();

  return useQuery({
    queryKey: [QUERY_KEYS.TRANSACTION, transactionId, chainId],
    queryFn: async (): Promise<Transaction | null> => {
      if (!provider || !chainId || transactionId < 0) return null;

      try {
        const contract = getContract('financialPlatform', chainId, provider);
        const txData = await contract.getTransaction(transactionId);

        // Map contract data to Transaction type
        return {
          id: txData.id,
          from: txData.from,
          to: txData.to,
          amount: txData.amount,
          description: txData.description,
          status: txData.status,
          timestamp: txData.timestamp,
          approvalId: txData.approvalId,
        };
      } catch (error) {
        console.error('Error fetching transaction:', error);
        return null;
      }
    },
    enabled: !!provider && !!chainId && transactionId >= 0,
  });
};

/**
 * Fetches all transactions for a given user address from the smart contract.
 * Returns an array of Transaction objects.
 */
export const useUserTransactions = (userAddress?: string) => {
  const { provider, chainId, address } = useWallet();
  const targetAddress = userAddress || address;

  return useQuery({
    queryKey: [QUERY_KEYS.USER_TRANSACTIONS, targetAddress, chainId],
    queryFn: async (): Promise<Transaction[]> => {
      if (!provider || !chainId || !targetAddress) return [];

      try {
        const contract = getContract('financialPlatform', chainId, provider);
        const transactionIds = await contract.getUserTransactions(
          targetAddress
        );

        // Fetch each transaction by ID
        const transactions = await Promise.all(
          transactionIds.map(async (id: bigint) => {
            const txData = await contract.getTransaction(id);
            return {
              id: txData.id,
              from: txData.from,
              to: txData.to,
              amount: txData.amount,
              description: txData.description,
              status: txData.status,
              timestamp: txData.timestamp,
              approvalId: txData.approvalId,
            };
          })
        );

        // Sort transactions by timestamp (most recent first)
        return transactions.sort((a, b) => Number(b.timestamp - a.timestamp));
      } catch (error) {
        console.error('Error fetching user transactions:', error);
        return [];
      }
    },
    enabled: !!provider && !!chainId && !!targetAddress,
  });
};

/**
 * Fetches all transactions in the system (admin only).
 * Returns an array of Transaction objects.
 */
export const useAllTransactions = () => {
  const { provider, chainId } = useWallet();

  return useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, chainId],
    queryFn: async (): Promise<Transaction[]> => {
      if (!provider || !chainId) return [];

      try {
        const contract = getContract('financialPlatform', chainId, provider);
        const transactionIds = await contract.getAllTransactions();

        // Fetch each transaction by ID
        const transactions = await Promise.all(
          transactionIds.map(async (id: bigint) => {
            const txData = await contract.getTransaction(id);
            return {
              id: txData.id,
              from: txData.from,
              to: txData.to,
              amount: txData.amount,
              description: txData.description,
              status: txData.status,
              timestamp: txData.timestamp,
              approvalId: txData.approvalId,
            };
          })
        );

        // Sort transactions by timestamp (most recent first)
        return transactions.sort((a, b) => Number(b.timestamp - a.timestamp));
      } catch (error) {
        console.error('Error fetching all transactions:', error);
        return [];
      }
    },
    enabled: !!provider && !!chainId,
  });
};

/**
 * Creates a new transaction on the smart contract.
 * Invalidates transaction and dashboard queries on success.
 */
export const useCreateTransaction = () => {
  const { signer, chainId } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      to,
      amount,
      description,
    }: {
      to: string;
      amount: bigint;
      description: string;
    }): Promise<number> => {
      if (!signer || !chainId) throw new Error('Wallet not connected');

      const contract = getContract('financialPlatform', chainId, signer);
      const tx = await contract.createTransaction(to, amount, description, {
        gasLimit: GAS_LIMITS.CREATE_TRANSACTION,
      });

      // Wait for the transaction to be mined and get the receipt
      const receipt = await waitForTransaction(tx.hash, signer.provider);

      if (!receipt) {
        throw new Error('Transaction failed to be mined');
      }

      // Parse the receipt logs to find the TransactionCreated event
      const iface = new ethers.Interface(FINANCIAL_PLATFORM_ABI);
      let transactionId: number | null = null;

      for (const log of receipt.logs) {
        try {
          const parsedLog = iface.parseLog(log);
          if (parsedLog && parsedLog.name === 'TransactionCreated') {
            transactionId = Number(parsedLog.args.transactionId);
            break;
          }
        } catch (error) {
          // Ignore logs that are not from our contract
        }
      }

      if (transactionId === null) {
        throw new Error('Could not find TransactionCreated event');
      }

      return transactionId;
    },
    onSuccess: () => {
      // Invalidate queries to refresh transaction lists and dashboard
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_TRANSACTIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DASHBOARD_METRICS],
      });
      toast.success('Transaction created successfully');
    },
    onError: (error) => {
      toast.error(formatError(error));
    },
  });
};

/**
 * Completes a transaction (marks as completed) on the smart contract.
 * Only callable by authorized users (e.g., after approval).
 */
export const useCompleteTransaction = () => {
  const { signer, chainId } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: number) => {
      if (!signer || !chainId) throw new Error('Wallet not connected');
      const contract = getContract('financialPlatform', chainId, signer);
      // Call completeTransaction on the contract
      const tx = await contract.completeTransaction(transactionId, {
        gasLimit: GAS_LIMITS.COMPLETE_TRANSACTION || 200_000,
      });
      await waitForTransaction(tx.hash, signer.provider);
      return tx;
    },
    onSuccess: () => {
      // Invalidate queries to refresh transaction lists and dashboard
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_TRANSACTIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DASHBOARD_METRICS],
      });
      toast.success('Transaction completed successfully');
    },
    onError: (error) => {
      toast.error(formatError(error));
    },
  });
};

// =====================
// Approval Management Hooks
// =====================

/**
 * Fetches all pending approvals from the smart contract.
 * Refetches every 10 seconds for real-time updates.
 */
export const usePendingApprovals = () => {
  const { provider, chainId } = useWallet();

  return useQuery({
    queryKey: [QUERY_KEYS.PENDING_APPROVALS, chainId],
    queryFn: async (): Promise<Approval[]> => {
      console.log('🔍 Fetching pending approvals...', {
        provider: !!provider,
        chainId,
      });
      if (!provider || !chainId) return [];

      try {
        const contract = getContract('financialPlatform', chainId, provider);
        const approvalIds = await contract.getPendingApprovals();

        // Fetch each approval by ID
        const approvals = await Promise.all(
          approvalIds.map(async (id: bigint) => {
            const approvalData = await contract.getApproval(id);
            return {
              id: approvalData.id,
              transactionId: approvalData.transactionId,
              requester: approvalData.requester,
              approver: approvalData.approver,
              approvalType: approvalData.approvalType,
              status: approvalData.status,
              reason: approvalData.reason,
              timestamp: approvalData.timestamp,
            };
          })
        );

        // Sort approvals by timestamp (most recent first)
        return approvals.sort((a, b) => Number(b.timestamp - a.timestamp));
      } catch (error) {
        console.error('Error fetching pending approvals:', error);
        return [];
      }
    },
    enabled: !!provider && !!chainId,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });
};

/**
 * Processes an approval (approve or reject) for a transaction.
 * Only callable by authorized users (e.g., managers/admins).
 */
export const useProcessApproval = () => {
  const { signer, chainId } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      approvalId,
      approved,
      reason,
    }: {
      approvalId: number;
      approved: boolean;
      reason: string;
    }) => {
      if (!signer || !chainId) throw new Error('Wallet not connected');

      const contract = getContract('financialPlatform', chainId, signer);
      // Call processApproval on the contract
      const tx = await contract.processApproval(approvalId, approved, reason, {
        gasLimit: GAS_LIMITS.PROCESS_APPROVAL,
      });

      await waitForTransaction(tx.hash, signer.provider);
      return tx;
    },
    onSuccess: () => {
      // Invalidate queries to refresh approvals and dashboard
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PENDING_APPROVALS],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DASHBOARD_METRICS],
      });
      toast.success('Approval processed successfully');
    },
    onError: (error) => {
      toast.error(formatError(error));
    },
  });
};

/**
 * Requests approval for a transaction.
 * Only callable by authorized users (e.g., transaction creator).
 */
export const useRequestApproval = () => {
  const { signer, chainId } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      reason,
    }: {
      transactionId: number;
      reason: string;
    }) => {
      if (!signer || !chainId) throw new Error('Wallet not connected');
      const contract = getContract('financialPlatform', chainId, signer);
      // Call requestApproval on the contract
      const tx = await contract.requestApproval(transactionId, reason, {
        gasLimit: GAS_LIMITS.REQUEST_APPROVAL || 200_000,
      });
      await waitForTransaction(tx.hash, signer.provider);
      return tx;
    },
    onSuccess: () => {
      // Invalidate queries to refresh approvals and transactions
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PENDING_APPROVALS],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] });
      toast.success('Approval requested successfully');
    },
    onError: (error) => {
      toast.error(formatError(error));
    },
  });
};

/**
 * Fetches a single approval by its ID from the smart contract.
 */
export const useApproval = (approvalId?: number) => {
  const { provider, chainId } = useWallet();

  return useQuery({
    queryKey: [QUERY_KEYS.APPROVAL, approvalId, chainId],
    queryFn: async (): Promise<Approval | null> => {
      if (!provider || !chainId || !approvalId) return null;
      try {
        const contract = getContract('financialPlatform', chainId, provider);
        const approvalData = await contract.getApproval(approvalId);
        return {
          id: approvalData.id,
          transactionId: approvalData.transactionId,
          requester: approvalData.requester,
          approver: approvalData.approver,
          approvalType: approvalData.approvalType,
          status: approvalData.status,
          reason: approvalData.reason,
          timestamp: approvalData.timestamp,
        };
      } catch (error) {
        console.error('Error fetching approval:', error);
        return null;
      }
    },
    enabled: !!provider && !!chainId && !!approvalId,
  });
};

// =====================
// Dashboard Metrics Hook
// =====================

/**
 * Fetches dashboard metrics such as total transactions, users, and pending approvals.
 * Also returns the current user's role for UI logic.
 */
export const useDashboardMetrics = () => {
  const { provider, chainId, address } = useWallet();
  const { data: user } = useUser(address || '');

  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_METRICS, chainId],
    queryFn: async () => {
      if (!provider || !chainId) return null;

      try {
        const contract = getContract('financialPlatform', chainId, provider);

        // Fetch metrics in parallel
        const [transactionCount, userCount, pendingApprovals] =
          await Promise.all([
            contract.getTransactionCount(),
            contract.getUserCount(),
            contract.getPendingApprovals(),
          ]);

        return {
          totalTransactions: Number(transactionCount),
          pendingApprovals: pendingApprovals.length,
          totalUsers: Number(userCount),
          userRole: user?.role || UserRole.Regular,
        };
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        return null;
      }
    },
    enabled: !!provider && !!chainId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
