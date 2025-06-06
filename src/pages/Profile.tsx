
import React, { useState } from 'react';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { WorkspaceSettings } from '@/components/WorkspaceSettings';
import { WebSearchApiSettings } from '@/components/WebSearchApiSettings';
import { ApiKeySettings } from '@/components/ApiKeySettings';
import {
  User,
  Shield,
  Globe,
  Key,
  Settings2,
  BookOpen,
  Save,
  FolderOpen,
  Keyboard,
  BrainCircuit,
  FileText
} from 'lucide-react';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import ResetSettingsDialog from '@/components/ResetSettingsDialog';
import { useAppSettings } from '@/context/AppSettingsContext';
import { useAuth } from '@/context/AuthContext';
import DummyLogin from '@/components/DummyLogin';
import { DummyRegister } from '@/components/DummyRegister';
import { DummyEditProfile } from '@/components/DummyEditProfile';
import VectorDbStats from '@/components/VectorDbStats';

export default function Profile() {
  const { workspaces, activeWorkspaceId } = useWorkspace();
  const [activeTab, setActiveTab] = useState('account');
  const { toast } = useToast();
  
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const { theme, setTheme, density, setDensity, resetSettings } = useAppSettings();
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleEditProfileSave = (updatedUser: any) => {
    // Here you would update the user in your auth context
    setShowEditProfile(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };
  
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Settings & Profile</h1>
      <p className="text-muted-foreground mb-8">Manage your account, API keys, and preferences</p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-7 w-full max-w-4xl mb-8">
          <TabsTrigger value="account" className="flex items-center gap-2 overflow-hidden">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="workspace" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Workspace</span>
          </TabsTrigger>
          <TabsTrigger value="keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">API Keys</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Web Search</span>
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            <span className="hidden sm:inline">Models</span>
          </TabsTrigger>
          <TabsTrigger value="vector-db" className="flex items-center gap-2 overflow-hidden">
            <BrainCircuit className="h-4 w-4" />
            <span className="hidden sm:inline">Vector DB</span>
          </TabsTrigger>
          <TabsTrigger value="shortcuts" className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            <span className="hidden sm:inline">Shortcuts</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-6">
          {user ? (
            <div className="space-y-6">
              {showEditProfile ? (
                <DummyEditProfile user={user} onSave={handleEditProfileSave} />
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>Your profile details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border-b pb-4">
                          <h3 className="font-medium mb-1">ID</h3>
                          <p className="text-sm text-muted-foreground">{user.id}</p>
                        </div>
                        <div className="border-b pb-4">
                          <h3 className="font-medium mb-1">Name</h3>
                          <p className="text-sm text-muted-foreground">{user.name}</p>
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">Email</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowEditProfile(true)} className="mt-4">
                          Edit Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Application Settings</CardTitle>
                      <CardDescription>
                        Configure global application settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-4">
                          <div>
                            <h3 className="font-medium">App Theme</h3>
                            <p className="text-sm text-muted-foreground">Select the default color scheme</p>
                          </div>
                          <div>
                            <select
                              className="p-2 border rounded-md"
                              value={theme}
                              onChange={(e) => setTheme(e.target.value as 'system' | 'light' | 'dark')}
                            >
                              <option value="system">System Default</option>
                              <option value="light">Light Mode</option>
                              <option value="dark">Dark Mode</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-b pb-4">
                          <div>
                            <h3 className="font-medium">Interface Density</h3>
                            <p className="text-sm text-muted-foreground">Choose compact or comfortable view</p>
                          </div>
                          <div>
                            <select
                              className="p-2 border rounded-md"
                              value={density}
                              onChange={(e) => setDensity(e.target.value as 'default' | 'compact' | 'comfortable')}
                            >
                              <option value="default">Default</option>
                              <option value="compact">Compact</option>
                              <option value="comfortable">Comfortable</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">Reset All Settings</h3>
                            <p className="text-sm text-muted-foreground">Restore all application settings to defaults</p>
                          </div>
                          <ResetSettingsDialog onConfirm={resetSettings}>
                            <Button variant="destructive" size="sm">Reset</Button>
                          </ResetSettingsDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
              <Button variant="outline" onClick={logout} className="w-fit mt-6">Logout</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              {showLogin ? <DummyLogin /> : <DummyRegister />}
              <Button variant="link" onClick={() => setShowLogin(!showLogin)} className="mt-4">
                {showLogin ? 'Need an account? Register' : 'Already have an account? Login'}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="workspace" className="space-y-6">
          {activeWorkspace ? (
            <WorkspaceSettings workspaceId={activeWorkspace.id} />
          ) : (
            <Card>
              <CardContent>
                <div className="py-6 text-center text-muted-foreground">
                  No active workspace selected. Please select a workspace to edit its settings.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global API Keys</CardTitle>
              <CardDescription>
                Configure API keys for AI model providers globally. These will be used when workspace-specific keys are not set.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeySettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Settings</CardTitle>
              <CardDescription>
                Configure document processing, storage, and vector database settings for RAG capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2">Document Management</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure how documents are processed, chunked, and stored in the vector database for retrieval-augmented generation (RAG).
                  </p>
                  <Button asChild>
                    <a href="/document-settings">Manage Document Settings</a>
                  </Button>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2">Document Knowledge Base</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload, organize, and manage documents in your knowledge base to enhance AI responses with relevant information.
                  </p>
                  <Button variant="outline" asChild>
                    <a href="/knowledge-base">Open Knowledge Base</a>
                  </Button>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Vector Database</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Monitor and manage your vector database performance, indexes, and usage statistics.
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab('vector-db')}>
                    Manage Vector Database
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Web Search Settings</CardTitle>
              <CardDescription>
                Configure global web search settings. These will be used when workspace-specific settings are not set.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WebSearchApiSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vector-db" className="space-y-6">
          <VectorDbStats />
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Settings</CardTitle>
              <CardDescription>
                Configure global model settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-6 text-center text-muted-foreground">
                Global model settings will be available soon.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shortcuts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
              <CardDescription>
                View and customize keyboard shortcuts for common actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KeyboardShortcuts inline={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
