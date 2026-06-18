import { cn } from '../../utils/cn';

interface ConfidenceBarProps {
  confidence: number; // 0.0 to 1.0
  className?: string;
}

export function ConfidenceBar({ confidence, className }: ConfidenceBarProps) {
  const percentage = Math.round(confidence * 100);
  
  let colorClass = 'bg-emerald';
  if (percentage < 50) colorClass = 'bg-rose';
  else if (percentage < 80) colorClass = 'bg-amber';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="text-[11px] font-mono text-muted w-8 text-right">
        {percentage}%
      </span>
      <div className="h-1 flex-1 bg-surface2 rounded-full overflow-hidden">
        <div 
          className={cn('h-full rounded-full transition-all duration-500', colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-[10px] uppercase tracking-wider text-muted font-medium w-20">
        Confidence
      </span>
    </div>
  );
}
