
// Web Search API using Brave Search
// https://brave.com/search/api/

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

// Brave Search API endpoints
const SEARCH_API_URL = 'https://api.search.brave.com/res/v1/web/search';

// API key storage key for localStorage
const BRAVE_API_KEY_STORAGE_KEY = 'brave_search_api_key';

// Save API key to localStorage
export const saveBraveApiKey = (apiKey: string): void => {
  localStorage.setItem(BRAVE_API_KEY_STORAGE_KEY, apiKey);
};

// Get API key from localStorage
export const getBraveApiKey = (): string | null => {
  return localStorage.getItem(BRAVE_API_KEY_STORAGE_KEY);
};

// Check if Brave API key is set
export const isBraveApiKeySet = (): boolean => {
  return !!getBraveApiKey();
};

// Validate Brave API key with a test search
export const validateBraveApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(`${SEARCH_API_URL}?q=test`, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey
      }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error('Error validating Brave API key:', error);
    return false;
  }
};

export const searchWeb = async (query: string): Promise<SearchResponse> => {
  console.log('Searching the web for:', query);
  
  const apiKey = getBraveApiKey();
  
  if (!apiKey) {
    console.error('Brave Search API key not found');
    return { 
      results: [],
      error: 'Brave Search API key not set. Please configure it in settings.'
    };
  }
  
  try {
    const response = await fetch(`${SEARCH_API_URL}?q=${encodeURIComponent(query)}`, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Search API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform Brave Search results to our format
    const results: SearchResult[] = data.web?.results?.map((result: any, index: number) => ({
      title: result.title || '',
      link: result.url || '',
      snippet: result.description || '',
      source: new URL(result.url).hostname,
      position: index + 1
    })) || [];
    
    return { results };
  } catch (error) {
    console.error('Error searching the web:', error);
    
    // Fallback to mock results if in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock search results in development mode');
      return getMockSearchResults(query);
    }
    
    return { 
      results: [],
      error: error instanceof Error ? error.message : 'Failed to search the web'
    };
  }
};

// Mock search results for development/testing
const getMockSearchResults = (query: string): SearchResponse => {
  // Simulate network delay
  return {
    results: [
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
    ]
  };
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
