'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletConnect } from '@/components/web3/WalletConnect';
import { useWallet } from '@/lib/hooks/useWallet';
import { useUser } from '@/lib/hooks/useContract';
import { UserRole } from '@/types/contracts';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ArrowLeftRight,
  CheckSquare,
  Users,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: [UserRole.Regular, UserRole.Manager, UserRole.Admin],
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: ArrowLeftRight,
    roles: [UserRole.Regular, UserRole.Manager, UserRole.Admin],
  },
  {
    name: 'Approvals',
    href: '/approvals',
    icon: CheckSquare,
    roles: [UserRole.Manager, UserRole.Admin],
  },
  {
    name: 'Users',
    href: '/users',
    icon: Users,
    roles: [UserRole.Admin],
  },
];

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { address, isConnected } = useWallet();
  const { data: user } = useUser(address || '');

  const userRole = user?.role ?? UserRole.Regular;
  const availableNavigation = navigation.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center space-x-4 lg:space-x-6">
          <Link href="/dashboard" className="font-bold text-xl">
            Financial Dashboard
          </Link>

          {isConnected && (
            <nav className="flex items-center space-x-4 lg:space-x-6">
              {availableNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center text-sm font-medium transition-colors hover:text-primary',
                      pathname === item.href
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {user && (
            <div className="text-sm text-muted-foreground">
              {user.name} ({UserRole[user.role]})
            </div>
          )}
          <WalletConnect />
        </div>
      </div>
    </header>
  );
};
