import DOMPurify from 'dompurify';

// Input validation and sanitization utilities
export class InputValidator {
  // Sanitize HTML content to prevent XSS
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    });
  }

  // Sanitize plain text
  static sanitizeText(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove basic HTML tags
      .slice(0, 10000); // Limit length
  }

  // Validate API key format
  static validateApiKey(key: string, provider: string): boolean {
    if (!key || key.length < 10) return false;
    
    switch (provider.toLowerCase()) {
      case 'openai':
        return key.startsWith('sk-');
      case 'anthropic':
        return key.startsWith('sk-ant-');
      case 'hugging face':
        return key.startsWith('hf_');
      case 'google':
        return key.length > 20; // Basic length check
      case 'openrouter':
        return key.startsWith('sk-or-');
      default:
        return key.length >= 10;
    }
  }

  // Validate workspace name
  static validateWorkspaceName(name: string): { isValid: boolean; error?: string } {
    const sanitized = this.sanitizeText(name);
    
    if (!sanitized) {
      return { isValid: false, error: 'Workspace name cannot be empty' };
    }
    
    if (sanitized.length < 2) {
      return { isValid: false, error: 'Workspace name must be at least 2 characters' };
    }
    
    if (sanitized.length > 50) {
      return { isValid: false, error: 'Workspace name must be less than 50 characters' };
    }
    
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(sanitized)) {
      return { isValid: false, error: 'Workspace name can only contain letters, numbers, spaces, hyphens, and underscores' };
    }
    
    return { isValid: true };
  }

  // Validate chat message
  static validateChatMessage(message: string): { isValid: boolean; sanitized: string; error?: string } {
    const sanitized = this.sanitizeText(message);
    
    if (!sanitized) {
      return { isValid: false, sanitized: '', error: 'Message cannot be empty' };
    }
    
    if (sanitized.length > 4000) {
      return { isValid: false, sanitized: '', error: 'Message must be less than 4000 characters' };
    }
    
    return { isValid: true, sanitized };
  }

  // Validate email format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate URL format
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}