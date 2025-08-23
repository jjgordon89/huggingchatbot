import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChat } from '@/context/ChatContext';
import { ApiProvider } from '@/context/ChatContext';
import { SUPPORTED_MODELS } from '@/components/ModelSelector';
import { OllamaApiKeyForm } from '@/components/OllamaApiKeyForm';
import { OllamaModels } from '@/components/OllamaModels';
import { OpenRouterModels } from '@/components/OpenRouterModels';
import { ApiProviderConfig } from '@/components/api-keys/ApiProviderConfig';
import { Workspace } from '@/context/WorkspaceContext';
import {
  AlarmClock,
  Sparkles,
  BrainCircuit,
  Globe,
  Server
} from 'lucide-react';

interface ApiProviderInfo {
  id: ApiProvider;
  name: string;
  description: string;
  website: string;
  icon: React.ElementType;
  requiresKey: boolean;
  getKeyLink: string;
  freeCredits?: string;
  contextWindow?: string;
  pricingInfo?: string;
}

interface ApiKeySettingsProps {
  workspace?: Workspace;
  onUpdateKeys?: (provider: string, key: string) => void;
}

const API_PROVIDERS: ApiProviderInfo[] = [
  {
    id: 'hugging face',
    name: 'Hugging Face',
    description: 'Open-source AI models through the Hugging Face Inference API',
    website: 'https://huggingface.co',
    icon: BrainCircuit,
    requiresKey: true,
    getKeyLink: 'https://huggingface.co/settings/tokens',
    freeCredits: 'Limited free tier available',
    pricingInfo: 'Pay-as-you-go available for higher usage'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Advanced AI models including GPT-5 and GPT-4.1',
    website: 'https://openai.com',
    icon: Sparkles,
    requiresKey: true,
    getKeyLink: 'https://platform.openai.com/api-keys',
    freeCredits: '$5 free credit for new users',
    contextWindow: 'Up to 128K tokens',
    pricingInfo: 'Pay-as-you-go based on tokens processed'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Powerful Claude 4 and Claude 3 AI models with extensive context windows',
    website: 'https://anthropic.com',
    icon: AlarmClock,
    requiresKey: true,
    getKeyLink: 'https://console.anthropic.com/settings/keys',
    contextWindow: 'Up to 200K tokens with Claude 4',
    pricingInfo: 'Pay-as-you-go based on tokens processed'
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Google\'s Gemini models for advanced reasoning with long context',
    website: 'https://ai.google.dev/',
    icon: Globe,
    requiresKey: true,
    getKeyLink: 'https://aistudio.google.com/app/apikey',
    contextWindow: 'Up to 1M tokens',
    pricingInfo: 'Free and paid tiers available'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'Real-time web search with AI reasoning capabilities',
    website: 'https://perplexity.ai',
    icon: Server,
    requiresKey: true,
    getKeyLink: 'https://perplexity.ai/settings/api',
    contextWindow: 'Up to 127K tokens',
    pricingInfo: 'Pay-as-you-go for web-enabled AI'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Unified API for 100+ AI models from different providers',
    website: 'https://openrouter.ai',
    icon: Server,
    requiresKey: true,
    getKeyLink: 'https://openrouter.ai/keys',
    pricingInfo: 'Pay-as-you-go with transparent pricing'
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Local AI models running on your own hardware',
    website: 'https://ollama.ai',
    icon: BrainCircuit,
    requiresKey: false,
    getKeyLink: '',
    pricingInfo: 'Free - runs locally'
  }
];

export function ApiKeySettings({ 
  workspace,
  onUpdateKeys
}: ApiKeySettingsProps) {
  const { availableApiKeys, setApiKey, getApiKey } = useChat();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
    // Initialize from workspace settings if provided, otherwise from global settings
    if (workspace?.settings?.apiKeys) {
      return { ...workspace.settings.apiKeys };
    }
    return API_PROVIDERS.reduce((acc, provider) => {
      const key = getApiKey(provider.id as ApiProvider) || '';
      return { ...acc, [provider.id]: key };
    }, {});
  });
  
  const [activeTab, setActiveTab] = useState('hugging face');

  // Update the apiKeys state if the workspace changes
  useEffect(() => {
    if (workspace?.settings?.apiKeys) {
      setApiKeys(prev => ({
        ...prev,
        ...workspace.settings?.apiKeys
      }));
    }
  }, [workspace]);

  const handleKeyChange = (provider: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  const handleSaveKey = async (provider: ApiProvider) => {
    try {
      if (onUpdateKeys) {
        // Save to workspace settings
        onUpdateKeys(provider, apiKeys[provider]);
      } else {
        // Save to global settings
        setApiKey(apiKeys[provider], provider);
      }
      return true;
    } catch (error) {
      console.error(`Error saving ${provider} API key:`, error);
      return false;
    }
  };

  // Check if API key is available (either in workspace settings or global settings)
  const isKeyAvailable = (provider: string): boolean => {
    if (workspace?.settings?.apiKeys && workspace.settings.apiKeys[provider]) {
      return true;
    }
    return !!availableApiKeys[provider];
  };

  const getProviderModels = (provider: string) => {
    return SUPPORTED_MODELS.filter(model => 
      model.provider.toLowerCase() === provider.toLowerCase()
    );
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">AI Model Providers</h2>
        <p className="text-sm text-muted-foreground">
          Configure API keys for different AI providers to access their models
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          {API_PROVIDERS.map(provider => (
            <TabsTrigger
              key={provider.id}
              value={provider.id}
              className="relative"
            >
              <div className="flex items-center gap-2">
                <provider.icon className="h-4 w-4" />
                <span>{provider.name}</span>
              </div>
              {isKeyAvailable(provider.id) && (
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {API_PROVIDERS.map(provider => (
          <TabsContent key={provider.id} value={provider.id} className="space-y-4 mt-4">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{provider.name}</h3>
                  <p className="text-sm text-muted-foreground">{provider.description}</p>
                </div>
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Visit website
                </a>
              </div>

              {provider.id === 'ollama' ? (
                // Special case for Ollama with its own form
                <OllamaApiKeyForm />
              ) : (
                <ApiProviderConfig
                  provider={provider}
                  apiKey={apiKeys[provider.id] || ''}
                  isKeyAvailable={isKeyAvailable(provider.id)}
                  onKeyChange={(value) => handleKeyChange(provider.id, value)}
                  onSaveKey={() => handleSaveKey(provider.id as ApiProvider)}
                />
              )}


              <div className="mt-4 pt-4 border-t">
                {provider.id === 'ollama' ? (
                  // Show Ollama models component
                  <OllamaModels />
                ) : provider.id === 'openrouter' ? (
                  // Show OpenRouter models component with callback to integrate models
                  <OpenRouterModels onModelSelect={(modelId) => {
                    // This component provides the list of all available models
                    // We can use this as a hook point to load models into the application
                    console.log('Selected OpenRouter model ID:', modelId);
                    
                    // The actual model loading happens inside the OpenRouterModels component
                    // which uses listOpenRouterModels and addOpenRouterModels
                  }} />
                ) : (
                  <>
                    <h4 className="font-medium mb-2">Available Models</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getProviderModels(provider.id).map(model => (
                        <div
                          key={model.id}
                          className={`border rounded-md p-3
                            ${!isKeyAvailable(provider.id) && provider.requiresKey
                              ? 'opacity-50'
                              : 'hover:border-primary'
                            }`}
                        >
                          <div className="flex items-start gap-2">
                            <model.icon className="h-5 w-5 mt-0.5 text-primary" />
                            <div>
                              <h5 className="font-medium">{model.name}</h5>
                              <p className="text-sm text-muted-foreground">{model.description}</p>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {model.strengths && model.strengths.map((strength, index) => (
                                  <span key={index} className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                    {strength}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}