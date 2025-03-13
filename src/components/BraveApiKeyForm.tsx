
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveBraveApiKey, validateBraveApiKey, getBraveApiKey } from "@/lib/webSearchService";
import { useToast } from "@/hooks/use-toast";

export function BraveApiKeyForm({ onClose }: { onClose?: () => void }) {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState(getBraveApiKey() || "");
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Brave Search API key",
        variant: "destructive",
      });
      return;
    }
    
    setIsValidating(true);
    
    try {
      const isValid = await validateBraveApiKey(apiKey);
      
      if (isValid) {
        saveBraveApiKey(apiKey);
        toast({
          title: "Success",
          description: "Brave Search API key saved successfully",
        });
        
        if (onClose) {
          onClose();
        }
      } else {
        toast({
          title: "Invalid API Key",
          description: "The API key could not be validated with Brave Search",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="brave-api-key">Brave Search API Key</Label>
        <Input
          id="brave-api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Brave Search API key"
          autoComplete="off"
        />
        <p className="text-sm text-muted-foreground">
          You can get a Brave Search API key by visiting{" "}
          <a
            href="https://brave.com/search/api/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            Brave Search API
          </a>
        </p>
      </div>
      
      <Button type="submit" disabled={isValidating} className="w-full">
        {isValidating ? "Validating..." : "Save API Key"}
      </Button>
    </form>
  );
}
