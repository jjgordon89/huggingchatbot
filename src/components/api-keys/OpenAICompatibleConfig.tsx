import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSecureStorage } from '@/hooks/useSecureStorage';
import { InputValidator } from '@/lib/inputValidation';
import { useToast } from '@/hooks/use-toast';
import {
  Server,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  ExternalLink
} from 'lucide-react';

interface OpenAICompatibleModel {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  modelId: string;
  description?: string;
  createdAt: string;
}

interface OpenAICompatibleConfigProps {
  onModelsUpdate?: (models: OpenAICompatibleModel[]) => void;
}

export function OpenAICompatibleConfig({ onModelsUpdate }: OpenAICompatibleConfigProps) {
  const [models, setModels] = useState<OpenAICompatibleModel[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingModel, setEditingModel] = useState<OpenAICompatibleModel | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
    modelId: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load models from secure storage
  const { value: storedModels, setValue: setStoredModels, isLoading } = useSecureStorage<OpenAICompatibleModel[]>(
    'openai_compatible_models',
    [],
    { encrypt: true, type: 'localStorage' }
  );

  useEffect(() => {
    if (!isLoading && storedModels) {
      setModels(storedModels);
      onModelsUpdate?.(storedModels);
    }
  }, [storedModels, isLoading, onModelsUpdate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Model name is required';
    }

    if (!formData.baseUrl.trim()) {
      errors.baseUrl = 'Base URL is required';
    } else if (!InputValidator.validateUrl(formData.baseUrl)) {
      errors.baseUrl = 'Please enter a valid URL';
    }

    if (!formData.apiKey.trim()) {
      errors.apiKey = 'API key is required';
    }

    if (!formData.modelId.trim()) {
      errors.modelId = 'Model ID is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveModel = async () => {
    if (!validateForm()) return;

    const newModel: OpenAICompatibleModel = {
      id: editingModel?.id || `openai-compatible-${Date.now()}`,
      name: formData.name.trim(),
      baseUrl: formData.baseUrl.trim(),
      apiKey: formData.apiKey.trim(),
      modelId: formData.modelId.trim(),
      description: formData.description.trim(),
      createdAt: editingModel?.createdAt || new Date().toISOString()
    };

    try {
      let updatedModels: OpenAICompatibleModel[];
      
      if (editingModel) {
        updatedModels = models.map(m => m.id === editingModel.id ? newModel : m);
      } else {
        updatedModels = [...models, newModel];
      }

      await setStoredModels(updatedModels);
      setModels(updatedModels);
      onModelsUpdate?.(updatedModels);
      
      resetForm();
      toast({
        title: "Model Saved",
        description: `OpenAI Compatible model "${newModel.name}" has been saved successfully.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save model configuration.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    try {
      const updatedModels = models.filter(m => m.id !== modelId);
      await setStoredModels(updatedModels);
      setModels(updatedModels);
      onModelsUpdate?.(updatedModels);
      
      toast({
        title: "Model Deleted",
        description: "OpenAI Compatible model has been deleted successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete model configuration.",
        variant: "destructive"
      });
    }
  };

  const handleEditModel = (model: OpenAICompatibleModel) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      baseUrl: model.baseUrl,
      apiKey: model.apiKey,
      modelId: model.modelId,
      description: model.description || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      baseUrl: '',
      apiKey: '',
      modelId: '',
      description: ''
    });
    setFormErrors({});
    setEditingModel(null);
    setShowForm(false);
  };

  const toggleKeyVisibility = (modelId: string) => {
    setVisibleKeys(prev => ({ ...prev, [modelId]: !prev[modelId] }));
  };

  const maskApiKey = (key: string): string => {
    return key.length > 8 ? `${key.slice(0, 4)}${'*'.repeat(key.length - 8)}${key.slice(-4)}` : '*'.repeat(key.length);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="animate-fade-up">
          <h3 className="text-lg font-medium">OpenAI Compatible Models</h3>
          <p className="text-sm text-muted-foreground">
            Add custom models that use OpenAI's API format (self-hosted, local servers, etc.)
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 hover-scale"
        >
          <Plus className="h-4 w-4" />
          Add Model
        </Button>
      </div>

      {/* Add/Edit Model Form */}
      {showForm && (
        <Card className="animate-scale-in backdrop-blur-sm border-border/50 shadow-glass">{}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              {editingModel ? 'Edit' : 'Add'} OpenAI Compatible Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model-name">Model Name *</Label>
                <Input
                  id="model-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Local Llama 3"
                  aria-describedby={formErrors.name ? "name-error" : undefined}
                />
                {formErrors.name && (
                  <p id="name-error" className="text-sm text-destructive" role="alert">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model-id">Model ID *</Label>
                <Input
                  id="model-id"
                  value={formData.modelId}
                  onChange={(e) => setFormData(prev => ({ ...prev, modelId: e.target.value }))}
                  placeholder="e.g., llama3:8b"
                  aria-describedby={formErrors.modelId ? "model-id-error" : undefined}
                />
                {formErrors.modelId && (
                  <p id="model-id-error" className="text-sm text-destructive" role="alert">
                    {formErrors.modelId}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base-url">Base URL *</Label>
              <Input
                id="base-url"
                value={formData.baseUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="e.g., http://localhost:11434/v1"
                aria-describedby={formErrors.baseUrl ? "base-url-error" : undefined}
              />
              {formErrors.baseUrl && (
                <p id="base-url-error" className="text-sm text-destructive" role="alert">
                  {formErrors.baseUrl}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                The base URL for your OpenAI compatible API endpoint
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key *</Label>
              <Input
                id="api-key"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter API key (use 'none' if not required)"
                aria-describedby={formErrors.apiKey ? "api-key-error" : undefined}
              />
              {formErrors.apiKey && (
                <p id="api-key-error" className="text-sm text-destructive" role="alert">
                  {formErrors.apiKey}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the model"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveModel}>
                {editingModel ? 'Update' : 'Add'} Model
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Models */}
      {models.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Configured Models</h4>
          {models.map((model) => (
            <Card key={model.id} className="hover-scale backdrop-blur-sm border-border/50 shadow-glass animate-fade-in">
              <CardContent className="pt-6">{}
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-primary" />
                      <h5 className="font-medium">{model.name}</h5>
                      <Badge variant="outline" className="text-xs">
                        OpenAI Compatible
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div><strong>Model ID:</strong> {model.modelId}</div>
                      <div className="flex items-center gap-2">
                        <strong>Base URL:</strong> 
                        <a 
                          href={model.baseUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-1"
                        >
                          {model.baseUrl}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>API Key:</strong>
                        <span className="font-mono text-xs">
                          {visibleKeys[model.id] ? model.apiKey : maskApiKey(model.apiKey)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleKeyVisibility(model.id)}
                        >
                          {visibleKeys[model.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                      {model.description && (
                        <div><strong>Description:</strong> {model.description}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditModel(model)}
                      aria-label={`Edit ${model.name}`}
                    >
                      <Server className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteModel(model.id)}
                      aria-label={`Delete ${model.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {models.length === 0 && !showForm && (
        <Alert>
          <Server className="h-4 w-4" />
          <AlertTitle>No OpenAI Compatible Models</AlertTitle>
          <AlertDescription>
            Add custom models that use OpenAI's API format. This includes self-hosted models, 
            local servers like Ollama with OpenAI compatibility, or other providers using the same API format.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
