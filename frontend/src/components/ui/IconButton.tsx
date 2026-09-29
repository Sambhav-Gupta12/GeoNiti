import React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from './Button';

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ElementType;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, className, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'h-8 w-8 p-0',
      md: 'h-10 w-10 p-0',
      lg: 'h-12 w-12 p-0',
    };
    return (
      <Button ref={ref} size={size} className={cn(sizes[size], className)} {...props}>
        <Icon className={cn("h-4 w-4", size === 'lg' && "h-5 w-5", size === 'sm' && "h-3 w-3")} />
      </Button>
    );
  }
);
IconButton.displayName = 'IconButton';
