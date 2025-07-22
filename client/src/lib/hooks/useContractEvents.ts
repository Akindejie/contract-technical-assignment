import { useEffect } from 'react';
import { useWallet } from './useWallet';
import { getContract } from '@/lib/web3/provider';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from './useContract';

export const useContractEvents = () => {
  const { provider, chainId, address } = useWallet();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!provider || !chainId || !address) return;

    let contract: any;

    try {
      contract = getContract('financialPlatform', chainId, provider);
    } catch (error) {
      console.error('Failed to get contract for events:', error);
      return;
    }

    // Transaction Created Event
    const handleTransactionCreated = (
      transactionId: bigint,
      from: string,
      to: string,
      amount: bigint,
      event: any
    ) => {
      console.log('🔔 TransactionCreated event:', {
        transactionId,
        from,
        to,
        amount,
      });

      // Show notification if user is involved
      if (from.toLowerCase() === address.toLowerCase()) {
        toast.success(`Transaction #${transactionId} created successfully!`);
      } else if (to.toLowerCase() === address.toLowerCase()) {
        toast.info(`You received a transaction #${transactionId}!`);
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_TRANSACTIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DASHBOARD_METRICS],
      });
    };

    // Transaction Status Updated Event
    const handleTransactionStatusUpdated = (
      transactionId: bigint,
      status: number,
      event: any
    ) => {
      console.log('🔔 TransactionStatusUpdated event:', {
        transactionId,
        status,
      });

      const statusText =
        ['Pending', 'Active', 'Completed', 'Rejected'][status] || 'Unknown';
      toast.info(
        `Transaction #${transactionId} status updated to ${statusText}`
      );

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_TRANSACTIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TRANSACTION, Number(transactionId)],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DASHBOARD_METRICS],
      });
    };

    // Approval Requested Event
    const handleApprovalRequested = (
      approvalId: bigint,
      transactionId: bigint,
      requester: string,
      event: any
    ) => {
      console.log('🔔 ApprovalRequested event:', {
        approvalId,
        transactionId,
        requester,
      });

      if (requester.toLowerCase() === address.toLowerCase()) {
        toast.info(
          `Approval #${approvalId} requested for transaction #${transactionId}`
        );
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PENDING_APPROVALS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DASHBOARD_METRICS],
      });
    };

    // Approval Processed Event
    const handleApprovalProcessed = (
      approvalId: bigint,
      status: number,
      approver: string,
      event: any
    ) => {
      console.log('🔔 ApprovalProcessed event:', {
        approvalId,
        status,
        approver,
      });

      const statusText =
        ['Pending', 'Approved', 'Rejected'][status] || 'Unknown';

      if (approver.toLowerCase() === address.toLowerCase()) {
        toast.success(
          `You ${statusText.toLowerCase()} approval #${approvalId}`
        );
      } else {
        toast.info(`Approval #${approvalId} was ${statusText.toLowerCase()}`);
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PENDING_APPROVALS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_TRANSACTIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DASHBOARD_METRICS],
      });
    };

    // User Registered Event
    const handleUserRegistered = (
      userId: bigint,
      walletAddress: string,
      name: string,
      role: number,
      event: any
    ) => {
      console.log('🔔 UserRegistered event:', {
        userId,
        walletAddress,
        name,
        role,
      });

      if (walletAddress.toLowerCase() === address.toLowerCase()) {
        toast.success(`Welcome ${name}! Your account has been registered.`);
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DASHBOARD_METRICS],
      });
    };

    // Set up event listeners
    try {
      contract.on('TransactionCreated', handleTransactionCreated);
      contract.on('TransactionStatusUpdated', handleTransactionStatusUpdated);
      contract.on('ApprovalRequested', handleApprovalRequested);
      contract.on('ApprovalProcessed', handleApprovalProcessed);
      contract.on('UserRegistered', handleUserRegistered);

      console.log('📡 Contract event listeners set up');
    } catch (error) {
      console.error('Failed to set up contract event listeners:', error);
    }

    // Cleanup function
    return () => {
      try {
        contract.off('TransactionCreated', handleTransactionCreated);
        contract.off(
          'TransactionStatusUpdated',
          handleTransactionStatusUpdated
        );
        contract.off('ApprovalRequested', handleApprovalRequested);
        contract.off('ApprovalProcessed', handleApprovalProcessed);
        contract.off('UserRegistered', handleUserRegistered);

        console.log('📡 Contract event listeners cleaned up');
      } catch (error) {
        console.error('Failed to clean up contract event listeners:', error);
      }
    };
  }, [provider, chainId, address, queryClient]);
};
