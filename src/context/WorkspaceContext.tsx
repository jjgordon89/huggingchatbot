
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";

// Define workspace type
export type Workspace = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  icon?: string; // Icon for the workspace
  color?: string; // Color for the workspace
};

// Define workspace context type
type WorkspaceContextType = {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  createWorkspace: (name: string, description?: string, icon?: string, color?: string) => Workspace;
  updateWorkspace: (id: string, data: Partial<Workspace>) => boolean;
  deleteWorkspace: (id: string) => boolean;
  switchWorkspace: (id: string) => void;
};

// Create the context
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Create a provider component
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize from localStorage
  useEffect(() => {
    const savedWorkspaces = localStorage.getItem('workspaces');
    const savedActiveWorkspaceId = localStorage.getItem('activeWorkspaceId');
    
    if (savedWorkspaces) {
      try {
        // Parse workspaces and ensure Date objects are properly converted
        const parsedWorkspaces: Workspace[] = JSON.parse(savedWorkspaces).map((w: any) => ({
          ...w,
          createdAt: new Date(w.createdAt)
        }));
        setWorkspaces(parsedWorkspaces);
      } catch (e) {
        console.error('Failed to parse saved workspaces:', e);
      }
    }
    
    if (savedActiveWorkspaceId) {
      setActiveWorkspaceId(savedActiveWorkspaceId);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (workspaces.length > 0) {
      localStorage.setItem('workspaces', JSON.stringify(workspaces));
    }
    
    if (activeWorkspaceId) {
      localStorage.setItem('activeWorkspaceId', activeWorkspaceId);
    }
  }, [workspaces, activeWorkspaceId]);

  // Create a new workspace
  const createWorkspace = (name: string, description?: string, icon?: string, color?: string): Workspace => {
    const newWorkspace: Workspace = {
      id: uuidv4(),
      name,
      description,
      createdAt: new Date(),
      icon,
      color
    };
    
    setWorkspaces(prev => [...prev, newWorkspace]);
    
    // If this is the first workspace, make it active
    if (workspaces.length === 0) {
      setActiveWorkspaceId(newWorkspace.id);
    }
    
    toast({
      title: "Workspace Created",
      description: `Created new workspace: ${name}`
    });
    
    return newWorkspace;
  };

  // Update an existing workspace
  const updateWorkspace = (id: string, data: Partial<Workspace>): boolean => {
    let updated = false;
    
    setWorkspaces(prev => {
      const index = prev.findIndex(w => w.id === id);
      if (index === -1) return prev;
      
      updated = true;
      const updatedWorkspaces = [...prev];
      updatedWorkspaces[index] = { ...updatedWorkspaces[index], ...data };
      return updatedWorkspaces;
    });
    
    if (updated) {
      toast({
        title: "Workspace Updated",
        description: `Updated workspace details`
      });
    }
    
    return updated;
  };

  // Delete a workspace
  const deleteWorkspace = (id: string): boolean => {
    // Don't delete if it's the only workspace
    if (workspaces.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one workspace",
        variant: "destructive"
      });
      return false;
    }
    
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    
    // If deleting the active workspace, switch to another one
    if (activeWorkspaceId === id) {
      setActiveWorkspaceId(workspaces.find(w => w.id !== id)?.id || null);
    }
    
    toast({
      title: "Workspace Deleted",
      description: `Deleted workspace`
    });
    
    return true;
  };

  // Switch to a different workspace
  const switchWorkspace = (id: string) => {
    const workspace = workspaces.find(w => w.id === id);
    if (!workspace) return;
    
    setActiveWorkspaceId(id);
    
    toast({
      title: "Workspace Switched",
      description: `Switched to workspace: ${workspace.name}`
    });
  };

  // Create a default workspace if none exist
  useEffect(() => {
    if (workspaces.length === 0) {
      const defaultWorkspace = createWorkspace("Default Workspace", "Your default workspace");
      setActiveWorkspaceId(defaultWorkspace.id);
    } else if (!activeWorkspaceId) {
      // If there are workspaces but no active one, set the first as active
      setActiveWorkspaceId(workspaces[0].id);
    }
  }, [workspaces.length]);

  const value = {
    workspaces,
    activeWorkspaceId,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    switchWorkspace
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

// Create a hook to use the workspace context
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
