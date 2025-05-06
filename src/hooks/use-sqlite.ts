
import { useEffect, useState, useCallback } from 'react';
import sqliteService from '@/lib/sqliteService';

// Custom hook for interacting with SQLite data
export const useSqlite = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize database
  useEffect(() => {
    const initializeDb = async () => {
      try {
        setIsLoading(true);
        await sqliteService.initializeDatabase();
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError('Failed to initialize database');
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDb();
  }, []);

  // Wrap all service methods to handle loading and errors
  const wrapAsyncMethod = useCallback(<T extends (...args: any[]) => Promise<any>>(
    method: T
  ) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await method(...args);
        return result as ReturnType<T>;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    };
  }, []);

  return {
    isInitialized,
    isLoading,
    error,
    getAllWorkspaces: wrapAsyncMethod(sqliteService.getAllWorkspaces),
    createWorkspace: wrapAsyncMethod(sqliteService.createWorkspace),
    updateWorkspace: wrapAsyncMethod(sqliteService.updateWorkspace),
    deleteWorkspace: wrapAsyncMethod(sqliteService.deleteWorkspace),
    getWorkspace: wrapAsyncMethod(sqliteService.getWorkspace),
    addDocument: wrapAsyncMethod(sqliteService.addDocument),
    listDocuments: wrapAsyncMethod(sqliteService.listDocuments),
    deleteDocument: wrapAsyncMethod(sqliteService.deleteDocument),
    createChat: wrapAsyncMethod(sqliteService.createChat),
    getChats: wrapAsyncMethod(sqliteService.getChats),
    deleteChats: wrapAsyncMethod(sqliteService.deleteChats),
    addMessage: wrapAsyncMethod(sqliteService.addMessage),
    getMessages: wrapAsyncMethod(sqliteService.getMessages)
  };
};
