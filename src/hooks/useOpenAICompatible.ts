import { useState, useEffect } from 'react';
import { useSecureStorage } from './useSecureStorage';

export interface OpenAICompatibleModel {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  modelId: string;
  description?: string;
  createdAt: string;
}

export function useOpenAICompatible() {
  const [models, setModels] = useState<OpenAICompatibleModel[]>([]);
  
  // Load models from secure storage
  const { value: storedModels, setValue: setStoredModels, isLoading } = useSecureStorage<OpenAICompatibleModel[]>(
    'openai_compatible_models',
    [],
    { encrypt: true, type: 'localStorage' }
  );

  useEffect(() => {
    if (!isLoading && storedModels) {
      setModels(storedModels);
    }
  }, [storedModels, isLoading]);

  const addModel = async (model: Omit<OpenAICompatibleModel, 'id' | 'createdAt'>) => {
    const newModel: OpenAICompatibleModel = {
      ...model,
      id: `openai-compatible-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const updatedModels = [...models, newModel];
    await setStoredModels(updatedModels);
    setModels(updatedModels);
    return newModel;
  };

  const updateModel = async (id: string, updates: Partial<OpenAICompatibleModel>) => {
    const updatedModels = models.map(model => 
      model.id === id ? { ...model, ...updates } : model
    );
    await setStoredModels(updatedModels);
    setModels(updatedModels);
  };

  const removeModel = async (id: string) => {
    const updatedModels = models.filter(model => model.id !== id);
    await setStoredModels(updatedModels);
    setModels(updatedModels);
  };

  const getModel = (id: string) => {
    return models.find(model => model.id === id);
  };

  // Convert to model selector format
  const getSelectorModels = () => {
    return models.map(model => ({
      id: model.id,
      name: model.name,
      description: model.description || `Custom OpenAI Compatible model: ${model.modelId}`,
      category: 'custom',
      provider: 'OpenAI Compatible',
      contextLength: 4096, // Default, can be customized later
      strengths: ['Custom', 'Self-hosted'],
      icon: 'Server' as any,
      apiKeyRequired: false, // Handled separately
      baseUrl: model.baseUrl,
      apiKey: model.apiKey,
      modelId: model.modelId
    }));
  };

  return {
    models,
    addModel,
    updateModel,
    removeModel,
    getModel,
    getSelectorModels,
    isLoading
  };
}