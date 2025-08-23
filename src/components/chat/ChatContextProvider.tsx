import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSqlite } from '@/hooks/use-sqlite';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { useChatOperations } from '@/hooks/useChatOperations';
import { useApiKeyManagement } from '@/hooks/useApiKeyManagement';
import { HuggingFaceModel } from '@/lib/api';

// Re-export types for backward compatibility
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

export interface Chat {
  id: string;
  title: string;
  workspaceId: string;
  createdAt: string;
  lastMessageAt: string;
  lastMessage?: string;
}

export type ApiProvider = 'hugging face' | 'openai' | 'anthropic' | 'google' | 'openrouter' | 'ollama' | 'perplexity';

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
  const [activeModel, setActiveModel] = useState<HuggingFaceModel>({
    id: 'mistralai/Mistral-7B-Instruct-v0.2',
    name: 'Mistral 7B',
    description: 'Balanced performance with moderate resource usage',
    task: 'text-generation',
    provider: 'Hugging Face',
    maxTokens: 8192
  });
  const [ragEnabled, setRagEnabled] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  const { activeWorkspaceId } = useWorkspace();
  const { getChats, getMessages, isInitialized } = useSqlite();
  const { toast } = useToast();
  
  // Use extracted hooks
  const chatOps = useChatOperations();
  const apiKeyMgmt = useApiKeyManagement();

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
        await chatOps.createNewChat(refreshChats, setActiveChatId);
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

  const sendMessage = async (content: string) => {
    await chatOps.sendMessage(content, activeChatId, activeModel, loadMessages, refreshChats);
  };

  const createNewChat = async () => {
    await chatOps.createNewChat(refreshChats, setActiveChatId);
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

  const value: ChatContextType = {
    messages,
    chats,
    activeChatId,
    activeThreadId,
    isLoading: chatOps.isLoading,
    activeModel,
    availableApiKeys: apiKeyMgmt.availableApiKeys,
    ragEnabled,
    webSearchEnabled,
    isApiKeySet: apiKeyMgmt.isApiKeySet,
    sendMessage,
    createNewChat,
    switchChat,
    deleteChat,
    startThread,
    exitThread,
    setActiveModel,
    refreshChats,
    setApiKey: apiKeyMgmt.setApiKey,
    getApiKey: apiKeyMgmt.getApiKey,
    startNewChat: createNewChat,
    clearChats: () => {
      setChats([]);
      setActiveChatId(null);
    },
    clearAllChats: () => {
      setChats([]);
      setActiveChatId(null);
    },
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