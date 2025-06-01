
/**
 * LanceDB Service
 * 
 * Provides LanceDB integration for vector search
 */

import { LanceDbStore } from './lanceDatabaseAdapter';

/**
 * Document interface for LanceDB storage
 */
export interface VectorDocument {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: Date;
  metadata: Record<string, any>;
}

let lanceDbStores: Record<string, LanceDbStore> = {};

/**
 * Initialize a vector store for a specific workspace
 * @param workspaceId The workspace ID
 * @returns The initialized LanceDbStore
 */
export function getOrCreateVectorStore(workspaceId: string): LanceDbStore {
  if (!lanceDbStores[workspaceId]) {
    // Initialize a new vector store for this workspace with proper options
    const store = new LanceDbStore({
      embeddingDimensions: 384,
      includeMetadata: true,
      indexType: 'hnsw'
    });
    lanceDbStores[workspaceId] = store;
  }
  
  return lanceDbStores[workspaceId];
}

/**
 * Add a document to the vector store
 * @param workspaceId The workspace ID
 * @param document The document to add
 */
export async function addDocumentToVectorStore(
  workspaceId: string, 
  document: VectorDocument
): Promise<void> {
  try {
    const store = getOrCreateVectorStore(workspaceId);
    
    // Create a simple embedding (mock for now)
    const mockEmbedding = new Array(384).fill(0).map(() => Math.random());
    
    await store.addDocument(document.content, mockEmbedding, {
      id: document.id,
      title: document.title,
      documentType: document.type,
      created: document.createdAt.toISOString(),
      ...document.metadata
    });
    
    console.log(`Added document ${document.id} to vector store for workspace ${workspaceId}`);
  } catch (error) {
    console.error('Error adding document to vector store:', error);
    throw new Error(`Failed to add document to vector store: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a document from the vector store
 * @param workspaceId The workspace ID
 * @param documentId The document ID to delete
 */
export async function deleteDocumentFromVectorStore(
  workspaceId: string,
  documentId: string
): Promise<void> {
  try {
    const store = getOrCreateVectorStore(workspaceId);
    
    await store.deleteDocument(documentId);
    console.log(`Document ${documentId} deleted from vector store`);
  } catch (error) {
    console.error('Error deleting document from vector store:', error);
    throw new Error(`Failed to delete document from vector store: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Perform a vector search
 * @param workspaceId The workspace ID
 * @param query The search query
 * @param topK The number of results to return
 * @param threshold The similarity threshold (0-1)
 */
export async function vectorSearch(
  workspaceId: string,
  query: string,
  topK: number = 5,
  threshold: number = 0.7
): Promise<any[]> {
  try {
    const store = getOrCreateVectorStore(workspaceId);
    
    // Create a mock embedding for the query
    const queryEmbedding = new Array(384).fill(0).map(() => Math.random());
    
    // Use search method from LanceDbStore
    const results = await store.search(queryEmbedding, topK, threshold * 100);
    
    // Transform the results to a more friendly format
    return results.map(result => ({
      id: result.id,
      text: result.text,
      documentName: result.metadata?.title || 'Untitled Document',
      similarity: result.score / 100,
      metadata: result.metadata || {}
    }));
  } catch (error) {
    console.error('Error performing vector search:', error);
    throw new Error(`Failed to perform vector search: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Reindex all documents for a workspace
 * @param workspaceId The workspace ID
 * @param documents The documents to reindex
 */
export async function reindexWorkspace(
  workspaceId: string,
  documents: VectorDocument[]
): Promise<void> {
  try {
    const store = getOrCreateVectorStore(workspaceId);
    
    // Clear existing documents
    try {
      await store.clearAll();
    } catch (e) {
      console.log('Clear method not available, continuing with reindex');
    }
    
    // Add all documents
    if (documents.length > 0) {
      for (const doc of documents) {
        const mockEmbedding = new Array(384).fill(0).map(() => Math.random());
        await store.addDocument(doc.content, mockEmbedding, {
          id: doc.id,
          title: doc.title,
          documentType: doc.type,
          created: doc.createdAt.toISOString(),
          ...doc.metadata
        });
      }
    }
    
    console.log(`Reindexed ${documents.length} documents for workspace ${workspaceId}`);
  } catch (error) {
    console.error('Error reindexing workspace:', error);
    throw new Error(`Failed to reindex workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
