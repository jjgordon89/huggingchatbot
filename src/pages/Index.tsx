
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Workflow, 
  FileText, 
  Database, 
  BrainCircuit, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { LiquidMetalCard } from '@/components/LiquidMetalCard';
import { LiquidMetalButton } from '@/components/LiquidMetalButton';
import { HolographicOrb } from '@/components/HolographicOrb';
import { HolographicBackground } from '@/components/HolographicBackground';

export default function Index() {
  const { workspaces, activeWorkspaceId } = useWorkspace();
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  
  return (
    <div className="relative min-h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* Holographic background */}
      <HolographicBackground />
      
      <div className="relative z-10 container py-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="relative">
            <div className="absolute -top-2 -left-2">
              <HolographicOrb size="sm" variant="chroma-1" />
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Welcome to AI Platform
            </h1>
            <p className="text-gray-300 text-lg">
              Build and deploy AI workflows with liquid metal precision
            </p>
          </div>
          
          <LiquidMetalButton variant="chroma" size="md" asChild>
            <Link to="/profile">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </LiquidMetalButton>
        </div>
        
        {activeWorkspace && (
          <LiquidMetalCard variant="chroma" className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-3">
                <HolographicOrb size="xs" variant="liquid-cyan" />
                Active Workspace: {activeWorkspace.name}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {activeWorkspace.description || 'No description'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-conic from-purple-600 via-blue-500 to-cyan-400 p-2 rounded-full">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Documents</div>
                    <div className="text-sm text-gray-400">
                      {activeWorkspace.documents?.length || 0} document(s)
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-conic from-cyan-400 via-blue-500 to-purple-600 p-2 rounded-full">
                    <BrainCircuit className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Model</div>
                    <div className="text-sm text-gray-400">
                      {activeWorkspace.llmConfig?.model || "Default model"}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-conic from-pink-500 via-purple-600 to-blue-500 p-2 rounded-full">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Settings</div>
                    <div className="text-sm text-gray-400">
                      {Object.keys(activeWorkspace.settings || {}).length || 0} configuration(s)
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </LiquidMetalCard>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LiquidMetalCard variant="chroma" className="group">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="bg-gradient-conic from-purple-600 via-blue-500 to-cyan-400 p-2 rounded-full group-hover:animate-spin-slow transition-all duration-500">
                  <Workflow className="h-5 w-5 text-white" />
                </div>
                Workflow Builder
              </CardTitle>
              <CardDescription className="text-gray-300">
                Build and deploy AI agent workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Create custom AI workflows with our visual editor. Connect different components to build powerful agent processes.
              </p>
            </CardContent>
            <CardFooter>
              <LiquidMetalButton variant="polarix" size="md" className="w-full" asChild>
                <Link to="/workflow-builder">
                  Open Workflow Builder
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </LiquidMetalButton>
            </CardFooter>
          </LiquidMetalCard>
          
          <LiquidMetalCard variant="polarix" className="group">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="bg-gradient-conic from-cyan-400 via-blue-500 to-teal-400 p-2 rounded-full group-hover:animate-spin-slow transition-all duration-500">
                  <Database className="h-5 w-5 text-white" />
                </div>
                Knowledge Base
              </CardTitle>
              <CardDescription className="text-gray-300">
                Manage your documents and knowledge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Upload and manage documents to create a knowledge base for your AI agents. Enhance your AI with domain-specific information.
              </p>
            </CardContent>
            <CardFooter>
              <LiquidMetalButton variant="chroma" size="md" className="w-full" asChild>
                <Link to="/knowledge-base">
                  Open Knowledge Base
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </LiquidMetalButton>
            </CardFooter>
          </LiquidMetalCard>
          
          <LiquidMetalCard variant="alumix" className="group">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-800">
                <div className="bg-gradient-conic from-gray-300 via-white to-gray-200 p-2 rounded-full group-hover:animate-spin-slow transition-all duration-500">
                  <BrainCircuit className="h-5 w-5 text-gray-800" />
                </div>
                Fine-Tuning
              </CardTitle>
              <CardDescription className="text-gray-600">
                Create and manage fine-tuned models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Fine-tune foundation models on your custom data to improve performance on specific tasks and domains.
              </p>
            </CardContent>
            <CardFooter>
              <LiquidMetalButton variant="alumix" size="md" className="w-full" asChild>
                <Link to="/fine-tuning">
                  Open Fine-Tuning
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </LiquidMetalButton>
            </CardFooter>
          </LiquidMetalCard>
        </div>
      </div>
    </div>
  );
}
