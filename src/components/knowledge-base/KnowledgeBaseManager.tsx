/**
 * Knowledge Base Manager Component
 * 
 * Comprehensive interface for managing documents and knowledge base operations
 */

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { knowledgeBaseWorkflow, DocumentMetadata, SearchResult } from '@/lib/knowledgeBaseWorkflow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  Upload,
  Search,
  Trash2,
  RefreshCw,
  Download,
  Settings,
  MoreVertical,
  Database,
  Activity,
  TrendingUp,
  Clock,
  FileCheck,
  AlertCircle,
  Bot,
  Eye,
  Copy
} from 'lucide-react';

interface KnowledgeBaseManagerProps {
  workspaceId: string;
}

export const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({ workspaceId }) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [generatedContext, setGeneratedContext] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [autoIndex, setAutoIndex] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    indexedDocuments: 0,
    totalChunks: 0,
    storageSize: 0,
    lastIndexed: undefined as string | undefined
  });

  // Initialize and load documents
  useEffect(() => {
    const initializeWorkspace = async () => {
      try {
        await knowledgeBaseWorkflow.initializeWorkspace(workspaceId);
        loadDocuments();
        updateStats();
      } catch (error) {
        console.error('Error initializing workspace:', error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize knowledge base workspace",
          variant: "destructive",
        });
      }
    };

    initializeWorkspace();
  }, [workspaceId]);

  const loadDocuments = () => {
    const docs = knowledgeBaseWorkflow.listDocuments(workspaceId);
    setDocuments(docs);
  };

  const updateStats = () => {
    const workspaceStats = knowledgeBaseWorkflow.getWorkspaceStats(workspaceId);
    setStats({
      totalDocuments: workspaceStats.totalDocuments,
      indexedDocuments: workspaceStats.indexedDocuments,
      totalChunks: workspaceStats.totalChunks,
      storageSize: workspaceStats.storageSize,
      lastIndexed: workspaceStats.lastIndexed
    });
  };

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(((i + 1) / files.length) * 100);

        try {
          const result = await knowledgeBaseWorkflow.processDocument(workspaceId, file, {
            autoIndex,
            chunkSize: 1000,
            chunkOverlap: 200
          });

          if (result.success) {
            successCount++;
          } else {
            toast({
              title: "Processing Error",
              description: `Failed to process ${file.name}: ${result.error}`,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          toast({
            title: "Upload Error",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
        }
      }

      if (successCount > 0) {
        toast({
          title: "Documents Uploaded",
          description: `Successfully processed ${successCount} document(s)`,
        });
        loadDocuments();
        updateStats();
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  // Search documents
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await knowledgeBaseWorkflow.searchDocuments(workspaceId, searchQuery, {
        limit: 10,
        threshold: 0.6,
        includeContent: true
      });

      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No Results",
          description: "No documents found matching your search query",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search documents",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Generate AI context
  const handleGenerateContext = async () => {
    if (searchResults.length === 0) return;

    try {
      const context = await knowledgeBaseWorkflow.generateContext(
        workspaceId,
        searchQuery,
        searchResults
      );
      setGeneratedContext(context);
      
      toast({
        title: "Context Generated",
        description: "AI context generated from search results",
      });
    } catch (error) {
      console.error('Context generation error:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate AI context",
        variant: "destructive",
      });
    }
  };

  // Delete document
  const handleDeleteDocument = async (documentId: string, filename: string) => {
    try {
      const success = await knowledgeBaseWorkflow.deleteDocument(workspaceId, documentId);
      
      if (success) {
        toast({
          title: "Document Deleted",
          description: `${filename} has been removed from the knowledge base`,
        });
        loadDocuments();
        updateStats();
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  // Reindex workspace
  const handleReindex = async () => {
    try {
      await knowledgeBaseWorkflow.reindexWorkspace(workspaceId);
      
      toast({
        title: "Reindexing Complete",
        description: "All documents have been reindexed successfully",
      });
      loadDocuments();
      updateStats();
    } catch (error) {
      console.error('Reindex error:', error);
      toast({
        title: "Reindex Error",
        description: "Failed to reindex workspace",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      indexed: { color: 'bg-green-100 text-green-800', icon: FileCheck },
      error: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Documents</p>
                <p className="text-2xl font-bold">{stats.totalDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Indexed</p>
                <p className="text-2xl font-bold">{stats.indexedDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Chunks</p>
                <p className="text-2xl font-bold">{stats.totalChunks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Storage</p>
                <p className="text-2xl font-bold">{formatFileSize(stats.storageSize)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Document Management
                  </CardTitle>
                  <CardDescription>
                    Upload and manage your knowledge base documents
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="auto-index"
                      checked={autoIndex}
                      onCheckedChange={setAutoIndex}
                    />
                    <Label htmlFor="auto-index" className="text-sm">Auto-index</Label>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReindex}
                    disabled={documents.length === 0}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reindex All
                  </Button>
                  
                  <div className="relative">
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <Button disabled={isUploading}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {isUploading && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Uploading and processing...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              <ScrollArea className="h-[400px]">
                {documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{doc.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{formatFileSize(doc.size)}</span>
                              <span>•</span>
                              <span>{doc.type}</span>
                              {doc.chunkCount && (
                                <>
                                  <span>•</span>
                                  <span>{doc.chunkCount} chunks</span>
                                </>
                              )}
                            </div>
                          </div>
                          {getStatusBadge(doc.status)}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedDocument(doc)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteDocument(doc.id, doc.filename)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No documents yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload documents to start building your knowledge base
                    </p>
                    <div className="relative">
                      <Input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Documents
                      </Button>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Semantic Search
              </CardTitle>
              <CardDescription>
                Search your knowledge base using AI-powered semantic understanding
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a question or search for information..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                  {isSearching ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Search Results ({searchResults.length})</h3>
                    <Button onClick={handleGenerateContext} variant="outline" size="sm">
                      <Bot className="h-4 w-4 mr-2" />
                      Generate Context
                    </Button>
                  </div>

                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {searchResults.map((result, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{result.metadata.title}</span>
                            </div>
                            <Badge variant="outline">
                              {Math.round(result.similarity * 100)}% match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {result.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {generatedContext && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      Generated Context
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(generatedContext)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <Textarea
                      value={generatedContext}
                      readOnly
                      className="min-h-[200px] bg-transparent border-0 resize-none"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Knowledge Base Settings
              </CardTitle>
              <CardDescription>
                Configure document processing and search parameters
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Document Processing</Label>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-indexing</p>
                    <p className="text-xs text-muted-foreground">
                      Automatically process and index uploaded documents
                    </p>
                  </div>
                  <Switch checked={autoIndex} onCheckedChange={setAutoIndex} />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Search Settings</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Similarity Threshold</Label>
                    <Input type="number" defaultValue="0.7" min="0" max="1" step="0.1" />
                  </div>
                  <div>
                    <Label className="text-sm">Max Results</Label>
                    <Input type="number" defaultValue="10" min="1" max="50" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Chunking Parameters</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Chunk Size</Label>
                    <Input type="number" defaultValue="1000" min="100" max="2000" />
                  </div>
                  <div>
                    <Label className="text-sm">Chunk Overlap</Label>
                    <Input type="number" defaultValue="200" min="0" max="500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Details Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>
              {selectedDocument?.filename}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedDocument.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">File Size</Label>
                  <p className="text-sm mt-1">{formatFileSize(selectedDocument.size)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm mt-1">{selectedDocument.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Chunks</Label>
                  <p className="text-sm mt-1">{selectedDocument.chunkCount || 0}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Uploaded</Label>
                <p className="text-sm mt-1">
                  {new Date(selectedDocument.uploadedAt).toLocaleString()}
                </p>
              </div>
              
              {selectedDocument.processedAt && (
                <div>
                  <Label className="text-sm font-medium">Processed</Label>
                  <p className="text-sm mt-1">
                    {new Date(selectedDocument.processedAt).toLocaleString()}
                  </p>
                </div>
              )}
              
              {selectedDocument.errorMessage && (
                <div>
                  <Label className="text-sm font-medium text-destructive">Error</Label>
                  <p className="text-sm mt-1 text-destructive">{selectedDocument.errorMessage}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeBaseManager;