// React hook for subscribing to smart contract events and updating app state/UI accordingly
import { useEffect } from 'react';
import { useWallet } from './useWallet';
import { getContract } from '@/lib/web3/provider';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from './useContract';
import {
  TransactionCreatedHandler,
  TransactionStatusUpdatedHandler,
  ApprovalRequestedHandler,
  ApprovalProcessedHandler,
  UserRegisteredHandler,
} from '@/types/contracts';

// Main hook to set up and clean up contract event listeners
export const useContractEvents = () => {
  const { provider, chainId, address } = useWallet();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only set up listeners if wallet and provider are available
    if (!provider || !chainId || !address) return;

    let contract: ReturnType<typeof getContract>;

    try {
      // Get the contract instance for the current network
      contract = getContract('financialPlatform', chainId, provider);
    } catch (error) {
      console.error('Failed to get contract for events:', error);
      return;
    }

    // --- Event Handlers ---

    // Handle TransactionCreated event
    const handleTransactionCreated: TransactionCreatedHandler = (
      transactionId,
      from,
      to,
      amount
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

      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_TRANSACTIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DASHBOARD_METRICS],
      });
    };

    // Handle TransactionStatusUpdated event
    const handleTransactionStatusUpdated: TransactionStatusUpdatedHandler = (
      transactionId,
      status
    ) => {
      console.log('🔔 TransactionStatusUpdated event:', {
        transactionId,
        status,
      });

      // Map status number to text
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

    // Handle ApprovalRequested event
    const handleApprovalRequested: ApprovalRequestedHandler = (
      approvalId,
      transactionId,
      requester
    ) => {
      console.log('🔔 ApprovalRequested event:', {
        approvalId,
        transactionId,
        requester,
      });

      // Notify requester
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

    // Handle ApprovalProcessed event
    const handleApprovalProcessed: ApprovalProcessedHandler = (
      approvalId,
      status,
      approver
    ) => {
      console.log('🔔 ApprovalProcessed event:', {
        approvalId,
        status,
        approver,
      });

      // Map status number to text
      const statusText =
        ['Pending', 'Approved', 'Rejected'][status] || 'Unknown';

      // Notify approver or general info
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

    // Handle UserRegistered event
    const handleUserRegistered: UserRegisteredHandler = (
      userId,
      walletAddress,
      name,
      role
    ) => {
      console.log('🔔 UserRegistered event:', {
        userId,
        walletAddress,
        name,
        role,
      });

      // Welcome notification for the new user
      if (walletAddress.toLowerCase() === address.toLowerCase()) {
        toast.success(`Welcome ${name}! Your account has been registered.`);
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DASHBOARD_METRICS],
      });
    };

    // --- Set up event listeners on the contract ---
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

    // --- Cleanup function to remove listeners when component unmounts or deps change ---
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
