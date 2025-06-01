
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSqlite } from '@/hooks/use-sqlite';
import { useWorkspace } from './WorkspaceContext';
import { useLangChain } from '@/hooks/use-langchain';
import { useToast } from '@/hooks/use-toast';
import { HuggingFaceModel } from '@/lib/api';

// Message type definition
export interface Message {
  id: string;
  chatId?: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
  workspaceId?: string;
  hasThread?: boolean;
  sources?: any;
}

// Chat type definition
export interface Chat {
  id: string;
  title: string;
  workspaceId: string;
  createdAt: string;
  lastMessageAt: string;
  lastMessage?: string;
}

// API Provider type
export type ApiProvider = 'hugging face' | 'openai' | 'anthropic' | 'google' | 'openrouter' | 'ollama';

// Context type definition
interface ChatContextType {
  messages: Message[];
  chats: Chat[];
  activeChatId: string | null;
  activeThreadId: string | null;
  isLoading: boolean;
  activeModel: HuggingFaceModel;
  availableApiKeys: Record<string, boolean>;
  ragEnabled: boolean;
  webSearchEnabled: boolean;
  isApiKeySet: boolean;
  sendMessage: (content: string) => Promise<void>;
  createNewChat: () => Promise<void>;
  switchChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  startThread: (messageId: string) => void;
  exitThread: () => void;
  setActiveModel: (model: HuggingFaceModel) => void;
  refreshChats: () => Promise<void>;
  setApiKey: (key: string, provider?: ApiProvider) => boolean;
  getApiKey: (provider: ApiProvider) => string | null;
  startNewChat: () => Promise<void>;
  clearChats: () => void;
  clearAllChats: () => void;
  setRagEnabled: (enabled: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<HuggingFaceModel>({
    id: 'mistralai/Mistral-7B-Instruct-v0.2',
    name: 'Mistral 7B',
    description: 'Balanced performance with moderate resource usage',
    task: 'text-generation',
    provider: 'Hugging Face',
    maxTokens: 8192
  });
  const [availableApiKeys, setAvailableApiKeys] = useState<Record<string, boolean>>({});
  const [ragEnabled, setRagEnabled] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  const { activeWorkspaceId } = useWorkspace();
  const { createChat, getChats, addMessage, getMessages, isInitialized } = useSqlite();
  const { generateChatResponse } = useLangChain();
  const { toast } = useToast();

  // Load API keys from localStorage on mount
  useEffect(() => {
    const loadApiKeys = () => {
      const providers: ApiProvider[] = ['hugging face', 'openai', 'anthropic', 'google', 'openrouter', 'ollama'];
      const keys: Record<string, boolean> = {};
      
      providers.forEach(provider => {
        const key = localStorage.getItem(`${provider}_api_key`);
        keys[provider] = !!key;
      });
      
      setAvailableApiKeys(keys);
    };
    
    loadApiKeys();
  }, []);

  // Computed property for API key status
  const isApiKeySet = availableApiKeys['hugging face'] || availableApiKeys['openai'] || availableApiKeys['anthropic'] || availableApiKeys['google'] || availableApiKeys['openrouter'] || availableApiKeys['ollama'];

  // Load chats when workspace changes
  useEffect(() => {
    if (isInitialized && activeWorkspaceId) {
      refreshChats();
    }
  }, [isInitialized, activeWorkspaceId]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId);
      localStorage.setItem('activeChatId', activeChatId);
    }
  }, [activeChatId]);

  const refreshChats = async () => {
    if (!activeWorkspaceId) return;
    
    try {
      const workspaceChats = await getChats(activeWorkspaceId);
      setChats(workspaceChats);
      
      // If no active chat, set the first one or create new one
      if (!activeChatId && workspaceChats.length > 0) {
        setActiveChatId(workspaceChats[0].id);
      } else if (!activeChatId && workspaceChats.length === 0) {
        await createNewChat();
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
      toast({
        title: "Error",
        description: "Failed to load chats",
        variant: "destructive"
      });
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const chatMessages = await getMessages(chatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  };

  const createNewChat = async () => {
    if (!activeWorkspaceId) return;
    
    try {
      const chatId = await createChat(activeWorkspaceId, 'New Chat');
      
      // Add system message
      await addMessage(chatId, activeWorkspaceId, {
        role: 'system',
        content: 'You are a helpful, friendly, and knowledgeable AI assistant. Answer questions accurately and helpfully.'
      });
      
      await refreshChats();
      setActiveChatId(chatId);
      
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
  };

  const sendMessage = async (content: string) => {
    if (!activeChatId || !activeWorkspaceId || !content.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Add user message
      const userMessageId = await addMessage(activeChatId, activeWorkspaceId, {
        role: 'user',
        content: content.trim()
      });
      
      // Reload messages to show user message
      await loadMessages(activeChatId);
      
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
      await loadMessages(activeChatId);
      await refreshChats();
      
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
  };

  const switchChat = (chatId: string) => {
    setActiveChatId(chatId);
    setActiveThreadId(null); // Exit any active thread
  };

  const deleteChat = async (chatId: string) => {
    try {
      // Implementation would go here - for now just remove from state
      setChats(prev => prev.filter(c => c.id !== chatId));
      
      if (activeChatId === chatId) {
        const remainingChats = chats.filter(c => c.id !== chatId);
        if (remainingChats.length > 0) {
          setActiveChatId(remainingChats[0].id);
        } else {
          await createNewChat();
        }
      }
      
      toast({
        title: "Chat Deleted",
        description: "Chat conversation deleted"
      });
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive"
      });
    }
  };

  const startThread = (messageId: string) => {
    setActiveThreadId(messageId);
    toast({
      title: "Thread Started",
      description: "Thread view activated"
    });
  };

  const exitThread = () => {
    setActiveThreadId(null);
    toast({
      title: "Thread Exited",
      description: "Returned to main chat view"
    });
  };

  const setApiKey = (key: string, provider: ApiProvider = 'hugging face'): boolean => {
    try {
      localStorage.setItem(`${provider}_api_key`, key);
      setAvailableApiKeys(prev => ({ ...prev, [provider]: true }));
      return true;
    } catch (error) {
      console.error('Failed to save API key:', error);
      return false;
    }
  };

  const getApiKey = (provider: ApiProvider): string | null => {
    return localStorage.getItem(`${provider}_api_key`);
  };

  const startNewChat = async () => {
    await createNewChat();
  };

  const clearChats = () => {
    setChats([]);
    setActiveChatId(null);
  };

  const clearAllChats = () => {
    clearChats();
  };

  const value: ChatContextType = {
    messages,
    chats,
    activeChatId,
    activeThreadId,
    isLoading,
    activeModel,
    availableApiKeys,
    ragEnabled,
    webSearchEnabled,
    isApiKeySet,
    sendMessage,
    createNewChat,
    switchChat,
    deleteChat,
    startThread,
    exitThread,
    setActiveModel,
    refreshChats,
    setApiKey,
    getApiKey,
    startNewChat,
    clearChats,
    clearAllChats,
    setRagEnabled
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
