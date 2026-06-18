import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { api } from '../../api/client';
import { ChatMessage } from './ChatMessage';

export function ChatBar() {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { documents, chatMessages, addChatMessage, updateLastChatMessage } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const readyDocs = documents.filter(d => d.status === 'ready');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending || readyDocs.length === 0) return;

    const question = input.trim();
    setInput('');
    setIsSending(true);

    addChatMessage({ role: 'user', content: question });
    addChatMessage({ role: 'assistant', content: '', isStreaming: true });

    let fullResponse = '';
    const docIds = readyDocs.map(d => d.id);

    await api.streamChat(
      question,
      docIds,
      (chunk) => {
        fullResponse += chunk;
        updateLastChatMessage(fullResponse, true);
      },
      () => {
        setIsSending(false);
        updateLastChatMessage(fullResponse, false);
      },
      (error) => {
        setIsSending(false);
        updateLastChatMessage(fullResponse + `\n\n**Error:** ${error}`, false);
      }
    );
  };

  return (
    <div className="w-96 flex flex-col border-l border-border bg-surface shrink-0">
      <div className="p-4 border-b border-border bg-surface2/30">
        <h2 className="text-sm font-semibold tracking-wide text-text uppercase">Due Diligence Chat</h2>
        <p className="text-xs text-muted mt-1">Ask specific questions about the documents.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {chatMessages.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted">
            No messages yet. Ask a question to start.
          </div>
        ) : (
          chatMessages.map((msg, i) => <ChatMessage key={i} message={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-surface2/50">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending || readyDocs.length === 0}
            placeholder={readyDocs.length === 0 ? "Upload documents first..." : "Ask a question..."}
            className="flex-1 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text focus:outline-none focus:border-cyan disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending || readyDocs.length === 0}
            className="absolute right-2 top-2 p-1.5 text-muted hover:text-cyan disabled:opacity-50 disabled:hover:text-muted transition-colors rounded-md"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
