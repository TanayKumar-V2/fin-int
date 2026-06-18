import { UploadZone } from './UploadZone';
import { DocumentItem } from './DocumentItem';
import { useDocuments } from '../../hooks/useDocuments';
import { useAnalysis } from '../../hooks/useAnalysis';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Play } from 'lucide-react';

export function DocumentVault() {
  const { documents, isLoading } = useDocuments();
  const { runAnalysis, isAnalyzing, error } = useAnalysis();

  const readyCount = documents.filter(d => d.status === 'ready').length;

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border w-80 shrink-0">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold tracking-wide text-text mb-4 uppercase">Document Vault</h2>
        <UploadZone />
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {isLoading && documents.length === 0 ? (
          <div className="py-8"><LoadingSpinner /></div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted">No documents uploaded.</div>
        ) : (
          documents.map(doc => <DocumentItem key={doc.id} document={doc} />)
        )}
      </div>

      <div className="p-4 border-t border-border bg-surface2/50">
        <button
          onClick={runAnalysis}
          disabled={readyCount === 0 || isAnalyzing}
          className="w-full flex items-center justify-center gap-2 bg-cyan hover:bg-cyan/90 text-[#0d0d12] font-semibold py-2.5 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isAnalyzing ? <LoadingSpinner size="sm" className="border-t-[#0d0d12]" /> : <Play className="w-4 h-4" />}
          {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
        </button>
        {error && <p className="text-xs text-rose mt-2 text-center">{error}</p>}
      </div>
    </div>
  );
}
