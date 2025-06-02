
import { useState, useCallback } from 'react';
import { Message } from '@/context/ChatContext';
import { useSqlite } from '@/hooks/use-sqlite';
import { useLangChain } from '@/hooks/use-langchain';
import { useToast } from '@/hooks/use-toast';
import { HuggingFaceModel } from '@/lib/api';
import { withErrorHandling } from '@/lib/errorHandling';

export function useChatMessages(activeWorkspaceId: string | null, activeChatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { addMessage, getMessages } = useSqlite();
  const { generateChatResponse } = useLangChain();
  const { toast } = useToast();

  const loadMessages = useCallback(async (chatId: string) => {
    const result = await withErrorHandling(
      () => getMessages(chatId),
      'Loading messages',
      { showToast: false }
    );
    
    if (result) {
      setMessages(result);
    }
  }, [getMessages]);

  const sendMessage = useCallback(async (
    content: string, 
    activeModel: HuggingFaceModel
  ) => {
    if (!activeChatId || !activeWorkspaceId || !content.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Add user message
      await withErrorHandling(
        () => addMessage(activeChatId, activeWorkspaceId, {
          role: 'user',
          content: content.trim()
        }),
        'Adding user message'
      );
      
      // Reload messages to show user message
      await loadMessages(activeChatId);
      
      // Prepare messages for AI
      const currentMessages = await withErrorHandling(
        () => getMessages(activeChatId),
        'Getting messages for AI'
      );
      
      if (!currentMessages) return;
      
      const langchainMessages = currentMessages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }));
      
      // Generate AI response with retry logic
      const aiResponse = await withErrorHandling(
        () => generateChatResponse(langchainMessages, {
          model: activeModel.id,
          temperature: 0.7
        }),
        'Generating AI response',
        { retries: 2, retryDelay: 2000 }
      );
      
      if (!aiResponse) {
        toast({
          title: "AI Response Failed",
          description: "Failed to generate response. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Add AI response
      await withErrorHandling(
        () => addMessage(activeChatId, activeWorkspaceId, {
          role: 'assistant',
          content: aiResponse
        }),
        'Adding AI response'
      );
      
      // Reload messages to show AI response
      await loadMessages(activeChatId);
      
    } finally {
      setIsLoading(false);
    }
  }, [activeChatId, activeWorkspaceId, addMessage, loadMessages, getMessages, generateChatResponse, toast]);

  return {
    messages,
    isLoading,
    loadMessages,
    sendMessage,
    setMessages
  };
}
