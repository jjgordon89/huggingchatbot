
import React, { useEffect } from 'react';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { useSqlite } from '@/hooks/use-sqlite';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function Chat() {
  const { isInitialized } = useSqlite();
  const { activeWorkspaceId } = useWorkspace();

  useEffect(() => {
    if (isInitialized && activeWorkspaceId) {
      console.log("Chat component ready with workspace:", activeWorkspaceId);
    }
  }, [isInitialized, activeWorkspaceId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden relative">
        <ChatMessages />
      </div>
      
      <div className="w-full mt-auto">
        <ChatInput />
      </div>
    </div>
  );
}
