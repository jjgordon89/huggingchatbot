
import { ChevronDown, ChevronUp, BookOpen, FileType } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

export function RagSources({ sources }: { sources: string[] }) {
  const [expanded, setExpanded] = useState(false);
  
  const renderSourceIcon = (source: string) => {
    // Extract document type from source string
    if (source.includes('pdf') || source.includes('PDF')) return 'PDF';
    if (source.includes('csv') || source.includes('CSV')) return 'CSV';
    if (source.includes('excel') || source.includes('xls') || source.includes('XLS')) return 'XLS';
    if (source.includes('markdown') || source.includes('md')) return 'MD';
    if (source.includes('json')) return '{}';
    if (source.includes('html')) return 'HTML';
    if (source.includes('code')) return '</>';
    return 'TXT';
  };

  return (
    <div className="mt-2 text-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-primary hover:underline"
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span>{sources.length} source{sources.length !== 1 ? 's' : ''}</span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>
      
      {expanded && (
        <div className="mt-2 space-y-1 pl-4 border-l-2 border-muted">
          {sources.map((source, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Badge variant="outline" className="h-5 px-1.5 font-mono text-xs">
                {renderSourceIcon(source)}
              </Badge>
              <span className="text-muted-foreground">{source}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
