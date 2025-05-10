
// Extend the existing types.d.ts file with enhanced model definitions

export interface HuggingFaceModel {
  id: string;
  name: string;
  description: string;
  task: string;
  provider: string;
  maxTokens: number;
}

// Document-related types
export interface Document {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  createdAt: string;
  filename?: string;
  sources?: DocumentSource[];
}

export type DocumentType = 'text' | 'markdown' | 'code' | 'pdf' | 'csv' | 'excel' | 'html' | 'json';

export interface DocumentSource {
  title: string;
  url?: string;
  pageNumber?: number;
  section?: string;
  relevanceScore?: number;
}

// Message type with sources
export interface MessageWithSources {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: DocumentSource[];
}
