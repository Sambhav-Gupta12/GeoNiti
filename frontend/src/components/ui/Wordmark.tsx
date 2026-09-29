import React from 'react';
import { cn } from '@/lib/utils';
import { Leaf } from 'lucide-react';

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-2 select-none", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
        <Leaf className="h-5 w-5" />
      </div>
      <span className="font-serif text-xl font-bold tracking-tight text-neutral-900">
        BhuNiti
      </span>
    </div>
  );
}
