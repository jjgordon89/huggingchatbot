
// Import types directly or define them locally
import { Document } from '@/types/models';

// Define interface for EmbeddingVector
export interface EmbeddingVector {
  values: number[];
  dimensions: number;
}

// Define interface for EmbeddingGenerator
export interface EmbeddingGenerator {
  generateEmbedding(text: string): Promise<EmbeddingVector>;
}

// Define interface for VectorStore
export interface VectorStore {
  addDocument(doc: Document, embedding: EmbeddingVector): Promise<boolean>;
  search(embedding: EmbeddingVector, limit?: number): Promise<Document[]>;
  deleteDocument(id: string): Promise<boolean>;
  clearAll(): Promise<boolean>;
}

// Define a minimal in-memory vector store
export class InMemoryVectorStore implements VectorStore {
  private documents: Map<string, Document & { embedding: EmbeddingVector }> = new Map();
  
  async addDocument(doc: Document, embedding: EmbeddingVector): Promise<boolean> {
    this.documents.set(doc.id, { ...doc, embedding });
    return true;
  }
  
  async search(embedding: EmbeddingVector, limit: number = 5): Promise<Document[]> {
    // Simple cosine similarity calculation
    const results = Array.from(this.documents.values())
      .map(doc => {
        const similarity = this.cosineSimilarity(embedding.values, doc.embedding.values);
        return { doc, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(result => result.doc);
      
    return results;
  }
  
  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }
  
  async clearAll(): Promise<boolean> {
    this.documents.clear();
    return true;
  }
  
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, value, i) => sum + value * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
