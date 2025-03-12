
import { useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Message } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

export function ChatMessages() {
  const { messages, isLoading } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (messages.length <= 1) {  // Only system message or no messages
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-4 animate-fade-up">
          <Bot className="h-12 w-12 mx-auto text-primary opacity-80" />
          <h2 className="text-2xl font-semibold tracking-tight">Welcome to AI Chatbot</h2>
          <p className="text-muted-foreground">
            Start a conversation with our AI. Ask questions, seek information, or just chat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          {/* Filter out system messages */}
          {messages
            .filter(message => message.role !== 'system')
            .map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
        </div>
        
        {isLoading && <ThinkingIndicator />}
        
        <div ref={bottomRef} className="h-10" />
      </div>
    </ScrollArea>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <div 
      className={cn(
        "group flex gap-3 transition-opacity",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1 flex-shrink-0">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      
      <div className={cn(
        "flex flex-col max-w-[85%] sm:max-w-[75%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-lg text-sm",
          isUser 
            ? "bg-primary text-primary-foreground"
            : "bg-card shadow-subtle"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        <span className="text-xs text-muted-foreground mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {message.timestamp && format(new Date(message.timestamp), 'h:mm a')}
        </span>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1 flex-shrink-0">
          <User className="h-4 w-4 text-primary" />
        </div>
      )}
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3 mt-6">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Bot className="h-4 w-4 text-primary animate-pulse" />
      </div>
      
      <div className="px-4 py-3 rounded-lg bg-card shadow-subtle max-w-[85%] sm:max-w-[75%]">
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse delay-0" />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse delay-300" />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse delay-500" />
        </div>
      </div>
    </div>
  );
}
