
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, Square, Paperclip, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/ChatContext';
import { useLangChain } from '@/hooks/use-langchain';
import { HolographicButton } from './HolographicButton';
import { HolographicOrb } from './HolographicOrb';

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
  };

  return (
    <div className="relative">
      {/* Enhanced background with Chroma effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 p-4 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          {/* Main input container with Chroma styling */}
          <div className={cn(
            "relative rounded-2xl transition-all duration-300 group",
            "bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95",
            "border border-purple-500/30 shadow-holographic backdrop-blur-xl",
            "hover:border-purple-400/50 hover:shadow-holographic-lg",
            isLoading && "border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.5)]"
          )}>
            {/* Chroma shine effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-conic from-transparent via-purple-500/5 via-blue-500/5 via-cyan-400/5 to-transparent opacity-50 animate-holographic-shine pointer-events-none" />
            
            {/* Status indicator with Chroma orb */}
            {isLoading && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <HolographicOrb size="xs" variant="chroma-1" />
              </div>
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
                
                {/* Enhanced character count with Chroma styling */}
                {input.length > 0 && (
                  <div className="absolute bottom-1 right-2 text-xs text-gray-500 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm border border-purple-500/20">
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

              {/* Enhanced send button with Chroma effect */}
              <HolographicButton
                type="submit"
                disabled={!input.trim() || isLoading}
                variant="chroma"
                chromaVariant="primary"
                size="sm"
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
              </HolographicButton>
            </div>
          </div>

          {/* Enhanced status indicator with Chroma orb */}
          {isLoading && (
            <div className="flex items-center justify-center mt-3 text-sm text-cyan-400">
              <div className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-cyan-400/20">
                <HolographicOrb size="xs" variant="chroma-1" />
                <span>Alfred is generating a response...</span>
              </div>
            </div>
          )}
        </form>

        {/* Enhanced helpful shortcuts with Chroma accents */}
        <div className="mt-3 text-center text-xs text-gray-500">
          <div className="flex items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-700/50 rounded-md text-gray-300 border border-purple-500/30">Enter</kbd>
              to send
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-700/50 rounded-md text-gray-300 border border-purple-500/30">Shift + Enter</kbd>
              for new line
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
