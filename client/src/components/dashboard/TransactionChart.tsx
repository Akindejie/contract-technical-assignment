'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/contracts';
import { formatTokenAmount } from '@/lib/web3/provider';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface TransactionChartProps {
  transactions: Transaction[];
  userAddress: string;
}

interface ChartData {
  date: string;
  sent: number;
  received: number;
  count: number;
}

export const TransactionChart: React.FC<TransactionChartProps> = ({
  transactions,
  userAddress,
}) => {
  // Process transactions into chart data
  const processChartData = (): ChartData[] => {
    const dataMap = new Map<string, ChartData>();

    transactions.forEach((tx) => {
      const date = new Date(Number(tx.timestamp) * 1000).toLocaleDateString();
      const amount = Number(formatTokenAmount(tx.amount));

      if (!dataMap.has(date)) {
        dataMap.set(date, { date, sent: 0, received: 0, count: 0 });
      }

      const dayData = dataMap.get(date)!;
      dayData.count++;

      if (tx.from.toLowerCase() === userAddress.toLowerCase()) {
        dayData.sent += amount;
      } else {
        dayData.received += amount;
      }
    });

    return Array.from(dataMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  };

  const chartData = processChartData();
  const maxAmount = Math.max(
    ...chartData.flatMap((d) => [d.sent, d.received]),
    1
  );

  // Calculate totals
  const totalSent = chartData.reduce((sum, d) => sum + d.sent, 0);
  const totalReceived = chartData.reduce((sum, d) => sum + d.received, 0);
  const totalTransactions = chartData.reduce((sum, d) => sum + d.count, 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Transaction Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No transaction data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Transaction Activity (Last 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingDown className="w-4 h-4 mr-1 text-red-500" />
              <span className="text-sm font-medium">Sent</span>
            </div>
            <p className="text-lg font-bold text-red-600">
              {totalSent.toFixed(2)} ETH
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
              <span className="text-sm font-medium">Received</span>
            </div>
            <p className="text-lg font-bold text-green-600">
              {totalReceived.toFixed(2)} ETH
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <BarChart3 className="w-4 h-4 mr-1 text-blue-500" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {totalTransactions}
            </p>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Daily Activity</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-1" />
                <span>Sent</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-1" />
                <span>Received</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {chartData.map((data) => (
              <div key={data.date} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium">{data.date}</span>
                  <Badge variant="outline" className="text-xs">
                    {data.count} tx
                  </Badge>
                </div>
                <div className="flex space-x-1 h-6">
                  {/* Sent bar */}
                  <div className="flex-1 bg-gray-100 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all duration-300"
                      style={{
                        width: `${
                          data.sent === 0
                            ? 0
                            : Math.max((data.sent / maxAmount) * 100, 2)
                        }%`,
                      }}
                    />
                  </div>
                  {/* Received bar */}
                  <div className="flex-1 bg-gray-100 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{
                        width: `${
                          data.received === 0
                            ? 0
                            : Math.max((data.received / maxAmount) * 100, 2)
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{data.sent.toFixed(2)} ETH</span>
                  <span>{data.received.toFixed(2)} ETH</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Net Flow */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Net Flow</span>
            <div
              className={`flex items-center ${
                totalReceived - totalSent >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {totalReceived - totalSent >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span className="font-bold">
                {totalReceived - totalSent >= 0 ? '+' : ''}
                {(totalReceived - totalSent).toFixed(2)} ETH
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
