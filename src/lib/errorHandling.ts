
import { toast } from '@/hooks/use-toast';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  context?: string;
}

export class ErrorService {
  private static instance: ErrorService;
  private errors: AppError[] = [];

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  logError(error: Error | string, context?: string, details?: any): AppError {
    const appError: AppError = {
      code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : error,
      details,
      context,
      timestamp: Date.now()
    };

    this.errors.push(appError);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('App Error:', appError);
    }

    // Here you would integrate with external error tracking (Sentry, etc.)
    // this.sendToExternalService(appError);

    return appError;
  }

  handleApiError(error: any, context: string = 'API'): AppError {
    let message = 'An unexpected error occurred';
    let code = 'API_ERROR';

    if (error?.response) {
      // HTTP error response
      code = `HTTP_${error.response.status}`;
      message = error.response.data?.message || `Request failed with status ${error.response.status}`;
    } else if (error?.message) {
      message = error.message;
      code = 'NETWORK_ERROR';
    }

    const appError = this.logError(new Error(message), context, {
      status: error?.response?.status,
      url: error?.config?.url,
      method: error?.config?.method
    });

    // Show user-friendly toast
    toast({
      title: "Error",
      description: this.getUserFriendlyMessage(appError),
      variant: "destructive"
    });

    return appError;
  }

  handleDatabaseError(error: any, operation: string): AppError {
    const appError = this.logError(error, `Database: ${operation}`, { operation });
    
    toast({
      title: "Database Error",
      description: "There was an issue with the database. Please try again.",
      variant: "destructive"
    });

    return appError;
  }

  getUserFriendlyMessage(error: AppError): string {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Check your internet connection and try again.';
      case 'HTTP_401':
        return 'Please check your API key and try again.';
      case 'HTTP_429':
        return 'Too many requests. Please wait a moment and try again.';
      case 'HTTP_500':
        return 'Server error. Please try again later.';
      default:
        return error.message || 'Something went wrong. Please try again.';
    }
  }

  getRecentErrors(limit: number = 10): AppError[] {
    return this.errors
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  clearErrors(): void {
    this.errors = [];
  }
}

export const errorService = ErrorService.getInstance();

// Utility function for wrapping async operations with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  options: {
    showToast?: boolean;
    retries?: number;
    retryDelay?: number;
  } = {}
): Promise<T | null> {
  const { showToast = true, retries = 0, retryDelay = 1000 } = options;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === retries) {
        // Last attempt failed
        const appError = errorService.logError(error as Error, context);
        
        if (showToast) {
          toast({
            title: "Error",
            description: errorService.getUserFriendlyMessage(appError),
            variant: "destructive"
          });
        }
        
        return null;
      }
      
      // Wait before retry
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  return null;
}
