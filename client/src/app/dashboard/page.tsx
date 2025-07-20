'use client';

import React from 'react';
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
import { UserRole, TransactionStatus } from '@/types/contracts';
import { formatTokenAmount, formatAddress } from '@/lib/web3/provider';
import {
  Users,
  ArrowLeftRight,
  CheckSquare,
  Clock,
  TrendingUp,
  Activity,
} from 'lucide-react';

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}> = ({ title, value, description, icon: Icon, trend }) => (
  <Card>
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
  const { data: transactions } = useUserTransactions(address || '');
  const { data: pendingApprovals } = usePendingApprovals();

  const recentTransactions = transactions?.slice(0, 5) || [];
  const recentApprovals = pendingApprovals?.slice(0, 3) || [];

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your latest transactions and approval requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentTransactions.length === 0 && recentApprovals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <>
            {recentTransactions.map((tx) => (
              <div
                key={tx.id.toString()}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium">
                      Transaction to {formatAddress(tx.to)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTokenAmount(tx.amount)} ETH
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    tx.status === TransactionStatus.Completed
                      ? 'default'
                      : tx.status === TransactionStatus.Rejected
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {TransactionStatus[tx.status]}
                </Badge>
              </div>
            ))}

            {recentApprovals.map((approval) => (
              <div
                key={approval.id.toString()}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">
                      Approval Request #{approval.transactionId.toString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      From {formatAddress(approval.requester)}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const { isConnected, address } = useWallet();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: pendingApprovals } = usePendingApprovals();

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
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
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
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
        />
        <MetricCard
          title="Pending Approvals"
          value={metrics?.pendingApprovals || 0}
          description="Awaiting your action"
          icon={CheckSquare}
        />
        <MetricCard
          title="Total Users"
          value={metrics?.totalUsers || 0}
          description="Registered users"
          icon={Users}
        />
        <MetricCard
          title="Your Role"
          value={metrics ? UserRole[metrics.userRole] : 'Loading...'}
          description="Current access level"
          icon={TrendingUp}
        />
      </div>

      {/* Activity Feed */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ActivityFeed />

        {/* Quick Actions */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks based on your role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <a
                href="/transactions"
                className="flex items-center p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <ArrowLeftRight className="w-4 h-4 mr-3" />
                <div>
                  <p className="text-sm font-medium">Create Transaction</p>
                  <p className="text-xs text-muted-foreground">
                    Send funds to another user
                  </p>
                </div>
              </a>

              {metrics &&
                (metrics.userRole === UserRole.Manager ||
                  metrics.userRole === UserRole.Admin) && (
                  <a
                    href="/approvals"
                    className="flex items-center p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <CheckSquare className="w-4 h-4 mr-3" />
                    <div>
                      <p className="text-sm font-medium">Review Approvals</p>
                      <p className="text-xs text-muted-foreground">
                        {pendingApprovals?.length || 0} pending approvals
                      </p>
                    </div>
                  </a>
                )}

              {metrics && metrics.userRole === UserRole.Admin && (
                <a
                  href="/users"
                  className="flex items-center p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Users className="w-4 h-4 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Manage Users</p>
                    <p className="text-xs text-muted-foreground">
                      Register and manage users
                    </p>
                  </div>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
