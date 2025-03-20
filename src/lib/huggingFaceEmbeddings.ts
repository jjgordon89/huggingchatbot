/**
 * Hugging Face Embedding Models Integration
 * 
 * This file provides integration with Hugging Face embedding models for the RAG system.
 */

// Define the EmbeddingVector type directly here to avoid circular dependencies
export interface EmbeddingVector {
  values: number[];
  dimensions: number;
}

// Define the EmbeddingGenerator interface directly here to match our implementation
export interface EmbeddingGenerator {
  generateEmbedding(text: string): Promise<EmbeddingVector>;
  generateEmbeddings(texts: string[]): Promise<number[][]>;
}

import { createEmbeddings, getCurrentEmbeddingModel, setEmbeddingModel, EmbeddingModel, EMBEDDING_MODELS } from './api';

/**
 * Hugging Face Embedding Generator implementation
 * Uses the Hugging Face API to generate real embeddings
 */
export class HuggingFaceEmbeddingGenerator implements EmbeddingGenerator {
  private modelId: string;

  constructor(modelId?: string) {
    // Use provided model or get the current one from settings
    this.modelId = modelId || getCurrentEmbeddingModel().id;
  }

  /**
   * Get the current embedding model ID
   */
  getModelId(): string {
    return this.modelId;
  }

  /**
   * Set the embedding model
   * @param modelId The model ID to use
   */
  setModel(modelId: string): void {
    const model = EMBEDDING_MODELS.find(m => m.id === modelId);
    if (!model) {
      throw new Error(`Embedding model ${modelId} not found`);
    }
    this.modelId = modelId;
    setEmbeddingModel(modelId);
  }

  /**
   * Get information about the current embedding model
   */
  getModelInfo(): EmbeddingModel {
    return EMBEDDING_MODELS.find(m => m.id === this.modelId) || getCurrentEmbeddingModel();
  }

  /**
   * Generate embeddings for a text using the Hugging Face API
   * @param text The text to embed
   * @returns A promise resolving to an embedding vector
   */
  async generateEmbedding(text: string): Promise<EmbeddingVector> {
    try {
      const embedding = await createEmbeddings([text], this.modelId);
      
      if (!embedding || !embedding[0] || !Array.isArray(embedding[0])) {
        throw new Error('Failed to generate embedding');
      }

      const modelInfo = this.getModelInfo();
      
      return {
        dimensions: modelInfo.dimensions,
        values: embedding[0]
      };
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts
   * Required by the EmbeddingGenerator interface
   * @param texts Array of texts to embed
   * @returns A promise resolving to an array of embedding arrays
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      return await createEmbeddings(texts, this.modelId);
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   * @param texts Array of texts to embed
   * @returns A promise resolving to an array of embedding vectors
   */
  async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingVector[]> {
    try {
      const embeddings = await createEmbeddings(texts, this.modelId);
      const modelInfo = this.getModelInfo();
      
      return embeddings.map(embedding => ({
        dimensions: modelInfo.dimensions,
        values: embedding
      }));
    } catch (error) {
      console.error('Error generating batch embeddings:', error);
      throw error;
    }
  }
  
  /**
   * Get all available embedding models
   */
  getAvailableModels(): EmbeddingModel[] {
    return [...EMBEDDING_MODELS];
  }
}

/**
 * Factory function to create a configured HuggingFaceEmbeddingGenerator
 * @param modelId Optional model ID to use
 * @returns Configured HuggingFaceEmbeddingGenerator instance
 */
export function createHuggingFaceEmbeddingGenerator(modelId?: string): HuggingFaceEmbeddingGenerator {
  return new HuggingFaceEmbeddingGenerator(modelId);
}