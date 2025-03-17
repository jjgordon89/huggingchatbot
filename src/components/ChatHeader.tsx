
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
import { AgentSkills } from "./AgentSkills";
import { PlusCircle, Settings, Database, Search, Zap, BookOpen, Sliders } from "lucide-react";
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
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const isBraveKeySet = isBraveApiKeySet();
  
  return (
    <header className="border-b border-border/30 h-14 flex items-center justify-between px-4 sticky top-0 z-10 bg-cyber-dark/95 backdrop-blur supports-[backdrop-filter]:bg-cyber-dark/60">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-cyber-primary" />
        <h1 className="text-lg font-semibold text-cyber-primary">ALFRED</h1>
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
                className="hover:bg-cyber-primary/20 hover:text-cyber-primary"
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
                      className="hover:bg-cyber-primary/20 hover:text-cyber-primary"
                    >
                      <Sliders className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Knowledge Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DialogContent className="sm:max-w-[500px] bg-cyber-dark border-cyber-primary/30">
              <DialogHeader>
                <DialogTitle className="text-cyber-primary">Advanced Knowledge Settings</DialogTitle>
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
                    className="hover:bg-cyber-primary/20 hover:text-cyber-primary"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenuContent align="end" className="bg-cyber-dark border-cyber-primary/30">
            <DropdownMenuLabel className="text-cyber-primary">Settings</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-cyber-primary/20" />
            
            <Dialog open={apiDialogOpen} onOpenChange={setApiDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-cyber-primary/20 hover:text-cyber-primary focus:bg-cyber-primary/20 focus:text-cyber-primary">
                  Hugging Face API Key
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="bg-cyber-dark border-cyber-primary/30">
                <DialogHeader>
                  <DialogTitle className="text-cyber-primary">Hugging Face API Key</DialogTitle>
                  <DialogDescription>
                    Enter your Hugging Face API key to access AI models
                  </DialogDescription>
                </DialogHeader>
                <ApiKeyForm />
              </DialogContent>
            </Dialog>
            
            <Dialog open={braveApiDialogOpen} onOpenChange={setBraveApiDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-cyber-primary/20 hover:text-cyber-primary focus:bg-cyber-primary/20 focus:text-cyber-primary">
                  Brave Search API Key
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="bg-cyber-dark border-cyber-primary/30">
                <DialogHeader>
                  <DialogTitle className="text-cyber-primary">Brave Search API Key</DialogTitle>
                  <DialogDescription>
                    Enter your Brave Search API key to enable web search functionality
                  </DialogDescription>
                </DialogHeader>
                <BraveApiKeyForm onClose={() => setBraveApiDialogOpen(false)} />
              </DialogContent>
            </Dialog>
            
            <Dialog open={skillsDialogOpen} onOpenChange={setSkillsDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-cyber-primary/20 hover:text-cyber-primary focus:bg-cyber-primary/20 focus:text-cyber-primary">
                  Agent Skills
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="bg-cyber-dark border-cyber-primary/30">
                <DialogHeader>
                  <DialogTitle className="text-cyber-primary">Agent Skills</DialogTitle>
                  <DialogDescription>
                    Explore capabilities of your AI assistant
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <AgentSkills />
                </div>
              </DialogContent>
            </Dialog>
            
            <DropdownMenuSeparator className="bg-cyber-primary/20" />
            <DropdownMenuLabel className="text-cyber-primary">Models</DropdownMenuLabel>
            
            {availableModels.map(model => (
              <DropdownMenuItem 
                key={model.id}
                onSelect={() => setActiveModel(model)}
                className="flex items-center justify-between hover:bg-cyber-primary/20 hover:text-cyber-primary focus:bg-cyber-primary/20 focus:text-cyber-primary"
              >
                <span>{model.name}</span>
                {activeModel.id === model.id && (
                  <span className="h-2 w-2 rounded-full bg-cyber-primary" />
                )}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator className="bg-cyber-primary/20" />
            <DropdownMenuLabel className="text-cyber-primary">Knowledge</DropdownMenuLabel>
            
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setRagEnabled(!ragEnabled);
              }}
              className="flex items-center justify-between hover:bg-cyber-primary/20 hover:text-cyber-primary focus:bg-cyber-primary/20 focus:text-cyber-primary"
            >
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Use Document Knowledge</span>
              </div>
              <Switch 
                checked={ragEnabled} 
                onCheckedChange={setRagEnabled} 
                onClick={(e) => e.stopPropagation()}
                className="data-[state=checked]:bg-cyber-primary data-[state=checked]:border-cyber-primary"
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
              className="flex items-center justify-between hover:bg-cyber-primary/20 hover:text-cyber-primary focus:bg-cyber-primary/20 focus:text-cyber-primary"
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
                className="data-[state=checked]:bg-cyber-primary data-[state=checked]:border-cyber-primary"
              />
            </DropdownMenuItem>
            
            {(ragEnabled || webSearchEnabled) && (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setAdvancedRagDialogOpen(true);
                }}
                className="hover:bg-cyber-primary/20 hover:text-cyber-primary focus:bg-cyber-primary/20 focus:text-cyber-primary"
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
