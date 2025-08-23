import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import { Database, Search, FileText, Brain, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const KnowledgeBaseNode = memo(({ id, data, isConnectable, selected }: NodeProps) => {
  // Get operation type
  const getOperationType = () => {
    return data.operation || 'search';
  };

  // Get operation icon and color
  const getOperationIcon = () => {
    const operation = getOperationType();
    
    switch (operation) {
      case 'search':
        return { icon: Search, color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'index':
        return { icon: Database, color: 'text-green-500', bg: 'bg-green-50' };
      case 'retrieve':
        return { icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' };
      case 'generate':
        return { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' };
      default:
        return { icon: Database, color: 'text-gray-500', bg: 'bg-gray-50' };
    }
  };

  // Get status indicator
  const getStatusIndicator = () => {
    const status = data.status || 'ready';
    
    switch (status) {
      case 'processing':
        return { icon: Clock, color: 'text-blue-500', label: 'Processing' };
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-500', label: 'Completed' };
      case 'error':
        return { icon: AlertCircle, color: 'text-red-500', label: 'Error' };
      default:
        return { icon: CheckCircle, color: 'text-gray-400', label: 'Ready' };
    }
  };

  const operationConfig = getOperationIcon();
  const statusConfig = getStatusIndicator();
  const OperationIcon = operationConfig.icon;
  const StatusIcon = statusConfig.icon;

  // Format operation label
  const getOperationLabel = () => {
    const operation = getOperationType();
    return operation.charAt(0).toUpperCase() + operation.slice(1);
  };

  // Get workspace info
  const workspaceId = data.workspaceId || 'default';
  const documentCount = data.documentCount || 0;
  const processedDocuments = data.processedDocuments || 0;

  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      selected={selected}
      icon={<OperationIcon className={`h-4 w-4 ${operationConfig.color}`} />}
      color={operationConfig.bg}
    >
      <div className="space-y-3">
        {/* Operation and Status */}
        <div className="flex items-center justify-between mb-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs font-normal">
                  {getOperationLabel()}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Operation: {getOperationLabel()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center gap-1 ${statusConfig.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  <span className="text-xs">{statusConfig.label}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Status: {statusConfig.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Workspace Info */}
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-medium">Workspace</p>
            <p className="text-xs text-muted-foreground truncate">{workspaceId}</p>
          </div>
        </div>

        {/* Document Count */}
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-medium">Documents</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{documentCount} total</p>
              {processedDocuments > 0 && (
                <Badge variant="secondary" className="h-4 text-xs">
                  {processedDocuments} indexed
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Search Query (for search operations) */}
        {getOperationType() === 'search' && data.query && (
          <div className="flex items-start gap-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium">Query</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{data.query}</p>
            </div>
          </div>
        )}

        {/* Processing Progress */}
        {data.status === 'processing' && data.progress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Processing...</span>
              <span>{Math.round(data.progress)}%</span>
            </div>
            <Progress value={data.progress} className="h-1" />
          </div>
        )}

        {/* Search Results */}
        {data.isCompleted && data.output && data.output.results && (
          <div className="mt-2 border-t pt-2">
            <p className="text-xs font-medium mb-1 flex items-center">
              <Brain className="h-3.5 w-3.5 mr-1" />
              Results
            </p>
            <div className="text-xs text-muted-foreground">
              {Array.isArray(data.output.results) && (
                <div className="space-y-1">
                  <span>{data.output.results.length} documents found</span>
                  {data.output.executionTime && (
                    <div className="text-xs opacity-75">
                      Executed in {data.output.executionTime}ms
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {data.status === 'error' && data.errorMessage && (
          <div className="mt-2 border-t pt-2">
            <p className="text-xs font-medium mb-1 flex items-center text-red-600">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              Error
            </p>
            <p className="text-xs text-red-600 line-clamp-2">{data.errorMessage}</p>
          </div>
        )}

        {/* Configuration Details */}
        {(data.similarityThreshold || data.maxResults || data.embeddingModel) && (
          <div className="mt-2 border-t pt-2">
            <p className="text-xs font-medium mb-1">Configuration</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
              {data.maxResults && (
                <div>Max: {data.maxResults}</div>
              )}
              {data.similarityThreshold && (
                <div>Threshold: {data.similarityThreshold}</div>
              )}
              {data.embeddingModel && (
                <div className="col-span-2 truncate">
                  Model: {data.embeddingModel}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
});

KnowledgeBaseNode.displayName = 'KnowledgeBaseNode';