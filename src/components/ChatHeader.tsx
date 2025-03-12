
import { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Settings, Code, Plus, BrainCircuit, Lightbulb, Menu } from 'lucide-react';

export function ChatHeader() {
  const { 
    startNewChat, 
    isApiKeySet, 
    setApiKey, 
    activeModel, 
    availableModels, 
    setActiveModel,
    ragEnabled,
    setRagEnabled
  } = useChat();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const { toast } = useToast();

  const handleApiKeySubmit = () => {
    if (apiKeyInput.trim()) {
      const success = setApiKey(apiKeyInput.trim());
      if (success) {
        setIsSettingsOpen(false);
        toast({
          title: "API Key Saved",
          description: "Your Hugging Face API key has been saved"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save API key",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <header className="flex items-center justify-between h-[--header-height] px-6 border-b backdrop-blur-sm bg-background/80 z-10 sticky top-0">
      <div className="flex items-center gap-2 font-medium text-lg">
        <BrainCircuit className="h-5 w-5 text-primary" />
        <span>AI Chatbot</span>
        {activeModel && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm text-muted-foreground gap-1.5 ml-1 group"
            onClick={() => setIsModelSelectorOpen(true)}
          >
            <span className="font-normal hidden sm:inline">
              Model: 
            </span>
            <span className="group-hover:text-primary transition-colors">{activeModel.name}</span>
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full focus-ring hover:bg-secondary"
          onClick={() => setRagEnabled(!ragEnabled)}
          title={ragEnabled ? "RAG Enabled" : "RAG Disabled"}
        >
          <Lightbulb className={`h-[1.2rem] w-[1.2rem] ${ragEnabled ? 'text-amber-500' : 'text-muted-foreground'}`} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full focus-ring hover:bg-secondary"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
        </Button>
        
        <Button
          onClick={startNewChat}
          className="gap-1.5 sm:px-4 sm:py-2 sm:h-9 smooth-transition focus-ring"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Chat</span>
        </Button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hugging Face API Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Please enter your Hugging Face API key to use the chatbot. 
                You can get one from your <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="text-primary underline hover:text-primary/80">Hugging Face account settings</a>.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="password"
                  placeholder="Enter your Hugging Face API key"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="flex-1"
                />
              </div>
              {isApiKeySet && (
                <p className="text-xs text-muted-foreground">
                  An API key is already set. Entering a new one will replace it.
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Retrieval-Augmented Generation (RAG)</h4>
              <p className="text-sm text-muted-foreground">
                Enable RAG to improve responses by searching for relevant information from your documents.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant={ragEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRagEnabled(true)}
                  className="flex-1"
                >
                  Enable RAG
                </Button>
                <Button
                  variant={!ragEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRagEnabled(false)}
                  className="flex-1"
                >
                  Disable RAG
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleApiKeySubmit} disabled={!apiKeyInput.trim()}>
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Model Selector Dialog */}
      <Dialog open={isModelSelectorOpen} onOpenChange={setIsModelSelectorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select AI Model</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {availableModels.filter(model => model.task !== 'feature-extraction').map((model) => (
              <Button
                key={model.id}
                variant={model.id === activeModel.id ? "default" : "outline"}
                className={`justify-start text-left h-auto p-4 ${
                  model.id === activeModel.id ? 'border-primary/50' : ''
                }`}
                onClick={() => {
                  setActiveModel(model);
                  setIsModelSelectorOpen(false);
                }}
              >
                <div className="flex flex-col items-start gap-1">
                  <div className="font-medium">{model.name}</div>
                  {model.description && (
                    <div className="text-xs text-muted-foreground">{model.description}</div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
