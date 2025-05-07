
import { v4 as uuidv4 } from 'uuid';

// Document type definition
export interface Document {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  createdAt: string;
  filename?: string;
}

export type DocumentType = 'text' | 'markdown' | 'code' | 'pdf' | 'csv' | 'excel' | 'html' | 'json';

// Embedding models
export interface EmbeddingModel {
  id: string;
  name: string;
  dimensions: number;
  description: string;
}

export const EMBEDDING_MODELS: EmbeddingModel[] = [
  {
    id: 'mini',
    name: 'Mini Embeddings',
    dimensions: 384,
    description: 'Fast, lightweight embeddings model'
  },
  {
    id: 'default',
    name: 'Standard Embeddings',
    dimensions: 768,
    description: 'Balanced performance and quality'
  },
  {
    id: 'large',
    name: 'Large Embeddings',
    dimensions: 1024,
    description: 'High quality semantic search'
  }
];

// In-memory document storage for now
let documents: Document[] = [];
let currentEmbeddingModel: EmbeddingModel = EMBEDDING_MODELS[1]; // Default model

// Helper functions
export function addDocumentToStore(title: string, content: string, filename?: string): Promise<Document> {
  return new Promise((resolve) => {
    const doc: Document = {
      id: uuidv4(),
      title,
      content,
      type: getDocumentType(filename || ''),
      createdAt: new Date().toISOString(),
      filename
    };
    
    documents.push(doc);
    console.log(`Added document: ${title}`);
    resolve(doc);
  });
}

export function getAllDocuments(): Document[] {
  return [...documents];
}

export function deleteDocument(id: string): boolean {
  const initialLength = documents.length;
  documents = documents.filter(doc => doc.id !== id);
  return documents.length < initialLength;
}

export function getCurrentEmbeddingModel(): EmbeddingModel {
  return currentEmbeddingModel;
}

export function setEmbeddingModel(modelId: string): EmbeddingModel {
  const model = EMBEDDING_MODELS.find(m => m.id === modelId);
  if (model) {
    currentEmbeddingModel = model;
    return model;
  }
  return currentEmbeddingModel;
}

export async function reembedAllDocuments(modelId: string): Promise<boolean> {
  // In a real implementation, this would re-generate embeddings for all documents
  setEmbeddingModel(modelId);
  console.log(`Re-embedded all documents with model: ${currentEmbeddingModel.name}`);
  return true;
}

export function getApiKey(): string | null {
  return localStorage.getItem('huggingface_api_key');
}

export function processDocumentFile(file: File, onProgress?: (progress: number) => void): Promise<{title: string, content: string}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = event.loaded / event.total;
        onProgress(progress);
      }
    };
    
    reader.onload = () => {
      try {
        const content = reader.result as string;
        const title = file.name.split('.')[0];
        
        resolve({
          title,
          content: content.slice(0, 100000) // Limiting content size
        });
      } catch (error) {
        reject(new Error('Failed to process file content'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}

function getDocumentType(filename: string): DocumentType {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'md': return 'markdown';
    case 'js':
    case 'ts':
    case 'py':
    case 'java':
    case 'cpp':
    case 'cs': return 'code';
    case 'pdf': return 'pdf';
    case 'csv': return 'csv';
    case 'xls':
    case 'xlsx': return 'excel';
    case 'html': return 'html';
    case 'json': return 'json';
    default: return 'text';
  }
}

export const documentStore = {
  addDocumentToStore,
  getAllDocuments,
  deleteDocument,
  getCurrentEmbeddingModel,
  setEmbeddingModel,
  reembedAllDocuments,
  getApiKey,
  processDocumentFile
};

export default documentStore;
