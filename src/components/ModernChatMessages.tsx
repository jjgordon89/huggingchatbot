
import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '@/context/ChatContext';
import ReactMarkdown from 'react-markdown';
import { 
  User, 
  Bot, 
  MessageCircle, 
  ArrowLeft, 
  Copy, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HolographicCard } from './HolographicCard';
import { HolographicBackground } from './HolographicBackground';
import { ModernWelcomeScreen } from './ModernWelcomeScreen';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';

export function ModernChatMessages() {
  const {
    messages,
    isLoading,
    startThread,
    exitThread,
    activeThreadId
  } = useChat();
  const endRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Copy message content to clipboard
  const copyMessageContent = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    toast({
      title: "Copied to clipboard",
      description: "Message content copied",
      duration: 2000,
    });
    
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      <HolographicBackground />
      
      <div className="relative z-10 overflow-y-auto flex-1 pb-32 chat-scroll-area">
        {activeThreadId && (
          <div className="sticky top-0 z-20 p-4">
            <HolographicCard variant="glass" className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium flex items-center gap-3 text-white">
                  <MessageCircle className="h-5 w-5 text-cyan-400" />
                  <span>Thread View</span>
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 text-sm gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-200"
                  onClick={exitThread}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Exit Thread
                </Button>
              </div>
            </HolographicCard>
          </div>
        )}
        
        {messages.length === 0 ? (
          <ModernWelcomeScreen />
        ) : (
          <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
            {messages.map((message) => {
              if (message.role === 'system') return null;
              
              const isAssistant = message.role === 'assistant';
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    "group flex gap-4 transition-all duration-300",
                    isAssistant ? 'justify-start' : 'justify-end'
                  )}
                >
                  <div className={cn(
                    "max-w-3xl",
                    isAssistant ? 'order-1' : 'order-2'
                  )}>
                    <HolographicCard 
                      variant={isAssistant ? 'primary' : 'secondary'}
                      className={cn(
                        "group relative",
                        isAssistant ? 'mr-12' : 'ml-12'
                      )}
                    >
                      {/* Avatar */}
                      <div className={cn(
                        "absolute -top-2 w-12 h-12 rounded-full border-2 flex items-center justify-center",
                        isAssistant 
                          ? '-left-4 border-purple-400/50 bg-gradient-to-br from-purple-600 to-blue-600' 
                          : '-right-4 border-cyan-400/50 bg-gradient-to-br from-cyan-600 to-blue-600'
                      )}>
                        {isAssistant ? (
                          <Bot className="h-6 w-6 text-white" />
                        ) : (
                          <User className="h-6 w-6 text-white" />
                        )}
                      </div>
                      
                      {/* Message header */}
                      <div className={cn(
                        "flex justify-between items-center mb-3",
                        !isAssistant && "flex-row-reverse"
                      )}>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium text-sm",
                            isAssistant ? "text-cyan-300" : "text-blue-300"
                          )}>
                            {isAssistant ? 'Alfred AI' : 'You'}
                          </span>
                          
                          {isAssistant && (
                            <Badge className="text-[10px] py-0 h-5 bg-purple-500/20 border-purple-400/30 text-purple-200">
                              <Sparkles className="h-2.5 w-2.5 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                            onClick={() => copyMessageContent(message.content, message.id)}
                          >
                            {copiedMessageId === message.id ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Message content */}
                      <div className={cn(
                        "prose dark:prose-invert max-w-none",
                        "prose-headings:text-white prose-p:text-gray-200 prose-strong:text-cyan-300",
                        "prose-code:bg-black/30 prose-code:text-cyan-300 prose-code:border prose-code:border-cyan-500/30 prose-code:rounded prose-code:px-2 prose-code:py-1",
                        "prose-pre:bg-black/50 prose-pre:border prose-pre:border-purple-500/30 prose-pre:rounded-lg",
                        "prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline"
                      )}>
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      
                      {/* Thread indicator for user messages */}
                      {!activeThreadId && message.role === 'user' && (
                        <div className="mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-400 hover:text-cyan-400 h-7"
                            onClick={() => startThread(message.id)}
                          >
                            <MessageCircle className="h-3 w-3 mr-1.5" />
                            Start Thread
                          </Button>
                        </div>
                      )}
                    </HolographicCard>
                  </div>
                </div>
              );
            })}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <HolographicCard variant="primary" className="mr-12 max-w-md">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center animate-pulse">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-cyan-300 text-sm font-medium">Alfred AI</span>
                        <Badge className="text-[10px] py-0 h-4 bg-purple-500/20 border-purple-400/30 text-purple-200 animate-pulse">
                          <Sparkles className="h-2 w-2 mr-1" />
                          Thinking...
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-600/50 animate-pulse rounded-full w-full"></div>
                        <div className="h-3 bg-gray-600/50 animate-pulse rounded-full w-4/5"></div>
                        <div className="h-3 bg-gray-600/50 animate-pulse rounded-full w-3/5"></div>
                      </div>
                    </div>
                  </div>
                </HolographicCard>
              </div>
            )}
            
            <div ref={endRef} className="h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
