
import React from 'react';
import { Loader2, Database, MessageSquare, BrainCircuit } from 'lucide-react';
import { HolographicOrb } from '@/components/HolographicOrb';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'holographic';
  className?: string;
}

export function LoadingSpinner({ size = 'md', variant = 'default', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  if (variant === 'holographic') {
    const orbSize = size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md';
    return <HolographicOrb size={orbSize} variant="liquid-cyan" className={className} />;
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('animate-pulse bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full', sizeClasses[size], className)} />
    );
  }

  return (
    <Loader2 className={cn('animate-spin text-cyan-400', sizeClasses[size], className)} />
  );
}

interface LoadingStateProps {
  message?: string;
  type?: 'chat' | 'database' | 'ai' | 'general';
  showProgress?: boolean;
  progress?: number;
}

export function LoadingState({ message, type = 'general', showProgress = false, progress = 0 }: LoadingStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="h-6 w-6 text-cyan-400" />;
      case 'database':
        return <Database className="h-6 w-6 text-cyan-400" />;
      case 'ai':
        return <BrainCircuit className="h-6 w-6 text-cyan-400" />;
      default:
        return <LoadingSpinner variant="holographic" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      <div className="flex items-center space-x-3">
        {getIcon()}
        <LoadingSpinner />
      </div>
      
      {message && (
        <p className="text-sm text-gray-300 text-center max-w-xs">
          {message}
        </p>
      )}
      
      {showProgress && (
        <div className="w-full max-w-xs bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function PageLoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <LoadingState message={message} type="general" />
    </div>
  );
}

export function InlineLoadingState({ message, className }: { message?: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <LoadingState message={message} />
    </div>
  );
}
