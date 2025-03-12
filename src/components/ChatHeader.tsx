
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiKeyForm } from "./ApiKeyForm";
import { PlusCircle, Settings, Database, FileUp, Sparkles, Search } from "lucide-react";
import { useState } from "react";
import { useChat } from "@/context/ChatContext";
import { useMobile } from "@/hooks/use-mobile";

export function ChatHeader() {
  const { 
    startNewChat, 
    isApiKeySet, 
    activeModel, 
    setActiveModel, 
    availableModels,
    ragEnabled,
    setRagEnabled,
    webSearchEnabled,
    setWebSearchEnabled
  } = useChat();
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const isMobile = useMobile();
  
  return (
    <header className="border-b h-14 flex items-center justify-between px-4 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5" />
        <h1 className="text-lg font-semibold">AI Chat</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => startNewChat()}
                aria-label="New Chat"
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Chat</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    aria-label="Settings"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <Dialog open={apiDialogOpen} onOpenChange={setApiDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  API Key
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Hugging Face API Key</DialogTitle>
                  <DialogDescription>
                    Enter your Hugging Face API key to access AI models
                  </DialogDescription>
                </DialogHeader>
                <ApiKeyForm onSuccess={() => setApiDialogOpen(false)} />
              </DialogContent>
            </Dialog>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Models</DropdownMenuLabel>
            
            {availableModels.map(model => (
              <DropdownMenuItem 
                key={model.id}
                onSelect={() => setActiveModel(model)}
                className="flex items-center justify-between"
              >
                <span>{model.name}</span>
                {activeModel.id === model.id && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Knowledge</DropdownMenuLabel>
            
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setRagEnabled(!ragEnabled);
              }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Use Document Knowledge</span>
              </div>
              <Switch 
                checked={ragEnabled} 
                onCheckedChange={setRagEnabled} 
                onClick={(e) => e.stopPropagation()}
              />
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setWebSearchEnabled(!webSearchEnabled);
              }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Web Search</span>
              </div>
              <Switch 
                checked={webSearchEnabled} 
                onCheckedChange={setWebSearchEnabled} 
                onClick={(e) => e.stopPropagation()}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
