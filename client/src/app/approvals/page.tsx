'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@/lib/hooks/useWallet';
import {
  usePendingApprovals,
  useUser,
  useTransaction,
  useProcessApproval,
  useAllTransactions,
} from '@/lib/hooks/useContract';
import { UserRole, Approval, Transaction } from '@/types/contracts';
import { formatTokenAmount, formatAddress } from '@/lib/web3/provider';
import { TransactionStatus } from '@/types/contracts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { LoadingPage } from '@/components/ui/loading-spinner';
import {
  CheckSquare,
  Clock,
  User,
  ArrowLeftRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface ApprovalActionDialogProps {
  approval: Approval;
  transaction: Transaction;
  onClose: () => void;
}

const ApprovalActionDialog: React.FC<ApprovalActionDialogProps> = ({
  approval,
  transaction,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [isApproving, setIsApproving] = useState<boolean | null>(null);
  const processApprovalMutation = useProcessApproval();

  const handleProcess = async (approved: boolean) => {
    if (!reason.trim()) {
      return;
    }

    setIsApproving(approved);

    try {
      await processApprovalMutation.mutateAsync({
        approvalId: Number(approval.id),
        approved,
        reason: reason.trim(),
      });

      onClose();
    } catch (error) {
      console.error('Error processing approval:', error);
    } finally {
      setIsApproving(null);
    }
  };

  const isLoading = processApprovalMutation.isPending;

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Process Approval Request</DialogTitle>
        <DialogDescription>
          Review the transaction details and provide your decision
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Transaction Details */}
        <div className="space-y-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium">Transaction Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">From:</span>
              <span className="font-mono">
                {formatAddress(transaction.from)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">To:</span>
              <span className="font-mono">{formatAddress(transaction.to)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">
                {formatTokenAmount(transaction.amount)} ETH
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Description:</span>
              <span className="max-w-60 break-words">
                {transaction.description}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Requested:</span>
              <span>
                {new Date(Number(approval.timestamp) * 1000).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Approval Reason */}
        <div className="space-y-2">
          <Label htmlFor="reason">Approval Reason *</Label>
          <Input
            id="reason"
            placeholder="Provide a reason for your decision..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            This reason will be recorded and visible to the requester
          </p>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleProcess(false)}
            disabled={isLoading || !reason.trim()}
            className="flex-1"
          >
            {isApproving === false ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </>
            )}
          </Button>
          <Button
            onClick={() => handleProcess(true)}
            disabled={isLoading || !reason.trim()}
            className="flex-1"
          >
            {isApproving === true ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            • Approved transactions will be activated and can be completed by
            the requester
          </p>
          <p>
            • Rejected transactions cannot be reactivated and will require a new
            request
          </p>
        </div>
      </div>
    </DialogContent>
  );
};

export default function ApprovalsPage() {
  const { isConnected, address } = useWallet();
  const { data: user, isLoading: userLoading } = useUser(address || '');
  const { data: pendingApprovals = [], isLoading } = usePendingApprovals();
  const { data: allTransactions = [], isLoading: allTransactionsLoading } =
    useAllTransactions();
  const [selectedApproval, setSelectedApproval] = useState<
    (Approval & { transaction: Transaction }) | null
  >(null);
  const queryClient = useQueryClient();

  // Invalidate all queries when wallet address changes
  useEffect(() => {
    if (address) {
      queryClient.invalidateQueries();
    }
  }, [address, queryClient]);

  // Check if user has approval permissions
  const canApprove =
    user?.role === UserRole.Manager || user?.role === UserRole.Admin;

  // Filter pending transactions that don't have approval requests yet
  const pendingTransactionsWithoutApproval = allTransactions.filter(
    (tx) =>
      tx.status === TransactionStatus.Pending &&
      tx.approvalId.toString() === '0'
  );

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-[60vh] animate-in fade-in duration-500">
        <Card className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="text-center">
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to access the approval dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (userLoading) {
    return <LoadingPage message="Loading user data..." />;
  }

  if (!canApprove) {
    return (
      <div className="flex items-center justify-center h-[60vh] animate-in fade-in duration-500">
        <Card className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You need Manager or Admin role to access the approval dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading || allTransactionsLoading) {
    return <LoadingPage message="Loading approvals..." />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 animate-in slide-in-from-top-4 duration-500">
        <h2 className="text-3xl font-bold tracking-tight">
          Approval Dashboard
        </h2>
        <Badge
          variant="outline"
          className="flex items-center animate-in slide-in-from-right-4 duration-500"
          style={{ animationDelay: '200ms' }}
        >
          <User className="w-4 h-4 mr-1" />
          {UserRole[user?.role || UserRole.Regular]}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div
        className="grid gap-4 md:grid-cols-4 animate-in slide-in-from-bottom-4 duration-500"
        style={{ animationDelay: '100ms' }}
      >
        <Card
          className="animate-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '150ms' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        <Card
          className="animate-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '175ms' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Need Approval Request
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingTransactionsWithoutApproval.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending transactions
            </p>
          </CardContent>
        </Card>

        <Card
          className="animate-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '200ms' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {UserRole[user?.role || UserRole.Regular]}
            </div>
            <p className="text-xs text-muted-foreground">
              Approval permissions
            </p>
          </CardContent>
        </Card>

        <Card
          className="animate-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '250ms' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingApprovals.length +
                pendingTransactionsWithoutApproval.length >
              0
                ? 'Review'
                : 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              Items need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Transactions Without Approval Requests */}
      {pendingTransactionsWithoutApproval.length > 0 && (
        <Card
          className="animate-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '350ms' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Pending Transactions (No Approval Request)
            </CardTitle>
            <CardDescription>
              These transactions are pending but haven&apos;t had approval
              requested yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTransactionsWithoutApproval.map((tx, index) => (
                  <TableRow
                    key={tx.id.toString()}
                    className="animate-in slide-in-from-left-4 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-medium">
                      #{tx.id.toString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">
                        {formatAddress(tx.from)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">
                        {formatAddress(tx.to)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatTokenAmount(tx.amount)} ETH
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {tx.description}
                    </TableCell>
                    <TableCell>
                      {new Date(
                        Number(tx.timestamp) * 1000
                      ).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pending Approval Requests Table */}
      <Card
        className="animate-in slide-in-from-bottom-4 duration-500"
        style={{ animationDelay: '300ms' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckSquare className="w-5 h-5 mr-2" />
            Pending Approval Requests
          </CardTitle>
          <CardDescription>
            Review and process transaction approval requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-12 animate-in fade-in duration-500">
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Pending Approvals</h3>
              <p className="text-muted-foreground">
                All approval requests have been processed. Check back later for
                new requests.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Transaction Details</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((approval, index) => (
                  <ApprovalRow
                    key={approval.id.toString()}
                    approval={approval}
                    onSelect={setSelectedApproval}
                    index={index}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approval Action Dialog */}
      {selectedApproval && (
        <Dialog
          open={!!selectedApproval}
          onOpenChange={() => setSelectedApproval(null)}
        >
          <ApprovalActionDialog
            approval={selectedApproval}
            transaction={selectedApproval.transaction}
            onClose={() => setSelectedApproval(null)}
          />
        </Dialog>
      )}
    </div>
  );
}

// Separate component for approval rows to handle transaction data loading
const ApprovalRow: React.FC<{
  approval: Approval;
  onSelect: (approval: Approval & { transaction: Transaction }) => void;
  index: number;
}> = ({ approval, onSelect, index }) => {
  const { data: transaction } = useTransaction(Number(approval.transactionId));

  if (!transaction) {
    return (
      <TableRow
        className="animate-in slide-in-from-left-4 duration-300"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <TableCell colSpan={6}>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Loading transaction details...
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow
      className="animate-in slide-in-from-left-4 duration-300"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <TableCell className="font-medium">#{approval.id.toString()}</TableCell>
      <TableCell>
        <div className="font-mono text-sm">
          {formatAddress(approval.requester)}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="text-sm">
            To:{' '}
            <span className="font-mono">{formatAddress(transaction.to)}</span>
          </div>
          <div className="text-xs text-muted-foreground truncate max-w-40">
            {transaction.description}
          </div>
        </div>
      </TableCell>
      <TableCell className="font-medium">
        {formatTokenAmount(transaction.amount)} ETH
      </TableCell>
      <TableCell>
        {new Date(Number(approval.timestamp) * 1000).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <Button
          size="sm"
          onClick={() => onSelect({ ...approval, transaction })}
        >
          Review
        </Button>
      </TableCell>
    </TableRow>
  );
};
