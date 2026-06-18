import type { ChatMessage as ChatMessageType } from '../../types';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../utils/cn';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Basic styling for the markdown to make it fit our theme
  const renderMarkdown = (content: string) => (
    <ReactMarkdown
      components={{
        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
        a: ({ node, ...props }) => <a className="text-cyan hover:underline" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-semibold text-text" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
        code: ({ node, ...props }) => <code className="bg-surface border border-border px-1 py-0.5 rounded text-xs font-mono" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className={cn("flex gap-3 text-sm", isUser ? 'flex-row-reverse' : '')}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isUser ? 'bg-cyan/20 text-cyan' : 'bg-surface2 border border-border text-text'
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={cn(
        "px-4 py-3 rounded-2xl max-w-[85%]",
        isUser ? 'bg-cyan/10 text-text rounded-tr-sm border border-cyan/20' : 'bg-surface2/50 text-text/90 rounded-tl-sm border border-border/50'
      )}>
        {renderMarkdown(message.content)}
        {message.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-cyan animate-pulse align-middle" />}
      </div>
    </div>
  );
}
