import React from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KnowledgeBaseManager } from '@/components/knowledge-base/KnowledgeBaseManager';
import { Database, Brain, Search, Book, FileText, Zap } from 'lucide-react';

const DocumentKnowledgeBase = () => {
  const workspaceContext = useWorkspace();
  const activeWorkspaceId = workspaceContext?.activeWorkspaceId || 'default-workspace';
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Database className="h-10 w-10 text-primary" />
          Knowledge Base
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Intelligent document management with AI-powered semantic search and retrieval-augmented generation
        </p>
      </div>
      
      {activeWorkspaceId ? (
        <div className="space-y-6">
          {/* Feature Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">AI-Powered Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic document chunking and semantic embedding generation
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Search className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Semantic Search</h3>
                <p className="text-sm text-muted-foreground">
                  Find relevant information based on meaning, not just keywords
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">RAG Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Enhanced AI responses with contextual knowledge retrieval
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Knowledge Base Manager */}
          <KnowledgeBaseManager workspaceId={activeWorkspaceId} />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              No Workspace Selected
            </CardTitle>
            <CardDescription>
              Please select or create a workspace to access the knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Select a workspace from the sidebar to start managing your knowledge base
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentKnowledgeBase;