'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useWallet } from '@/lib/hooks/useWallet';
import { useUserTransactions } from '@/lib/hooks/useContract';
import { TransactionStatus, Transaction } from '@/types/contracts';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LoadingPage } from '@/components/ui/loading-spinner';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { CreateTransactionForm } from '@/components/transactions/CreateTransactionForm';

const getStatusIcon = (status: TransactionStatus) => {
  switch (status) {
    case TransactionStatus.Completed:
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case TransactionStatus.Rejected:
      return <XCircle className="w-4 h-4 text-red-500" />;
    case TransactionStatus.Active:
      return <AlertCircle className="w-4 h-4 text-blue-500" />;
    case TransactionStatus.Pending:
    default:
      return <Clock className="w-4 h-4 text-yellow-500" />;
  }
};

const getStatusBadge = (status: TransactionStatus) => {
  const config = {
    [TransactionStatus.Completed]: {
      variant: 'default' as const,
      label: 'Completed',
    },
    [TransactionStatus.Rejected]: {
      variant: 'destructive' as const,
      label: 'Rejected',
    },
    [TransactionStatus.Active]: {
      variant: 'secondary' as const,
      label: 'Active',
    },
    [TransactionStatus.Pending]: {
      variant: 'outline' as const,
      label: 'Pending',
    },
  };

  const { variant, label } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
};

export default function TransactionsPage() {
  const { isConnected, address } = useWallet();
  const { data: transactions = [], isLoading } = useUserTransactions(
    address || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Invalidate all queries when wallet address changes
  useEffect(() => {
    if (address) {
      queryClient.invalidateQueries();
    }
  }, [address, queryClient]);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      formatAddress(tx.to).toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatAddress(tx.from).toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      TransactionStatus[tx.status].toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Separate transactions by direction
  const sentTransactions = filteredTransactions.filter(
    (tx) => tx.from === address
  );
  const receivedTransactions = filteredTransactions.filter(
    (tx) => tx.to === address
  );

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-[60vh] animate-in fade-in duration-500">
        <Card className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="text-center">
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to view your transactions
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingPage message="Loading transactions..." />;
  }

  const TransactionTable = ({
    transactions,
    title,
  }: {
    transactions: Transaction[];
    title: string;
  }) => (
    <Card className="animate-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ArrowLeftRight className="w-5 h-5 mr-2" />
          {title}
        </CardTitle>
        <CardDescription>
          {transactions.length} transaction
          {transactions.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground animate-in fade-in duration-500">
            No transactions found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>From/To</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx, index) => (
                <TableRow
                  key={tx.id.toString()}
                  className="animate-in slide-in-from-left-4 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(tx.status)}
                      {getStatusBadge(tx.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">
                      {tx.from === address ? (
                        <span>To: {formatAddress(tx.to)}</span>
                      ) : (
                        <span>From: {formatAddress(tx.from)}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatTokenAmount(tx.amount)} ETH
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {tx.description}
                  </TableCell>
                  <TableCell>
                    {new Date(Number(tx.timestamp) * 1000).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link href={`/transactions/${tx.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 animate-in slide-in-from-top-4 duration-500">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="animate-in slide-in-from-right-4 duration-500"
              style={{ animationDelay: '200ms' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
              <DialogDescription>
                Send funds to another registered user
              </DialogDescription>
            </DialogHeader>
            <CreateTransactionForm
              onSuccess={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div
        className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-top-4 duration-500"
        style={{ animationDelay: '100ms' }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction Tables */}
      <Tabs
        defaultValue="all"
        className="space-y-4 animate-in slide-in-from-bottom-4 duration-500"
        style={{ animationDelay: '200ms' }}
      >
        <TabsList>
          <TabsTrigger value="all">
            All Transactions ({filteredTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({sentTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="received">
            Received ({receivedTransactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <TransactionTable
            transactions={filteredTransactions}
            title="All Transactions"
          />
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <TransactionTable
            transactions={sentTransactions}
            title="Sent Transactions"
          />
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          <TransactionTable
            transactions={receivedTransactions}
            title="Received Transactions"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
