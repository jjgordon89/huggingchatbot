
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getApiKey, setApiKey, Message, queryModel, searchSimilarDocuments, AVAILABLE_MODELS, HuggingFaceModel } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";

// Define the context type
type ChatContextType = {
  messages: Message[];
  isLoading: boolean;
  activeChatId: string | null;
  chats: { id: string; title: string; messages: Message[] }[];
  activeModel: HuggingFaceModel;
  availableModels: HuggingFaceModel[];
  isApiKeySet: boolean;
  ragEnabled: boolean;
  setRagEnabled: (enabled: boolean) => void;
  sendMessage: (content: string) => Promise<void>;
  startNewChat: () => void;
  switchChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  clearChats: () => void;
  setApiKey: (key: string) => boolean;
  setActiveModel: (model: HuggingFaceModel) => void;
};

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Create a provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<{ id: string; title: string; messages: Message[] }[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeModel, setActiveModel] = useState<HuggingFaceModel>(AVAILABLE_MODELS[0]);
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(!!getApiKey());
  const [ragEnabled, setRagEnabled] = useState<boolean>(false);
  
  const { toast } = useToast();

  // Effect to initialize from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    const savedActiveChatId = localStorage.getItem('activeChatId');
    const savedActiveModelId = localStorage.getItem('activeModelId');
    const savedRagEnabled = localStorage.getItem('ragEnabled');
    
    if (savedChats) {
      try {
        setChats(JSON.parse(savedChats));
      } catch (e) {
        console.error('Failed to parse saved chats:', e);
      }
    }
    
    if (savedActiveChatId) {
      setActiveChatId(savedActiveChatId);
    }
    
    if (savedActiveModelId) {
      const model = AVAILABLE_MODELS.find(m => m.id === savedActiveModelId);
      if (model) setActiveModel(model);
    }
    
    if (savedRagEnabled) {
      setRagEnabled(savedRagEnabled === 'true');
    }
  }, []);

  // Effect to save to localStorage when state changes
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('chats', JSON.stringify(chats));
    }
    
    if (activeChatId) {
      localStorage.setItem('activeChatId', activeChatId);
    }
    
    localStorage.setItem('activeModelId', activeModel.id);
    localStorage.setItem('ragEnabled', ragEnabled.toString());
  }, [chats, activeChatId, activeModel.id, ragEnabled]);

  // Get the active chat's messages
  const messages = activeChatId 
    ? chats.find(chat => chat.id === activeChatId)?.messages || []
    : [];

  // Start a new chat
  const startNewChat = useCallback(() => {
    const systemMessage: Message = {
      id: uuidv4(),
      role: 'system',
      content: 'You are a helpful, friendly, and knowledgeable AI assistant. Answer questions accurately and helpfully.',
      timestamp: new Date()
    };
    
    const newChatId = uuidv4();
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      messages: [systemMessage]
    };
    
    setChats(prev => [...prev, newChat]);
    setActiveChatId(newChatId);
  }, []);

  // If no chats exist, start a new one
  useEffect(() => {
    if (chats.length === 0 && isApiKeySet) {
      startNewChat();
    } else if (activeChatId && !chats.find(chat => chat.id === activeChatId)) {
      // If active chat doesn't exist anymore, set to first available or null
      setActiveChatId(chats.length > 0 ? chats[0].id : null);
    }
  }, [chats, activeChatId, startNewChat, isApiKeySet]);

  // Switch to a different chat
  const switchChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
  }, []);

  // Delete a chat
  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    
    // If deleted the active chat, switch to first available or null
    if (activeChatId === chatId) {
      setActiveChatId(prev => {
        const remainingChats = chats.filter(chat => chat.id !== chatId);
        return remainingChats.length > 0 ? remainingChats[0].id : null;
      });
    }
  }, [activeChatId, chats]);

  // Clear all chats
  const clearChats = useCallback(() => {
    setChats([]);
    setActiveChatId(null);
  }, []);

  // Set the API key
  const updateApiKey = useCallback((key: string) => {
    try {
      setApiKey(key);
      setIsApiKeySet(!!key);
      
      if (!!key && chats.length === 0) {
        startNewChat();
      }
      
      return true;
    } catch (error) {
      console.error('Error setting API key:', error);
      return false;
    }
  }, [chats.length, startNewChat]);

  // Update the model
  const updateActiveModel = useCallback((model: HuggingFaceModel) => {
    setActiveModel(model);
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!activeChatId) return;
    
    try {
      // Create user message
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date()
      };
      
      // Add user message to chat
      setChats(prev => {
        return prev.map(chat => {
          if (chat.id === activeChatId) {
            // Auto-generate title from first user message if still default
            let updatedChat = {
              ...chat,
              messages: [...chat.messages, userMessage]
            };
            
            if (chat.title === 'New Chat' && chat.messages.length === 1) {
              // If first user message, use it as title
              updatedChat.title = content.length > 30 
                ? content.substring(0, 30) + '...' 
                : content;
            }
            
            return updatedChat;
          }
          return chat;
        });
      });
      
      setIsLoading(true);
      
      // If RAG is enabled, search for similar documents
      let context = undefined;
      if (ragEnabled) {
        try {
          const similarDocs = await searchSimilarDocuments(content);
          if (similarDocs.length > 0) {
            context = {
              documents: similarDocs.map(doc => doc.content),
              sources: similarDocs.map(doc => doc.id)
            };
          }
        } catch (error) {
          console.error('Error in RAG processing:', error);
          // Continue without RAG if it fails
        }
      }
      
      // Get the updated messages after adding user message
      const currentChat = chats.find(chat => chat.id === activeChatId);
      if (!currentChat) throw new Error('Chat not found');
      
      const updatedMessages = [...currentChat.messages, userMessage];
      
      // Query the model
      const assistantContent = await queryModel(
        activeModel.id,
        updatedMessages,
        context
      );
      
      // Create assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date()
      };
      
      // Add assistant message to chat
      setChats(prev => {
        return prev.map(chat => {
          if (chat.id === activeChatId) {
            return {
              ...chat,
              messages: [...chat.messages, userMessage, assistantMessage]
            };
          }
          return chat;
        });
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive"
      });
      
      // Remove the user message if failed
      setChats(prev => {
        return prev.map(chat => {
          if (chat.id === activeChatId) {
            return {
              ...chat,
              messages: chat.messages.filter(m => m.content !== content || m.role !== 'user')
            };
          }
          return chat;
        });
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeChatId, chats, activeModel.id, toast, ragEnabled]);

  const value = {
    messages,
    isLoading,
    activeChatId,
    chats,
    activeModel,
    availableModels: AVAILABLE_MODELS,
    isApiKeySet,
    ragEnabled,
    setRagEnabled,
    sendMessage,
    startNewChat,
    switchChat,
    deleteChat,
    clearChats,
    setApiKey: updateApiKey,
    setActiveModel: updateActiveModel
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Create a hook to use the chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
