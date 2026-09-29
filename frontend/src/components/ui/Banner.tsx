import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'warning' | 'caveat';
  message: string;
}

export function Banner({ variant = 'info', message, className, ...props }: BannerProps) {
  const variants = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    caveat: 'bg-purple-50 text-purple-800 border-purple-200',
  };

  const icons = {
    info: Info,
    warning: AlertTriangle,
    caveat: AlertCircle,
  };

  const Icon = icons[variant];

  return (
    <div className={cn("flex items-start p-4 rounded-md border", variants[variant], className)} {...props}>
      <Icon className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
      <div className="text-sm font-medium">{message}</div>
    </div>
  );
}
