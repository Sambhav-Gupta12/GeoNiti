import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          error ? "border-semantic-error focus:ring-semantic-error focus:border-semantic-error" : "border-neutral-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
