import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div
        className={cn(
          'absolute inset-0 rounded-full border-2 border-muted animate-pulse',
          sizeClasses[size]
        )}
      />
      <div
        className={cn(
          'absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin',
          sizeClasses[size]
        )}
      />
    </div>
  );
};

interface LoadingPageProps {
  message?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="flex items-center justify-center h-[60vh] animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground animate-pulse">{message}</p>
      </div>
    </div>
  );
};
