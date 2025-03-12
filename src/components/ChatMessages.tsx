
import React, { useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RagSources } from './RagSources';

export function ChatMessages() {
  const { messages, isLoading } = useChat();
  const endRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Find messages with RAG context
  const messagesWithContext = messages.map((message, index) => {
    const nextMessage = messages[index + 1];
    const hasRagContext = nextMessage?.role === 'assistant' && 
                          message.role === 'user' && 
                          nextMessage.content.includes('sources:');
    
    let sources: string[] = [];
    
    // Check for sources in the assistant message
    if (nextMessage?.role === 'assistant') {
      const sourcesMatch = nextMessage.content.match(/Sources:\s*\[(.*?)\]/);
      if (sourcesMatch) {
        sources = sourcesMatch[1].split(',').map(s => s.trim());
      }
    }
    
    return {
      ...message,
      sources
    };
  });
  
  return (
    <div className="p-4 overflow-y-auto flex-1 pb-32">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold">Welcome to AI Chat</h2>
            <p className="text-muted-foreground mt-2 mb-6">
              Start a conversation with an AI assistant
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              <SamplePrompt text="Explain what quantum computing is" />
              <SamplePrompt text="Write a short poem about nature" />
              <SamplePrompt text="Generate 5 creative business ideas" />
              <SamplePrompt text="What are the key features of React?" />
            </div>
          </div>
        ) : (
          messagesWithContext.map((message, index) => {
            if (message.role === 'system') return null;
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-4 rounded-lg",
                  message.role === 'assistant' ? 'bg-card/50 p-4' : ''
                )}
              >
                {message.role === 'assistant' ? (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                )}
                
                <div className="flex-1 overflow-hidden">
                  <div className={cn(
                    "prose dark:prose-invert max-w-none prose-headings:mb-2 prose-headings:mt-4 prose-p:my-2 prose-pre:my-2",
                    "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none"
                  )}>
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  
                  {message.sources && message.sources.length > 0 && (
                    <RagSources sources={message.sources} />
                  )}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-start gap-4 rounded-lg bg-card/50 p-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="h-4 w-12 bg-muted animate-pulse rounded mb-2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
                <div className="h-4 bg-muted animate-pulse rounded w-5/6"></div>
                <div className="h-4 bg-muted animate-pulse rounded w-4/6"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={endRef} />
      </div>
    </div>
  );
}

function SamplePrompt({ text }: { text: string }) {
  const { sendMessage } = useChat();
  
  return (
    <button 
      onClick={() => sendMessage(text)}
      className="p-3 text-left text-sm bg-muted rounded-lg hover:bg-muted/80 transition-colors"
    >
      {text}
    </button>
  );
}
