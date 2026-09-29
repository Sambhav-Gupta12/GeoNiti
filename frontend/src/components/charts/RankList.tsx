import React from 'react';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from 'recharts';

export interface RankListProps {
  data: any[];
  xKey: string; // The numeric value
  yKey: string; // The category/name
  color?: string;
  className?: string;
}

export function RankList({ data, xKey, yKey, color = '#5a82a1', className }: RankListProps) {
  // Sort data for ranking
  const sortedData = [...data].sort((a, b) => b[xKey] - a[xKey]);

  return (
    <div className={cn("w-full h-72", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis 
            type="category" 
            dataKey={yKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#383838', fontSize: 12, fontWeight: 500 }}
            width={80}
          />
          <RechartsTooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '0.375rem', border: '1px solid #e1e1e1', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Bar dataKey={xKey} fill={color} radius={[0, 4, 4, 0]} barSize={20}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
