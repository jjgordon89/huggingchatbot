
import { ChevronDown, ChevronUp, BookOpen, FileType, Globe, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function RagSources({ sources }: { sources: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  
  // No sources to display
  if (!sources || sources.length === 0) {
    return null;
  }
  
  const renderSourceIcon = (source: string) => {
    // Check if it's a web source
    if (source.startsWith('Web:')) return <Globe className="h-3 w-3" />;
    
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

  // Extract similarity score if available
  const extractSimilarity = (source: string): number | null => {
    const match = source.match(/similarity: (\d+\.?\d*)%/);
    return match ? parseFloat(match[1]) : null;
  };

  // Get source URL if it's a web source
  const extractWebUrl = (source: string): string | null => {
    if (!source.startsWith('Web:')) return null;
    const urlMatch = source.match(/\((https?:\/\/[^)]+)\)/);
    return urlMatch ? urlMatch[1] : null;
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
          {sources.map((source, i) => {
            const similarity = extractSimilarity(source);
            const webUrl = extractWebUrl(source);
            
            return (
              <div key={i} className="flex items-center gap-1.5">
                <Badge variant="outline" className="h-5 px-1.5 font-mono text-xs flex items-center">
                  {typeof renderSourceIcon(source) === 'string' ? 
                    renderSourceIcon(source) : 
                    renderSourceIcon(source)}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="max-w-[300px] truncate">{source}</span>
                  
                  {similarity !== null && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant={similarity > 85 ? "default" : similarity > 70 ? "secondary" : "outline"} 
                            className="ml-1 h-5 text-xs">
                            {similarity}%
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Relevance score: {similarity}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {webUrl && (
                    <a 
                      href={webUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 ml-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
