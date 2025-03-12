
import { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export function ApiKeyForm() {
  const { setApiKey } = useChat();
  const [apiKey, setApiKeyInput] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (apiKey.trim()) {
      const success = setApiKey(apiKey.trim());
      
      if (success) {
        toast({
          title: "API Key Saved",
          description: "Your Hugging Face API key has been saved"
        });
        setApiKeyInput('');
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
    <div className="w-full max-w-md p-6 flex flex-col gap-6 rounded-lg shadow-subtle border bg-card">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">Welcome to AI Chatbot</h2>
        <p className="text-muted-foreground">
          Please enter your Hugging Face API key to start using the chatbot
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="api-key" className="text-sm font-medium">
            Hugging Face API Key
          </label>
          <Input
            id="api-key"
            type="password"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKeyInput(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            You can get your API key from your{" "}
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Hugging Face account settings
            </a>
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={!apiKey.trim()}>
          Save API Key
        </Button>
      </form>
    </div>
  );
}
