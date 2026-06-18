import axios from 'axios';
import type { Document, AnalysisResult } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const api = {
  uploadDocument: async (file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<Document>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  listDocuments: async (): Promise<Document[]> => {
    const { data } = await apiClient.get<Document[]>('/documents');
    return data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },

  getDocumentStatus: async (id: string): Promise<Pick<Document, 'id' | 'status' | 'chunk_count' | 'error_message'>> => {
    const { data } = await apiClient.get(`/documents/${id}/status`);
    return data;
  },

  runAnalysis: async (docIds: string[]): Promise<AnalysisResult> => {
    const { data } = await apiClient.post<AnalysisResult>('/analysis/run', { doc_ids: docIds });
    return data;
  },

  streamChat: async (
    question: string,
    docIds: string[],
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (err: string) => void
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/analysis/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, doc_ids: docIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onDone();
            } else if (data.startsWith('[ERROR]')) {
              onError(data.slice(8));
            } else {
              onChunk(data);
            }
          }
        }
      }
    } catch (err: any) {
      onError(err.message || 'Stream failed');
    }
  },
};
