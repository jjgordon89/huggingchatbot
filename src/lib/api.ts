/**
 * API utilities for the application
 * This file provides functions for accessing external APIs and services
 */

/**
 * Embedding model information
 */
export interface EmbeddingModel {
  id: string;
  name: string;
  dimensions: number;
  language: string;
  description: string;
  category: string;
}

/**
 * Document interface - exported for use in other modules
 */
export interface Document {
  id: string;
  name: string;
  title?: string;
  type: string;
  size: number;
  uploadedAt: Date;
  createdAt: Date;
  content?: string;
  filename?: string;
  url?: string;
  workspaceId?: string;
  metadata?: Record<string, any>;
}

/**
 * Available embedding models
 */
export const EMBEDDING_MODELS: EmbeddingModel[] = [
  {
    id: "BAAI/bge-small-en-v1.5",
    name: "BGE Small",
    dimensions: 384,
    language: "English",
    description: "Fast and efficient embedding model, good balance of speed and quality",
    category: "general"
  },
  {
    id: "BAAI/bge-base-en-v1.5",
    name: "BGE Base",
    dimensions: 768,
    language: "English",
    description: "Standard embedding model with good performance across various tasks",
    category: "general"
  },
  {
    id: "BAAI/bge-large-en-v1.5",
    name: "BGE Large",
    dimensions: 1024,
    language: "English",
    description: "High-quality embedding model for maximum accuracy, larger context window",
    category: "general"
  },
  {
    id: "sentence-transformers/all-MiniLM-L6-v2",
    name: "MiniLM",
    dimensions: 384,
    language: "English",
    description: "Very efficient model, good for resource-constrained environments",
    category: "general"
  },
  {
    id: "sentence-transformers/all-mpnet-base-v2",
    name: "MPNet",
    dimensions: 768,
    language: "English",
    description: "Strong general purpose embeddings with good semantic understanding",
    category: "general"
  },
  {
    id: "thenlper/gte-large",
    name: "GTE Large",
    dimensions: 1024,
    language: "Multilingual",
    description: "General Text Embeddings model with strong performance across languages",
    category: "multilingual"
  },
  {
    id: "intfloat/e5-large-v2",
    name: "E5 Large",
    dimensions: 1024,
    language: "English",
    description: "Optimized for retrieval tasks with excellent performance",
    category: "specialized"
  },
  {
    id: "jinaai/jina-embeddings-v2-base-en",
    name: "Jina Base",
    dimensions: 768,
    language: "English",
    description: "Efficient embeddings with strong performance on retrieval tasks",
    category: "specialized"
  }
];

/**
 * Current embedding model state
 */
let currentEmbeddingModel: EmbeddingModel = EMBEDDING_MODELS[0];

/**
 * Get the current embedding model
 * @returns The current embedding model
 */
export function getCurrentEmbeddingModel(): EmbeddingModel {
  return currentEmbeddingModel;
}

/**
 * Set the current embedding model by ID
 * @param modelId The model ID to set as current
 * @returns The new current model
 */
export function setEmbeddingModel(modelId: string): EmbeddingModel {
  const model = EMBEDDING_MODELS.find(m => m.id === modelId);
  if (!model) {
    throw new Error(`Embedding model ${modelId} not found`);
  }
  
  currentEmbeddingModel = model;
  return model;
}

/**
 * Create embeddings for the given texts
 * This is a mock implementation that generates random embeddings of the correct dimension
 * In a real implementation, this would call a Hugging Face API endpoint
 * 
 * @param texts Array of texts to generate embeddings for
 * @param modelId Optional model ID (defaults to current model)
 * @returns Promise resolving to array of embedding arrays
 */
export async function createEmbeddings(
  texts: string[], 
  modelId?: string
): Promise<number[][]> {
  const model = modelId 
    ? EMBEDDING_MODELS.find(m => m.id === modelId) 
    : currentEmbeddingModel;
  
  if (!model) {
    throw new Error(`Embedding model ${modelId || 'unknown'} not found`);
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generate random embeddings of the correct dimension
  return texts.map(() => {
    // Generate random unit vector of the correct dimension
    const vec = Array.from({ length: model.dimensions }, () => Math.random() * 2 - 1);
    
    // Normalize to unit length
    const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    return vec.map(v => v / magnitude);
  });
}

/**
 * Saves API keys to local storage
 * @param apiKey The API key to save
 * @param type The type of API key
 */
export function saveApiKey(apiKey: string, type: string): void {
  localStorage.setItem(`${type}_api_key`, apiKey);
}

/**
 * Gets an API key from local storage
 * @param type The type of API key
 * @returns The API key or empty string if not found
 */
export function getApiKey(type: string): string {
  return localStorage.getItem(`${type}_api_key`) || '';
}

/**
 * Sets API key in storage
 * @param key The key to store
 * @param provider Optional provider name (defaults to 'hugging face')
 */
export function setApiKey(key: string, provider: string = 'hugging face'): boolean {
  try {
    localStorage.setItem(`${provider}_api_key`, key);
    return true;
  } catch (error) {
    console.error('Error setting API key:', error);
    return false;
  }
}

/**
 * Document type for retrievable documents
 */
export interface DocumentType {
  id: string;
  title: string;
  content: string;
  metadata?: any;
}

/**
 * Chat message interface
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

/**
 * LLM Model interface
 */
export interface HuggingFaceModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  maxTokens: number;
  contextWindow?: number;
  pricingInfo?: string;
  strengths?: string[];
  icon?: any;
  category?: 'open-source' | 'proprietary' | 'local';
  task?: string;
}

/**
 * OpenRouter model interface
 */
export interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: number;
    completion: number;
  };
  top_provider: {
    id: string;
    name: string;
  };
}

/**
 * Available models
 */
export const AVAILABLE_MODELS: HuggingFaceModel[] = [
  {
    id: "gpt-4",
    name: "GPT-4",
    description: "OpenAI's most advanced model",
    provider: "openai",
    maxTokens: 8192
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description: "Fast and efficient OpenAI model",
    provider: "openai",
    maxTokens: 4096
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    description: "Anthropic's most powerful model",
    provider: "anthropic",
    maxTokens: 100000
  },
  {
    id: "mistral-large-latest",
    name: "Mistral Large",
    description: "Mistral AI's largest model",
    provider: "mistral",
    maxTokens: 32768
  }
];

/**
 * Converts OpenRouter models to the application's model format
 * @param models List of OpenRouter models
 * @returns List of models in the application's format
 */
export function convertOpenRouterModels(models: OpenRouterModel[]): HuggingFaceModel[] {
  return models.map(model => {
    // Extract provider from model name or use top provider
    const provider = model.top_provider?.name || 'OpenRouter';
    
    // Create description including pricing info
    const pricePerThousandPrompt = (model.pricing.prompt * 1000).toFixed(4);
    const pricePerThousandCompletion = (model.pricing.completion * 1000).toFixed(4);
    const pricingInfo = `$${pricePerThousandPrompt}/1K prompt, $${pricePerThousandCompletion}/1K completion`;

    return {
      id: `openrouter/${model.id}`,  // Prefix with openrouter/ to distinguish
      name: model.name,
      description: `${provider} model via OpenRouter`,
      provider: 'openrouter',
      maxTokens: model.context_length,
      contextWindow: model.context_length,
      pricingInfo: pricingInfo,
      strengths: [provider, `${model.context_length.toLocaleString()} context`],
      category: 'proprietary',
    };
  });
}

/**
 * Adds OpenRouter models to the available models list
 * @param models List of OpenRouter models to add
 */
export function addOpenRouterModels(models: OpenRouterModel[]): void {
  const convertedModels = convertOpenRouterModels(models);
  
  // Remove any existing OpenRouter models
  const filteredModels = AVAILABLE_MODELS.filter(model => !model.id.startsWith('openrouter/'));
  
  // Add the new models
  AVAILABLE_MODELS.length = 0;
  AVAILABLE_MODELS.push(...filteredModels, ...convertedModels);
}

/**
 * Mock function to query a language model
 */
export async function queryModel(
  modelId: string,
  messages: Message[],
  options?: { temperature?: number }
): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const userMessage = messages.find(m => m.role === 'user')?.content || '';
  
  // Generate a mock response
  return `This is a simulated response to your query: "${userMessage.substring(0, 30)}${userMessage.length > 30 ? '...' : ''}".\n\nIn a real application, this would be generated by the ${modelId} model.`;
}

/**
 * Mock function to search for similar documents
 */
export async function searchSimilarDocuments(
  query: string,
  options?: { topK?: number; threshold?: number }
): Promise<DocumentType[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Return dummy documents
  return [
    {
      id: '1',
      title: 'Related Document 1',
      content: `This document is related to "${query.substring(0, 20)}..."`
    },
    {
      id: '2',
      title: 'Related Document 2',
      content: `Another document related to "${query.substring(0, 20)}..."`
    }
  ];
}

/**
 * Mock function to process a document file
 */
export async function processDocumentFile(file: File): Promise<{ text: string; type: string }> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    text: `Mock extracted text from ${file.name}. This would be the actual content in a real application.`,
    type: file.type
  };
}
