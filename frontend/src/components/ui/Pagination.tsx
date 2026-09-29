import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from './IconButton';

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange, className, ...props }: PaginationProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)} {...props}>
      <IconButton 
        icon={ChevronLeft} 
        variant="outline" 
        size="sm" 
        disabled={currentPage <= 1} 
        onClick={() => onPageChange(currentPage - 1)} 
        aria-label="Previous page"
      />
      <span className="text-sm text-neutral-600 font-medium px-2">
        Page {currentPage} of {Math.max(1, totalPages)}
      </span>
      <IconButton 
        icon={ChevronRight} 
        variant="outline" 
        size="sm" 
        disabled={currentPage >= totalPages} 
        onClick={() => onPageChange(currentPage + 1)} 
        aria-label="Next page"
      />
    </div>
  );
}
