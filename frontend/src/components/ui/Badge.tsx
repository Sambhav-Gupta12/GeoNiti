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
    success: 'bg-semantic-success/10 text-semantic-success border border-semantic-success/20',
    warning: 'bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20',
    error: 'bg-semantic-error/10 text-semantic-error border border-semantic-error/20',
    illustrative: 'bg-semantic-illustrative/10 text-semantic-illustrative border border-semantic-illustrative/20',
    modelled: 'bg-semantic-modelled/10 text-semantic-modelled border border-semantic-modelled/20',
  };

  return (
    <div className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors", variants[variant], className)} {...props}>
      {variant === 'illustrative' && <Sparkles className="w-3 h-3 mr-1" />}
      {variant === 'modelled' && <Activity className="w-3 h-3 mr-1" />}
      {children}
    </div>
  );
}
