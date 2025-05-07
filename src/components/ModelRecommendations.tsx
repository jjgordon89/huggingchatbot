
import React from 'react';
import { Button } from './ui/button';
import { Bot, Sparkles } from 'lucide-react';

interface ModelRecommendation {
  id: string;
  name: string;
  description: string;
}

export function ModelRecommendations() {
  const recommendations: ModelRecommendation[] = [
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Fast and efficient for general tasks'
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      description: 'More capable for complex reasoning'
    }
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Recommended Models</h3>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Sparkles className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-1">
        {recommendations.map((model) => (
          <Button 
            key={model.id}
            variant="ghost" 
            className="w-full justify-start text-left h-auto py-2"
          >
            <div className="flex gap-2 items-center">
              <Bot className="h-3.5 w-3.5 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs font-medium">{model.name}</span>
                <span className="text-xs text-muted-foreground">{model.description}</span>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

// This is a compact version that can be used in the sidebar
export function CompactModelRecommendations() {
  return <ModelRecommendations />;
}
