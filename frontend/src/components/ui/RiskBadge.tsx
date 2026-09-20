import React from 'react';
import { cn } from '@/lib/utils';

export function RiskBadge({ level, className }: { level: string, className?: string }) {
  let bgColor = 'bg-slate-100 text-slate-800 border-slate-200';
  
  if (level === 'HIGH') bgColor = 'bg-red-50 text-red-700 border-red-300';
  if (level === 'MEDIUM') bgColor = 'bg-amber-50 text-amber-800 border-amber-300';
  if (level === 'LOW') bgColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold border",
      bgColor,
      className
    )}>
      {level}
    </span>
  );
}
