import React from 'react';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

export interface LineTrendProps {
  data: any[];
  xKey: string;
  lines: { key: string; color: string; name?: string }[];
  yLabel?: string;
  className?: string;
}

export function LineTrend({ data, xKey, lines, yLabel, className }: LineTrendProps) {
  return (
    <div className={cn("w-full h-72", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e1e1" />
          <XAxis 
            dataKey={xKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#696969', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#696969', fontSize: 12 }}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: '#696969', fontSize: 12 }}
          />
          <RechartsTooltip 
            contentStyle={{ borderRadius: '0.375rem', border: '1px solid #e1e1e1', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            labelStyle={{ color: '#383838', fontWeight: 600, marginBottom: '0.25rem' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
          {lines.map((line) => (
            <Line 
              key={line.key}
              type="monotone" 
              dataKey={line.key} 
              name={line.name || line.key}
              stroke={line.color} 
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
