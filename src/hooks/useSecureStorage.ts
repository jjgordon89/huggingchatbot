
import { useState, useEffect, useCallback } from 'react';
import { errorService } from '@/lib/errorHandling';

export type StorageType = 'localStorage' | 'sessionStorage' | 'memory';

interface SecureStorageOptions {
  encrypt?: boolean;
  expiry?: number; // in milliseconds
  type?: StorageType;
}

export function useSecureStorage<T>(
  key: string, 
  defaultValue: T,
  options: SecureStorageOptions = {}
) {
  const { type = 'localStorage', expiry } = options;
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // Simple encryption/decryption (in production, use proper encryption)
  const encrypt = (data: string): string => {
    if (!options.encrypt) return data;
    return btoa(data); // Basic base64 encoding
  };

  const decrypt = (data: string): string => {
    if (!options.encrypt) return data;
    try {
      return atob(data); // Basic base64 decoding
    } catch {
      return data; // Return as-is if decryption fails
    }
  };

  const getStorage = (): Storage | null => {
    if (typeof window === 'undefined') return null;
    
    switch (type) {
      case 'sessionStorage':
        return window.sessionStorage;
      case 'localStorage':
        return window.localStorage;
      default:
        return null;
    }
  };

  const getStoredValue = useCallback((): T => {
    try {
      const storage = getStorage();
      if (!storage) return defaultValue;

      const item = storage.getItem(key);
      if (!item) return defaultValue;

      const decrypted = decrypt(item);
      const parsed = JSON.parse(decrypted);

      // Check expiry
      if (expiry && parsed.timestamp) {
        const isExpired = Date.now() - parsed.timestamp > expiry;
        if (isExpired) {
          storage.removeItem(key);
          return defaultValue;
        }
        return parsed.value;
      }

      return parsed.value || parsed; // Handle both wrapped and unwrapped values
    } catch (error) {
      errorService.logError(error as Error, `SecureStorage: getStoredValue for ${key}`);
      return defaultValue;
    }
  }, [key, defaultValue, expiry, type]);

  const setStoredValue = useCallback((newValue: T) => {
    try {
      const storage = getStorage();
      if (!storage) {
        setValue(newValue);
        return;
      }

      const dataToStore = expiry 
        ? { value: newValue, timestamp: Date.now() }
        : { value: newValue };

      const serialized = JSON.stringify(dataToStore);
      const encrypted = encrypt(serialized);
      
      storage.setItem(key, encrypted);
      setValue(newValue);
    } catch (error) {
      errorService.logError(error as Error, `SecureStorage: setStoredValue for ${key}`);
      setValue(newValue); // Still update state even if storage fails
    }
  }, [key, expiry, type]);

  const removeStoredValue = useCallback(() => {
    try {
      const storage = getStorage();
      if (storage) {
        storage.removeItem(key);
      }
      setValue(defaultValue);
    } catch (error) {
      errorService.logError(error as Error, `SecureStorage: removeStoredValue for ${key}`);
    }
  }, [key, defaultValue, type]);

  // Load initial value
  useEffect(() => {
    const storedValue = getStoredValue();
    setValue(storedValue);
    setIsLoading(false);
  }, [getStoredValue]);

  return {
    value,
    setValue: setStoredValue,
    removeValue: removeStoredValue,
    isLoading
  };
}

// Specialized hook for API keys with additional security
export function useApiKeyStorage(provider: string) {
  const { value, setValue, removeValue, isLoading } = useSecureStorage(
    `${provider}_api_key`,
    '',
    {
      encrypt: true,
      expiry: 7 * 24 * 60 * 60 * 1000, // 7 days
      type: 'localStorage'
    }
  );

  const isKeyValid = useCallback((key: string): boolean => {
    if (!key || key.length < 10) return false;
    
    // Add provider-specific validation
    switch (provider) {
      case 'openai':
        return key.startsWith('sk-');
      case 'anthropic':
        return key.startsWith('sk-ant-');
      case 'hugging face':
        return key.startsWith('hf_');
      default:
        return true;
    }
  }, [provider]);

  const setApiKey = useCallback((key: string): boolean => {
    if (!isKeyValid(key)) {
      errorService.logError(
        new Error('Invalid API key format'),
        `API Key validation for ${provider}`
      );
      return false;
    }
    
    setValue(key);
    return true;
  }, [provider, isKeyValid, setValue]);

  return {
    apiKey: value,
    setApiKey,
    removeApiKey: removeValue,
    isLoading,
    isValid: isKeyValid(value)
  };
}
