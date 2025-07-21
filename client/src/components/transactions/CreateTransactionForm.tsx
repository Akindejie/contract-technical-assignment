'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ethers } from 'ethers';
import { useCreateTransaction } from '@/lib/hooks/useContract';
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
  const createTransactionMutation = useCreateTransaction();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CreateTransactionFormData>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      to: '',
      amount: '',
      description: '',
    },
  });

  const watchedAmount = watch('amount');

  const onSubmit = async (data: CreateTransactionFormData) => {
    try {
      // Convert amount to Wei
      const amountInWei = ethers.parseEther(data.amount);

      await createTransactionMutation.mutateAsync({
        to: data.to,
        amount: amountInWei,
        description: data.description,
      });

      toast.success('Transaction created successfully!');
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating transaction:', error);
      // Error handling is done in the mutation hook
    }
  };

  const isLoading = isSubmitting || createTransactionMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Recipient Address */}
      <div className="space-y-2">
        <Label htmlFor="to">Recipient Address *</Label>
        <Input
          id="to"
          type="text"
          placeholder="0x..."
          {...register('to')}
          className={errors.to ? 'border-red-500' : ''}
          disabled={isLoading}
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
        <Label htmlFor="amount">Amount (ETH) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.000000000000000001"
          min="0"
          placeholder="0.0"
          {...register('amount')}
          className={errors.amount ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
        {watchedAmount && !errors.amount && (
          <p className="text-xs text-muted-foreground">
            ≈ {parseFloat(watchedAmount).toLocaleString()} ETH
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          type="text"
          placeholder="e.g., Payment for services, Salary, Reimbursement..."
          {...register('description')}
          className={errors.description ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Provide a clear description for this transaction
        </p>
      </div>

      <Separator />

      {/* Transaction Summary */}
      <div className="space-y-3 p-4 bg-muted rounded-lg">
        <h4 className="font-medium">Transaction Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recipient:</span>
            <span className="font-mono">{watch('to') || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">{watch('amount') || '0'} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Description:</span>
            <span className="max-w-40 truncate">
              {watch('description') || 'Not specified'}
            </span>
          </div>
        </div>
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            ⚠️ This transaction will require approval from a manager before
            execution
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isLoading}
          className="flex-1"
        >
          Reset
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Create Transaction
            </>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Transactions require manager approval before execution</p>
        <p>
          • Make sure the recipient address is correct - transactions cannot be
          reversed
        </p>
        <p>
          • You'll be notified when your transaction is approved or rejected
        </p>
      </div>
    </form>
  );
};
