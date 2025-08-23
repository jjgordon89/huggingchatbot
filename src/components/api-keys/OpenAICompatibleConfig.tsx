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

interface OpenAICompatibleEndpoint {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  selectedModels: string[];
  availableModels: { id: string; name: string }[];
  description?: string;
  createdAt: string;
}

interface OpenAICompatibleConfigProps {
  onModelsUpdate?: (models: OpenAICompatibleModel[]) => void;
}

export function OpenAICompatibleConfig({ onModelsUpdate }: OpenAICompatibleConfigProps) {
  const [endpoints, setEndpoints] = useState<OpenAICompatibleEndpoint[]>([]);
  const [models, setModels] = useState<OpenAICompatibleModel[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<OpenAICompatibleEndpoint | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [availableModels, setAvailableModels] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
    selectedModels: [] as string[],
    description: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load endpoints from secure storage
  const { value: storedEndpoints, setValue: setStoredEndpoints, isLoading } = useSecureStorage<OpenAICompatibleEndpoint[]>(
    'openai_compatible_endpoints',
    [],
    { encrypt: true, type: 'localStorage' }
  );

  useEffect(() => {
    if (!isLoading && storedEndpoints) {
      setEndpoints(storedEndpoints);
      // Convert endpoints to models for backwards compatibility
      const allModels = storedEndpoints.flatMap(endpoint => 
        endpoint.selectedModels.map(modelId => ({
          id: `${endpoint.id}-${modelId}`,
          name: `${endpoint.name} - ${modelId}`,
          baseUrl: endpoint.baseUrl,
          apiKey: endpoint.apiKey,
          modelId,
          description: endpoint.description,
          createdAt: endpoint.createdAt
        }))
      );
      setModels(allModels);
      onModelsUpdate?.(allModels);
    }
  }, [storedEndpoints, isLoading, onModelsUpdate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Endpoint name is required';
    }

    if (!formData.baseUrl.trim()) {
      errors.baseUrl = 'Base URL is required';
    } else if (!InputValidator.validateUrl(formData.baseUrl)) {
      errors.baseUrl = 'Please enter a valid URL';
    }

    if (!formData.apiKey.trim()) {
      errors.apiKey = 'API key is required';
    }

    if (formData.selectedModels.length === 0) {
      errors.selectedModels = 'At least one model must be selected';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const testConnection = async () => {
    if (!formData.baseUrl || !formData.apiKey) {
      toast({
        title: "Missing Information",
        description: "Please provide base URL and API key first.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
    try {
      const response = await fetch(`${formData.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${formData.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const models = data.data || data.models || [];
      
      const modelList = models.map((model: any) => ({
        id: model.id || model.name,
        name: model.id || model.name
      }));

      setAvailableModels(modelList);
      toast({
        title: "Connection Successful",
        description: `Found ${modelList.length} available models.`
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to the endpoint.",
        variant: "destructive"
      });
      setAvailableModels([]);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveEndpoint = async () => {
    if (!validateForm()) return;

    const newEndpoint: OpenAICompatibleEndpoint = {
      id: editingEndpoint?.id || `openai-compatible-${Date.now()}`,
      name: formData.name.trim(),
      baseUrl: formData.baseUrl.trim(),
      apiKey: formData.apiKey.trim(),
      selectedModels: formData.selectedModels,
      availableModels,
      description: formData.description.trim(),
      createdAt: editingEndpoint?.createdAt || new Date().toISOString()
    };

    try {
      let updatedEndpoints: OpenAICompatibleEndpoint[];
      
      if (editingEndpoint) {
        updatedEndpoints = endpoints.map(e => e.id === editingEndpoint.id ? newEndpoint : e);
      } else {
        updatedEndpoints = [...endpoints, newEndpoint];
      }

      await setStoredEndpoints(updatedEndpoints);
      setEndpoints(updatedEndpoints);
      
      resetForm();
      toast({
        title: "Endpoint Saved",
        description: `OpenAI Compatible endpoint "${newEndpoint.name}" has been saved successfully.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save endpoint configuration.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEndpoint = async (endpointId: string) => {
    try {
      const updatedEndpoints = endpoints.filter(e => e.id !== endpointId);
      await setStoredEndpoints(updatedEndpoints);
      setEndpoints(updatedEndpoints);
      
      toast({
        title: "Endpoint Deleted",
        description: "OpenAI Compatible endpoint has been deleted successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete endpoint configuration.",
        variant: "destructive"
      });
    }
  };

  const handleEditEndpoint = (endpoint: OpenAICompatibleEndpoint) => {
    setEditingEndpoint(endpoint);
    setFormData({
      name: endpoint.name,
      baseUrl: endpoint.baseUrl,
      apiKey: endpoint.apiKey,
      selectedModels: endpoint.selectedModels,
      description: endpoint.description || ''
    });
    setAvailableModels(endpoint.availableModels);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      baseUrl: '',
      apiKey: '',
      selectedModels: [],
      description: ''
    });
    setFormErrors({});
    setEditingEndpoint(null);
    setAvailableModels([]);
    setShowForm(false);
  };

  const toggleKeyVisibility = (endpointId: string) => {
    setVisibleKeys(prev => ({ ...prev, [endpointId]: !prev[endpointId] }));
  };

  const maskApiKey = (key: string): string => {
    return key.length > 8 ? `${key.slice(0, 4)}${'*'.repeat(key.length - 8)}${key.slice(-4)}` : '*'.repeat(key.length);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="animate-fade-up">
          <h3 className="text-lg font-medium">OpenAI Compatible Endpoints</h3>
          <p className="text-sm text-muted-foreground">
            Add custom endpoints that use OpenAI's API format (self-hosted, local servers, etc.)
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 hover-scale"
        >
          <Plus className="h-4 w-4" />
          Add Endpoint
        </Button>
      </div>

      {/* Add/Edit Endpoint Form */}
      {showForm && (
        <Card className="animate-scale-in backdrop-blur-sm border-border/50 shadow-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              {editingEndpoint ? 'Edit' : 'Add'} OpenAI Compatible Endpoint
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="endpoint-name">Endpoint Name *</Label>
              <Input
                id="endpoint-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Local Ollama Server"
                aria-describedby={formErrors.name ? "name-error" : undefined}
              />
              {formErrors.name && (
                <p id="name-error" className="text-sm text-destructive" role="alert">
                  {formErrors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="base-url">Base URL *</Label>
              <div className="flex gap-2">
                <Input
                  id="base-url"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="e.g., http://localhost:11434/v1"
                  aria-describedby={formErrors.baseUrl ? "base-url-error" : undefined}
                />
                <Button 
                  variant="outline" 
                  onClick={testConnection}
                  disabled={isTestingConnection || !formData.baseUrl || !formData.apiKey}
                >
                  {isTestingConnection ? 'Testing...' : 'Test'}
                </Button>
              </div>
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

            {availableModels.length > 0 && (
              <div className="space-y-2">
                <Label>Available Models *</Label>
                <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                  {availableModels.map((model) => (
                    <div key={model.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`model-${model.id}`}
                        checked={formData.selectedModels.includes(model.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              selectedModels: [...prev.selectedModels, model.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              selectedModels: prev.selectedModels.filter(id => id !== model.id)
                            }));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`model-${model.id}`} className="text-sm font-normal">
                        {model.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {formErrors.selectedModels && (
                  <p className="text-sm text-destructive" role="alert">
                    {formErrors.selectedModels}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Select the models you want to use from this endpoint
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the endpoint"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveEndpoint} disabled={availableModels.length === 0}>
                {editingEndpoint ? 'Update' : 'Add'} Endpoint
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Endpoints */}
      {endpoints.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Configured Endpoints</h4>
          {endpoints.map((endpoint) => (
            <Card key={endpoint.id} className="hover-scale backdrop-blur-sm border-border/50 shadow-glass animate-fade-in">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-primary" />
                      <h5 className="font-medium">{endpoint.name}</h5>
                      <Badge variant="outline" className="text-xs">
                        OpenAI Compatible
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {endpoint.selectedModels.length} models
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <strong>Base URL:</strong> 
                        <a 
                          href={endpoint.baseUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-1"
                        >
                          {endpoint.baseUrl}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>API Key:</strong>
                        <span className="font-mono text-xs">
                          {visibleKeys[endpoint.id] ? endpoint.apiKey : maskApiKey(endpoint.apiKey)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleKeyVisibility(endpoint.id)}
                        >
                          {visibleKeys[endpoint.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                      <div><strong>Selected Models:</strong> {endpoint.selectedModels.join(', ')}</div>
                      {endpoint.description && (
                        <div><strong>Description:</strong> {endpoint.description}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditEndpoint(endpoint)}
                      aria-label={`Edit ${endpoint.name}`}
                    >
                      <Server className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteEndpoint(endpoint.id)}
                      aria-label={`Delete ${endpoint.name}`}
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

      {endpoints.length === 0 && !showForm && (
        <Alert>
          <Server className="h-4 w-4" />
          <AlertTitle>No OpenAI Compatible Endpoints</AlertTitle>
          <AlertDescription>
            Add custom endpoints that use OpenAI's API format. This includes self-hosted models, 
            local servers like Ollama with OpenAI compatibility, or other providers using the same API format.
            Test the connection to automatically discover available models.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
