import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  PlayCircle, 
  StopCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity,
  Download,
  RotateCcw,
  Eye
} from 'lucide-react';
import { Workflow, WorkflowExecutionResult } from '@/lib/workflowTypes';
import { workflowExecutionService } from '@/lib/workflowExecutionService';
import { formatDistanceToNow } from 'date-fns';

interface WorkflowExecutionPanelProps {
  workflow: Workflow;
  onExecutionComplete?: (result: WorkflowExecutionResult) => void;
  className?: string;
}

interface ExecutionLog {
  timestamp: string;
  message: string;
  level: 'info' | 'error' | 'warning';
  nodeId?: string;
}

export const WorkflowExecutionPanel: React.FC<WorkflowExecutionPanelProps> = ({
  workflow,
  onExecutionComplete,
  className
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<WorkflowExecutionResult | null>(null);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [executionHistory, setExecutionHistory] = useState<WorkflowExecutionResult[]>([]);

  useEffect(() => {
    // Load execution history from localStorage
    const historyKey = `workflow-history-${workflow.id}`;
    const saved = localStorage.getItem(historyKey);
    if (saved) {
      try {
        setExecutionHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading execution history:', error);
      }
    }
  }, [workflow.id]);

  const saveExecutionToHistory = (result: WorkflowExecutionResult) => {
    const historyKey = `workflow-history-${workflow.id}`;
    const newHistory = [result, ...executionHistory.slice(0, 9)]; // Keep last 10 executions
    setExecutionHistory(newHistory);
    localStorage.setItem(historyKey, JSON.stringify(newHistory));
  };

  const handleExecuteWorkflow = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    setExecutionLogs([]);
    setCurrentNodeId(null);
    setProgress(0);

    const startTime = Date.now();
    const totalNodes = workflow.nodes.length;
    let completedNodes = 0;

    try {
      const result = await workflowExecutionService.executeWorkflow(workflow, {
        onNodeStart: (nodeId) => {
          setCurrentNodeId(nodeId);
          const node = workflow.nodes.find(n => n.id === nodeId);
          setExecutionLogs(prev => [...prev, {
            timestamp: new Date().toISOString(),
            message: `Started executing node: ${node?.data.label || nodeId}`,
            level: 'info',
            nodeId
          }]);
        },
        onNodeComplete: (nodeId, output) => {
          completedNodes++;
          setProgress((completedNodes / totalNodes) * 100);
          
          const node = workflow.nodes.find(n => n.id === nodeId);
          setExecutionLogs(prev => [...prev, {
            timestamp: new Date().toISOString(),
            message: `Completed node: ${node?.data.label || nodeId}`,
            level: 'info',
            nodeId
          }]);
        },
        onNodeError: (nodeId, error) => {
          completedNodes++;
          setProgress((completedNodes / totalNodes) * 100);
          
          const node = workflow.nodes.find(n => n.id === nodeId);
          setExecutionLogs(prev => [...prev, {
            timestamp: new Date().toISOString(),
            message: `Error in node ${node?.data.label || nodeId}: ${error}`,
            level: 'error',
            nodeId
          }]);
        },
        onLogUpdate: (log) => {
          setExecutionLogs(prev => [...prev, {
            timestamp: new Date().toISOString(),
            message: log,
            level: 'info'
          }]);
        },
        onWorkflowComplete: (result) => {
          setExecutionResult(result);
          setCurrentNodeId(null);
          setProgress(100);
          
          // Save to history
          saveExecutionToHistory(result);
          
          if (onExecutionComplete) {
            onExecutionComplete(result);
          }
        }
      });
    } catch (error) {
      const errorResult: WorkflowExecutionResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: `${((Date.now() - startTime) / 1000).toFixed(2)}s`
      };
      
      setExecutionResult(errorResult);
      saveExecutionToHistory(errorResult);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStopExecution = () => {
    workflowExecutionService.stopExecution();
    setIsExecuting(false);
    setCurrentNodeId(null);
  };

  const exportExecutionResult = () => {
    if (!executionResult) return;
    
    const exportData = {
      workflow: {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description
      },
      execution: executionResult,
      logs: executionLogs,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `workflow-execution-${workflow.id}-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getStatusIcon = (success?: boolean) => {
    if (success === undefined) return <Clock className="h-4 w-4" />;
    return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (success?: boolean) => {
    if (success === undefined) return <Badge variant="secondary">Pending</Badge>;
    return success ? 
      <Badge variant="default" className="bg-green-500">Success</Badge> : 
      <Badge variant="destructive">Failed</Badge>;
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Workflow Execution
              </CardTitle>
              <CardDescription>
                Execute and monitor the workflow: {workflow.name}
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              {executionResult && (
                <Button variant="outline" size="sm" onClick={exportExecutionResult}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
              
              {isExecuting ? (
                <Button variant="outline" size="sm" onClick={handleStopExecution}>
                  <StopCircle className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button onClick={handleExecuteWorkflow} disabled={workflow.nodes.length === 0}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Execute
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="execution" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="execution">Current Execution</TabsTrigger>
              <TabsTrigger value="logs">Execution Logs</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="execution" className="space-y-4">
              {/* Progress and Status */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {isExecuting ? 'Executing...' : 'Ready to execute'}
                  </span>
                  {executionResult && getStatusBadge(executionResult.success)}
                </div>
                
                {isExecuting && (
                  <>
                    <Progress value={progress} className="w-full" />
                    <div className="text-xs text-muted-foreground">
                      {currentNodeId && `Current: ${workflow.nodes.find(n => n.id === currentNodeId)?.data.label || currentNodeId}`}
                    </div>
                  </>
                )}
              </div>
              
              {/* Current Execution Result */}
              {executionResult && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(executionResult.success)}
                      <CardTitle className="text-lg">
                        Execution {executionResult.success ? 'Completed' : 'Failed'}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <div className="font-medium">{executionResult.executionTime}</div>
                      </div>
                      
                      {executionResult.stats && (
                        <>
                          <div>
                            <span className="text-muted-foreground">Nodes:</span>
                            <div className="font-medium">
                              {executionResult.stats.successfulNodes}/{executionResult.stats.nodesExecuted}
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground">Errors:</span>
                            <div className="font-medium">{executionResult.stats.errorsEncountered}</div>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground">Total Time:</span>
                            <div className="font-medium">
                              {(executionResult.stats.totalExecutionTime / 1000).toFixed(2)}s
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {executionResult.error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">{executionResult.error}</p>
                      </div>
                    )}
                    
                    {executionResult.output && Object.keys(executionResult.output).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Output:</h4>
                        <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(executionResult.output, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Execution Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    {executionLogs.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        No logs available. Execute the workflow to see logs.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {executionLogs.map((log, index) => (
                          <div key={index} className="flex gap-2 text-sm">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span className={`
                              ${log.level === 'error' ? 'text-red-600' : ''}
                              ${log.level === 'warning' ? 'text-yellow-600' : ''}
                              ${log.level === 'info' ? 'text-foreground' : ''}
                            `}>
                              {log.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Execution History</CardTitle>
                  <CardDescription>
                    Recent executions of this workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {executionHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No execution history available.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {executionHistory.map((execution, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(execution.success)}
                            <div>
                              <div className="font-medium">
                                {execution.success ? 'Successful' : 'Failed'} Execution
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Duration: {execution.executionTime}
                                {execution.stats && ` • ${execution.stats.nodesExecuted} nodes`}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setExecutionResult(execution)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowExecutionPanel;