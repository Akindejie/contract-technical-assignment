'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/lib/hooks/useWallet';
import { useUser } from '@/lib/hooks/useContract';
import { UserRole } from '@/types/contracts';
import { formatAddress } from '@/lib/web3/provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  ArrowLeftRight,
  CheckSquare,
  Users,
  Menu,
  X,
  Wallet,
  LogOut,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRole?: UserRole[];
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { isConnected, address, disconnect } = useWallet();
  const { data: user } = useUser(address || '');

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Transactions',
      href: '/transactions',
      icon: ArrowLeftRight,
    },
    {
      title: 'Approvals',
      href: '/approvals',
      icon: CheckSquare,
      requiredRole: [UserRole.Manager, UserRole.Admin],
    },
    {
      title: 'Users',
      href: '/users',
      icon: Users,
      requiredRole: [UserRole.Admin],
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!item.requiredRole) return true;
    if (!user) return false;
    return item.requiredRole.includes(user.role);
  });

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

  const SidebarContent = () => (
    <TooltipProvider>
      <div
        className="flex flex-col h-full min-h-screen bg-gradient-to-b from-background via-muted/80 to-background border-r shadow-lg transition-all duration-500 ease-in-out"
        style={{ boxShadow: '2px 0 16px 0 rgba(0,0,0,0.04)' }}
      >
        {/* Header */}
        <div className="p-6 border-b bg-background/80 backdrop-blur-md">
          <div
            className={cn(
              'flex items-center space-x-3 transition-all duration-300',
              isCollapsed && 'justify-center'
            )}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="animate-in slide-in-from-left-2 duration-300">
                <h1 className="font-bold text-xl tracking-tight">
                  Oumla Platform
                </h1>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {isConnected && user && (
          <div className="p-6 border-b bg-muted/40">
            <div
              className={cn(
                'flex flex-col items-center justify-center transition-all duration-300 space-y-2',
                isCollapsed ? '' : ''
              )}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm mx-auto">
                      <span className="text-lg font-semibold text-gray-700">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <div className="font-medium text-sm mb-1">{user.name}</div>
                    <div className="text-xs font-mono text-muted-foreground mb-1">
                      {formatAddress(address || '')}
                    </div>
                    <Badge
                      className={cn('text-xs', getRoleBadgeColor(user.role))}
                    >
                      {UserRole[user.role]}
                    </Badge>
                  </TooltipContent>
                )}
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mx-auto">
                    <Badge
                      className={cn(
                        'text-xs mt-1 px-3 py-1 rounded-full font-semibold mx-auto',
                        getRoleBadgeColor(user.role),
                        isCollapsed && 'w-fit'
                      )}
                    >
                      {UserRole[user.role]}
                    </Badge>
                  </div>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <span>{UserRole[user.role]}</span>
                  </TooltipContent>
                )}
              </Tooltip>
              {!isCollapsed && (
                <div className="flex flex-col items-center animate-in slide-in-from-left-2 duration-300">
                  <p className="font-semibold text-base text-center">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono text-center">
                    {formatAddress(address || '')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation - now directly under user info */}
        <nav className="p-3 flex flex-col gap-1">
          {filteredNavItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Tooltip key={item.href} delayDuration={200}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group relative font-medium text-left',
                      'hover:bg-accent hover:text-accent-foreground hover:shadow-sm',
                      isActive &&
                        'bg-primary text-primary-foreground shadow-md',
                      isCollapsed && 'justify-center px-0 w-12 h-12 mx-auto'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Icon
                      className={cn(
                        'w-6 h-6 transition-transform duration-200',
                        'group-hover:scale-110',
                        isActive && 'scale-110'
                      )}
                    />
                    {!isCollapsed && (
                      <span className="font-medium animate-in slide-in-from-left-2 duration-300 text-left">
                        {item.title}
                      </span>
                    )}
                    {item.badge && !isCollapsed && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-l-full" />
                    )}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">{item.title}</TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Footer always at the bottom */}
        <div className="mt-auto">
          <Separator />
          <div className="p-6 bg-background/80 flex flex-col items-start gap-3">
            {isConnected ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={disconnect}
                    className={cn(
                      'w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold text-base py-3 rounded-lg transition-all duration-200 text-left',
                      isCollapsed && 'w-12 h-12 p-0 justify-center text-center'
                    )}
                  >
                    <LogOut className={cn('w-5 h-5', !isCollapsed && 'mr-2')} />
                    {!isCollapsed && (
                      <span className="animate-in slide-in-from-left-2 duration-300">
                        Disconnect
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">Disconnect</TooltipContent>
                )}
              </Tooltip>
            ) : (
              <div
                className={cn(
                  'text-left text-sm text-muted-foreground w-full',
                  isCollapsed && 'text-xs text-center'
                )}
              >
                {!isCollapsed ? 'Connect wallet to continue' : 'No wallet'}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-background/80 backdrop-blur-sm"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 h-full bg-background border-r z-30 transition-all duration-300 ease-in-out hidden lg:block',
          isCollapsed ? 'w-16' : 'w-64',
          className
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 h-full bg-background border-r z-50 transition-all duration-300 ease-in-out lg:hidden w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </div>
    </>
  );
};
