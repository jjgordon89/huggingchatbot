
// Re-export from the new location for backward compatibility
export { ChatProvider, useChat } from '@/components/chat/ChatContextProvider';
export type { Message, Chat, ApiProvider } from '@/components/chat/ChatContextProvider';

// Update API provider type to include Perplexity
export type ApiProviderExtended = 'hugging face' | 'openai' | 'anthropic' | 'google' | 'openrouter' | 'ollama' | 'perplexity';
