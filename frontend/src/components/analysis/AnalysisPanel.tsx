import { useAppStore } from '../../store/appStore';
import { SummaryTab } from './SummaryTab';
import { RiskTab } from './RiskTab';
import { GrowthTab } from './GrowthTab';
import { cn } from '../../utils/cn';

export function AnalysisPanel() {
  const { analysisResult, activeTab, setActiveTab } = useAppStore();

  if (!analysisResult) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0d0d12]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text mb-2">No Analysis Yet</h2>
          <p className="text-muted text-sm">Upload documents and run an analysis to see insights.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', label: 'Executive Summary' },
    { id: 'risk', label: 'Risk Assessment' },
    { id: 'growth', label: 'Growth Signals' }
  ] as const;

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d12] overflow-hidden">
      <div className="border-b border-border bg-surface shrink-0 px-6">
        <div className="flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'py-4 text-sm font-semibold tracking-wide transition-colors relative',
                activeTab === tab.id ? 'text-cyan' : 'text-muted hover:text-text'
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan rounded-t" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'summary' && <SummaryTab />}
          {activeTab === 'risk' && <RiskTab />}
          {activeTab === 'growth' && <GrowthTab />}
        </div>
      </div>
    </div>
  );
}
