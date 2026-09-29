import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: { id: string; label: string; content?: React.ReactNode }[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  variant?: 'line' | 'pills';
}

export function Tabs({ tabs, defaultTab, onChange, variant = 'line', className, ...props }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (onChange) onChange(id);
  };

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <div className={cn(
        "flex", 
        variant === 'line' ? "border-b border-neutral-200" : "space-x-2"
      )}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors focus-ring outline-none",
                variant === 'line' 
                  ? cn("border-b-2", isActive ? "border-primary-500 text-primary-600" : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300")
                  : cn("rounded-md", isActive ? "bg-primary-100 text-primary-800" : "text-neutral-600 hover:bg-neutral-100")
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="pt-4">
        {tabs.find(t => t.id === activeTab)?.content}
      </div>
    </div>
  );
}
