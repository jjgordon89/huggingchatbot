
import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal } from 'lucide-react';

export function ChatInput() {
  const { sendMessage, isLoading, isApiKeySet } = useChat();
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto focus the textarea on component mount
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

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

  return (
    <div className="p-4 border-t bg-background">
      <div className="max-w-3xl mx-auto">
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
          ) : (
            "Press Enter to send, Shift+Enter for a new line"
          )}
        </p>
      </div>
    </div>
  );
}
