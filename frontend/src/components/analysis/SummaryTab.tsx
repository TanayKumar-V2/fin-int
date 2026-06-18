import { useAppStore } from '../../store/appStore';
import { MetricChip } from '../ui/MetricChip';
import { Badge } from '../ui/Badge';
import { ShieldCheck, ShieldAlert, AlertTriangle, XCircle } from 'lucide-react';

export function SummaryTab() {
  const result = useAppStore(s => s.analysisResult);
  if (!result) return null;

  const { summary } = result;

  const VerdictIcon = () => {
    switch(summary.verdict) {
      case 'Proceed': return <ShieldCheck className="w-8 h-8 text-emerald" />;
      case 'Proceed with Conditions': return <ShieldAlert className="w-8 h-8 text-amber" />;
      case 'Caution': return <AlertTriangle className="w-8 h-8 text-amber" />;
      case 'Do Not Proceed': return <XCircle className="w-8 h-8 text-rose" />;
      default: return <ShieldCheck className="w-8 h-8 text-cyan" />;
    }
  };

  const verdictColor = 
    summary.verdict === 'Proceed' ? 'emerald' :
    summary.verdict === 'Do Not Proceed' ? 'rose' : 'amber';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-surface2/30 border border-border p-6 rounded-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-xl bg-${verdictColor}/10`}>
            <VerdictIcon />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text">{summary.company_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted">Verdict:</span>
              <Badge variant={verdictColor as any}>{summary.verdict.toUpperCase()}</Badge>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-text/90 leading-relaxed bg-surface p-4 rounded-lg border border-border/50">
          {summary.verdict_rationale}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface2/30 border border-border p-5 rounded-xl">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">Investment Thesis</h3>
          <p className="text-sm text-text/90 leading-relaxed">{summary.investment_thesis}</p>
        </div>
        
        <div className="bg-surface2/30 border border-border p-5 rounded-xl flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-1">Key Metrics</h3>
          {Object.entries(summary.key_metrics || {}).map(([k, v]) => (
            <MetricChip key={k} label={k} value={v} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-rose/5 border border-rose/10 p-5 rounded-xl">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">Top Risks</h3>
          <ul className="list-disc pl-4 space-y-2 text-sm text-text/80">
            {summary.top_risks.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
        
        <div className="bg-emerald/5 border border-emerald/10 p-5 rounded-xl">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald mb-3">Top Opportunities</h3>
          <ul className="list-disc pl-4 space-y-2 text-sm text-text/80">
            {summary.top_opportunities.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
