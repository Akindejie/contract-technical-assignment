'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ethers } from 'ethers';
import {
  useCreateTransaction,
  useUserTransactions,
  useRequestApproval,
} from '@/lib/hooks/useContract';
import { useWallet } from '@/lib/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

const createTransactionSchema = z.object({
  to: z
    .string()
    .min(1, 'Recipient address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => {
      try {
        const num = parseFloat(val);
        return num > 0;
      } catch {
        return false;
      }
    }, 'Amount must be greater than 0'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters'),
});

type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;

interface CreateTransactionFormProps {
  onSuccess?: () => void;
}

export const CreateTransactionForm: React.FC<CreateTransactionFormProps> = ({
  onSuccess,
}) => {
  const { address } = useWallet();
  const createTransactionMutation = useCreateTransaction();
  const requestApprovalMutation = useRequestApproval();
  const { refetch: refetchUserTransactions } = useUserTransactions(
    address || ''
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<CreateTransactionFormData>({
    resolver: zodResolver(createTransactionSchema),
    mode: 'onChange',
  });

  const watchedValues = watch();

  const onSubmit = async (data: CreateTransactionFormData) => {
    try {
      const amountInWei = ethers.parseEther(data.amount);

      // Step 1: Create the transaction and get its ID
      const transactionId = await createTransactionMutation.mutateAsync({
        to: data.to,
        amount: amountInWei,
        description: data.description,
      });

      // Step 2: Automatically request approval for the new transaction
      try {
        await requestApprovalMutation.mutateAsync({
          transactionId,
          reason: 'Automatic approval request after transaction creation',
        });
        toast.success(
          'Transaction created and approval requested successfully!'
        );
      } catch (approvalError) {
        // Only show a gentle info toast, not a blocking error
        toast.info(
          'Transaction created, but automatic approval request failed. You can request approval manually from the transaction details page.'
        );
      }

      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating transaction:', error);
      // The useCreateTransaction hook already shows a toast on error
    }
  };

  const isLoading =
    createTransactionMutation.isPending || requestApprovalMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Recipient Address */}
        <div className="space-y-2">
          <Label htmlFor="to">Recipient Address</Label>
          <Input
            id="to"
            placeholder="0x..."
            {...register('to')}
            className={errors.to ? 'border-red-500' : ''}
          />
          {errors.to && (
            <p className="text-sm text-red-500">{errors.to.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Enter the Ethereum address of the recipient
          </p>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (ETH)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('amount')}
            className={errors.amount ? 'border-red-500' : ''}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
          <p className="text-xs text-muted-foreground">Amount to send in ETH</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="Payment for services..."
            {...register('description')}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Brief description of the transaction purpose
          </p>
        </div>
      </div>

      {/* Transaction Summary */}
      {watchedValues.to &&
        watchedValues.amount &&
        watchedValues.description && (
          <>
            <Separator />
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <h4 className="font-medium">Transaction Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-mono">
                    {watchedValues.to.slice(0, 6)}...
                    {watchedValues.to.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    {watchedValues.amount} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="max-w-32 truncate">
                    {watchedValues.description}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {createTransactionMutation.isPending
              ? 'Creating Transaction...'
              : 'Requesting Approval...'}
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Create Transaction
          </>
        )}
      </Button>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Transactions will automatically request approval after creation</p>
        <p>
          • Approved transactions can be completed by the transaction creator
        </p>
        <p>• Make sure the recipient address is correct before submitting</p>
      </div>
    </form>
  );
};
