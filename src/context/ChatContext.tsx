
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
import { 
  availableSkills, 
  detectSkill, 
  executeSkill,
  Skill
} from '@/lib/skillsService';
import { WeatherData } from '@/lib/weatherService';
import { useWorkspace } from './WorkspaceContext';

// Define skill result type
type SkillResult = {
  skillId: string;
  data: any;
};

// Extend the Message type to support threading
type ThreadedMessage = Message & {
  threadId?: string; // ID of the thread this message belongs to
  parentId?: string; // ID of the parent message in a thread
  hasThread?: boolean; // Whether this message has a thread
  skillResult?: SkillResult; // Add this property for skill results
  workspaceId?: string; // ID of the workspace this message belongs to
};

// Define chat type to include workspace ID
type Chat = {
  id: string;
  title: string;
  messages: ThreadedMessage[];
  workspaceId: string; // Associated workspace ID
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
  chats: Chat[];
  activeModel: HuggingFaceModel;
  availableModels: HuggingFaceModel[];
  isApiKeySet: boolean;
  ragEnabled: boolean;
  webSearchEnabled: boolean;
  ragSettings: RagSettings;
  skillsEnabled: boolean;
  setSkillsEnabled: (enabled: boolean) => void;
  availableSkills: Skill[];
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
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeModel, setActiveModel] = useState<HuggingFaceModel>(AVAILABLE_MODELS[0]);
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(!!getApiKey());
  const [ragEnabled, setRagEnabled] = useState<boolean>(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(false);
  const [ragSettings, setRagSettings] = useState<RagSettings>(DEFAULT_RAG_SETTINGS);
  const [skillsEnabled, setSkillsEnabled] = useState<boolean>(true);
  
  const { toast } = useToast();
  const { activeWorkspaceId } = useWorkspace();

  // Effect to initialize from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    const savedActiveChatId = localStorage.getItem('activeChatId');
    const savedActiveThreadId = localStorage.getItem('activeThreadId');
    const savedActiveModelId = localStorage.getItem('activeModelId');
    const savedRagEnabled = localStorage.getItem('ragEnabled');
    const savedWebSearchEnabled = localStorage.getItem('webSearchEnabled');
    const savedRagSettings = localStorage.getItem('ragSettings');
    const savedSkillsEnabled = localStorage.getItem('skillsEnabled');
    
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
    
    if (savedSkillsEnabled) {
      setSkillsEnabled(savedSkillsEnabled === 'true');
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
    localStorage.setItem('skillsEnabled', skillsEnabled.toString());
  }, [chats, activeChatId, activeThreadId, activeModel.id, ragEnabled, webSearchEnabled, ragSettings, skillsEnabled]);

  // Update RAG settings
  const updateRagSettings = useCallback((settings: Partial<RagSettings>) => {
    setRagSettings(prev => ({
      ...prev,
      ...settings
    }));
  }, []);

  // Get the active chat's messages, filtered by workspace
  const messages = activeChatId 
    ? chats.find(chat => chat.id === activeChatId && (!activeWorkspaceId || chat.workspaceId === activeWorkspaceId))?.messages.filter(msg => {
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
    if (!activeWorkspaceId) return;

    const systemMessage: ThreadedMessage = {
      id: uuidv4(),
      role: 'system',
      content: 'You are a helpful, friendly, and knowledgeable AI assistant. Answer questions accurately and helpfully.',
      timestamp: new Date(),
      workspaceId: activeWorkspaceId
    };
    
    const newChatId = uuidv4();
    const newChat: Chat = {
      id: newChatId,
      title: 'New Chat',
      messages: [systemMessage],
      workspaceId: activeWorkspaceId
    };
    
    setChats(prev => [...prev, newChat]);
    setActiveChatId(newChatId);
    setActiveThreadId(null);
  }, [activeWorkspaceId]);

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

  // If no chats exist for the active workspace, start a new one
  useEffect(() => {
    if (isApiKeySet && activeWorkspaceId) {
      const workspaceChats = chats.filter(chat => chat.workspaceId === activeWorkspaceId);
      
      if (workspaceChats.length === 0) {
        startNewChat();
      } else if (!activeChatId || !workspaceChats.some(chat => chat.id === activeChatId)) {
        // If active chat doesn't exist in this workspace, set to first available
        setActiveChatId(workspaceChats[0].id);
        setActiveThreadId(null);
      }
    }
  }, [chats, activeChatId, startNewChat, isApiKeySet, activeWorkspaceId]);

  // Switch to a different chat
  const switchChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    setActiveThreadId(null);
  }, []);

  // Delete a chat
  const deleteChat = useCallback((chatId: string) => {
    if (!activeWorkspaceId) return false;
    
    // Filter chats by active workspace before deciding what to do
    const workspaceChats = chats.filter(chat => chat.workspaceId === activeWorkspaceId);
    
    // Don't allow deleting if it's the only chat in the workspace
    if (workspaceChats.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one chat in each workspace",
        variant: "destructive"
      });
      return false;
    }
    
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    
    // If deleted the active chat, switch to first available in the workspace
    if (activeChatId === chatId) {
      const remainingWorkspaceChats = workspaceChats.filter(chat => chat.id !== chatId);
      if (remainingWorkspaceChats.length > 0) {
        setActiveChatId(remainingWorkspaceChats[0].id);
      }
      setActiveThreadId(null);
    }
    
    return true;
  }, [activeChatId, chats, activeWorkspaceId, toast]);

  // Clear all chats for the current workspace
  const clearChats = useCallback(() => {
    if (!activeWorkspaceId) return;
    
    // Filter out chats from the current workspace
    setChats(prev => {
      const filteredChats = prev.filter(chat => chat.workspaceId !== activeWorkspaceId);
      return filteredChats;
    });
    
    setActiveChatId(null);
    setActiveThreadId(null);
    
    // Create a new chat for the workspace
    startNewChat();
  }, [activeWorkspaceId, startNewChat]);

  // Set the API key
  const updateApiKey = useCallback((key: string) => {
    try {
      setApiKey(key);
      setIsApiKeySet(!!key);
      
      if (!!key && activeWorkspaceId && !chats.some(chat => chat.workspaceId === activeWorkspaceId)) {
        startNewChat();
      }
      
      return true;
    } catch (error) {
      console.error('Error setting API key:', error);
      return false;
    }
  }, [chats, startNewChat, activeWorkspaceId]);

  // Update the model
  const updateActiveModel = useCallback((model: HuggingFaceModel) => {
    setActiveModel(model);
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string, parentId?: string) => {
    if (!activeChatId || !activeWorkspaceId) return;
    
    try {
      // Create user message
      const userMessage: ThreadedMessage = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date(),
        threadId: parentId ? activeThreadId : undefined,
        parentId: parentId || undefined,
        workspaceId: activeWorkspaceId
      };
      
      // Add user message to chat
      setChats(prev => {
        return prev.map(chat => {
          if (chat.id === activeChatId && chat.workspaceId === activeWorkspaceId) {
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

      // Check if query matches any skill
      let skillResult: any = null;
      let skillUsed: Skill | null = null;
      
      if (skillsEnabled) {
        skillUsed = detectSkill(content, availableSkills);
        
        if (skillUsed) {
          try {
            console.log(`Using skill: ${skillUsed.name} for query: ${content}`);
            skillResult = await executeSkill(skillUsed, content);
            console.log('Skill result:', skillResult);
          } catch (error) {
            console.error(`Error executing skill ${skillUsed.name}:`, error);
            // Continue with regular AI response if skill fails
            skillUsed = null;
          }
        }
      }
      
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
      const currentChat = chats.find(chat => chat.id === activeChatId && chat.workspaceId === activeWorkspaceId);
      if (!currentChat) throw new Error('Chat not found');
      
      // Filter messages to get relevant context for the thread
      const contextMessages = currentChat.messages.filter(msg => {
        if (activeThreadId) {
          return msg.threadId === activeThreadId || msg.id === activeThreadId;
        }
        return !msg.threadId;
      });
      
      const updatedMessages = [...contextMessages, userMessage];

      let assistantContent = '';
      
      // Handle skill response if applicable
      if (skillUsed && skillResult) {
        // For skills like weather, create a tailored response
        if (skillUsed.id === 'weather') {
          const weatherData = skillResult as WeatherData;
          assistantContent = `Here's the current weather for ${weatherData.location}:\n\n` +
            `🌡️ Temperature: ${weatherData.temperature}°C\n` +
            `☁️ Conditions: ${weatherData.condition}\n` +
            `💧 Humidity: ${weatherData.humidity}%\n` +
            `🌬️ Wind: ${weatherData.windSpeed} m/s`;
            
          if (weatherData.forecast) {
            assistantContent += "\n\n**5-Day Forecast:**\n";
            weatherData.forecast.forEach(day => {
              assistantContent += `- ${day.date}: ${day.condition}, ${day.temperature.min}°C to ${day.temperature.max}°C\n`;
            });
          }
        } else {
          // Generic skill response format
          assistantContent = `I've found this information for you:\n\n${JSON.stringify(skillResult, null, 2)}`;
        }
      } else {
        // Normal AI query without skill
        assistantContent = await queryModel(
          activeModel.id,
          updatedMessages,
          context
        );
      }
      
      // Create assistant message
      const assistantMessage: ThreadedMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        sources: sources.length > 0 ? sources : undefined,
        threadId: userMessage.threadId,
        parentId: userMessage.id,
        skillResult: skillUsed && skillResult ? {
          skillId: skillUsed.id,
          data: skillResult
        } : undefined,
        workspaceId: activeWorkspaceId
      };
      
      // Add assistant message to chat
      setChats(prev => {
        return prev.map(chat => {
          if (chat.id === activeChatId && chat.workspaceId === activeWorkspaceId) {
            return {
              ...chat,
              messages: [...chat.messages, assistantMessage]
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
          if (chat.id === activeChatId && chat.workspaceId === activeWorkspaceId) {
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
  }, [activeChatId, activeThreadId, activeWorkspaceId, chats, activeModel.id, toast, ragEnabled, webSearchEnabled, ragSettings, skillsEnabled]);

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
    skillsEnabled,
    setSkillsEnabled,
    availableSkills,
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
