import { useState, useEffect, useCallback } from 'react';
import { useSecureStorage } from './useSecureStorage';
import { InputValidator } from '@/lib/inputValidation';
import { useToast } from '@/hooks/use-toast';
import { ApiProvider } from '@/context/ChatContext';

export function useApiKeyManagement() {
  const [availableApiKeys, setAvailableApiKeys] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Load API keys from secure storage on mount
  useEffect(() => {
    const loadApiKeys = () => {
      const providers: ApiProvider[] = ['hugging face', 'openai', 'anthropic', 'google', 'openrouter', 'ollama', 'perplexity'];
      const keys: Record<string, boolean> = {};
      
      providers.forEach(provider => {
        const key = localStorage.getItem(`${provider}_api_key`);
        keys[provider] = !!key;
      });
      
      setAvailableApiKeys(keys);
    };
    
    loadApiKeys();
  }, []);

  const setApiKey = useCallback((key: string, provider: ApiProvider = 'hugging face'): boolean => {
    // Validate API key format
    if (!InputValidator.validateApiKey(key, provider)) {
      toast({
        title: "Invalid API Key",
        description: `Invalid API key format for ${provider}`,
        variant: "destructive"
      });
      return false;
    }

    try {
      localStorage.setItem(`${provider}_api_key`, key);
      setAvailableApiKeys(prev => ({ ...prev, [provider]: true }));
      
      toast({
        title: "API Key Saved",
        description: `${provider} API key saved successfully`,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to save API key:', error);
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const getApiKey = useCallback((provider: ApiProvider): string | null => {
    return localStorage.getItem(`${provider}_api_key`);
  }, []);

  const removeApiKey = useCallback((provider: ApiProvider): void => {
    try {
      localStorage.removeItem(`${provider}_api_key`);
      setAvailableApiKeys(prev => ({ ...prev, [provider]: false }));
      
      toast({
        title: "API Key Removed",
        description: `${provider} API key removed successfully`,
      });
    } catch (error) {
      console.error('Failed to remove API key:', error);
      toast({
        title: "Error",
        description: "Failed to remove API key",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Computed property for API key status
  const isApiKeySet = availableApiKeys['hugging face'] || 
                     availableApiKeys['openai'] || 
                     availableApiKeys['anthropic'] || 
                     availableApiKeys['google'] || 
                     availableApiKeys['openrouter'] || 
                     availableApiKeys['ollama'] ||
                     availableApiKeys['perplexity'];

  return {
    availableApiKeys,
    setApiKey,
    getApiKey,
    removeApiKey,
    isApiKeySet
  };
}