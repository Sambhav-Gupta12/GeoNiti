import React from 'react';
import { cn } from '@/lib/utils';

export interface CitationPillProps extends React.HTMLAttributes<HTMLButtonElement> {
  index: number;
  active?: boolean;
}

export const CitationPill = React.forwardRef<HTMLButtonElement, CitationPillProps>(
  ({ index, active, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full w-5 h-5 text-[10px] font-bold leading-none cursor-pointer align-super mx-0.5 transition-colors focus-ring outline-none",
          active ? "bg-primary-500 text-white" : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300",
          className
        )}
        {...props}
      >
        {index}
      </button>
    );
  }
);
CitationPill.displayName = 'CitationPill';
