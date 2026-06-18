import { create } from 'zustand';
import type { Document, AnalysisResult, ChatMessage } from '../types';

interface AppState {
  documents: Document[];
  analysisResult: AnalysisResult | null;
  activeTab: 'risk' | 'growth' | 'summary';
  isAnalyzing: boolean;
  chatMessages: ChatMessage[];
  
  setDocuments: (docs: Document[]) => void;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, partial: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setActiveTab: (tab: 'risk' | 'growth' | 'summary') => void;
  setIsAnalyzing: (is: boolean) => void;
  addChatMessage: (msg: ChatMessage) => void;
  updateLastChatMessage: (content: string, isStreaming?: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  documents: [],
  analysisResult: null,
  activeTab: 'summary',
  isAnalyzing: false,
  chatMessages: [],

  setDocuments: (docs) => set({ documents: docs }),
  addDocument: (doc) => set((state) => ({ documents: [...state.documents, doc] })),
  updateDocument: (id, partial) => set((state) => ({
    documents: state.documents.map((d) => d.id === id ? { ...d, ...partial } : d)
  })),
  removeDocument: (id) => set((state) => ({
    documents: state.documents.filter((d) => d.id !== id)
  })),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsAnalyzing: (is) => set({ isAnalyzing: is }),
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  updateLastChatMessage: (content, isStreaming = true) => set((state) => {
    const msgs = [...state.chatMessages];
    if (msgs.length > 0) {
      msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content, isStreaming };
    }
    return { chatMessages: msgs };
  }),
}));
