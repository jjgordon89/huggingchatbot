
import { useChat } from '@/context/ChatContext';
import { ChatHeader } from '@/components/ChatHeader';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { ApiKeyForm } from '@/components/ApiKeyForm';

const Index = () => {
  const { isApiKeySet } = useChat();

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
