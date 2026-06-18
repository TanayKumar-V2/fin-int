import { useAppStore } from '../../store/appStore';
import { GrowthCard } from './GrowthCard';

export function GrowthTab() {
  const result = useAppStore(s => s.analysisResult);
  if (!result || !result.growth_signals) return null;

  const sortedSignals = [...result.growth_signals].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-10">
      {sortedSignals.map((signal, i) => (
        <GrowthCard key={i} signal={signal} />
      ))}
    </div>
  );
}
