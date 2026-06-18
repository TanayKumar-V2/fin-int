import type { GrowthSignal } from '../../types';
import { Badge } from '../ui/Badge';
import { ConfidenceBar } from '../ui/ConfidenceBar';
import { MetricChip } from '../ui/MetricChip';
import { SourceTag } from './SourceTag';
import { TrendingUp } from 'lucide-react';

export function GrowthCard({ signal }: { signal: GrowthSignal }) {
  const metricsEntries = Object.entries(signal.metrics || {});

  return (
    <div className="bg-surface2/30 border border-border rounded-xl p-5 hover:border-border/80 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald/10 mt-1">
            <TrendingUp className="w-5 h-5 text-emerald" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text mb-1">{signal.title}</h3>
            <Badge variant="emerald" className="capitalize">
              {signal.opportunity_type.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>

      <p className="text-sm text-text/90 leading-relaxed mb-4">
        {signal.description}
      </p>

      {metricsEntries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {metricsEntries.map(([label, val]) => (
            <MetricChip key={label} label={label} value={val} />
          ))}
        </div>
      )}

      <div className="space-y-4">
        <ConfidenceBar confidence={signal.confidence} />
        
        {signal.sources.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Source Citations</span>
            <div className="flex flex-col gap-2">
              {signal.sources.map((s, i) => <SourceTag key={i} source={s} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
