import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Eye,
  Settings,
  BarChart3,
  Zap,
  Server,
  Activity
} from 'lucide-react';
import { FineTuningJob, FineTunedModel } from '@/lib/fineTuningService';
import { workflowExecutionService } from '@/lib/workflowExecutionService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface FineTuningMonitorProps {
  job: FineTuningJob;
  onJobUpdate?: (job: FineTuningJob) => void;
  className?: string;
}

interface TrainingMetrics {
  epoch: number;
  step: number;
  trainingLoss: number;
  validationLoss?: number;
  learningRate: number;
  accuracy?: number;
  timestamp: string;
}

export const FineTuningMonitor: React.FC<FineTuningMonitorProps> = ({
  job,
  onJobUpdate,
  className
}) => {
  const [realTimeMetrics, setRealTimeMetrics] = useState<TrainingMetrics[]>([]);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string>('');
  const [resourceUsage, setResourceUsage] = useState({
    gpu: 0,
    memory: 0,
    cpu: 0
  });

  // Simulate real-time metrics for running jobs
  useEffect(() => {
    if (job.status !== 'running') return;

    const interval = setInterval(() => {
      const newMetric: TrainingMetrics = {
        epoch: Math.floor(job.progress / (100 / job.hyperparams.epochs)),
        step: Math.floor(Math.random() * 1000),
        trainingLoss: Math.max(0.1, 2.0 - (job.progress / 100) * 1.5 + (Math.random() - 0.5) * 0.1),
        validationLoss: Math.max(0.15, 2.2 - (job.progress / 100) * 1.3 + (Math.random() - 0.5) * 0.15),
        learningRate: job.hyperparams.learningRate * Math.pow(0.95, Math.floor(job.progress / 10)),
        accuracy: Math.min(0.95, 0.3 + (job.progress / 100) * 0.6 + (Math.random() - 0.5) * 0.05),
        timestamp: new Date().toISOString()
      };

      setRealTimeMetrics(prev => [...prev.slice(-50), newMetric]);
      setCurrentEpoch(newMetric.epoch);

      // Update resource usage
      setResourceUsage({
        gpu: 70 + Math.random() * 20,
        memory: 60 + Math.random() * 25,
        cpu: 30 + Math.random() * 40
      });

      // Estimate time remaining
      const progressRate = job.progress / ((Date.now() - new Date(job.createdAt).getTime()) / 1000 / 60);
      const remainingMinutes = (100 - job.progress) / progressRate;
      
      if (remainingMinutes > 60) {
        setEstimatedTimeRemaining(`${Math.floor(remainingMinutes / 60)}h ${Math.floor(remainingMinutes % 60)}m`);
      } else {
        setEstimatedTimeRemaining(`${Math.floor(remainingMinutes)}m`);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [job.status, job.progress, job.createdAt, job.hyperparams.epochs, job.hyperparams.learningRate]);

  const getStatusIcon = () => {
    switch (job.status) {
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'succeeded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <Pause className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'running':
        return 'bg-blue-500';
      case 'succeeded':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const handlePauseResume = () => {
    // In real implementation, this would call the API to pause/resume training
    console.log('Pause/Resume training');
  };

  const handleStop = () => {
    // In real implementation, this would call the API to stop training
    console.log('Stop training');
    if (onJobUpdate) {
      onJobUpdate({ ...job, status: 'stopping' });
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    const duration = (end ? end.getTime() : Date.now()) - start.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${getStatusColor()}/10`}>
                <Brain className={`h-5 w-5 ${getStatusColor().replace('bg-', 'text-')}`} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon()}
                  {job.name}
                </CardTitle>
                <CardDescription>
                  Fine-tuning {job.baseModelId} • {job.status}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex gap-2">
              {job.status === 'running' && (
                <>
                  <Button variant="outline" size="sm" onClick={handlePauseResume}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleStop}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </>
              )}
              
              {job.status === 'succeeded' && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Progress Section */}
              {(job.status === 'running' || job.status === 'preparing') && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Training Progress</span>
                    <span className="text-sm text-muted-foreground">{Math.round(job.progress)}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Epoch {currentEpoch} of {job.hyperparams.epochs}</span>
                    {estimatedTimeRemaining && <span>~{estimatedTimeRemaining} remaining</span>}
                  </div>
                </div>
              )}

              {/* Status Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-medium capitalize">{job.status}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-medium">
                    {formatDuration(job.createdAt, job.finishedAt)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Dataset Size</div>
                  <div className="font-medium">{job.dataset.samples.toLocaleString()} samples</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Model Size</div>
                  <div className="font-medium">
                    {job.fineTunedModel?.size ? `${job.fineTunedModel.size}MB` : 'TBD'}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Configuration Summary */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuration
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Learning Rate:</span>
                    <div className="font-mono">{job.hyperparams.learningRate}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Batch Size:</span>
                    <div>{job.hyperparams.batchSize}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Epochs:</span>
                    <div>{job.hyperparams.epochs}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Length:</span>
                    <div>{job.hyperparams.maxSequenceLength}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">PEFT:</span>
                    <div>{job.hyperparams.usePeft ? 'Enabled' : 'Disabled'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dataset Type:</span>
                    <div className="capitalize">{job.dataset.config.type}</div>
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              {job.status === 'succeeded' && job.metrics && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Final Results
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {job.metrics.accuracy && (
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {(job.metrics.accuracy * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Accuracy</div>
                        </div>
                      )}
                      {job.metrics.perplexity && (
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold">
                            {job.metrics.perplexity.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">Perplexity</div>
                        </div>
                      )}
                      {job.metrics.trainingLoss && (
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold">
                            {job.metrics.trainingLoss.toFixed(4)}
                          </div>
                          <div className="text-xs text-muted-foreground">Final Loss</div>
                        </div>
                      )}
                      {job.metrics.validationLoss && (
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-2xl font-bold">
                            {job.metrics.validationLoss.toFixed(4)}
                          </div>
                          <div className="text-xs text-muted-foreground">Val Loss</div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              {realTimeMetrics.length > 0 ? (
                <div className="space-y-6">
                  {/* Training Loss Chart */}
                  <div>
                    <h4 className="font-medium mb-3">Training Loss</h4>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={realTimeMetrics}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="step" 
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="trainingLoss" 
                            stroke="#8884d8" 
                            strokeWidth={2}
                            name="Training Loss"
                          />
                          {realTimeMetrics.some(m => m.validationLoss) && (
                            <Line 
                              type="monotone" 
                              dataKey="validationLoss" 
                              stroke="#82ca9d" 
                              strokeWidth={2}
                              name="Validation Loss"
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Accuracy Chart */}
                  {realTimeMetrics.some(m => m.accuracy) && (
                    <div>
                      <h4 className="font-medium mb-3">Accuracy</h4>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={realTimeMetrics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="step" 
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis tick={{ fontSize: 12 }} domain={[0, 1]} />
                            <Tooltip formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Accuracy']} />
                            <Area 
                              type="monotone" 
                              dataKey="accuracy" 
                              stroke="#ffc658" 
                              fill="#ffc658"
                              fillOpacity={0.3}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No metrics available yet</p>
                  <p className="text-sm">Metrics will appear when training starts</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              {job.status === 'running' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          GPU Usage
                        </span>
                        <span className="text-sm text-muted-foreground">{resourceUsage.gpu.toFixed(1)}%</span>
                      </div>
                      <Progress value={resourceUsage.gpu} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          Memory
                        </span>
                        <span className="text-sm text-muted-foreground">{resourceUsage.memory.toFixed(1)}%</span>
                      </div>
                      <Progress value={resourceUsage.memory} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          CPU
                        </span>
                        <span className="text-sm text-muted-foreground">{resourceUsage.cpu.toFixed(1)}%</span>
                      </div>
                      <Progress value={resourceUsage.cpu} className="h-2" />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Instance Type:</span>
                      <div className="font-medium">GPU-V100</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">GPU Memory:</span>
                      <div className="font-medium">16GB</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CPU Cores:</span>
                      <div className="font-medium">8</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">RAM:</span>
                      <div className="font-medium">32GB</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Server className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Resource monitoring unavailable</p>
                  <p className="text-sm">Resources are only monitored during training</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <ScrollArea className="h-[400px] w-full border rounded-lg p-4">
                <div className="space-y-2 font-mono text-xs">
                  {job.status === 'running' ? (
                    realTimeMetrics.slice(-10).map((metric, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-muted-foreground">
                          {new Date(metric.timestamp).toLocaleTimeString()}
                        </span>
                        <span>
                          Epoch {metric.epoch} Step {metric.step}: loss={metric.trainingLoss.toFixed(4)}
                          {metric.accuracy && ` acc=${(metric.accuracy * 100).toFixed(1)}%`}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No logs available</p>
                      <p className="text-sm">Training logs will appear here during execution</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FineTuningMonitor;