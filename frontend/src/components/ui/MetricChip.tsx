import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface MetricChipProps {
  label: string;
  value: string;
  className?: string;
}

export function MetricChip({ label, value, className }: MetricChipProps) {
  return (
    <div className={cn('flex flex-col bg-surface2/50 border border-border rounded px-3 py-2', className)}>
      <span className="text-[11px] text-muted font-medium uppercase tracking-wider mb-1">
        {label}
      </span>
      <span className="text-sm font-mono text-text">
        {value}
      </span>
    </div>
  );
}
