import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  trend?: number; // percentage
  trendLabel?: string;
  icon?: React.ElementType;
}

export function StatCard({ title, value, trend, trendLabel, icon: Icon, className, ...props }: StatCardProps) {
  return (
    <Card className={cn("p-6", className)} {...props}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-neutral-500">{title}</h4>
        {Icon && <Icon className="w-5 h-5 text-neutral-400" />}
      </div>
      <div className="mt-4 flex items-baseline">
        <span className="text-3xl font-semibold text-neutral-900">{value}</span>
      </div>
      {trend !== undefined && (
        <div className="mt-2 flex items-center text-sm">
          <span className={cn("flex items-center font-medium", trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-600" : "text-neutral-500")}>
            {trend > 0 ? <ArrowUpRight className="mr-1 w-4 h-4" /> : trend < 0 ? <ArrowDownRight className="mr-1 w-4 h-4" /> : null}
            {Math.abs(trend)}%
          </span>
          {trendLabel && <span className="ml-2 text-neutral-500">{trendLabel}</span>}
        </div>
      )}
    </Card>
  );
}
