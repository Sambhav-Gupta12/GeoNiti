import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLNavElement> {
  items: { label: string; href?: string }[];
}

export function Breadcrumbs({ items, className, ...props }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center text-sm text-neutral-500", className)} aria-label="Breadcrumb" {...props}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center">
              {item.href && !isLast ? (
                <a href={item.href} className="hover:text-primary-600 transition-colors focus-ring rounded-sm">
                  {item.label}
                </a>
              ) : (
                <span className={cn(isLast && "text-neutral-900 font-medium")} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="mx-2 h-4 w-4 text-neutral-400 shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
