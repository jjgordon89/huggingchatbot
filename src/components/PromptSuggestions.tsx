
import React from 'react';
import { Button } from './ui/button';
import { MessageSquarePlus } from 'lucide-react';

interface PromptSuggestion {
  id: string;
  text: string;
  category: string;
}

export function PromptSuggestions() {
  const suggestions: PromptSuggestion[] = [
    {
      id: '1',
      text: 'Explain this code',
      category: 'coding'
    },
    {
      id: '2',
      text: 'Generate a task list',
      category: 'productivity'
    },
    {
      id: '3',
      text: 'Summarize this document',
      category: 'writing'
    }
  ];
  
  const handleSuggestionClick = (suggestion: PromptSuggestion) => {
    console.log('Using suggestion:', suggestion.text);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Prompt Suggestions</h3>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MessageSquarePlus className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-1">
        {suggestions.map((suggestion) => (
          <Button 
            key={suggestion.id}
            variant="ghost" 
            className="w-full justify-start text-left h-auto py-2"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <div className="flex gap-2 items-center">
              <MessageSquarePlus className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs">{suggestion.text}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

// This is a compact version that can be used in the sidebar
export function CompactPromptSuggestions() {
  return <PromptSuggestions />;
}
