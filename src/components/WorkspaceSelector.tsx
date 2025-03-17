
import React, { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, FolderOpen, Settings, Trash2 } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { cn } from '@/lib/utils';

export function WorkspaceSelector() {
  const { 
    workspaces, 
    activeWorkspaceId, 
    createWorkspace, 
    updateWorkspace,
    deleteWorkspace, 
    switchWorkspace 
  } = useWorkspace();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  const [editWorkspaceName, setEditWorkspaceName] = useState('');
  const [editWorkspaceDescription, setEditWorkspaceDescription] = useState('');
  
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  
  // Handle create workspace
  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      createWorkspace(newWorkspaceName.trim(), newWorkspaceDescription.trim());
      setNewWorkspaceName('');
      setNewWorkspaceDescription('');
      setIsCreateDialogOpen(false);
    }
  };
  
  // Handle edit workspace
  const handleEditWorkspace = () => {
    if (activeWorkspaceId && editWorkspaceName.trim()) {
      updateWorkspace(activeWorkspaceId, {
        name: editWorkspaceName.trim(),
        description: editWorkspaceDescription.trim()
      });
      setIsEditDialogOpen(false);
    }
  };
  
  // Open edit dialog with current workspace data
  const openEditDialog = () => {
    if (activeWorkspace) {
      setEditWorkspaceName(activeWorkspace.name);
      setEditWorkspaceDescription(activeWorkspace.description || '');
      setIsEditDialogOpen(true);
    }
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center justify-start w-full px-3 text-base font-medium"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            <span className="truncate">
              {activeWorkspace ? activeWorkspace.name : 'Select Workspace'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {workspaces.map(workspace => (
            <DropdownMenuItem 
              key={workspace.id}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                workspace.id === activeWorkspaceId && "bg-accent"
              )}
              onClick={() => switchWorkspace(workspace.id)}
            >
              <FolderOpen className="h-4 w-4" />
              <span className="truncate flex-1">{workspace.name}</span>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>New Workspace</span>
          </DropdownMenuItem>
          
          {activeWorkspace && (
            <>
              <DropdownMenuItem 
                className="flex items-center gap-2 cursor-pointer"
                onClick={openEditDialog}
              >
                <Settings className="h-4 w-4" />
                <span>Edit Workspace</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="flex items-center gap-2 cursor-pointer text-red-500"
                onClick={() => deleteWorkspace(activeWorkspaceId)}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Workspace</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Create Workspace Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your conversations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workspaceName">Name</Label>
              <Input
                id="workspaceName"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="My Workspace"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workspaceDescription">Description (optional)</Label>
              <Input
                id="workspaceDescription"
                value={newWorkspaceDescription}
                onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                placeholder="What is this workspace for?"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkspace}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Workspace Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription>
              Update your workspace information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editWorkspaceName">Name</Label>
              <Input
                id="editWorkspaceName"
                value={editWorkspaceName}
                onChange={(e) => setEditWorkspaceName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editWorkspaceDescription">Description (optional)</Label>
              <Input
                id="editWorkspaceDescription"
                value={editWorkspaceDescription}
                onChange={(e) => setEditWorkspaceDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditWorkspace}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
