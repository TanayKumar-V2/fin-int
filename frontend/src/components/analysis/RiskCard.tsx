import type { RiskFinding } from '../../types';
import { Badge } from '../ui/Badge';
import { ConfidenceBar } from '../ui/ConfidenceBar';
import { SourceTag } from './SourceTag';
import { AlertTriangle } from 'lucide-react';

export function RiskCard({ risk }: { risk: RiskFinding }) {
  const badgeColors = {
    high: 'rose',
    medium: 'amber',
    low: 'emerald'
  } as const;

  return (
    <div className="bg-surface2/30 border border-border rounded-xl p-5 hover:border-border/80 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-${badgeColors[risk.risk_level]}/10 mt-1`}>
            <AlertTriangle className={`w-5 h-5 text-${badgeColors[risk.risk_level]}`} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text mb-1">{risk.title}</h3>
            <Badge variant={badgeColors[risk.risk_level]}>
              {risk.risk_level.toUpperCase()} RISK
            </Badge>
          </div>
        </div>
      </div>

      <p className="text-sm text-text/90 leading-relaxed mb-4">
        {risk.description}
      </p>

      {risk.mitigation_hint && (
        <div className="mb-4 p-3 bg-surface rounded-lg border border-border/50">
          <span className="text-xs font-semibold text-emerald uppercase tracking-wider mb-1 block">Mitigation Hint</span>
          <p className="text-sm text-muted">{risk.mitigation_hint}</p>
        </div>
      )}

      <div className="space-y-4">
        <ConfidenceBar confidence={risk.confidence} />
        
        {risk.sources.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Source Citations</span>
            <div className="flex flex-col gap-2">
              {risk.sources.map((s, i) => <SourceTag key={i} source={s} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
