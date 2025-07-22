'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@/lib/hooks/useWallet';
import {
  useTransaction,
  useUser,
  useCompleteTransaction,
  useRequestApproval,
} from '@/lib/hooks/useContract';
import { TransactionStatus, UserRole } from '@/types/contracts';
import { formatTokenAmount, formatAddress } from '@/lib/web3/provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  Hash,
  ArrowRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const getStatusConfig = (status: TransactionStatus) => {
  switch (status) {
    case TransactionStatus.Pending:
      return {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
      };
    case TransactionStatus.Active:
      return {
        label: 'Active',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: AlertCircle,
      };
    case TransactionStatus.Completed:
      return {
        label: 'Completed',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
      };
    case TransactionStatus.Rejected:
      return {
        label: 'Rejected',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
      };
    default:
      return {
        label: 'Unknown',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: AlertCircle,
      };
  }
};

export default function TransactionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, address } = useWallet();
  const { data: user } = useUser(address || '');
  const completeTransactionMutation = useCompleteTransaction();
  const requestApprovalMutation = useRequestApproval();
  const [isRequestDialogOpen, setIsRequestDialogOpen] = React.useState(false);
  const [approvalReason, setApprovalReason] = React.useState('');

  const transactionId = params.id as string;
  const { data: transaction, isLoading } = useTransaction(
    Number(transactionId)
  );

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to view transaction details
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            Loading transaction details...
          </p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
              Transaction Not Found
            </CardTitle>
            <CardDescription>
              The requested transaction could not be found or you don't have
              permission to view it
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(transaction.status);
  const StatusIcon = statusConfig.icon;
  const isOwner = transaction.from.toLowerCase() === address?.toLowerCase();
  const isRecipient = transaction.to.toLowerCase() === address?.toLowerCase();
  const canView =
    isOwner ||
    isRecipient ||
    user?.role === UserRole.Manager ||
    user?.role === UserRole.Admin;

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to view this transaction
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Helper: Show request approval if owner, pending, and approvalId is 0
  const canRequestApproval =
    isOwner &&
    transaction.status === TransactionStatus.Pending &&
    transaction.approvalId.toString() === '0';

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">
            Transaction Details
          </h2>
          <p className="text-muted-foreground">
            Transaction #{transaction.id.toString()}
          </p>
        </div>
        <Badge className={`${statusConfig.color} flex items-center`}>
          <StatusIcon className="w-4 h-4 mr-1" />
          {statusConfig.label}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Transaction Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hash className="w-5 h-5 mr-2" />
              Transaction Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-mono text-lg font-semibold">
                  {formatTokenAmount(transaction.amount)} ETH
                </span>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">From</span>
                <div className="text-right">
                  <div className="font-mono text-sm">
                    {formatAddress(transaction.from)}
                  </div>
                  {isOwner && (
                    <Badge variant="outline" className="text-xs mt-1">
                      You
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">To</span>
                <div className="text-right">
                  <div className="font-mono text-sm">
                    {formatAddress(transaction.to)}
                  </div>
                  {isRecipient && (
                    <Badge variant="outline" className="text-xs mt-1">
                      You
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Description
                </span>
                <span className="text-sm max-w-48 text-right">
                  {transaction.description}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(
                    Number(transaction.timestamp) * 1000
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <StatusIcon className="w-5 h-5 mr-2" />
              Status & History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* Current Status */}
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Current Status</span>
                  <Badge className={statusConfig.color}>
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {transaction.status === TransactionStatus.Pending &&
                    'Transaction is waiting for approval from a manager.'}
                  {transaction.status === TransactionStatus.Active &&
                    'Transaction has been approved and is ready to be completed.'}
                  {transaction.status === TransactionStatus.Completed &&
                    'Transaction has been successfully completed.'}
                  {transaction.status === TransactionStatus.Rejected &&
                    'Transaction has been rejected and cannot be completed.'}
                </p>
              </div>

              {/* Status History */}
              <div>
                <h4 className="font-medium mb-3">Transaction History</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Transaction Created</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          Number(transaction.timestamp) * 1000
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {transaction.status !== TransactionStatus.Pending && (
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          transaction.status === TransactionStatus.Rejected
                            ? 'bg-red-500'
                            : 'bg-green-500'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {transaction.status === TransactionStatus.Rejected
                            ? 'Transaction Rejected'
                            : 'Transaction Approved'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Processed by manager
                        </p>
                      </div>
                    </div>
                  )}

                  {transaction.status === TransactionStatus.Completed && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Transaction Completed
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Funds transferred successfully
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {canRequestApproval && (
                <div className="pt-4 border-t">
                  <Dialog
                    open={isRequestDialogOpen}
                    onOpenChange={setIsRequestDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline">
                        Request Approval
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Approval</DialogTitle>
                        <DialogDescription>
                          Enter a reason for requesting approval for this
                          transaction.
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          requestApprovalMutation.mutate(
                            {
                              transactionId: Number(transaction.id),
                              reason: approvalReason,
                            },
                            {
                              onSuccess: () => {
                                setIsRequestDialogOpen(false);
                                setApprovalReason('');
                              },
                            }
                          );
                        }}
                        className="space-y-4"
                      >
                        <Input
                          value={approvalReason}
                          onChange={(e) => setApprovalReason(e.target.value)}
                          placeholder="Reason for approval request"
                          required
                          disabled={requestApprovalMutation.isPending}
                        />
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={
                            requestApprovalMutation.isPending ||
                            !approvalReason.trim()
                          }
                        >
                          {requestApprovalMutation.isPending
                            ? 'Requesting...'
                            : 'Submit Request'}
                        </Button>
                        {requestApprovalMutation.isError && (
                          <p className="text-xs text-red-500 text-center mt-2">
                            {String(requestApprovalMutation.error)}
                          </p>
                        )}
                      </form>
                    </DialogContent>
                  </Dialog>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    This will submit the transaction for manager approval
                  </p>
                </div>
              )}
              {isOwner && transaction.status === TransactionStatus.Active && (
                <div className="pt-4 border-t">
                  <Button
                    className="w-full"
                    onClick={() =>
                      completeTransactionMutation.mutate(Number(transaction.id))
                    }
                    disabled={completeTransactionMutation.isPending}
                  >
                    {completeTransactionMutation.isPending
                      ? 'Completing...'
                      : 'Complete Transaction'}
                  </Button>
                  {completeTransactionMutation.isError && (
                    <p className="text-xs text-red-500 text-center mt-2">
                      {String(completeTransactionMutation.error)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    This will transfer the funds to the recipient
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Transaction ID</h4>
              <p className="font-mono text-sm text-muted-foreground">
                #{transaction.id.toString()}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Approval ID</h4>
              <p className="font-mono text-sm text-muted-foreground">
                {transaction.approvalId.toString() !== '0'
                  ? `#${transaction.approvalId.toString()}`
                  : 'No approval required'}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Your Role</h4>
              <div className="flex items-center space-x-2">
                {isOwner && <Badge variant="outline">Sender</Badge>}
                {isRecipient && <Badge variant="outline">Recipient</Badge>}
                {(user?.role === UserRole.Manager ||
                  user?.role === UserRole.Admin) && (
                  <Badge variant="outline">
                    {user.role === UserRole.Admin ? 'Admin' : 'Manager'}
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Network</h4>
              <p className="text-sm text-muted-foreground">
                Localhost (Hardhat)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
