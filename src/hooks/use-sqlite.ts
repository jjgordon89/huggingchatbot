
import { useEffect, useState, useCallback } from 'react';
import sqliteService from '@/lib/sqliteService';

// Custom hook for interacting with IndexedDB data
export const useSqlite = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check database initialization status
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        setIsLoading(true);
        // We're just checking if the database is ready
        const workspaces = await sqliteService.getAllWorkspaces();
        console.log("Database check complete, found workspaces:", workspaces.length);
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error('Failed to check database status:', err);
        setError('Failed to connect to database');
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkDbStatus();
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
