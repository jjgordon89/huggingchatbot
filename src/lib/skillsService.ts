
import { getWeatherData, isWeatherApiKeySet } from "./weatherService";

// Define skill types
export type Skill = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiresApiKey?: boolean;
  isApiKeySet?: () => boolean;
  handler: (query: string) => Promise<any>;
  keywords: string[];
};

// Weather skill
export const weatherSkill: Skill = {
  id: "weather",
  name: "Weather",
  description: "Get weather information for locations",
  enabled: true,
  requiresApiKey: true,
  isApiKeySet: isWeatherApiKeySet,
  keywords: ["weather", "temperature", "forecast", "rain", "sunny", "cloudy", "humidity", "climate"],
  handler: async (query: string) => {
    // Extract location from query
    const locationRegex = /weather (?:in|for|at) ([a-zA-Z\s,]+)/i;
    const match = query.match(locationRegex);
    
    if (!match || !match[1]) {
      throw new Error("Location not found in query");
    }
    
    const location = match[1].trim();
    return await getWeatherData(location);
  }
};

// Function to detect if a query matches a skill
export const detectSkill = (query: string, skills: Skill[]): Skill | null => {
  const lowerQuery = query.toLowerCase();
  
  for (const skill of skills) {
    if (!skill.enabled) continue;
    
    // If the skill requires an API key and it's not set, skip it
    if (skill.requiresApiKey && skill.isApiKeySet && !skill.isApiKeySet()) {
      continue;
    }
    
    // Check if query contains any keywords for this skill
    if (skill.keywords.some(keyword => lowerQuery.includes(keyword.toLowerCase()))) {
      return skill;
    }
  }
  
  return null;
};

// Function to execute a skill with a query
export const executeSkill = async (skill: Skill, query: string): Promise<any> => {
  try {
    return await skill.handler(query);
  } catch (error) {
    console.error(`Error executing skill ${skill.name}:`, error);
    throw error;
  }
};

// List of all available skills
export const availableSkills: Skill[] = [
  weatherSkill,
  // Add more skills here as they're implemented
];
