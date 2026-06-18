import type { SourceCitation } from '../../types';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';

interface SourceTagProps {
  source: SourceCitation;
}

export function SourceTag({ source }: SourceTagProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-surface rounded border border-border overflow-hidden">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2 hover:bg-surface2 transition-colors text-left"
      >
        <div className="flex items-center gap-2 text-xs font-mono text-cyan">
          <FileText className="w-3.5 h-3.5" />
          <span>{source.citation_label}</span>
        </div>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-muted" />}
      </button>
      
      {expanded && (
        <div className="p-3 pt-0 text-sm text-text/80 bg-surface2/30 border-t border-border/50 font-serif italic">
          "{source.excerpt}"
        </div>
      )}
    </div>
  );
}
