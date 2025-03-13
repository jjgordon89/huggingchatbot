
import { useChat } from '@/context/ChatContext';
import { ChatHeader } from '@/components/ChatHeader';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { ApiKeyForm } from '@/components/ApiKeyForm';
import { BraveApiKeyForm } from '@/components/BraveApiKeyForm';
import { isBraveApiKeySet } from '@/lib/webSearchService';

const Index = () => {
  const { isApiKeySet, webSearchEnabled, activeThreadId } = useChat();

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
    </div>
  );
};

export default Index;
