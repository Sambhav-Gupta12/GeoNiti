import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Activity } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'illustrative' | 'modelled';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-neutral-100 text-neutral-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
    illustrative: 'bg-orange-100 text-orange-800 border border-orange-200',
    modelled: 'bg-purple-100 text-purple-800 border border-purple-200',
  };

  return (
    <div className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors", variants[variant], className)} {...props}>
      {variant === 'illustrative' && <Sparkles className="w-3 h-3 mr-1" />}
      {variant === 'modelled' && <Activity className="w-3 h-3 mr-1" />}
      {children}
    </div>
  );
}
