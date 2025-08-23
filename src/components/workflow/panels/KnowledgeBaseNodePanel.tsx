import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Database,
  Search,
  Brain,
  Zap,
  Settings,
  ChevronDown,
  FileText,
  AlertCircle,
  Info
} from 'lucide-react';

interface KnowledgeBaseNodePanelProps {
  data: any;
  onChange: (id: string, data: any) => void;
  id: string;
}

export const KnowledgeBaseNodePanel: React.FC<KnowledgeBaseNodePanelProps> = ({
  data,
  onChange,
  id,
}) => {
  const handleChange = (key: string, value: any) => {
    onChange(id, { ...data, [key]: value });
  };

  const operation = data.operation || 'search';

  const operationIcons = {
    search: Search,
    index: Database,
    retrieve: Brain,
    generate: Zap,
  };

  const OperationIcon = operationIcons[operation as keyof typeof operationIcons] || Search;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <OperationIcon className="h-5 w-5" />
            Knowledge Base Configuration
          </CardTitle>
          <CardDescription>
            Configure knowledge base operations and parameters
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Operation Type */}
          <div className="space-y-2">
            <Label>Operation Type</Label>
            <Select value={operation} onValueChange={(value) => handleChange('operation', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="search">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span>Search Documents</span>
                  </div>
                </SelectItem>
                <SelectItem value="index">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span>Index Documents</span>
                  </div>
                </SelectItem>
                <SelectItem value="retrieve">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span>Retrieve Context</span>
                  </div>
                </SelectItem>
                <SelectItem value="generate">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>Generate Answer</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Workspace Selection */}
          <div className="space-y-2">
            <Label>Workspace ID</Label>
            <Input
              value={data.workspaceId || ''}
              onChange={(e) => handleChange('workspaceId', e.target.value)}
              placeholder="Enter workspace ID"
            />
            <p className="text-xs text-muted-foreground">
              The workspace containing your documents
            </p>
          </div>

          {/* Operation-specific configurations */}
          {operation === 'search' && (
            <div className="space-y-4">
              <Separator />
              <h4 className="font-medium flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Configuration
              </h4>
              
              <div className="space-y-2">
                <Label>Search Query</Label>
                <Textarea
                  value={data.query || ''}
                  onChange={(e) => handleChange('query', e.target.value)}
                  placeholder="Enter your search query or question..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Results</Label>
                  <Input
                    type="number"
                    value={data.maxResults || 10}
                    onChange={(e) => handleChange('maxResults', parseInt(e.target.value) || 10)}
                    min={1}
                    max={50}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Similarity Threshold</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[data.similarityThreshold || 0.7]}
                      onValueChange={(value) => handleChange('similarityThreshold', value[0])}
                      min={0}
                      max={1}
                      step={0.1}
                      className="flex-1"
                    />
                    <div className="text-xs text-center text-muted-foreground">
                      {((data.similarityThreshold || 0.7) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm">Include Content</Label>
                  <p className="text-xs text-muted-foreground">
                    Include full document content in results
                  </p>
                </div>
                <Switch
                  checked={data.includeContent !== false}
                  onCheckedChange={(checked) => handleChange('includeContent', checked)}
                />
              </div>
            </div>
          )}

          {operation === 'index' && (
            <div className="space-y-4">
              <Separator />
              <h4 className="font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Indexing Configuration
              </h4>

              <div className="space-y-2">
                <Label>Document Source</Label>
                <Select
                  value={data.documentSource || 'workspace'}
                  onValueChange={(value) => handleChange('documentSource', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workspace">Workspace Documents</SelectItem>
                    <SelectItem value="upload">File Upload</SelectItem>
                    <SelectItem value="url">URL/Web Content</SelectItem>
                    <SelectItem value="input">Text Input</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chunk Size</Label>
                  <Input
                    type="number"
                    value={data.chunkSize || 1000}
                    onChange={(e) => handleChange('chunkSize', parseInt(e.target.value) || 1000)}
                    min={100}
                    max={2000}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Chunk Overlap</Label>
                  <Input
                    type="number"
                    value={data.chunkOverlap || 200}
                    onChange={(e) => handleChange('chunkOverlap', parseInt(e.target.value) || 200)}
                    min={0}
                    max={500}
                  />
                </div>
              </div>
            </div>
          )}

          {operation === 'retrieve' && (
            <div className="space-y-4">
              <Separator />
              <h4 className="font-medium flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Retrieval Configuration
              </h4>

              <div className="space-y-2">
                <Label>Context Query</Label>
                <Textarea
                  value={data.contextQuery || ''}
                  onChange={(e) => handleChange('contextQuery', e.target.value)}
                  placeholder="Query for context retrieval..."
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm">Enhanced Context</Label>
                  <p className="text-xs text-muted-foreground">
                    Use advanced context generation
                  </p>
                </div>
                <Switch
                  checked={data.enhancedContext !== false}
                  onCheckedChange={(checked) => handleChange('enhancedContext', checked)}
                />
              </div>
            </div>
          )}

          {operation === 'generate' && (
            <div className="space-y-4">
              <Separator />
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Generation Configuration
              </h4>

              <div className="space-y-2">
                <Label>Question/Prompt</Label>
                <Textarea
                  value={data.prompt || ''}
                  onChange={(e) => handleChange('prompt', e.target.value)}
                  placeholder="Enter your question or prompt..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm">Include Citations</Label>
                  <p className="text-xs text-muted-foreground">
                    Add source references to the response
                  </p>
                </div>
                <Switch
                  checked={data.includeCitations !== false}
                  onCheckedChange={(checked) => handleChange('includeCitations', checked)}
                />
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Advanced Settings
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4">
              <Separator />
              
              <div className="space-y-2">
                <Label>Embedding Model</Label>
                <Select
                  value={data.embeddingModel || 'sentence-transformers/all-MiniLM-L6-v2'}
                  onValueChange={(value) => handleChange('embeddingModel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sentence-transformers/all-MiniLM-L6-v2">
                      MiniLM-L6-v2 (Fast)
                    </SelectItem>
                    <SelectItem value="sentence-transformers/all-mpnet-base-v2">
                      MPNet Base (Better Quality)
                    </SelectItem>
                    <SelectItem value="text-embedding-ada-002">
                      OpenAI Ada-002
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Vector Index Type</Label>
                <Select
                  value={data.indexType || 'hnsw'}
                  onValueChange={(value) => handleChange('indexType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select index" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hnsw">HNSW (Recommended)</SelectItem>
                    <SelectItem value="flat">Flat Index</SelectItem>
                    <SelectItem value="ivf">IVF Index</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm">Cache Results</Label>
                  <p className="text-xs text-muted-foreground">
                    Cache search results for faster repeated queries
                  </p>
                </div>
                <Switch
                  checked={data.cacheResults !== false}
                  onCheckedChange={(checked) => handleChange('cacheResults', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Timeout (seconds)</Label>
                <Input
                  type="number"
                  value={data.timeout || 30}
                  onChange={(e) => handleChange('timeout', parseInt(e.target.value) || 30)}
                  min={5}
                  max={300}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Status Information */}
          {data.status && (
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center gap-2">
                {data.status === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Info className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-sm font-medium">
                  Status: {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                </span>
              </div>
              
              {data.errorMessage && (
                <p className="text-xs text-red-600">{data.errorMessage}</p>
              )}
              
              {data.documentCount && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span>{data.documentCount} documents in workspace</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeBaseNodePanel;