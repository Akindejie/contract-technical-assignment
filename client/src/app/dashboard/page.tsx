'use client';

import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/lib/hooks/useWallet';
import {
  useDashboardMetrics,
  usePendingApprovals,
  useUserTransactions,
} from '@/lib/hooks/useContract';
import { TransactionChart } from '@/components/dashboard/TransactionChart';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { UserRole, TransactionStatus } from '@/types/contracts';
import { formatTokenAmount, formatAddress } from '@/lib/web3/provider';
import {
  Users,
  ArrowLeftRight,
  CheckSquare,
  TrendingUp,
  Activity,
} from 'lucide-react';

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  index?: number;
}> = ({ title, value, description, icon: Icon, index = 0 }) => (
  <Card
    className="animate-in slide-in-from-bottom duration-500 hover:shadow-md transition-shadow"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
);

const ActivityFeed: React.FC = () => {
  const { address } = useWallet();
  const { data: userTransactions = [] } = useUserTransactions(address || '');

  const recentTransactions = userTransactions.slice(0, 5);

  return (
    <Card
      className="col-span-1 md:col-span-2 lg:col-span-4 animate-in slide-in-from-left duration-700"
      style={{ animationDelay: '400ms' }}
    >
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your latest transactions and approval requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((tx, index) => (
              <div
                key={tx.id.toString()}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 animate-in slide-in-from-right duration-300"
                style={{ animationDelay: `${500 + index * 100}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      tx.status === TransactionStatus.Completed
                        ? 'bg-green-500'
                        : tx.status === TransactionStatus.Rejected
                        ? 'bg-red-500'
                        : tx.status === TransactionStatus.Active
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {tx.from.toLowerCase() === address?.toLowerCase()
                        ? 'Sent'
                        : 'Received'}{' '}
                      {formatTokenAmount(tx.amount)} ETH
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.from.toLowerCase() === address?.toLowerCase()
                        ? `To ${formatAddress(tx.to)}`
                        : `From ${formatAddress(tx.from)}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {TransactionStatus[tx.status]}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(Number(tx.timestamp) * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-6 text-muted-foreground animate-in fade-in duration-500"
            style={{ animationDelay: '600ms' }}
          >
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const { isConnected, address } = useWallet();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: pendingApprovals } = usePendingApprovals();
  const { data: userTransactions = [] } = useUserTransactions(address || '');
  const queryClient = useQueryClient();

  // Invalidate all queries when wallet address changes
  useEffect(() => {
    if (address) {
      queryClient.invalidateQueries();
    }
  }, [address, queryClient]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-[60vh] animate-in fade-in duration-500">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to access the financial dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (metricsLoading) {
    return <LoadingPage message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight animate-in slide-in-from-top duration-500">
          Dashboard
        </h2>
        <div
          className="flex items-center space-x-2 animate-in slide-in-from-top duration-500"
          style={{ animationDelay: '100ms' }}
        >
          <Badge variant="outline">
            {metrics ? UserRole[metrics.userRole] : 'Loading...'}
          </Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Transactions"
          value={metrics?.totalTransactions || 0}
          description="All time transactions"
          icon={ArrowLeftRight}
          index={0}
        />
        <MetricCard
          title="Pending Approvals"
          value={metrics?.pendingApprovals || 0}
          description="Awaiting your action"
          icon={CheckSquare}
          index={1}
        />
        <MetricCard
          title="Total Users"
          value={metrics?.totalUsers || 0}
          description="Registered users"
          icon={Users}
          index={2}
        />
        <MetricCard
          title="Your Role"
          value={metrics ? UserRole[metrics.userRole] : 'Loading...'}
          description="Current access level"
          icon={TrendingUp}
          index={3}
        />
      </div>

      {/* Activity Feed */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
        <div className="col-span-1 md:col-span-2 lg:col-span-4">
          <ActivityFeed />
        </div>

        {/* Quick Actions */}
        <Card
          className="col-span-1 md:col-span-2 lg:col-span-3 animate-in slide-in-from-right duration-700"
          style={{ animationDelay: '500ms' }}
        >
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks based on your role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Link
                href="/transactions"
                className="flex items-center p-3 rounded-lg border hover:bg-accent transition-all duration-200 hover:shadow-sm animate-in slide-in-from-bottom duration-300"
                style={{ animationDelay: '600ms' }}
              >
                <ArrowLeftRight className="w-4 h-4 mr-3" />
                <div>
                  <p className="text-sm font-medium">Create Transaction</p>
                  <p className="text-xs text-muted-foreground">
                    Send funds to another user
                  </p>
                </div>
              </Link>

              {metrics &&
                (metrics.userRole === UserRole.Manager ||
                  metrics.userRole === UserRole.Admin) && (
                  <Link
                    href="/approvals"
                    className="flex items-center p-3 rounded-lg border hover:bg-accent transition-all duration-200 hover:shadow-sm animate-in slide-in-from-bottom duration-300"
                    style={{ animationDelay: '700ms' }}
                  >
                    <CheckSquare className="w-4 h-4 mr-3" />
                    <div>
                      <p className="text-sm font-medium">Review Approvals</p>
                      <p className="text-xs text-muted-foreground">
                        {pendingApprovals?.length || 0} pending approvals
                      </p>
                    </div>
                  </Link>
                )}

              {metrics && metrics.userRole === UserRole.Admin && (
                <Link
                  href="/users"
                  className="flex items-center p-3 rounded-lg border hover:bg-accent transition-all duration-200 hover:shadow-sm animate-in slide-in-from-bottom duration-300"
                  style={{ animationDelay: '800ms' }}
                >
                  <Users className="w-4 h-4 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Manage Users</p>
                    <p className="text-xs text-muted-foreground">
                      Register and manage users
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transaction Chart */}
        {userTransactions.length > 0 && (
          <div
            className="col-span-1 md:col-span-2 lg:col-span-5 animate-in slide-in-from-bottom duration-700"
            style={{ animationDelay: '600ms' }}
          >
            <TransactionChart
              transactions={userTransactions}
              userAddress={address || ''}
            />
          </div>
        )}
      </div>
    </div>
  );
}
