
import { useToast } from "@/hooks/use-toast";

// Types
export type HuggingFaceModel = {
  id: string;
  name: string;
  description?: string;
  task?: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
};

export type ConversationContext = {
  documents?: string[];
  sources?: string[];
};

// API Configuration
let API_KEY = localStorage.getItem('hf_api_key') || '';

export const setApiKey = (key: string) => {
  API_KEY = key;
  localStorage.setItem('hf_api_key', key);
  return API_KEY;
};

export const getApiKey = () => API_KEY;

// API Endpoints
const API_BASE_URL = 'https://api-inference.huggingface.co/models';

// Model configurations
export const AVAILABLE_MODELS: HuggingFaceModel[] = [
  { 
    id: 'mistralai/Mistral-7B-Instruct-v0.2', 
    name: 'Mistral 7B', 
    description: 'High-performance instruction-tuned model',
    task: 'text-generation'
  },
  { 
    id: 'meta-llama/Llama-2-7b-chat-hf', 
    name: 'Llama 2 (7B)', 
    description: 'Open foundation chat model by Meta',
    task: 'text-generation'
  },
  { 
    id: 'microsoft/phi-2', 
    name: 'Phi-2', 
    description: 'Compact and efficient language model',
    task: 'text-generation'
  },
  { 
    id: 'BAAI/bge-large-en-v1.5', 
    name: 'BGE Embeddings', 
    description: 'For embedding documents and queries',
    task: 'feature-extraction'
  }
];

// API Interfaces
export const queryModel = async (
  modelId: string, 
  messages: Message[], 
  context?: ConversationContext,
  options = {}
): Promise<string> => {
  if (!API_KEY) {
    throw new Error('API key not set');
  }

  const isEmbeddingModel = modelId.includes('bge');
  
  try {
    // Format the prompt based on the model
    let payload: any;
    
    if (isEmbeddingModel) {
      // For embedding models
      payload = {
        inputs: messages[messages.length - 1].content,
      };
    } else {
      // For text generation models
      // Format prompt based on Mistral's expected format
      const formattedPrompt = formatMessagesForModel(modelId, messages, context);
      
      payload = {
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true,
          return_full_text: false,
          ...options
        }
      };
    }

    const response = await fetch(`${API_BASE_URL}/${modelId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    // Check for API errors (rate limiting, etc.)
    if (!response.ok) {
      const error = await response.json();
      
      // Special handling for model loading
      if (error.error && error.error.includes('Loading')) {
        console.log('Model is loading:', error.error);
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        return queryModel(modelId, messages, context, options);
      }
      
      throw new Error(`API error: ${error.error || response.statusText}`);
    }

    const data = await response.json();
    
    if (isEmbeddingModel) {
      // Return embedding data directly
      return data;
    } else {
      // Extract generated text
      if (Array.isArray(data) && data.length > 0) {
        return data[0].generated_text || '';
      }
      return data.generated_text || '';
    }
  } catch (error) {
    console.error('Error querying model:', error);
    throw error;
  }
};

// Formatter for different model prompts
export const formatMessagesForModel = (
  modelId: string, 
  messages: Message[], 
  context?: ConversationContext
): string => {
  let formattedPrompt = '';
  
  // Add context if available (RAG)
  if (context?.documents && context.documents.length > 0) {
    formattedPrompt += 'Context:\n' + context.documents.join('\n\n') + '\n\n';
  }
  
  if (modelId.includes('mistral')) {
    // Mistral format
    messages.forEach((message) => {
      if (message.role === 'system') {
        formattedPrompt += `<s>[INST] ${message.content} [/INST]</s>\n`;
      } else if (message.role === 'user') {
        formattedPrompt += `<s>[INST] ${message.content} [/INST]`;
      } else {
        formattedPrompt += ` ${message.content}</s>\n`;
      }
    });
    
    // If the last message is from the user, prepare for assistant response
    if (messages[messages.length - 1].role === 'user') {
      formattedPrompt += ' ';
    }
  } else if (modelId.includes('llama')) {
    // Llama 2 format
    const systemMessage = messages.find(m => m.role === 'system')?.content || 
      'You are a helpful assistant. Answer the user queries accurately and helpfully.';
      
    formattedPrompt = `<s>[INST] <<SYS>>\n${systemMessage}\n<</SYS>>\n\n`;
    
    // Add conversation history
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (message.role === 'system') continue;
      
      if (message.role === 'user') {
        formattedPrompt += `${message.content} [/INST] `;
      } else {
        formattedPrompt += `${message.content}</s> `;
        
        // Add next user instruction opening tag
        if (i < messages.length - 1 && messages[i+1].role === 'user') {
          formattedPrompt += `<s>[INST] `;
        }
      }
    }
  } else {
    // Generic format for other models
    const systemMessage = messages.find(m => m.role === 'system')?.content || 
      'You are a helpful assistant.';
    
    formattedPrompt = `System: ${systemMessage}\n\n`;
    
    messages.forEach((message) => {
      if (message.role === 'system') return;
      
      const role = message.role === 'user' ? 'User' : 'Assistant';
      formattedPrompt += `${role}: ${message.content}\n`;
    });
    
    formattedPrompt += 'Assistant:';
  }
  
  return formattedPrompt;
};

// RAG functionality
export const createEmbeddings = async (texts: string[]): Promise<number[][]> => {
  try {
    const embeddingModel = AVAILABLE_MODELS.find(m => m.task === 'feature-extraction')?.id || 'BAAI/bge-large-en-v1.5';
    
    const embeddingsResults = await Promise.all(
      texts.map(text => queryModel(embeddingModel, [{ 
        id: Date.now().toString(),
        role: 'user', 
        content: text,
        timestamp: new Date()
      }]))
    );
    
    return embeddingsResults as unknown as number[][];
  } catch (error) {
    console.error('Error creating embeddings:', error);
    throw error;
  }
};

// Simple cosine similarity for document retrieval
export const cosineSimilarity = (a: number[], b: number[]): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  return dotProduct / (normA * normB);
};

// Storage for document vectors
type DocumentVector = {
  id: string;
  content: string;
  vector: number[];
};

let documentVectors: DocumentVector[] = [];

export const addDocumentToStore = async (id: string, content: string): Promise<void> => {
  try {
    const embedding = await createEmbeddings([content]);
    
    documentVectors.push({
      id,
      content,
      vector: embedding[0],
    });
  } catch (error) {
    console.error('Error adding document to store:', error);
    throw error;
  }
};

export const searchSimilarDocuments = async (
  query: string, 
  topK: number = 3
): Promise<{id: string, content: string, similarity: number}[]> => {
  try {
    // Get query embedding
    const queryEmbedding = await createEmbeddings([query]);
    
    // Calculate similarities
    const similarities = documentVectors.map(doc => ({
      id: doc.id,
      content: doc.content,
      similarity: cosineSimilarity(queryEmbedding[0], doc.vector)
    }));
    
    // Sort by similarity and get top K
    const topDocs = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
    
    return topDocs;
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
};
