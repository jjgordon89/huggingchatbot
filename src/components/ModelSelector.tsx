import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Cpu, Zap, Sparkles, BrainCircuit, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/context/ChatContext';
import { useOpenAICompatible } from '@/hooks/useOpenAICompatible';
import { HuggingFaceModel } from '@/lib/api';

// List of supported models with additional metadata
export const SUPPORTED_MODELS = [
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.2',
    name: 'Mistral 7B',
    description: 'Balanced performance with moderate resource usage',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 8192,
    strengths: ['Balanced', 'General-purpose'],
    icon: Cpu
  },
  {
    id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    name: 'Mixtral 8x7B',
    description: 'Mixture of experts model with strong performance',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 32768,
    strengths: ['Powerful', 'Multilingual'],
    icon: BrainCircuit
  },
  {
    id: 'mistralai/Mistral-Nemo-Instruct-2407',
    name: 'Mistral Nemo',
    description: 'Latest top-performing Mistral model with enhanced reasoning',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 32768,
    strengths: ['Advanced reasoning', 'STEM expertise'],
    icon: BrainCircuit
  },
  {
    id: 'meta-llama/Llama-2-7b-chat-hf',
    name: 'Llama 2 (7B)',
    description: 'Meta\'s open source chat model with good reasoning',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 4096,
    strengths: ['Open-source', 'Reasoning'],
    icon: BrainCircuit
  },
  {
    id: 'meta-llama/Llama-2-13b-chat-hf',
    name: 'Llama 2 (13B)',
    description: 'Larger version of Llama 2 with improved capabilities',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 4096,
    strengths: ['Reasoning', 'Complex tasks'],
    icon: BrainCircuit
  },
  {
    id: 'meta-llama/Meta-Llama-3-8B-Instruct',
    name: 'Llama 3 (8B)',
    description: 'Meta\'s latest generation language model with improved performance',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 8192,
    strengths: ['Reasoning', 'Efficient'],
    icon: BrainCircuit
  },
  {
    id: 'meta-llama/Meta-Llama-3-70B-Instruct',
    name: 'Llama 3 (70B)',
    description: 'Meta\'s large high-performance language model',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 8192,
    strengths: ['Complex reasoning', 'High-performance'],
    icon: BrainCircuit
  },
  {
    id: 'microsoft/phi-2',
    name: 'Phi-2',
    description: 'Compact but capable model for basic tasks',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 2048,
    strengths: ['Compact', 'Fast'],
    icon: Zap
  },
  {
    id: 'microsoft/Phi-3-mini-4k-instruct',
    name: 'Phi-3 Mini',
    description: 'Microsoft\'s latest compact and efficient language model',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 4096,
    strengths: ['Highly efficient', 'Reasoning'],
    icon: Zap
  },
  {
    id: 'Qwen/Qwen1.5-7B-Chat',
    name: 'Qwen 1.5 (7B)',
    description: 'Versatile bilingual model with efficient processing',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 8192,
    strengths: ['Multilingual', 'Efficient'],
    icon: Cpu
  },
  {
    id: 'Qwen/Qwen2-7B-Instruct',
    name: 'Qwen 2 (7B)',
    description: 'Alibaba\'s latest language model with improved performance',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 32768,
    strengths: ['Long context', 'Multilingual'],
    icon: Cpu
  },
  {
    id: 'google/gemma-7b-it',
    name: 'Gemma (7B)',
    description: 'Google\'s lightweight language model',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 8192,
    strengths: ['Lightweight', 'Instruction-tuned'],
    icon: Zap
  },
  {
    id: 'google/gemma-2-9b-it',
    name: 'Gemma 2 (9B)',
    description: 'Google\'s latest language model with enhanced capabilities',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 8192,
    strengths: ['Efficient', 'High quality'],
    icon: Zap
  },
  {
    id: 'NousResearch/Nous-Hermes-2-Yi-34B',
    name: 'Nous Hermes-2 (34B)',
    description: 'Large high-performance instruction-tuned model',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 4096,
    strengths: ['High-performance', 'Instruction-tuned'],
    icon: BrainCircuit
  },
  {
    id: 'codellama/CodeLlama-34b-Instruct-hf',
    name: 'CodeLlama (34B)',
    description: 'Large code-specialized model for development tasks',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 16384,
    strengths: ['Code generation', 'Programming'],
    icon: BrainCircuit
  },
  {
    id: 'Salesforce/xgen-7b-8k-inst',
    name: 'XGEN (7B)',
    description: 'Salesforce\'s efficient instruction-tuned model',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 8192,
    strengths: ['Efficient', 'Balanced'],
    icon: Cpu
  },
  {
    id: 'stabilityai/stablecode-instruct-alpha-3b',
    name: 'StableCode (3B)',
    description: 'Specialized model for code generation and completion',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 4096,
    strengths: ['Code-focused', 'Compact'],
    icon: Zap
  },
  {
    id: 'databricks/dbrx-instruct',
    name: 'DBRX',
    description: 'Databricks\' high-performance research model',
    category: 'open-source',
    provider: 'Hugging Face',
    contextLength: 32768,
    strengths: ['High-performance', 'Data analysis'],
    icon: BrainCircuit
  },
  // Claude 4 Models (Latest - RECOMMENDED)
  { 
    id: 'claude-opus-4-20250514', 
    name: 'Claude 4 Opus', 
    description: 'Most capable and intelligent model with superior reasoning',
    category: 'proprietary',
    provider: 'Anthropic',
    contextLength: 200000,
    strengths: ['Superior reasoning', 'Most capable'],
    icon: BrainCircuit,
    apiKeyRequired: true
  },
  { 
    id: 'claude-sonnet-4-20250514', 
    name: 'Claude 4 Sonnet', 
    description: 'High-performance model with exceptional reasoning and efficiency',
    category: 'proprietary',
    provider: 'Anthropic',
    contextLength: 200000,
    strengths: ['High-performance', 'Exceptional reasoning'],
    icon: BrainCircuit,
    apiKeyRequired: true
  },
  { 
    id: 'claude-3-5-haiku-20241022', 
    name: 'Claude 3.5 Haiku', 
    description: 'Fastest model for quick responses with vision capabilities',
    category: 'proprietary',
    provider: 'Anthropic',
    contextLength: 200000,
    strengths: ['Fastest', 'Vision'],
    icon: Zap,
    apiKeyRequired: true
  },

  // Claude 3 Models (Legacy - use with caution)
  { 
    id: 'claude-3-7-sonnet-20250219', 
    name: 'Claude 3.7 Sonnet', 
    description: 'Extended thinking model (being superseded by Claude 4)',
    category: 'proprietary',
    provider: 'Anthropic',
    contextLength: 200000,
    strengths: ['Extended thinking', 'Legacy'],
    icon: Sparkles,
    apiKeyRequired: true
  },
  { 
    id: 'claude-3-5-sonnet-20241022', 
    name: 'Claude 3.5 Sonnet', 
    description: 'Previous intelligent model (replaced by Sonnet 4)',
    category: 'proprietary',
    provider: 'Anthropic',
    contextLength: 200000,
    strengths: ['Intelligent', 'Previous generation'],
    icon: Sparkles,
    apiKeyRequired: true
  },
  { 
    id: 'claude-3-opus-20240229', 
    name: 'Claude 3 Opus', 
    description: 'Powerful but older than Claude 4',
    category: 'proprietary',
    provider: 'Anthropic',
    contextLength: 200000,
    strengths: ['Powerful', 'Older generation'],
    icon: BrainCircuit,
    apiKeyRequired: true
  },

  // GPT-5 Models (Latest)
  { 
    id: 'gpt-5-2025-08-07', 
    name: 'GPT-5', 
    description: 'OpenAI\'s flagship model with superior performance',
    category: 'proprietary',
    provider: 'OpenAI',
    contextLength: 128000,
    strengths: ['Flagship', 'Superior performance'],
    icon: BrainCircuit,
    apiKeyRequired: true
  },
  { 
    id: 'gpt-5-mini-2025-08-07', 
    name: 'GPT-5 Mini', 
    description: 'Faster, more cost-efficient version of GPT-5',
    category: 'proprietary',
    provider: 'OpenAI',
    contextLength: 128000,
    strengths: ['Fast', 'Cost-efficient'],
    icon: Zap,
    apiKeyRequired: true
  },
  { 
    id: 'gpt-5-nano-2025-08-07', 
    name: 'GPT-5 Nano', 
    description: 'Fastest, cheapest version for summarization and classification',
    category: 'proprietary',
    provider: 'OpenAI',
    contextLength: 128000,
    strengths: ['Fastest', 'Cheapest'],
    icon: Zap,
    apiKeyRequired: true
  },

  // GPT-4.1 Models
  { 
    id: 'gpt-4.1-2025-04-14', 
    name: 'GPT-4.1', 
    description: 'Flagship GPT-4 model for reliable results',
    category: 'proprietary',
    provider: 'OpenAI',
    contextLength: 128000,
    strengths: ['Reliable', 'Flagship GPT-4'],
    icon: Sparkles,
    apiKeyRequired: true
  },
  { 
    id: 'gpt-4.1-mini-2025-04-14', 
    name: 'GPT-4.1 Mini', 
    description: 'Efficient GPT-4 model with vision capabilities',
    category: 'proprietary',
    provider: 'OpenAI',
    contextLength: 128000,
    strengths: ['Efficient', 'Vision'],
    icon: Zap,
    apiKeyRequired: true
  },

  // O-Series Reasoning Models
  { 
    id: 'o3-2025-04-16', 
    name: 'O3', 
    description: 'Powerful reasoning model for multi-step analysis',
    category: 'proprietary',
    provider: 'OpenAI',
    contextLength: 128000,
    strengths: ['Reasoning', 'Multi-step analysis'],
    icon: BrainCircuit,
    apiKeyRequired: true
  },
  { 
    id: 'o4-mini-2025-04-16', 
    name: 'O4 Mini', 
    description: 'Fast reasoning model optimized for coding and visual tasks',
    category: 'proprietary',
    provider: 'OpenAI',
    contextLength: 128000,
    strengths: ['Fast reasoning', 'Coding', 'Visual'],
    icon: Zap,
    apiKeyRequired: true
  },

  // Legacy OpenAI Models
  { 
    id: 'gpt-4o-mini', 
    name: 'GPT-4o Mini', 
    description: 'Fast and cheap legacy model with vision (legacy)',
    category: 'proprietary',
    provider: 'OpenAI',
    contextLength: 128000,
    strengths: ['Fast', 'Cheap', 'Legacy'],
    icon: Zap,
    apiKeyRequired: true
  },
  { 
    id: 'gpt-4o', 
    name: 'GPT-4o', 
    description: 'Older powerful model with vision capabilities (legacy)',
    category: 'proprietary',
    provider: 'OpenAI',
    contextLength: 128000,
    strengths: ['Powerful', 'Vision', 'Legacy'],
    icon: Sparkles,
    apiKeyRequired: true
  },

  // Google Models
  {
    id: 'gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    description: 'Google\'s latest advanced reasoning model with long context',
    category: 'proprietary',
    provider: 'Google',
    contextLength: 1048576,
    strengths: ['Long context', 'Advanced reasoning'],
    icon: BrainCircuit,
    apiKeyRequired: true
  },
  {
    id: 'gemini-flash-1.5',
    name: 'Gemini Flash 1.5',
    description: 'Google\'s fast and efficient model for quick responses',
    category: 'proprietary',
    provider: 'Google',
    contextLength: 1048576,
    strengths: ['Fast', 'Efficient'],
    icon: Zap,
    apiKeyRequired: true
  },

  // Perplexity Models
  {
    id: 'llama-3.1-sonar-small-128k-online',
    name: 'Perplexity Sonar Small',
    description: 'Real-time web search with 8B parameter model',
    category: 'proprietary',
    provider: 'Perplexity',
    contextLength: 127072,
    strengths: ['Web search', 'Real-time'],
    icon: Server,
    apiKeyRequired: true
  },
  {
    id: 'llama-3.1-sonar-large-128k-online',
    name: 'Perplexity Sonar Large',
    description: 'Real-time web search with 70B parameter model',
    category: 'proprietary',
    provider: 'Perplexity',
    contextLength: 127072,
    strengths: ['Web search', 'Large model'],
    icon: BrainCircuit,
    apiKeyRequired: true
  },
  {
    id: 'llama-3.1-sonar-huge-128k-online',
    name: 'Perplexity Sonar Huge',
    description: 'Real-time web search with 405B parameter model',
    category: 'proprietary',
    provider: 'Perplexity',
    contextLength: 127072,
    strengths: ['Web search', 'Huge model'],
    icon: BrainCircuit,
    apiKeyRequired: true
  },
  
  // Ollama Models - These are placeholders, actual models will be loaded dynamically
  {
    id: 'ollama:llama3',
    name: 'Llama 3 (Local)',
    description: 'Meta\'s latest language model running locally via Ollama',
    category: 'local',
    provider: 'Ollama',
    contextLength: 8192,
    strengths: ['Local', 'Privacy-focused'],
    icon: Server,
    apiKeyRequired: false
  },
  {
    id: 'ollama:mistral',
    name: 'Mistral (Local)',
    description: 'High-performance instruction-tuned model running locally',
    category: 'local',
    provider: 'Ollama',
    contextLength: 8192,
    strengths: ['Local', 'Efficient'],
    icon: Server,
    apiKeyRequired: false
  },
  {
    id: 'ollama:mixtral',
    name: 'Mixtral (Local)',
    description: 'Mixture of experts model running locally via Ollama',
    category: 'local',
    provider: 'Ollama',
    contextLength: 32768,
    strengths: ['Local', 'Powerful'],
    icon: Server,
    apiKeyRequired: false
  },
  {
    id: 'ollama:phi3',
    name: 'Phi-3 (Local)',
    description: 'Microsoft\'s compact model running locally via Ollama',
    category: 'local',
    provider: 'Ollama',
    contextLength: 4096,
    strengths: ['Local', 'Compact'],
    icon: Server,
    apiKeyRequired: false
  },
  {
    id: 'ollama:codellama',
    name: 'CodeLlama (Local)',
    description: 'Code-optimized model running locally via Ollama',
    category: 'local',
    provider: 'Ollama',
    contextLength: 16384,
    strengths: ['Local', 'Code-focused'],
    icon: Server,
    apiKeyRequired: false
  },

  // OpenAI Compatible Models - these are placeholders, actual models loaded dynamically
  {
    id: 'openai-compatible-placeholder',
    name: 'OpenAI Compatible',
    description: 'Custom models using OpenAI API format',
    category: 'custom',
    provider: 'OpenAI Compatible',
    contextLength: 4096,
    strengths: ['Custom', 'Self-hosted'],
    icon: Server,
    apiKeyRequired: false
  }
];

export type ModelSelectorProps = {
  className?: string;
  isCompact?: boolean;
  onlyAvailable?: boolean;
};

export function ModelSelector({ className, isCompact = false, onlyAvailable = false }: ModelSelectorProps) {
  const { activeModel, setActiveModel, availableApiKeys } = useChat();
  const { getSelectorModels } = useOpenAICompatible();
  const [open, setOpen] = useState(false);
  const [allModels, setAllModels] = useState(SUPPORTED_MODELS);

  // Combine built-in models with OpenAI Compatible models
  useEffect(() => {
    const openAICompatibleModels = getSelectorModels();
    // Filter out the placeholder and add real models
    const builtInModels = SUPPORTED_MODELS.filter(m => m.id !== 'openai-compatible-placeholder');
    setAllModels([...builtInModels, ...openAICompatibleModels]);
  }, [getSelectorModels]);

  // Filter models based on available API keys if onlyAvailable is true
  const filteredModels = onlyAvailable 
    ? allModels.filter(model => 
        !model.apiKeyRequired || 
        (model.apiKeyRequired && availableApiKeys[model.provider.toLowerCase()]))
    : allModels;
  
  const activeModelData = allModels.find(m => m.id === activeModel.id) || allModels[0];
  const Icon = activeModelData.icon || Cpu;

  const handleSelectModel = (modelId: string) => {
    const selectedModel = allModels.find(m => m.id === modelId);
    if (selectedModel) {
      setActiveModel({
        id: selectedModel.id,
        name: selectedModel.name,
        description: selectedModel.description,
        task: 'text-generation',
        provider: selectedModel.provider,
        maxTokens: selectedModel.contextLength || 4096
      } as HuggingFaceModel);
    }
    setOpen(false);
  };

  // Compact view (for chat header)
  if (isCompact) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1 border-dashed">
            <Icon className="h-3.5 w-3.5" />
            <span className="truncate max-w-[100px]">{activeModelData.name}</span>
            <ChevronsUpDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[225px] p-0" align="end">
          <Command>
            <CommandList>
              <CommandGroup heading="AI Models">
                {filteredModels.map((model) => {
                  const ModelIcon = model.icon || Cpu;
                  return (
                    <CommandItem
                      key={model.id}
                      onSelect={() => handleSelectModel(model.id)}
                      className="cursor-pointer"
                    >
                      <div className={cn(
                        "mr-2 h-4 w-4 flex items-center justify-center",
                        model.id === activeModel.id ? "opacity-100" : "opacity-40"
                      )}>
                        <ModelIcon className="h-4 w-4" />
                      </div>
                      <span>{model.name}</span>
                      {model.id === activeModel.id && (
                        <Check className="ml-auto h-4 w-4 opacity-100" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
  
  // Full view (for settings)
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-full"
          >
            <div className="flex items-center gap-2 truncate">
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{activeModelData.name}</span>
              {activeModelData.apiKeyRequired && !availableApiKeys[activeModelData.provider.toLowerCase()] && (
                <Badge variant="outline" className="ml-2 text-amber-500 border-amber-500">API Key Required</Badge>
              )}
            </div>
            <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search models..." />
            <CommandList className="max-h-[300px] overflow-auto">
              <CommandEmpty>No models found.</CommandEmpty>
              <CommandGroup heading="Hugging Face Models">
                {filteredModels
                  .filter(model => model.provider === 'Hugging Face')
                  .map((model) => (
                    <ModelCommandItem 
                      key={model.id} 
                      model={model} 
                      activeModelId={activeModel.id}
                      onSelect={handleSelectModel}
                      availableApiKeys={availableApiKeys}
                    />
                  ))}
              </CommandGroup>
              <CommandGroup heading="OpenAI Models">
                {filteredModels
                  .filter(model => model.provider === 'OpenAI')
                  .map((model) => (
                    <ModelCommandItem 
                      key={model.id} 
                      model={model} 
                      activeModelId={activeModel.id} 
                      onSelect={handleSelectModel}
                      availableApiKeys={availableApiKeys}
                    />
                  ))}
              </CommandGroup>
              <CommandGroup heading="Anthropic Models">
                {filteredModels
                  .filter(model => model.provider === 'Anthropic')
                  .map((model) => (
                    <ModelCommandItem 
                      key={model.id} 
                      model={model} 
                      activeModelId={activeModel.id} 
                      onSelect={handleSelectModel}
                      availableApiKeys={availableApiKeys}
                    />
                  ))}
              </CommandGroup>
              <CommandGroup heading="Google Models">
                {filteredModels
                  .filter(model => model.provider === 'Google')
                  .map((model) => (
                    <ModelCommandItem
                      key={model.id}
                      model={model}
                      activeModelId={activeModel.id}
                      onSelect={handleSelectModel}
                      availableApiKeys={availableApiKeys}
                    />
                  ))}
              </CommandGroup>
              <CommandGroup heading="Perplexity Models">
                {filteredModels
                  .filter(model => model.provider === 'Perplexity')
                  .map((model) => (
                    <ModelCommandItem
                      key={model.id}
                      model={model}
                      activeModelId={activeModel.id}
                      onSelect={handleSelectModel}
                      availableApiKeys={availableApiKeys}
                    />
                  ))}
              </CommandGroup>
              <CommandGroup heading="OpenAI Compatible Models">
                {filteredModels
                  .filter(model => model.provider === 'OpenAI Compatible')
                  .map((model) => (
                    <ModelCommandItem
                      key={model.id}
                      model={model}
                      activeModelId={activeModel.id}
                      onSelect={handleSelectModel}
                      availableApiKeys={availableApiKeys}
                    />
                  ))}
              </CommandGroup>
              <CommandGroup heading="Ollama Models">
                {filteredModels
                  .filter(model => model.provider === 'Ollama')
                  .map((model) => (
                    <ModelCommandItem
                      key={model.id}
                      model={model}
                      activeModelId={activeModel.id}
                      onSelect={handleSelectModel}
                      availableApiKeys={availableApiKeys}
                    />
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

type ModelCommandItemProps = {
  model: (typeof SUPPORTED_MODELS)[0] | any; // Allow OpenAI Compatible models
  activeModelId: string;
  onSelect: (id: string) => void;
  availableApiKeys: Record<string, boolean>;
}

function ModelCommandItem({ model, activeModelId, onSelect, availableApiKeys }: ModelCommandItemProps) {
  const ModelIcon = model.icon || Cpu;
  const isActive = model.id === activeModelId;
  const isAvailable = !model.apiKeyRequired || (model.apiKeyRequired && availableApiKeys[model.provider.toLowerCase()]);
  
  return (
    <CommandItem
      key={model.id}
      onSelect={() => onSelect(model.id)}
      className={cn(
        "flex items-start py-2 cursor-pointer",
        !isAvailable && "opacity-60"
      )}
      disabled={!isAvailable}
    >
      <div className="flex flex-1 gap-2">
        <div className={cn(
          "mt-0.5 h-5 w-5 flex-shrink-0",
          isActive ? "text-primary" : "text-muted-foreground"
        )}>
          <ModelIcon className="h-5 w-5" />
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{model.name}</span>
            {model.category === 'open-source' && (
              <Badge variant="outline" className="px-1 text-xs h-5">Open-source</Badge>
            )}
            {model.apiKeyRequired && !availableApiKeys[model.provider.toLowerCase()] && (
              <Badge variant="outline" className="px-1 h-5 text-xs text-amber-500 border-amber-500">API Key Required</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{model.description}</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {model.strengths.map((strength, index) => (
              <Badge key={index} variant="secondary" className="px-1 py-0 text-xs">
                {strength}
              </Badge>
            ))}
            <Badge variant="secondary" className="px-1 py-0 text-xs">
              {model.contextLength.toLocaleString()} tokens
            </Badge>
            <Badge variant="secondary" className="px-1 py-0 text-xs">
              {model.provider}
            </Badge>
          </div>
        </div>
      </div>
      {isActive && <Check className="ml-2 h-4 w-4 flex-shrink-0 text-primary" />}
    </CommandItem>
  );
}
