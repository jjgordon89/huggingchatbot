
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiquidMetalCard } from '@/components/LiquidMetalCard';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Log to external error tracking service (when available)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
          <LiquidMetalCard variant="chroma" className="max-w-md text-center">
            <div className="flex flex-col items-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <h1 className="text-xl font-bold text-white">Something went wrong</h1>
              <p className="text-gray-300 text-sm">
                We encountered an unexpected error. This has been logged for investigation.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-red-900/20 rounded-lg border border-red-500/30 text-left w-full">
                  <summary className="cursor-pointer text-red-400 font-medium">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-red-300 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="bg-gradient-to-r from-purple-600 to-cyan-400"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Reload App
                </Button>
              </div>
            </div>
          </LiquidMetalCard>
        </div>
      );
    }

    return this.props.children;
  }
}
