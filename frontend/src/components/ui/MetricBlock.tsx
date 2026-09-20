import React from 'react';
import { cn } from '@/lib/utils';

interface MetricBlockProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MetricBlock({ title, value, subtext, icon: Icon, trend, className }: MetricBlockProps) {
  return (
    <div className={cn("bg-white border border-slate-300 p-4", className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-xl font-bold text-slate-900">{value}</h3>
        </div>
        {Icon && (
          <div className="text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      {subtext && (
        <div className="mt-2 flex items-center text-xs">
          <span className={cn(
            "font-medium",
            trend === 'up' ? "text-emerald-700" : trend === 'down' ? "text-red-700" : "text-slate-600"
          )}>
            {subtext}
          </span>
        </div>
      )}
    </div>
  );
}
