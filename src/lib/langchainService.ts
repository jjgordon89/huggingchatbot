
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { Document as LangChainDocument } from 'langchain/document';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';

// Define interfaces for our service
export interface LangChainMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LangChainChatOptions {
  systemPrompt?: string;
  temperature?: number;
  model?: string;
  apiKey?: string;
  maxTokens?: number;
}

// LangChain service class
export class LangChainService {
  private defaultModel = 'gpt-3.5-turbo';
  private defaultSystemPrompt = 'You are a helpful AI assistant.';
  private defaultTemperature = 0.7;
  
  // Create a chat model instance
  createChatModel(options: {
    model?: string;
    temperature?: number;
    apiKey?: string;
    maxTokens?: number;
  } = {}) {
    // Use a mock API key for development if not provided
    const apiKey = options.apiKey || process.env.OPENAI_API_KEY || 'sk-mock-api-key';
    
    return new ChatOpenAI({
      modelName: options.model || this.defaultModel,
      temperature: options.temperature || this.defaultTemperature,
      openAIApiKey: apiKey,
      maxTokens: options.maxTokens,
    });
  }
  
  // Generate chat completion with message history
  async generateChatResponse(
    messages: LangChainMessage[],
    options: LangChainChatOptions = {}
  ): Promise<string> {
    try {
      // Create a chat model
      const model = this.createChatModel({
        model: options.model || this.defaultModel,
        temperature: options.temperature || this.defaultTemperature,
        apiKey: options.apiKey,
        maxTokens: options.maxTokens,
      });
      
      // Convert to LangChain message format
      const formattedMessages = messages.map((message) => {
        switch (message.role) {
          case 'system':
            return new SystemMessage(message.content);
          case 'user':
            return new HumanMessage(message.content);
          case 'assistant':
            return new AIMessage(message.content);
          default:
            return new HumanMessage(message.content);
        }
      });
      
      // Add default system message if none exists
      if (!messages.some((m) => m.role === 'system')) {
        formattedMessages.unshift(new SystemMessage(options.systemPrompt || this.defaultSystemPrompt));
      }
      
      // Invoke the model
      console.log('Generating chat response with LangChain...');
      const response = await model.invoke(formattedMessages);
      
      return response.content;
    } catch (error) {
      console.error('LangChain chat generation error:', error);
      throw new Error(`Failed to generate chat response: ${error}`);
    }
  }
  
  // Create a simple prompt chain
  async createPromptChain(promptTemplate: string, input: Record<string, any>) {
    try {
      const model = this.createChatModel();
      
      // Create a prompt template
      const prompt = PromptTemplate.fromTemplate(promptTemplate);
      
      // Create a chain
      const chain = RunnableSequence.from([
        prompt,
        model,
        new StringOutputParser(),
      ]);
      
      // Run the chain
      const result = await chain.invoke(input);
      return result;
    } catch (error) {
      console.error('LangChain prompt chain error:', error);
      throw new Error(`Failed to run prompt chain: ${error}`);
    }
  }
  
  // RAG (Retrieval Augmented Generation) functionality
  async generateRagResponse(
    query: string,
    documents: { content: string; metadata?: Record<string, any> }[],
    options: LangChainChatOptions = {}
  ): Promise<string> {
    try {
      // Convert to LangChain documents format
      const langchainDocs = documents.map(
        (doc) => new LangChainDocument({ 
          pageContent: doc.content, 
          metadata: doc.metadata || {} 
        })
      );
      
      // Construct context from documents
      const context = langchainDocs
        .map((doc) => doc.pageContent)
        .join('\n\n');
      
      // Create RAG prompt template
      const ragPromptTemplate = PromptTemplate.fromTemplate(`
        You are a helpful AI assistant. Use the following retrieved documents to answer the user's question.
        If you don't know the answer or can't find it in the context, just say so.
        
        Context:
        {context}
        
        User Question: {query}
        
        Answer:
      `);
      
      const model = this.createChatModel({
        model: options.model || this.defaultModel,
        temperature: options.temperature || 0.5, // Lower temperature for RAG
        apiKey: options.apiKey,
        maxTokens: options.maxTokens,
      });
      
      // Create and run the chain
      const chain = RunnableSequence.from([
        ragPromptTemplate,
        model,
        new StringOutputParser(),
      ]);
      
      const response = await chain.invoke({
        context,
        query,
      });
      
      return response;
    } catch (error) {
      console.error('LangChain RAG error:', error);
      throw new Error(`Failed to generate RAG response: ${error}`);
    }
  }
}

// Create a singleton instance
const langchainService = new LangChainService();
export default langchainService;
