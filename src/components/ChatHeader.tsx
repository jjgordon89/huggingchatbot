
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
import { ApiKeyForm } from "./ApiKeyForm";
import { BraveApiKeyForm } from "./BraveApiKeyForm";
import { AdvancedRagSettings } from "./AdvancedRagSettings";
import { PlusCircle, Settings, Database, Search, Sparkles, BookOpen, Sliders } from "lucide-react";
import { useState } from "react";
import { useChat } from "@/context/ChatContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { isBraveApiKeySet } from "@/lib/webSearchService";

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
  const [braveApiDialogOpen, setBraveApiDialogOpen] = useState(false);
  const [advancedRagDialogOpen, setAdvancedRagDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const isBraveKeySet = isBraveApiKeySet();
  
  return (
    <header className="border-b h-14 flex items-center justify-between px-4 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5" />
        <h1 className="text-lg font-semibold">Alfred</h1>
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
        
        {(ragEnabled || webSearchEnabled) && (
          <Dialog open={advancedRagDialogOpen} onOpenChange={setAdvancedRagDialogOpen}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      aria-label="Knowledge Settings"
                    >
                      <Sliders className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Knowledge Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Advanced Knowledge Settings</DialogTitle>
                <DialogDescription>
                  Configure how Alfred uses documents and web search to enhance responses.
                </DialogDescription>
              </DialogHeader>
              <AdvancedRagSettings />
            </DialogContent>
          </Dialog>
        )}
        
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
                  Hugging Face API Key
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Hugging Face API Key</DialogTitle>
                  <DialogDescription>
                    Enter your Hugging Face API key to access AI models
                  </DialogDescription>
                </DialogHeader>
                <ApiKeyForm />
              </DialogContent>
            </Dialog>
            
            <Dialog open={braveApiDialogOpen} onOpenChange={setBraveApiDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Brave Search API Key
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Brave Search API Key</DialogTitle>
                  <DialogDescription>
                    Enter your Brave Search API key to enable web search functionality
                  </DialogDescription>
                </DialogHeader>
                <BraveApiKeyForm onClose={() => setBraveApiDialogOpen(false)} />
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
                if (!isBraveKeySet && !webSearchEnabled) {
                  setBraveApiDialogOpen(true);
                  return;
                }
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
                onCheckedChange={(checked) => {
                  if (!isBraveKeySet && checked) {
                    setBraveApiDialogOpen(true);
                    return;
                  }
                  setWebSearchEnabled(checked);
                }} 
                onClick={(e) => e.stopPropagation()}
                disabled={!isBraveKeySet && !webSearchEnabled}
              />
            </DropdownMenuItem>
            
            {(ragEnabled || webSearchEnabled) && (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setAdvancedRagDialogOpen(true);
                }}
              >
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4" />
                  <span>Advanced Knowledge Settings</span>
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
