
// Model Types for Alfred-Intelligence

export interface Models {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  isPremium: boolean;
}

export interface ModelSettings {
  defaultModelId: string;
  defaultEmbeddingModel: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

export interface ModelCapability {
  canUseVision: boolean;
  canUseAudio: boolean;
  canUseFunctions: boolean;
  canStream: boolean;
  requiresApiKey: boolean;
}

export interface ModelUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost?: number;
}

export interface ModelProviderSettings {
  openai?: {
    apiKey?: string;
    organization?: string;
    baseUrl?: string;
  };
  anthropic?: {
    apiKey?: string;
    baseUrl?: string;
  };
  huggingface?: {
    apiKey?: string;
    baseUrl?: string;
  };
  mistral?: {
    apiKey?: string;
  };
  google?: {
    apiKey?: string;
    projectId?: string;
  };
  openrouter?: {
    apiKey?: string;
    defaultModel?: string;
  };
}

export interface Document {
  id: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  source?: string;
  timestamp?: Date;
  type?: string;
  size?: number;
  chunks?: DocumentChunk[];
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  embedding?: number[];
  score?: number;
}

export interface DocumentSource {
  id: string;
  title: string;
  url?: string;
  excerpt: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface HuggingFaceModel {
  id: string;
  name: string;
  description: string;
  task: string;
  provider: string;
  maxTokens: number;
}
