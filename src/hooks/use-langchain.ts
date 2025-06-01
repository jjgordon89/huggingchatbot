
import { useState } from 'react';
import langchainService, { LangChainMessage, LangChainChatOptions } from '@/lib/langchainService';
import { useToast } from '@/hooks/use-toast';
import { Document, DocumentSource } from '@/types/models';

interface UseLangChainReturn {
  isGenerating: boolean;
  generateChatResponse: (messages: LangChainMessage[], options?: LangChainChatOptions) => Promise<string>;
  generateWithPromptTemplate: (template: string, input: Record<string, any>) => Promise<string>;
  generateRagResponse: (query: string, documents: Document[]) => Promise<string>;
  error: Error | null;
}

export function useLangChain(): UseLangChainReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const generateChatResponse = async (
    messages: LangChainMessage[],
    options: LangChainChatOptions = {}
  ): Promise<string> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await langchainService.generateChatResponse(messages, options);
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: "Error generating response",
        description: error.message,
        variant: "destructive"
      });
      return "I'm sorry, but I encountered an error while generating a response.";
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWithPromptTemplate = async (
    template: string,
    input: Record<string, any>
  ): Promise<string> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await langchainService.createPromptChain(template, input);
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: "Error with prompt template",
        description: error.message,
        variant: "destructive"
      });
      return "I'm sorry, but I encountered an error with the prompt template.";
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRagResponse = async (
    query: string,
    documents: Document[]
  ): Promise<string> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const docsForRag = documents.map(doc => ({
        content: doc.content || '',
        metadata: {
          name: doc.name || 'Untitled Document',
          type: doc.type,
          filename: doc.filename
        }
      }));
      
      const response = await langchainService.generateRagResponse(query, docsForRag);
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: "Error with RAG response",
        description: error.message,
        variant: "destructive"
      });
      return "I'm sorry, but I encountered an error generating the RAG response.";
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateChatResponse,
    generateWithPromptTemplate,
    generateRagResponse,
    error
  };
}
