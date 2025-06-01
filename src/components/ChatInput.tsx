
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, Square, Paperclip, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/ChatContext';
import { useLangChain } from '@/hooks/use-langchain';
import { GlassButton } from './GlassButton';

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
          {/* Main input container with enhanced holographic styling */}
          <div className={cn(
            "relative rounded-2xl transition-all duration-300 group",
            "bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95",
            "border border-purple-500/30 shadow-holographic backdrop-blur-xl",
            "hover:border-purple-400/50 hover:shadow-holographic-lg",
            isLoading && "border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.5)]"
          )}>
            {/* Enhanced holographic shine effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50 animate-holographic-shine pointer-events-none" />
            
            {/* Status indicator bar */}
            {isLoading && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 rounded-t-2xl animate-pulse" />
            )}
            
            <div className="relative flex items-end gap-3 p-4">
              {/* Enhanced attachment button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 h-9 w-9 text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all duration-200 hover:scale-105"
              >
                <Paperclip className="h-4 w-4" />
                <span className="sr-only">Attach file</span>
              </Button>

              {/* Enhanced text input */}
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isLoading ? "AI is thinking..." : "Ask Alfred anything..."}
                  disabled={isLoading}
                  className={cn(
                    "min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent text-white placeholder:text-gray-400",
                    "focus:ring-0 focus:outline-none p-0 text-base",
                    "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-600"
                  )}
                  rows={1}
                />
                
                {/* Enhanced character count */}
                {input.length > 0 && (
                  <div className="absolute bottom-1 right-2 text-xs text-gray-500 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                    {input.length}/2000
                  </div>
                )}
              </div>

              {/* Enhanced voice recording button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleMicClick}
                className={cn(
                  "shrink-0 h-9 w-9 transition-all duration-200",
                  isRecording 
                    ? "text-red-400 hover:text-red-300 hover:bg-red-500/20 animate-pulse scale-110" 
                    : "text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 hover:scale-105"
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

              {/* Enhanced send button */}
              <GlassButton
                type="submit"
                disabled={!input.trim() || isLoading}
                size="sm"
                variant="primary"
                glow
                className={cn(
                  "shrink-0 h-9 w-9 p-0 rounded-xl",
                  "disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                )}
              >
                {isLoading ? (
                  <Sparkles className="h-4 w-4 animate-pulse" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send message</span>
              </GlassButton>
            </div>
          </div>

          {/* Enhanced status indicator */}
          {isLoading && (
            <div className="flex items-center justify-center mt-3 text-sm text-cyan-400">
              <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-cyan-400/20">
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>Alfred is generating a response...</span>
              </div>
            </div>
          )}
        </form>

        {/* Enhanced helpful shortcuts */}
        <div className="mt-3 text-center text-xs text-gray-500">
          <div className="flex items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-700/50 rounded-md text-gray-300 border border-gray-600/50">Enter</kbd>
              to send
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-700/50 rounded-md text-gray-300 border border-gray-600/50">Shift + Enter</kbd>
              for new line
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
