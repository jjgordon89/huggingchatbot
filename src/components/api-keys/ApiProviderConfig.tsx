import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InputValidator } from '@/lib/inputValidation';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  CheckCircle,
  Key,
  Lock,
  RefreshCw
} from 'lucide-react';
import { ApiProvider } from '@/context/ChatContext';

interface ApiProviderInfo {
  id: ApiProvider;
  name: string;
  description: string;
  website: string;
  icon: React.ElementType;
  requiresKey: boolean;
  getKeyLink: string;
  freeCredits?: string;
  contextWindow?: string;
  pricingInfo?: string;
}

interface ApiProviderConfigProps {
  provider: ApiProviderInfo;
  apiKey: string;
  isKeyAvailable: boolean;
  onKeyChange: (value: string) => void;
  onSaveKey: () => Promise<boolean>;
}

export function ApiProviderConfig({
  provider,
  apiKey,
  isKeyAvailable,
  onKeyChange,
  onSaveKey
}: ApiProviderConfigProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleKeyChange = (value: string) => {
    onKeyChange(value);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSave = async () => {
    // Validate API key before saving
    if (!InputValidator.validateApiKey(apiKey, provider.id)) {
      setValidationError(`Invalid ${provider.name} API key format`);
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);
    
    try {
      const success = await onSaveKey();
      if (success) {
        toast({
          title: "API Key Saved",
          description: `${provider.name} API key saved successfully`,
        });
      }
    } catch (error) {
      setValidationError('Failed to save API key');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!provider.requiresKey) {
    return (
      <Alert className="bg-blue-50 text-blue-800 border-blue-200">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>No API Key Required</AlertTitle>
        <AlertDescription>
          {provider.name} does not require an API key. {provider.pricingInfo}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${provider.id}-api-key`}>API Key</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id={`${provider.id}-api-key`}
              type={isVisible ? "text" : "password"}
              value={apiKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder={`Enter your ${provider.name} API key`}
              className="pr-10"
              aria-describedby={validationError ? `${provider.id}-error` : undefined}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide API key" : "Show API key"}
            >
              <Lock className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || !apiKey || !!validationError}
            aria-label={`Save ${provider.name} API key`}
          >
            {isSubmitting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Key className="h-4 w-4 mr-2" />
            )}
            Save Key
          </Button>
        </div>
        
        {validationError && (
          <p id={`${provider.id}-error`} className="text-sm text-destructive" role="alert">
            {validationError}
          </p>
        )}
        
        <div className="flex justify-between items-center text-sm">
          <a
            href={provider.getKeyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Get an API key
          </a>
          {isKeyAvailable ? (
            <div className="flex items-center text-green-500">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              <span>API key configured</span>
            </div>
          ) : (
            <div className="flex items-center text-amber-500">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              <span>No API key set</span>
            </div>
          )}
        </div>
      </div>

      {!isKeyAvailable && (
        <Alert className="bg-amber-50 text-amber-800 border-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription>
            An API key is required to use {provider.name} models.
            {provider.freeCredits && (
              <span className="font-medium block mt-1">{provider.freeCredits}</span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}