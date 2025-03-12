
import React, { useState } from 'react';
import { Database, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RagSourcesProps {
  sources: string[];
}

export function RagSources({ sources }: RagSourcesProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!sources || sources.length === 0) return null;
  
  return (
    <div className="mt-2 text-xs">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Database className="h-3 w-3 mr-1" />
        <span>{sources.length} knowledge source{sources.length !== 1 ? 's' : ''}</span>
        {isOpen ? (
          <ChevronUp className="h-3 w-3 ml-1" />
        ) : (
          <ChevronDown className="h-3 w-3 ml-1" />
        )}
      </Button>
      
      {isOpen && (
        <div className={cn(
          "mt-1 p-2 bg-muted/50 rounded-md",
          "animate-in fade-in-50 slide-in-from-top-2 duration-150"
        )}>
          <h4 className="font-medium mb-1">Sources:</h4>
          <ul className="space-y-1">
            {sources.map((source, index) => (
              <li key={index} className="flex items-start gap-1">
                <Badge variant="outline" className="h-5 px-1.5">
                  {index + 1}
                </Badge>
                <span>{source}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
