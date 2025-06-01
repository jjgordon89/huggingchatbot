
import React, { useEffect, useState } from 'react';
import { ModernChatMessages } from '@/components/ModernChatMessages';
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
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="flex-1 overflow-hidden relative">
        <ModernChatMessages />
        
        {/* LangChain status indicator with holographic styling */}
        {isGenerating && (
          <div className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center text-sm border border-blue-400/30 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
            Generating with LangChain...
          </div>
        )}
      </div>
      
      <div className="w-full mt-auto relative z-10">
        <ChatInput />
      </div>
      
      {/* Modern floating action button */}
      <div className="absolute bottom-20 right-4 z-10">
        <Button 
          onClick={handleCreateNewChat} 
          disabled={isCreatingChat || !isInitialized} 
          size="sm" 
          className="rounded-full h-12 w-12 p-0 bg-gradient-to-br from-purple-600 to-blue-600 border border-purple-400/30 shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] transition-all duration-300"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="sr-only">New Chat</span>
        </Button>
      </div>
    </div>
  );
}
