import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserPreferencesProvider } from '@/context/UserPreferencesContext';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { ChatProvider } from '@/context/ChatContext';
import { WorkflowProvider } from '@/context/WorkflowContext';
import { Layout } from '@/components/Layout';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';

// Import pages
import Index from '@/pages/Index';
import Chat from '@/pages/Chat';
import Profile from '@/pages/Profile';
import Documents from '@/pages/Documents';
import DocumentKnowledgeBase from '@/pages/DocumentKnowledgeBase';
import DocumentSettings from '@/pages/DocumentSettings';
import Templates from '@/pages/Templates';
import FineTuning from '@/pages/FineTuning';
import WorkflowManagement from '@/pages/WorkflowManagement';
import { WorkflowBuilderPage } from '@/pages/WorkflowBuilder';
import NotFound from '@/pages/NotFound';
import FallbackPage from '@/pages/FallbackPage';

const MinimalApp = () => {
  return (
    <UserPreferencesProvider>
      <WorkspaceProvider>
        <ChatProvider>
          <WorkflowProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/knowledge-base" element={<DocumentKnowledgeBase />} />
                  <Route path="/document-settings" element={<DocumentSettings />} />
                  <Route path="/templates" element={<Templates />} />
                  <Route path="/fine-tuning" element={<FineTuning />} />
                  <Route path="/workflows" element={<WorkflowManagement />} />
                  <Route path="/workflow-builder" element={<WorkflowBuilderPage />} />
                  <Route path="/workflow-builder/:id" element={<WorkflowBuilderPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
              
              {/* Global Components */}
              <Toaster />
              <SonnerToaster />
              {/* KeyboardShortcuts already included in Layout component */}
            </Router>
          </WorkflowProvider>
        </ChatProvider>
      </WorkspaceProvider>
    </UserPreferencesProvider>
  );
};

export default MinimalApp;