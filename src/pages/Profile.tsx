
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspace } from '@/context/WorkspaceContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { workspaces, activeWorkspaceId } = useWorkspace();
  const navigate = useNavigate();
  
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Manage your profile and workspace settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Active Workspace</h3>
            <p className="text-sm text-muted-foreground">
              {activeWorkspace ? activeWorkspace.name : 'No active workspace'}
            </p>
            {activeWorkspace?.description && (
              <p className="text-sm mt-1 italic">
                {activeWorkspace.description}
              </p>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Your Workspaces</h3>
            <ul className="mt-2 space-y-1">
              {workspaces.map(workspace => (
                <li key={workspace.id} className="text-sm">
                  {workspace.name} {workspace.id === activeWorkspaceId && '(active)'}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate('/')}>
            Back to Chat
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile;
