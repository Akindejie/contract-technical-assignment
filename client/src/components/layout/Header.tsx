'use client';

import React from 'react';
import { useWallet } from '@/lib/hooks/useWallet';
import { useUser } from '@/lib/hooks/useContract';
import { UserRole } from '@/types/contracts';
import { formatAddress } from '@/lib/web3/provider';
import { WalletConnect } from '@/components/web3/WalletConnect';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  const { isConnected, address, disconnect } = useWallet();
  const { data: user } = useUser(address || '');

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case UserRole.Admin:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case UserRole.Manager:
        return 'bg-green-100 text-green-800 border-green-200';
      case UserRole.Regular:
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Left side - empty for sidebar space on mobile */}
        <div className="flex items-center">
          <div className="w-10 lg:hidden" />{' '}
          {/* Space for mobile menu button */}
        </div>

        {/* Center - Page title or breadcrumbs could go here */}
        <div className="flex-1" />

        {/* Right side - Wallet connection and user menu */}
        <div className="flex items-center space-x-4">
          {isConnected ? (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-auto px-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border shadow-sm">
                        <span className="text-sm font-semibold text-gray-700">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {address || ''}
                        </span>
                      </div>
                      <Badge
                        className={cn(
                          'text-xs hidden sm:inline-flex',
                          getRoleBadgeColor(user.role)
                        )}
                      >
                        {UserRole[user.role]}
                      </Badge>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground font-mono break-all">
                        {address}
                      </p>
                      <Badge
                        className={cn(
                          'text-xs w-fit mt-1',
                          getRoleBadgeColor(user.role)
                        )}
                      >
                        {UserRole[user.role]}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={disconnect}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Disconnect</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Fallback when user data is loading or not found
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-auto px-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border shadow-sm">
                        <span className="text-sm font-semibold text-gray-700">
                          ?
                        </span>
                      </div>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium">
                          Unknown User
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {address || ''}
                        </span>
                      </div>
                      <Badge className="text-xs hidden sm:inline-flex bg-gray-100 text-gray-800 border-gray-200">
                        Not Registered
                      </Badge>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Unknown User
                      </p>
                      <p className="text-xs leading-none text-muted-foreground font-mono break-all">
                        {address}
                      </p>
                      <Badge className="text-xs w-fit mt-1 bg-gray-100 text-gray-800 border-gray-200">
                        Not Registered
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={disconnect}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Disconnect</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          ) : (
            <WalletConnect />
          )}
        </div>
      </div>
    </header>
  );
};
