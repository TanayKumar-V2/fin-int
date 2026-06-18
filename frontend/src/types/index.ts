export type DocumentStatus = 'uploading' | 'indexing' | 'ready' | 'error';

export interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size_kb: number;
  status: DocumentStatus;
  chunk_count: number;
  uploaded_at: string;
  error_message?: string;
}

export type RiskLevel = 'high' | 'medium' | 'low';

export interface SourceCitation {
  source_file: string;
  page_number: number | null;
  section: string | null;
  excerpt: string;
  citation_label: string;
}

export interface RiskFinding {
  title: string;
  description: string;
  risk_level: RiskLevel;
  confidence: number;
  sources: SourceCitation[];
  mitigation_hint?: string;
}

export interface GrowthSignal {
  title: string;
  description: string;
  opportunity_type: string;
  confidence: number;
  metrics: Record<string, string>;
  sources: SourceCitation[];
}

export interface ExecutiveSummary {
  company_name: string;
  verdict: string;
  verdict_rationale: string;
  key_metrics: Record<string, string>;
  investment_thesis: string;
  top_risks: string[];
  top_opportunities: string[];
  sources_used: string[];
}

export interface AnalysisResult {
  document_ids: string[];
  risks: RiskFinding[];
  growth_signals: GrowthSignal[];
  summary: ExecutiveSummary;
  query?: string;
  generated_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}
