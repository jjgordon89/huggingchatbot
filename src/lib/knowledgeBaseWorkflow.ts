/**
 * Knowledge Base Workflow Service
 * 
 * Comprehensive workflow management for document processing, indexing, and retrieval
 */

import { v4 as uuidv4 } from 'uuid';
import { ragService } from './ragService';
import { enhancedRagService } from './enhancedRagService';
import { addDocumentToVectorStore, deleteDocumentFromVectorStore, vectorSearch, reindexWorkspace } from './lanceDbService';
import { processDocumentFile } from './api';

export interface DocumentMetadata {
  id: string;
  filename: string;
  title: string;
  size: number;
  type: string;
  mimeType: string;
  uploadedAt: string;
  processedAt?: string;
  indexed: boolean;
  status: 'pending' | 'processing' | 'indexed' | 'error';
  errorMessage?: string;
  chunkCount?: number;
  embedding?: {
    model: string;
    dimensions: number;
    generatedAt: string;
  };
}

export interface ProcessingResult {
  success: boolean;
  documentId: string;
  metadata: DocumentMetadata;
  content?: string;
  chunks?: DocumentChunk[];
  error?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  index: number;
  metadata: Record<string, any>;
}

export interface SearchResult {
  id: string;
  documentId: string;
  content: string;
  similarity: number;
  metadata: DocumentMetadata;
  chunk?: DocumentChunk;
}

export interface KnowledgeBaseStats {
  totalDocuments: number;
  indexedDocuments: number;
  totalChunks: number;
  storageSize: number;
  lastIndexed?: string;
}

class KnowledgeBaseWorkflow {
  private workspaceStores: Map<string, Map<string, DocumentMetadata>> = new Map();
  private processingQueue: Map<string, Promise<ProcessingResult>> = new Map();

  /**
   * Initialize knowledge base for a workspace
   */
  async initializeWorkspace(workspaceId: string): Promise<void> {
    if (!this.workspaceStores.has(workspaceId)) {
      this.workspaceStores.set(workspaceId, new Map());
    }
    
    // Initialize RAG services for the workspace
    try {
      await enhancedRagService.ragService?.initialize?.();
      console.log(`Knowledge base initialized for workspace: ${workspaceId}`);
    } catch (error) {
      console.error(`Error initializing knowledge base for workspace ${workspaceId}:`, error);
      throw error;
    }
  }

  /**
   * Process and index a single document
   */
  async processDocument(
    workspaceId: string,
    file: File,
    options: {
      autoIndex?: boolean;
      chunkSize?: number;
      chunkOverlap?: number;
      embeddingModel?: string;
    } = {}
  ): Promise<ProcessingResult> {
    const documentId = uuidv4();
    const {
      autoIndex = true,
      chunkSize = 1000,
      chunkOverlap = 200,
      embeddingModel = 'sentence-transformers/all-MiniLM-L6-v2'
    } = options;

    // Create initial metadata
    const metadata: DocumentMetadata = {
      id: documentId,
      filename: file.name,
      title: file.name.split('.')[0],
      size: file.size,
      type: this.getDocumentType(file.name),
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      indexed: false,
      status: 'pending'
    };

    // Store metadata
    await this.initializeWorkspace(workspaceId);
    this.workspaceStores.get(workspaceId)!.set(documentId, metadata);

    // Check if already processing
    const processingKey = `${workspaceId}-${documentId}`;
    if (this.processingQueue.has(processingKey)) {
      return this.processingQueue.get(processingKey)!;
    }

    // Create processing promise
    const processingPromise = this._processDocumentInternal(
      workspaceId,
      documentId,
      file,
      metadata,
      { autoIndex, chunkSize, chunkOverlap, embeddingModel }
    );

    this.processingQueue.set(processingKey, processingPromise);

    try {
      const result = await processingPromise;
      return result;
    } finally {
      this.processingQueue.delete(processingKey);
    }
  }

  /**
   * Internal document processing logic
   */
  private async _processDocumentInternal(
    workspaceId: string,
    documentId: string,
    file: File,
    metadata: DocumentMetadata,
    options: any
  ): Promise<ProcessingResult> {
    try {
      // Update status to processing
      metadata.status = 'processing';
      this.workspaceStores.get(workspaceId)!.set(documentId, metadata);

      // Extract content from file
      const extracted = await processDocumentFile(file);
      
      if (!extracted.text || extracted.text.trim().length === 0) {
        throw new Error('No text content could be extracted from the document');
      }

      // Process with RAG service for chunking
      const ragDocument = await ragService.processDocument({
        id: documentId,
        title: metadata.title,
        content: extracted.text,
        type: metadata.type,
        name: metadata.filename,
        size: metadata.size,
        uploadedAt: new Date(metadata.uploadedAt),
        createdAt: new Date(),
        metadata: {
          filename: metadata.filename,
          size: metadata.size,
          mimeType: metadata.mimeType
        }
      });

      // Update metadata with processing results
      metadata.processedAt = new Date().toISOString();
      metadata.chunkCount = ragDocument.chunks.length;
      metadata.embedding = {
        model: options.embeddingModel,
        dimensions: 384, // Default for MiniLM
        generatedAt: new Date().toISOString()
      };

      // Index in vector store if auto-indexing is enabled
      if (options.autoIndex) {
        await addDocumentToVectorStore(workspaceId, {
          id: documentId,
          title: metadata.title,
          content: extracted.text,
          type: metadata.type,
          createdAt: new Date(),
          metadata: {
            ...metadata,
            chunks: ragDocument.chunks.length,
            processingOptions: options
          }
        });

        metadata.indexed = true;
        metadata.status = 'indexed';
      } else {
        metadata.status = 'indexed';
      }

      // Update final metadata
      this.workspaceStores.get(workspaceId)!.set(documentId, metadata);

      return {
        success: true,
        documentId,
        metadata,
        content: extracted.text,
        chunks: ragDocument.chunks.map((chunk, index) => ({
          id: uuidv4(),
          documentId,
          content: chunk.content,
          index,
          metadata: chunk.metadata
        }))
      };

    } catch (error) {
      // Update metadata with error
      metadata.status = 'error';
      metadata.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.workspaceStores.get(workspaceId)!.set(documentId, metadata);

      return {
        success: false,
        documentId,
        metadata,
        error: metadata.errorMessage
      };
    }
  }

  /**
   * Search documents using semantic search
   */
  async searchDocuments(
    workspaceId: string,
    query: string,
    options: {
      limit?: number;
      threshold?: number;
      includeContent?: boolean;
      filters?: Record<string, any>;
    } = {}
  ): Promise<SearchResult[]> {
    const {
      limit = 10,
      threshold = 0.7,
      includeContent = true,
      filters = {}
    } = options;

    try {
      // Perform vector search
      const vectorResults = await vectorSearch(workspaceId, query, limit, threshold);
      
      // Get workspace metadata
      const workspaceStore = this.workspaceStores.get(workspaceId) || new Map();
      
      // Transform results
      const searchResults: SearchResult[] = vectorResults.map(result => {
        const documentMetadata = workspaceStore.get(result.id) || {
          id: result.id,
          filename: result.documentName,
          title: result.documentName,
          size: 0,
          type: 'unknown',
          mimeType: 'unknown',
          uploadedAt: new Date().toISOString(),
          indexed: true,
          status: 'indexed' as const
        };

        return {
          id: result.id,
          documentId: result.id,
          content: includeContent ? result.text : '',
          similarity: result.similarity,
          metadata: documentMetadata,
          chunk: {
            id: uuidv4(),
            documentId: result.id,
            content: result.text,
            index: 0,
            metadata: result.metadata
          }
        };
      });

      // Apply filters if provided
      let filteredResults = searchResults;
      if (Object.keys(filters).length > 0) {
        filteredResults = searchResults.filter(result => {
          return Object.entries(filters).every(([key, value]) => {
            const metadataValue = result.metadata[key as keyof DocumentMetadata];
            return metadataValue === value;
          });
        });
      }

      return filteredResults.slice(0, limit);
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate AI context from search results
   */
  async generateContext(
    workspaceId: string,
    query: string,
    searchResults: SearchResult[]
  ): Promise<string> {
    try {
      // Convert search results to RAG format
      const ragResults = {
        query,
        results: searchResults.map(result => ({
          id: result.id,
          content: result.content,
          metadata: {
            ...result.metadata,
            similarity: result.similarity
          }
        })),
        executionTime: 0
      };

      // Generate enhanced context
      const context = await enhancedRagService.getEnhancedContext(ragResults);
      return context;
    } catch (error) {
      console.error('Error generating AI context:', error);
      throw new Error(`Context generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a document from the knowledge base
   */
  async deleteDocument(workspaceId: string, documentId: string): Promise<boolean> {
    try {
      // Remove from vector store
      await deleteDocumentFromVectorStore(workspaceId, documentId);
      
      // Remove from metadata store
      const workspaceStore = this.workspaceStores.get(workspaceId);
      if (workspaceStore) {
        workspaceStore.delete(documentId);
      }

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  /**
   * Reindex all documents in a workspace
   */
  async reindexWorkspace(workspaceId: string): Promise<void> {
    try {
      const workspaceStore = this.workspaceStores.get(workspaceId);
      if (!workspaceStore) {
        throw new Error('Workspace not found');
      }

      const documents = Array.from(workspaceStore.values())
        .filter(doc => doc.status === 'indexed')
        .map(doc => ({
          id: doc.id,
          title: doc.title,
          content: `Reindexed content for ${doc.filename}`,
          type: doc.type,
          createdAt: new Date(),
          metadata: doc
        }));

      await reindexWorkspace(workspaceId, documents);

      // Update all document statuses
      for (const [id, metadata] of workspaceStore) {
        if (metadata.status === 'indexed') {
          metadata.processedAt = new Date().toISOString();
          workspaceStore.set(id, metadata);
        }
      }
    } catch (error) {
      console.error('Error reindexing workspace:', error);
      throw error;
    }
  }

  /**
   * Get knowledge base statistics
   */
  getWorkspaceStats(workspaceId: string): KnowledgeBaseStats {
    const workspaceStore = this.workspaceStores.get(workspaceId);
    if (!workspaceStore) {
      return {
        totalDocuments: 0,
        indexedDocuments: 0,
        totalChunks: 0,
        storageSize: 0
      };
    }

    const documents = Array.from(workspaceStore.values());
    const indexedDocs = documents.filter(doc => doc.indexed);
    const totalChunks = documents.reduce((sum, doc) => sum + (doc.chunkCount || 0), 0);
    const storageSize = documents.reduce((sum, doc) => sum + doc.size, 0);
    
    const lastIndexedDoc = indexedDocs
      .filter(doc => doc.processedAt)
      .sort((a, b) => new Date(b.processedAt!).getTime() - new Date(a.processedAt!).getTime())[0];

    return {
      totalDocuments: documents.length,
      indexedDocuments: indexedDocs.length,
      totalChunks,
      storageSize,
      lastIndexed: lastIndexedDoc?.processedAt
    };
  }

  /**
   * List all documents in a workspace
   */
  listDocuments(workspaceId: string): DocumentMetadata[] {
    const workspaceStore = this.workspaceStores.get(workspaceId);
    if (!workspaceStore) {
      return [];
    }
    return Array.from(workspaceStore.values());
  }

  /**
   * Get document by ID
   */
  getDocument(workspaceId: string, documentId: string): DocumentMetadata | null {
    const workspaceStore = this.workspaceStores.get(workspaceId);
    return workspaceStore?.get(documentId) || null;
  }

  /**
   * Utility method to determine document type
   */
  private getDocumentType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf': return 'pdf';
      case 'doc':
      case 'docx': return 'document';
      case 'txt':
      case 'md': return 'text';
      case 'csv':
      case 'xls':
      case 'xlsx': return 'spreadsheet';
      case 'ppt':
      case 'pptx': return 'presentation';
      case 'html':
      case 'htm': return 'web';
      default: return 'unknown';
    }
  }
}

// Export singleton instance
export const knowledgeBaseWorkflow = new KnowledgeBaseWorkflow();
export default knowledgeBaseWorkflow;