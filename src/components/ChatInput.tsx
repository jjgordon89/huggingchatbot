
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, Square, Paperclip, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/ChatContext';
import { useLangChain } from '@/hooks/use-langchain';

export function ChatInput() {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading: chatLoading } = useChat();
  const { isGenerating } = useLangChain();
  
  const isLoading = chatLoading || isGenerating;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleMicClick = () => {
    setIsRecording(!isRecording);
    // Voice recording implementation would go here
  };

  return (
    <div className="relative">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 p-4 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          {/* Main input container with holographic styling */}
          <div className={cn(
            "relative rounded-2xl transition-all duration-300",
            "bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95",
            "border border-purple-500/30 shadow-[0_0_20px_rgba(147,51,234,0.3)]",
            "hover:border-purple-400/50 hover:shadow-[0_0_30px_rgba(147,51,234,0.4)]",
            isLoading && "border-cyan-400/50 shadow-[0_0_25px_rgba(34,211,238,0.4)]"
          )}>
            {/* Holographic shine effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50 animate-holographic-shine pointer-events-none" />
            
            <div className="relative flex items-end gap-3 p-4">
              {/* Attachment button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 h-9 w-9 text-gray-400 hover:text-cyan-400 hover:bg-white/10 transition-colors"
              >
                <Paperclip className="h-4 w-4" />
                <span className="sr-only">Attach file</span>
              </Button>

              {/* Text input */}
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isLoading ? "AI is thinking..." : "Type your message..."}
                  disabled={isLoading}
                  className={cn(
                    "min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent text-white placeholder:text-gray-400",
                    "focus:ring-0 focus:outline-none p-0",
                    "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-600"
                  )}
                  rows={1}
                />
                
                {/* Character count or status indicator */}
                {input.length > 0 && (
                  <div className="absolute bottom-1 right-2 text-xs text-gray-500">
                    {input.length}/2000
                  </div>
                )}
              </div>

              {/* Voice recording button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleMicClick}
                className={cn(
                  "shrink-0 h-9 w-9 transition-all duration-200",
                  isRecording 
                    ? "text-red-400 hover:text-red-300 hover:bg-red-500/20 animate-pulse" 
                    : "text-gray-400 hover:text-cyan-400 hover:bg-white/10"
                )}
              >
                {isRecording ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isRecording ? 'Stop recording' : 'Start voice recording'}
                </span>
              </Button>

              {/* Send button */}
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "shrink-0 h-9 w-9 p-0 rounded-xl transition-all duration-200",
                  "bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500",
                  "border border-purple-400/30 shadow-[0_0_15px_rgba(147,51,234,0.4)]",
                  "hover:shadow-[0_0_25px_rgba(147,51,234,0.6)] hover:scale-105",
                  "disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                )}
              >
                {isLoading ? (
                  <Sparkles className="h-4 w-4 animate-pulse" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>

          {/* Status indicator */}
          {isLoading && (
            <div className="flex items-center justify-center mt-3 text-sm text-cyan-400">
              <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
              <span>AI is generating a response...</span>
            </div>
          )}
        </form>

        {/* Helpful shortcuts */}
        <div className="mt-2 text-center text-xs text-gray-500">
          Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">Enter</kbd> to send, 
          <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300 ml-1">Shift + Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
}
