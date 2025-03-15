
import { useChat } from '@/context/ChatContext';
import { ChatHeader } from '@/components/ChatHeader';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { ApiKeyForm } from '@/components/ApiKeyForm';
import { BraveApiKeyForm } from '@/components/BraveApiKeyForm';
import { isBraveApiKeySet } from '@/lib/webSearchService';

const Index = () => {
  const { isApiKeySet, webSearchEnabled, activeThreadId, ragEnabled } = useChat();

  // Check if web search is enabled but no Brave API key is set
  const needsBraveApiKey = webSearchEnabled && !isBraveApiKeySet();

  if (!isApiKeySet) {
    return (
      <div className="min-h-screen flex flex-col">
        <ChatHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <ApiKeyForm />
          </div>
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
          {activeThreadId ? (
            <ChatMessages />
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                <div className="h-full flex flex-col items-center justify-center p-4">
                  <div className="w-full max-w-md text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">AI Assistant</h1>
                    <p className="text-gray-600 mb-6">
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
