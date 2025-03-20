import axios from 'axios';
import { EMBEDDING_MODELS } from '@/components/EmbeddingModelSelector';

const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/';

// Interfaces
export interface EmbeddingVector {
  values: number[];
  dimensions: number;
}

export interface EmbeddingOptions {
  modelId: string;
  batchSize?: number;
  pooling?: 'mean' | 'cls' | 'max';
  normalize?: boolean;
}

export interface EmbeddingResponse {
  vectors: number[][];
  model: string;
  dimensions: number;
}

/**
 * Class for generating embeddings using Hugging Face models
 */
export class HuggingFaceEmbeddingGenerator {
  private apiKey: string;
  private modelId: string;
  private dimensions: number;
  
  /**
   * Create a new Hugging Face embedding generator
   * @param modelId Hugging Face model ID (default: BAAI/bge-small-en-v1.5)
   * @param apiKey Optional Hugging Face API key (if not using environment variable)
   */
  constructor(modelId = 'BAAI/bge-small-en-v1.5', apiKey = '') {
    this.apiKey = apiKey || process.env.HUGGING_FACE_API_KEY || '';
    this.modelId = modelId;
    
    // Get dimensions from model config
    const model = EMBEDDING_MODELS.find(m => m.id === modelId);
    this.dimensions = model?.dimensions || 384; // Default to 384 if not found
  }

  /**
   * Generate an embedding for a single text input
   * @param text Text to embed
   * @param options Optional embedding options
   * @returns Promise with embedding vector
   */
  async generateEmbedding(text: string, options?: Partial<EmbeddingOptions>): Promise<EmbeddingVector> {
    const vectors = await this.generateEmbeddings([text], options);
    return {
      values: vectors[0],
      dimensions: this.dimensions
    };
  }

  /**
   * Generate embeddings for multiple text inputs
   * @param texts Array of texts to embed
   * @param options Optional embedding options
   * @returns Promise with array of embedding vectors
   */
  async generateEmbeddings(
    texts: string[], 
    options?: Partial<EmbeddingOptions>
  ): Promise<number[][]> {
    try {
      const useModelId = options?.modelId || this.modelId;
      const batchSize = options?.batchSize || 10;
      
      // Process in batches to avoid API limits
      const batches = [];
      for (let i = 0; i < texts.length; i += batchSize) {
        batches.push(texts.slice(i, i + batchSize));
      }
      
      const allEmbeddings: number[][] = [];
      
      for (const batch of batches) {
        const response = await axios.post(
          `${HUGGING_FACE_API_URL}${useModelId}`,
          {
            inputs: batch,
            options: {
              wait_for_model: true,
              use_cache: true,
              pooling: options?.pooling || 'mean',
              normalize: options?.normalize !== undefined ? options.normalize : true
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (Array.isArray(response.data)) {
          // Add the embeddings from this batch
          allEmbeddings.push(...response.data);
        } else {
          console.error('Unexpected response format:', response.data);
          throw new Error('Unexpected response format from Hugging Face API');
        }
      }
      
      return allEmbeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }
  
  /**
   * Calculate cosine similarity between two vectors
   * @param vecA First vector
   * @param vecB Second vector
   * @returns Cosine similarity score (-1 to 1)
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same dimensions');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (normA * normB);
  }
  
  /**
   * Find the most similar texts to a query text
   * @param queryText Query text
   * @param candidateTexts Array of texts to compare against
   * @param topK Number of results to return
   * @returns Array of indices of the most similar texts
   */
  async findSimilarTexts(
    queryText: string,
    candidateTexts: string[],
    topK = 3
  ): Promise<{ index: number; score: number }[]> {
    const queryEmbedding = await this.generateEmbedding(queryText);
    const candidateEmbeddings = await this.generateEmbeddings(candidateTexts);
    
    const similarities = candidateEmbeddings.map((embedding, index) => ({
      index,
      score: HuggingFaceEmbeddingGenerator.cosineSimilarity(queryEmbedding.values, embedding)
    }));
    
    // Sort by similarity (highest first)
    similarities.sort((a, b) => b.score - a.score);
    
    // Return top K results
    return similarities.slice(0, topK);
  }
}

/**
 * Create a Hugging Face embedding generator with the specified model
 * @param modelId The Hugging Face model ID to use
 * @returns A new HuggingFaceEmbeddingGenerator instance
 */
export function createHuggingFaceEmbeddings(modelId = 'BAAI/bge-small-en-v1.5'): HuggingFaceEmbeddingGenerator {
  return new HuggingFaceEmbeddingGenerator(modelId);
}

export default HuggingFaceEmbeddingGenerator;