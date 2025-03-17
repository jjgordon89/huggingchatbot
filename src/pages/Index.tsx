
import { useChat } from '@/context/ChatContext';
import { ChatHeader } from '@/components/ChatHeader';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { ApiKeyForm } from '@/components/ApiKeyForm';
import { BraveApiKeyForm } from '@/components/BraveApiKeyForm';
import { isBraveApiKeySet } from '@/lib/webSearchService';
import { Circuit, Zap } from 'lucide-react';

const Index = () => {
  const { isApiKeySet, webSearchEnabled, activeThreadId, ragEnabled } = useChat();

  // Check if web search is enabled but no Brave API key is set
  const needsBraveApiKey = webSearchEnabled && !isBraveApiKeySet();

  if (!isApiKeySet) {
    return (
      <div className="min-h-screen flex flex-col bg-cyber-dark">
        <ChatHeader />
        <div 
          className="flex-1 flex items-center justify-center p-4" 
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)'
          }}
        >
          <div className="w-full max-w-md cyber-card p-6 rounded-lg">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-cyber-primary/10 flex items-center justify-center">
                <Zap className="h-8 w-8 text-cyber-primary" />
              </div>
            </div>
            <ApiKeyForm />
          </div>
        </div>
      </div>
    );
  }

  if (needsBraveApiKey) {
    return (
      <div className="min-h-screen flex flex-col bg-cyber-dark">
        <ChatHeader />
        <div 
          className="flex-1 flex items-center justify-center p-4"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)'
          }}
        >
          <div className="w-full max-w-md cyber-card p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-cyber-primary">Brave Search API Key Required</h2>
            <p className="mb-4 text-muted-foreground">
              You've enabled web search, but we need a Brave Search API key to continue.
            </p>
            <BraveApiKeyForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cyber-dark">
      <ChatHeader />
      <div className="flex-1 flex flex-col md:ml-72 relative">
        <ChatSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeThreadId ? (
            <ChatMessages />
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                <div 
                  className="h-full flex flex-col items-center justify-center p-4"
                  style={{
                    backgroundSize: '40px 40px',
                    backgroundImage: 'linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="w-full max-w-md text-center mb-8">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-cyber-primary/10 flex items-center justify-center">
                        <Zap className="h-8 w-8 text-cyber-primary" />
                      </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 neon-text">ALFRED AI</h1>
                    <p className="text-muted-foreground mb-6">
                      Ask me anything or upload documents for advanced assistance
                    </p>
                  </div>
                </div>
              </div>
              <ChatMessages />
            </>
          )}
          <ChatInput />
        </div>
      </div>
    </div>
  );
};

export default Index;
