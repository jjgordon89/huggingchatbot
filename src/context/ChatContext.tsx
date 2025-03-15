import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  getApiKey, 
  setApiKey, 
  Message, 
  queryModel, 
  searchSimilarDocuments, 
  AVAILABLE_MODELS, 
  HuggingFaceModel,
  EMBEDDING_MODELS,
  getCurrentEmbeddingModel,
  DocumentType
} from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { searchWeb, formatSearchResultsAsContext } from '@/lib/webSearchService';

// Extend the Message type to support threading
type ThreadedMessage = Message & {
  threadId?: string; // ID of the thread this message belongs to
  parentId?: string; // ID of the parent message in a thread
  hasThread?: boolean; // Whether this message has a thread
};

// Define RAG settings type
export type RagSettings = {
  topK: number;
  similarityThreshold: number;
  enhancedContext: boolean;
  searchResultsCount: number;
  searchTimeRange: "day" | "week" | "month" | "year";
  autoCitation: boolean;
};

// Define the context type
type ChatContextType = {
  messages: ThreadedMessage[];
  isLoading: boolean;
  activeChatId: string | null;
  activeThreadId: string | null;
  chats: { id: string; title: string; messages: ThreadedMessage[] }[];
  activeModel: HuggingFaceModel;
  availableModels: HuggingFaceModel[];
  isApiKeySet: boolean;
  ragEnabled: boolean;
  webSearchEnabled: boolean;
  ragSettings: RagSettings;
  setRagEnabled: (enabled: boolean) => void;
  setWebSearchEnabled: (enabled: boolean) => void;
  updateRagSettings: (settings: Partial<RagSettings>) => void;
  sendMessage: (content: string, parentId?: string) => Promise<void>;
  startThread: (messageId: string) => void;
  exitThread: () => void;
  startNewChat: () => void;
  switchChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  clearChats: () => void;
  setApiKey: (key: string) => boolean;
  setActiveModel: (model: HuggingFaceModel) => void;
};

// Default RAG settings
const DEFAULT_RAG_SETTINGS: RagSettings = {
  topK: 3,
  similarityThreshold: 70,
  enhancedContext: false,
  searchResultsCount: 3,
  searchTimeRange: "month",
  autoCitation: true
};

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Create a provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<{ id: string; title: string; messages: ThreadedMessage[] }[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeModel, setActiveModel] = useState<HuggingFaceModel>(AVAILABLE_MODELS[0]);
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(!!getApiKey());
  const [ragEnabled, setRagEnabled] = useState<boolean>(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(false);
  const [ragSettings, setRagSettings] = useState<RagSettings>(DEFAULT_RAG_SETTINGS);
  
  const { toast } = useToast();

  // Effect to initialize from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    const savedActiveChatId = localStorage.getItem('activeChatId');
    const savedActiveThreadId = localStorage.getItem('activeThreadId');
    const savedActiveModelId = localStorage.getItem('activeModelId');
    const savedRagEnabled = localStorage.getItem('ragEnabled');
    const savedWebSearchEnabled = localStorage.getItem('webSearchEnabled');
    const savedRagSettings = localStorage.getItem('ragSettings');
    
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
    
    if (savedActiveThreadId) {
      setActiveThreadId(savedActiveThreadId);
    }
    
    if (savedActiveModelId) {
      const model = AVAILABLE_MODELS.find(m => m.id === savedActiveModelId);
      if (model) setActiveModel(model);
    }
    
    if (savedRagEnabled) {
      setRagEnabled(savedRagEnabled === 'true');
    }

    if (savedWebSearchEnabled) {
      setWebSearchEnabled(savedWebSearchEnabled === 'true');
    }
    
    if (savedRagSettings) {
      try {
        setRagSettings({
          ...DEFAULT_RAG_SETTINGS,
          ...JSON.parse(savedRagSettings)
        });
      } catch (e) {
        console.error('Failed to parse saved RAG settings:', e);
      }
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
    
    if (activeThreadId) {
      localStorage.setItem('activeThreadId', activeThreadId);
    } else {
      localStorage.removeItem('activeThreadId');
    }
    
    localStorage.setItem('activeModelId', activeModel.id);
    localStorage.setItem('ragEnabled', ragEnabled.toString());
    localStorage.setItem('webSearchEnabled', webSearchEnabled.toString());
    localStorage.setItem('ragSettings', JSON.stringify(ragSettings));
  }, [chats, activeChatId, activeThreadId, activeModel.id, ragEnabled, webSearchEnabled, ragSettings]);

  // Update RAG settings
  const updateRagSettings = useCallback((settings: Partial<RagSettings>) => {
    setRagSettings(prev => ({
      ...prev,
      ...settings
    }));
  }, []);

  // Get the active chat's messages
  const messages = activeChatId 
    ? chats.find(chat => chat.id === activeChatId)?.messages.filter(msg => {
        if (activeThreadId) {
          // When viewing a thread, show only messages in this thread
          return msg.threadId === activeThreadId || msg.id === activeThreadId;
        } else {
          // In main view, show only messages without a thread ID (main conversation)
          return !msg.threadId;
        }
      }) || []
    : [];

  // Start a new chat
  const startNewChat = useCallback(() => {
    const systemMessage: ThreadedMessage = {
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
    setActiveThreadId(null);
  }, []);

  // Start a thread from a message
  const startThread = useCallback((messageId: string) => {
    setActiveThreadId(messageId);
    
    // Mark the parent message as having a thread
    setChats(prev => {
      return prev.map(chat => {
        if (chat.id === activeChatId) {
          const updatedMessages = chat.messages.map(msg => {
            if (msg.id === messageId) {
              return { ...msg, hasThread: true };
            }
            return msg;
          });
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      });
    });
  }, [activeChatId]);

  // Exit the current thread
  const exitThread = useCallback(() => {
    setActiveThreadId(null);
  }, []);

  // If no chats exist, start a new one
  useEffect(() => {
    if (chats.length === 0 && isApiKeySet) {
      startNewChat();
    } else if (activeChatId && !chats.find(chat => chat.id === activeChatId)) {
      // If active chat doesn't exist anymore, set to first available or null
      setActiveChatId(chats.length > 0 ? chats[0].id : null);
      setActiveThreadId(null);
    }
  }, [chats, activeChatId, startNewChat, isApiKeySet]);

  // Switch to a different chat
  const switchChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    setActiveThreadId(null);
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
      setActiveThreadId(null);
    }
  }, [activeChatId, chats]);

  // Clear all chats
  const clearChats = useCallback(() => {
    setChats([]);
    setActiveChatId(null);
    setActiveThreadId(null);
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
  const sendMessage = useCallback(async (content: string, parentId?: string) => {
    if (!activeChatId) return;
    
    try {
      // Create user message
      const userMessage: ThreadedMessage = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date(),
        threadId: parentId ? activeThreadId : undefined,
        parentId: parentId || undefined
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
            
            if (chat.title === 'New Chat' && !activeThreadId && chat.messages.length === 1) {
              // If first user message in main chat, use it as title
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
      let context: any = undefined;
      let sources: string[] = [];
      
      if (ragEnabled) {
        try {
          const similarDocs = await searchSimilarDocuments(
            content, 
            ragSettings.topK,
            ragSettings.similarityThreshold / 100 // Convert to decimal
          );
          
          if (similarDocs.length > 0) {
            // Get the current embedding model info
            const embeddingModel = getCurrentEmbeddingModel();
            
            // Format the context with document information
            let formattedDocuments = [];
            
            for (const doc of similarDocs) {
              let docContent = doc.content;
              
              // Apply enhanced context formatting if enabled
              if (ragSettings.enhancedContext) {
                // Add structured formatting based on document type
                if (doc.type === 'pdf') {
                  // Add page markers and structure for PDFs
                  docContent = docContent.replace(/\[Page (\d+)\]/g, '### Page $1\n');
                } else if (doc.type === 'markdown') {
                  // Keep markdown structure
                  docContent = docContent;
                } else if (doc.type === 'csv' || doc.type === 'excel') {
                  // Format tabular data
                  docContent = `Table data from ${doc.title}:\n${docContent}`;
                } else if (doc.type === 'code') {
                  // Format code with appropriate markers
                  docContent = `\`\`\`\n${docContent}\n\`\`\``;
                }
              }
              
              // Add document type information to help the AI understand the content
              let docInfo = `[${doc.type.toUpperCase()}] ${doc.title}\n\n`;
              formattedDocuments.push(docInfo + docContent);
              
              // Create source citation with similarity score
              sources.push(`${doc.title} (${doc.type}, similarity: ${(doc.similarity * 100).toFixed(1)}%)`);
            }
            
            context = {
              documents: formattedDocuments,
              sources: sources
            };
            
            console.log('RAG context:', context);
          }
        } catch (error) {
          console.error('Error in RAG processing:', error);
          // Continue without RAG if it fails
        }
      }
      
      // If web search is enabled, search the web
      if (webSearchEnabled) {
        try {
          console.log('Performing web search for:', content);
          const searchResponse = await searchWeb(content, {
            count: ragSettings.searchResultsCount,
            timeRange: ragSettings.searchTimeRange
          });
          
          if (searchResponse.results.length > 0) {
            // Format search results as context
            const searchContext = formatSearchResultsAsContext(searchResponse.results, {
              includeCitations: ragSettings.autoCitation
            });
            
            // Add search context to existing context
            if (context) {
              context.documents = [
                ...(context.documents || []),
                searchContext
              ];
              
              // Add search results as sources
              context.sources = [
                ...(context.sources || []),
                ...searchResponse.results.map(result => `Web: ${result.title} (${result.source})`)
              ];
              
              sources = context.sources;
            } else {
              context = {
                documents: [searchContext],
                sources: searchResponse.results.map(result => `Web: ${result.title} (${result.source})`)
              };
              
              sources = context.sources;
            }
            
            console.log('Web search context:', searchContext);
          }
        } catch (error) {
          console.error('Error in web search processing:', error);
          toast({
            title: "Web Search Failed",
            description: "Couldn't retrieve search results, but continuing with AI response",
            variant: "destructive"
          });
          // Continue without web search if it fails
        }
      }
      
      // Get the updated messages after adding user message
      const currentChat = chats.find(chat => chat.id === activeChatId);
      if (!currentChat) throw new Error('Chat not found');
      
      // Filter messages to get relevant context for the thread
      const contextMessages = currentChat.messages.filter(msg => {
        if (activeThreadId) {
          return msg.threadId === activeThreadId || msg.id === activeThreadId;
        }
        return !msg.threadId;
      });
      
      const updatedMessages = [...contextMessages, userMessage];
      
      // Query the model
      const assistantContent = await queryModel(
        activeModel.id,
        updatedMessages,
        context
      );
      
      // Create assistant message
      const assistantMessage: ThreadedMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        sources: sources.length > 0 ? sources : undefined,
        threadId: userMessage.threadId,
        parentId: userMessage.id
      };
      
      // Add assistant message to chat
      setChats(prev => {
        return prev.map(chat => {
          if (chat.id === activeChatId) {
            return {
              ...chat,
              messages: [...chat.messages, {
                ...assistantMessage,
                sources
              }]
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
  }, [activeChatId, activeThreadId, chats, activeModel.id, toast, ragEnabled, webSearchEnabled, ragSettings]);

  const value = {
    messages,
    isLoading,
    activeChatId,
    activeThreadId,
    chats,
    activeModel,
    availableModels: AVAILABLE_MODELS,
    isApiKeySet,
    ragEnabled,
    webSearchEnabled,
    ragSettings,
    setRagEnabled,
    setWebSearchEnabled,
    updateRagSettings,
    sendMessage,
    startThread,
    exitThread,
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
