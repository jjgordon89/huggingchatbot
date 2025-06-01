
import React from 'react';

// Base Model interface
export interface Model {
  id: string;
  name: string;
  description: string;
  task: string;
}

// HuggingFace specific model interface
export interface HuggingFaceModel extends Model {
  provider: string;
  maxTokens: number;
}

// Navigation interface for menus
export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
}

export interface MainNavItem extends NavItem {
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SidebarNavItem extends NavItem {
  items?: SidebarNavItem[];
}

// Document types
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  content?: string;
  filename?: string;
  url?: string;
  workspaceId?: string;
}

export interface DocumentSource {
  title: string;
  url: string;
  snippet: string;
  relevanceScore?: number;
}

// Message and chat types
export interface ThreadedMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  threadId?: string;
  parentId?: string;
  isThreadStarter?: boolean;
  workspaceId?: string;
  sources?: DocumentSource[];
}

// User interface
export interface AppUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
}

// Models collection - fixed name
export interface ModelsCollection {
  [key: string]: Model[];
}

// Workspace types
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
}

// Fine-tuning types
export interface FineTuningJob {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  baseModelId: string;
  createdAt: Date;
  updatedAt: Date;
  progress?: number;
  workspaceId: string;
}

// RAG types
export interface RagSource {
  title: string;
  url: string;
  snippet: string;
  relevanceScore?: number;
}

export interface SearchResult {
  content: string;
  metadata: {
    source: string;
    score: number;
  };
}
