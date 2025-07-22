import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from './useWallet';
import {
  getContract,
  formatError,
  waitForTransaction,
} from '@/lib/web3/provider';
import { GAS_LIMITS } from '@/constants/contracts';
import {
  User,
  Transaction,
  Approval,
  UserRole,
  TransactionStatus,
  ApprovalStatus,
} from '@/types/contracts';
import { toast } from 'sonner';

// Query keys
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

// User Management Hooks
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
        console.error('Error fetching user:', error);
        return null;
      }
    },
    enabled: !!provider && !!chainId && !!userAddress,
    staleTime: 30000, // 30 seconds
  });
};

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
      const tx = await contract.registerUser(walletAddress, name, email, role, {
        gasLimit: GAS_LIMITS.REGISTER_USER,
      });

      await waitForTransaction(tx.hash, signer.provider);
      return tx;
    },
    onSuccess: () => {
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

// Update User Role
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

// Transaction Management Hooks
export const useTransaction = (transactionId: number) => {
  const { provider, chainId } = useWallet();

  return useQuery({
    queryKey: [QUERY_KEYS.TRANSACTION, transactionId, chainId],
    queryFn: async (): Promise<Transaction | null> => {
      if (!provider || !chainId || transactionId < 0) return null;

      try {
        const contract = getContract('financialPlatform', chainId, provider);
        const txData = await contract.getTransaction(transactionId);

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

        return transactions.sort((a, b) => Number(b.timestamp - a.timestamp));
      } catch (error) {
        console.error('Error fetching user transactions:', error);
        return [];
      }
    },
    enabled: !!provider && !!chainId && !!targetAddress,
  });
};

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
    }) => {
      if (!signer || !chainId) throw new Error('Wallet not connected');

      const contract = getContract('financialPlatform', chainId, signer);
      const tx = await contract.createTransaction(to, amount, description, {
        gasLimit: GAS_LIMITS.CREATE_TRANSACTION,
      });

      await waitForTransaction(tx.hash, signer.provider);
      return tx;
    },
    onSuccess: () => {
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

// Complete Transaction
export const useCompleteTransaction = () => {
  const { signer, chainId } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: number) => {
      if (!signer || !chainId) throw new Error('Wallet not connected');
      const contract = getContract('financialPlatform', chainId, signer);
      const tx = await contract.completeTransaction(transactionId, {
        gasLimit: GAS_LIMITS.COMPLETE_TRANSACTION || 200_000,
      });
      await waitForTransaction(tx.hash, signer.provider);
      return tx;
    },
    onSuccess: () => {
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

// Approval Management Hooks
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
      const tx = await contract.processApproval(approvalId, approved, reason, {
        gasLimit: GAS_LIMITS.PROCESS_APPROVAL,
      });

      await waitForTransaction(tx.hash, signer.provider);
      return tx;
    },
    onSuccess: () => {
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

// Request Approval
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
      const tx = await contract.requestApproval(transactionId, reason, {
        gasLimit: GAS_LIMITS.REQUEST_APPROVAL || 200_000,
      });
      await waitForTransaction(tx.hash, signer.provider);
      return tx;
    },
    onSuccess: () => {
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

// Dashboard Metrics Hook
export const useDashboardMetrics = () => {
  const { provider, chainId, address } = useWallet();
  const { data: user } = useUser(address || '');

  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_METRICS, chainId],
    queryFn: async () => {
      if (!provider || !chainId) return null;

      try {
        const contract = getContract('financialPlatform', chainId, provider);

        const [transactionCount, approvalCount, userCount, pendingApprovals] =
          await Promise.all([
            contract.getTransactionCount(),
            contract.getApprovalCount(),
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
