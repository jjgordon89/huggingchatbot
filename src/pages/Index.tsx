
import { useChat } from '@/context/ChatContext';
import { ChatHeader } from '@/components/ChatHeader';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { ApiKeyForm } from '@/components/ApiKeyForm';
import { BraveApiKeyForm } from '@/components/BraveApiKeyForm';
import { AdvancedRagSettings } from '@/components/AdvancedRagSettings';
import { isBraveApiKeySet } from '@/lib/webSearchService';
import { Button } from '@/components/ui/button';
import { Sliders } from 'lucide-react';

const Index = () => {
  const { isApiKeySet, webSearchEnabled, activeThreadId, ragEnabled } = useChat();

  // Check if web search is enabled but no Brave API key is set
  const needsBraveApiKey = webSearchEnabled && !isBraveApiKeySet();

  if (!isApiKeySet) {
    return (
      <div className="min-h-screen flex flex-col">
        <ChatHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <ApiKeyForm />
        </div>
      </div>
    );
  }

  if (needsBraveApiKey) {
    return (
      <div className="min-h-screen flex flex-col">
        <ChatHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Brave Search API Key Required</h2>
            <p className="mb-4 text-gray-600">
              You've enabled web search, but we need a Brave Search API key to continue.
            </p>
            <BraveApiKeyForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ChatHeader />
      <div className="flex-1 flex flex-col md:ml-72 relative">
        <ChatSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatMessages />
          <ChatInput />
        </div>
      </div>

      {/* Helper floating button for mobile to access advanced RAG settings */}
      {(ragEnabled || webSearchEnabled) && !activeThreadId && (
        <div className="md:hidden fixed bottom-20 right-4 z-50">
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg" 
            onClick={() => {
              // This button will trigger the advanced RAG settings dialog
              // Implementation would require adding state in ChatHeader and making it accessible
              const settingsButton = document.querySelector('button[aria-label="Knowledge Settings"]') as HTMLButtonElement;
              if (settingsButton) {
                settingsButton.click();
              }
            }}
          >
            <Sliders className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
