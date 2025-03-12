
// Web Search API using SerpAPI
// This is a simple implementation using fetch

type SearchResult = {
  title: string;
  link: string;
  snippet: string;
  source: string;
  position: number;
};

type SearchResponse = {
  results: SearchResult[];
  error?: string;
};

// Using a free API for demonstration
// In production, you would use a paid API with better results
const SEARCH_API_URL = 'https://serpapi.com/search';

// We'll use a mock implementation for demo purposes
// In a real app, you'd use your own API key
export const searchWeb = async (query: string): Promise<SearchResponse> => {
  console.log('Searching the web for:', query);
  
  try {
    // In a real implementation, you would make an actual API call:
    // const response = await fetch(`${SEARCH_API_URL}?q=${encodeURIComponent(query)}&api_key=${YOUR_API_KEY}`);
    // const data = await response.json();
    
    // For demo purposes, we'll return mock data after a short delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate some fake search results based on the query
    const results: SearchResult[] = [
      {
        title: `Latest information about ${query}`,
        link: `https://example.com/results/${encodeURIComponent(query)}`,
        snippet: `This is the most recent information about ${query}. The data was updated recently and includes the latest developments and research.`,
        source: 'example.com',
        position: 1
      },
      {
        title: `${query} - Wikipedia`,
        link: `https://en.wikipedia.org/wiki/${encodeURIComponent(query.replace(' ', '_'))}`,
        snippet: `${query} refers to a concept or topic that has been researched extensively. Recent studies have shown new developments in this area.`,
        source: 'wikipedia.org',
        position: 2
      },
      {
        title: `News about ${query}`,
        link: `https://news.example.com/topics/${encodeURIComponent(query)}`,
        snippet: `The latest news and updates about ${query}. Stay informed with real-time information and expert analysis on this topic.`,
        source: 'news.example.com',
        position: 3
      }
    ];
    
    return { results };
  } catch (error) {
    console.error('Error searching the web:', error);
    return { 
      results: [],
      error: error instanceof Error ? error.message : 'Failed to search the web'
    };
  }
};

// Format search results as context for the AI
export const formatSearchResultsAsContext = (results: SearchResult[]): string => {
  if (results.length === 0) {
    return '';
  }
  
  let formattedText = '### Web Search Results:\n\n';
  
  results.forEach((result, index) => {
    formattedText += `${index + 1}. **${result.title}**\n`;
    formattedText += `   Source: ${result.source}\n`;
    formattedText += `   ${result.snippet}\n\n`;
  });
  
  formattedText += 'Please use this information to answer the user\'s question accurately, and mention that you are using web search results.\n\n';
  
  return formattedText;
};
