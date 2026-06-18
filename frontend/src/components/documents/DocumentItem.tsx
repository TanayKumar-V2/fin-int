import { FileText, Trash2, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import type { Document } from '../../types';
import { useDocuments } from '../../hooks/useDocuments';

interface DocumentItemProps {
  document: Document;
}

export function DocumentItem({ document }: DocumentItemProps) {
  const { deleteDocument } = useDocuments();

  const getStatusIcon = () => {
    switch (document.status) {
      case 'uploading':
      case 'indexing':
        return <Loader2 className="w-4 h-4 text-amber animate-spin" />;
      case 'ready':
        return <CheckCircle2 className="w-4 h-4 text-emerald" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose" />;
    }
  };

  const formatSize = (kb: number) => {
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="flex items-center justify-between p-3 border border-border bg-surface2/30 rounded-lg group hover:bg-surface2 transition-colors">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="p-2 bg-surface rounded">
          <FileText className="w-5 h-5 text-cyan" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-text truncate">{document.filename}</span>
          <span className="text-xs text-muted font-mono">
            {formatSize(document.file_size_kb)} • {document.chunk_count} chunks
          </span>
          {document.error_message && (
            <span className="text-xs text-rose truncate" title={document.error_message}>
              {document.error_message}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3 pl-2">
        {getStatusIcon()}
        <button
          onClick={() => deleteDocument(document.id)}
          className="p-1.5 text-muted hover:text-rose hover:bg-rose/10 rounded transition-colors"
          title="Delete document"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
