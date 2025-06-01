
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  HardDrive, 
  Activity, 
  Clock,
  FileText,
  Search,
  Zap,
  Settings,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface VectorDbStats {
  totalDocuments: number;
  totalVectors: number;
  indexSize: string;
  queryLatency: number;
  lastUpdated: Date;
  status: 'healthy' | 'warning' | 'error';
  memoryUsage: string;
  diskUsage: string;
}

const VectorDbStats = () => {
  const [stats, setStats] = useState<VectorDbStats>({
    totalDocuments: 0,
    totalVectors: 0,
    indexSize: '0 MB',
    queryLatency: 0,
    lastUpdated: new Date(),
    status: 'healthy',
    memoryUsage: '0 MB',
    diskUsage: '0 MB'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual vector DB stats
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalDocuments: 1247,
        totalVectors: 4988,
        indexSize: '45.2 MB',
        queryLatency: 23,
        lastUpdated: new Date(),
        status: 'healthy',
        memoryUsage: '128 MB',
        diskUsage: '256 MB'
      });
    } catch (error) {
      toast({
        title: "Error loading stats",
        description: "Failed to load vector database statistics",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearDatabase = async () => {
    setIsLoading(true);
    try {
      // Simulate clearing database
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStats(prev => ({
        ...prev,
        totalDocuments: 0,
        totalVectors: 0,
        indexSize: '0 MB',
        lastUpdated: new Date()
      }));
      
      toast({
        title: "Database cleared",
        description: "All vectors have been removed from the database"
      });
    } catch (error) {
      toast({
        title: "Error clearing database",
        description: "Failed to clear vector database",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reindexDatabase = async () => {
    setIsLoading(true);
    try {
      // Simulate reindexing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Reindexing complete",
        description: "Vector database has been successfully reindexed"
      });
      
      await loadStats();
    } catch (error) {
      toast({
        title: "Error reindexing",
        description: "Failed to reindex vector database",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getStatusIcon = () => {
    switch (stats.status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusColor = () => {
    switch (stats.status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Vector Database Statistics
          </CardTitle>
          <CardDescription>
            Monitor your vector database performance and usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalDocuments.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <FileText className="h-3 w-3" />
                Documents
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalVectors.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Zap className="h-3 w-3" />
                Vectors
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.queryLatency}ms</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Activity className="h-3 w-3" />
                Avg Latency
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.indexSize}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <HardDrive className="h-3 w-3" />
                Index Size
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">Database Status</span>
                {getStatusIcon()}
              </div>
              <Badge className={getStatusColor()}>
                {stats.status.charAt(0).toUpperCase() + stats.status.slice(1)}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Memory Usage</span>
              <span className="text-muted-foreground">{stats.memoryUsage}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Disk Usage</span>
              <span className="text-muted-foreground">{stats.diskUsage}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Last Updated</span>
              </div>
              <span className="text-muted-foreground">
                {stats.lastUpdated.toLocaleString()}
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={loadStats} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Stats
            </Button>
            
            <Button 
              onClick={reindexDatabase} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Reindex Database
            </Button>
            
            <Button 
              onClick={clearDatabase} 
              disabled={isLoading}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Database
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VectorDbStats;
