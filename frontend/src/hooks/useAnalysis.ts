import { useState } from 'react';
import { api } from '../api/client';
import { useAppStore } from '../store/appStore';

export function useAnalysis() {
  const { documents, setAnalysisResult, setIsAnalyzing, isAnalyzing } = useAppStore();
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    const readyDocs = documents.filter(d => d.status === 'ready');
    if (readyDocs.length === 0) {
      setError('No documents ready for analysis.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const docIds = readyDocs.map(d => d.id);
      const result = await api.runAnalysis(docIds);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Analysis failed', err);
      setError(err?.response?.data?.detail || err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { runAnalysis, isAnalyzing, error };
}
