
import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal, Search, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { isBraveApiKeySet } from '@/lib/webSearchService';

export function ChatInput() {
  const { 
    sendMessage, 
    isLoading, 
    isApiKeySet, 
    ragEnabled, 
    webSearchEnabled,
    activeThreadId 
  } = useChat();
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isBraveKeySet = isBraveApiKeySet();

  useEffect(() => {
    // Auto focus the textarea on component mount
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeThreadId]); // Refocus when changing threads

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading || !isApiKeySet) return;
    
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const isWebSearchReady = webSearchEnabled && isBraveKeySet;
  const isWebSearchPending = webSearchEnabled && !isBraveKeySet;

  return (
    <div className="p-4 border-t bg-background">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-2 justify-center flex-wrap">
          {activeThreadId && (
            <Badge variant="outline" className="bg-primary/10 flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>Thread Reply</span>
            </Badge>
          )}
          {ragEnabled && (
            <Badge variant="outline" className="bg-primary/10">
              RAG Enabled
            </Badge>
          )}
          {isWebSearchReady && (
            <Badge variant="outline" className="bg-primary/10 flex items-center gap-1">
              <Search className="h-3 w-3" />
              <span>Web Search</span>
            </Badge>
          )}
          {isWebSearchPending && (
            <Badge variant="outline" className="bg-destructive/10 flex items-center gap-1">
              <Search className="h-3 w-3" />
              <span>Web Search (API Key Required)</span>
            </Badge>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              !isApiKeySet
                ? "Please set your Hugging Face API key in settings"
                : isLoading
                ? "Waiting for response..."
                : activeThreadId
                ? "Reply to thread..."
                : isWebSearchReady 
                ? "Ask anything (web search enabled)..."
                : isWebSearchPending
                ? "Set your Brave Search API key in settings"
                : "Type a message..."
            }
            disabled={isLoading || !isApiKeySet}
            className="resize-none pr-12 min-h-[60px] max-h-40 focus-visible:ring-1 smooth-transition"
            rows={1}
          />
          
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading || !isApiKeySet}
            className="absolute bottom-1.5 right-1.5 h-8 w-8 rounded-full"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </form>
        
        <p className="text-xs text-center text-muted-foreground mt-2">
          {!isApiKeySet ? (
            "Click the settings icon to add your Hugging Face API key"
          ) : isWebSearchPending ? (
            "Web search is enabled but requires a Brave Search API key"
          ) : activeThreadId ? (
            "Replying in thread - Press Enter to send"
          ) : (
            "Press Enter to send, Shift+Enter for a new line"
          )}
        </p>
      </div>
    </div>
  );
}
