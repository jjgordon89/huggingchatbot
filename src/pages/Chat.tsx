
import React, { useEffect, useState } from 'react';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { useSqlite } from '@/hooks/use-sqlite';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { MessageSquare, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLangChain } from '@/hooks/use-langchain';

export default function Chat() {
  const { isInitialized, createChat, error: dbError } = useSqlite();
  const { activeWorkspaceId } = useWorkspace();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { toast } = useToast();
  const { isGenerating } = useLangChain();

  useEffect(() => {
    if (isInitialized && activeWorkspaceId) {
      console.log("Chat component ready with workspace:", activeWorkspaceId);
    }
    
    if (dbError) {
      toast({
        title: "Database Error",
        description: dbError,
        variant: "destructive"
      });
    }
  }, [isInitialized, activeWorkspaceId, dbError, toast]);

  const handleCreateNewChat = async () => {
    if (!activeWorkspaceId) return;
    
    try {
      setIsCreatingChat(true);
      await createChat(activeWorkspaceId);
      toast({
        title: "Chat Created",
        description: "New chat conversation started"
      });
    } catch (err) {
      console.error("Failed to create chat:", err);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive"
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden relative">
        <ChatMessages />
        
        {/* LangChain status indicator */}
        {isGenerating && (
          <div className="absolute bottom-4 left-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-3 py-1 rounded-full flex items-center text-xs">
            <Sparkles className="h-3 w-3 mr-1.5 animate-pulse" />
            Generating with LangChain...
          </div>
        )}
      </div>
      
      <div className="w-full mt-auto">
        <ChatInput />
      </div>
      
      {/* Quick action button */}
      <div className="absolute bottom-20 right-4">
        <Button 
          onClick={handleCreateNewChat} 
          disabled={isCreatingChat || !isInitialized} 
          size="sm" 
          className="rounded-full h-10 w-10 p-0"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="sr-only">New Chat</span>
        </Button>
      </div>
    </div>
  );
}
