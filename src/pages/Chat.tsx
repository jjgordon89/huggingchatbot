import React from 'react';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';

export default function Chat() {
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