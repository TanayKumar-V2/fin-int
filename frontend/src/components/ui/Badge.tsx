import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: ReactNode;
  variant?: 'cyan' | 'amber' | 'emerald' | 'rose' | 'muted';
  className?: string;
}

export function Badge({ children, variant = 'cyan', className }: BadgeProps) {
  const variants = {
    cyan: 'bg-cyan/10 text-cyan border-cyan/20',
    amber: 'bg-amber/10 text-amber border-amber/20',
    emerald: 'bg-emerald/10 text-emerald border-emerald/20',
    rose: 'bg-rose/10 text-rose border-rose/20',
    muted: 'bg-white/5 text-muted border-white/10',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
