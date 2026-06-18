import { useAppStore } from '../../store/appStore';
import { RiskCard } from './RiskCard';

export function RiskTab() {
  const result = useAppStore(s => s.analysisResult);
  if (!result || !result.risks) return null;

  // Sort risks by level (high -> medium -> low) and then confidence
  const sortedRisks = [...result.risks].sort((a, b) => {
    const levelScore = { high: 3, medium: 2, low: 1 };
    if (levelScore[a.risk_level] !== levelScore[b.risk_level]) {
      return levelScore[b.risk_level] - levelScore[a.risk_level];
    }
    return b.confidence - a.confidence;
  });

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-10">
      {sortedRisks.map((risk, i) => (
        <RiskCard key={i} risk={risk} />
      ))}
    </div>
  );
}
