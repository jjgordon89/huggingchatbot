
import { useEffect, useState } from 'react';
import sqliteService from '@/lib/sqliteService';

// Custom hook for interacting with SQLite data
export const useSqlite = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      sqliteService.initializeDatabase();
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize SQLite:', error);
      setIsInitialized(false);
    }
  }, []);

  return {
    isInitialized,
    ...sqliteService
  };
};
