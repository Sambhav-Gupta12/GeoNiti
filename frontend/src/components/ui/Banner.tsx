import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react';

export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'warning' | 'caveat' | 'error';
  message: string;
}

export function Banner({ variant = 'info', message, className, ...props }: BannerProps) {
  const variants: Record<string, string> = {
    info: 'bg-semantic-info/10 text-semantic-info border-semantic-info/20',
    warning: 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20',
    caveat: 'bg-semantic-modelled/10 text-semantic-modelled border-semantic-modelled/20',
    error: 'bg-semantic-error/10 text-semantic-error border-semantic-error/20',
  };

  const icons: Record<string, React.ElementType> = {
    info: Info,
    warning: AlertTriangle,
    caveat: AlertCircle,
    error: XCircle,
  };

  const Icon = icons[variant] ?? Info;

  return (
    <div className={cn("flex items-start p-4 rounded-md border", variants[variant], className)} {...props}>
      <Icon className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
      <div className="text-sm font-medium">{message}</div>
    </div>
  );
}
