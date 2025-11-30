"use client"

import React from 'react';
import { BarChart, Bar, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

interface ActivityChartProps {
  data: number[];
  type: 'bar' | 'area';
  color?: string;
  height?: number;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data, type, color = "#3b82f6", height = 50 }) => {
  const chartData = data.map((v) => ({ value: v }));

  if (type === 'bar') {
    return (
      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Bar dataKey="value" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={color ?? 'var(--border)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'area') {
    return (
      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
};