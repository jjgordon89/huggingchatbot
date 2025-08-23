import { useState, useCallback } from 'react';
import { useSqlite } from '@/hooks/use-sqlite';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useLangChain } from '@/hooks/use-langchain';
import { useToast } from '@/hooks/use-toast';
import { InputValidator } from '@/lib/inputValidation';
import { HuggingFaceModel } from '@/lib/api';
import { Message, Chat } from '@/context/ChatContext';

export function useChatOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const { activeWorkspaceId } = useWorkspace();
  const { createChat, addMessage, getMessages } = useSqlite();
  const { generateChatResponse } = useLangChain();
  const { toast } = useToast();

  const sendMessage = useCallback(async (
    content: string,
    activeChatId: string | null,
    activeModel: HuggingFaceModel,
    onMessagesUpdate: (chatId: string) => Promise<void>,
    onChatsRefresh: () => Promise<void>
  ) => {
    if (!activeChatId || !activeWorkspaceId) return;
    
    // Validate and sanitize input
    const validation = InputValidator.validateChatMessage(content);
    if (!validation.isValid) {
      toast({
        title: "Invalid Message",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Add user message
      await addMessage(activeChatId, activeWorkspaceId, {
        role: 'user',
        content: validation.sanitized
      });
      
      // Reload messages to show user message
      await onMessagesUpdate(activeChatId);
      
      // Prepare messages for AI
      const currentMessages = await getMessages(activeChatId);
      const langchainMessages = currentMessages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }));
      
      // Generate AI response
      const aiResponse = await generateChatResponse(langchainMessages, {
        model: activeModel.id,
        temperature: 0.7
      });
      
      // Add AI response
      await addMessage(activeChatId, activeWorkspaceId, {
        role: 'assistant',
        content: aiResponse
      });
      
      // Reload messages to show AI response
      await onMessagesUpdate(activeChatId);
      await onChatsRefresh();
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId, addMessage, getMessages, generateChatResponse, toast]);

  const createNewChat = useCallback(async (
    onChatsRefresh: () => Promise<void>,
    onChatSwitch: (chatId: string) => void
  ) => {
    if (!activeWorkspaceId) return;
    
    try {
      const chatId = await createChat(activeWorkspaceId, 'New Chat');
      
      // Add system message
      await addMessage(chatId, activeWorkspaceId, {
        role: 'system',
        content: 'You are a helpful, friendly, and knowledgeable AI assistant. Answer questions accurately and helpfully.'
      });
      
      await onChatsRefresh();
      onChatSwitch(chatId);
      
      toast({
        title: "Chat Created",
        description: "New chat conversation started"
      });
    } catch (error) {
      console.error('Failed to create chat:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive"
      });
    }
  }, [activeWorkspaceId, createChat, addMessage, toast]);

  return {
    sendMessage,
    createNewChat,
    isLoading
  };
}