# Developer Guide

Comprehensive guide for developers working with the AI Platform codebase.

## 📋 Table of Contents

- [Architecture Overview](./architecture.md)
- [API Reference](./api-reference.md)
- [Component Library](./components.md)
- [State Management](./state-management.md)
- [Customization Guide](./customization.md)
- [Plugin Development](./plugins.md)
- [Testing Guide](./testing.md)
- [Performance Guide](./performance.md)

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── workflow/       # Workflow builder components
│   ├── chat/           # Chat interface components
│   └── ...             # Feature-specific components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Core services and utilities
├── pages/              # Route components
├── types/              # TypeScript type definitions
└── main.tsx           # Application entry point
```

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and suspense
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library

### State Management
- **React Context**: Global state management
- **React Query**: Server state and caching
- **Local Storage**: Client-side persistence
- **SQLite**: Client-side database

### UI/UX
- **Framer Motion**: Animation library
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Icon library
- **React Router**: Client-side routing

### AI Integration
- **Multiple Providers**: OpenAI, Anthropic, Google, etc.
- **LangChain**: AI framework integration
- **Vector Databases**: LanceDB for embeddings
- **Custom Services**: Modular AI service layer

## 🔧 Core Architecture

### Component Architecture

```typescript
// Component structure example
interface ComponentProps {
  // Required props
  id: string;
  // Optional props with defaults
  variant?: 'primary' | 'secondary';
  // Event handlers
  onAction?: (data: ActionData) => void;
}

const Component: React.FC<ComponentProps> = ({
  id,
  variant = 'primary',
  onAction
}) => {
  // Component logic
  return (
    <div className={cn(baseStyles, variantStyles[variant])}>
      {/* Component content */}
    </div>
  );
};
```

### Service Layer

```typescript
// Service pattern example
interface ServiceConfig {
  apiKey: string;
  baseUrl?: string;
}

class AIService {
  private config: ServiceConfig;

  constructor(config: ServiceConfig) {
    this.config = config;
  }

  async generateText(prompt: string): Promise<string> {
    // Implementation
  }

  async embedText(text: string): Promise<number[]> {
    // Implementation
  }
}
```

### Context Pattern

```typescript
// Context setup example
interface AppContextValue {
  state: AppState;
  actions: AppActions;
}

const AppContext = createContext<AppContextValue | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

## 📝 Development Setup

### Environment Setup

1. **Prerequisites**
   ```bash
   node --version  # v18+
   npm --version   # v8+
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   ```bash
   # Create .env.local
   VITE_APP_NAME="AI Platform"
   VITE_API_BASE_URL="http://localhost:3000"
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

### Code Standards

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

#### ESLint Configuration
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "react-hooks/recommended"
  ],
  "rules": {
    "prefer-const": "error",
    "no-unused-vars": "error"
  }
}
```

#### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80
}
```

## 🎨 Design System

### Color System

```css
/* CSS Custom Properties */
:root {
  /* Primary palette */
  --primary: 220 70% 50%;
  --primary-foreground: 0 0% 100%;
  
  /* Semantic colors */
  --background: 0 0% 100%;
  --foreground: 222 84% 5%;
  
  /* Component colors */
  --card: 0 0% 100%;
  --border: 214 32% 91%;
}

.dark {
  --background: 222 84% 5%;
  --foreground: 210 40% 98%;
}
```

### Component Variants

```typescript
// Using class-variance-authority
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Animation System

```typescript
// Framer Motion variants
const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
```

## 🔌 API Integration

### HTTP Client Setup

```typescript
// API client configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### React Query Integration

```typescript
// Query hooks
export const useWorkflows = () => {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: () => apiClient.get('/workflows').then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (workflow: CreateWorkflowRequest) =>
      apiClient.post('/workflows', workflow),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
};
```

## 🧪 Testing

### Testing Setup

```typescript
// Test utilities
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/context/ThemeContext';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

export const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </QueryClientProvider>
  );
};
```

### Component Testing

```typescript
// Component test example
describe('WorkflowBuilder', () => {
  it('renders workflow nodes', () => {
    const mockWorkflow = {
      id: '1',
      name: 'Test Workflow',
      nodes: [/* mock nodes */],
      edges: [/* mock edges */],
    };

    renderWithProviders(<WorkflowBuilder workflow={mockWorkflow} />);
    
    expect(screen.getByText('Test Workflow')).toBeInTheDocument();
  });

  it('handles node creation', async () => {
    const onNodeCreate = jest.fn();
    
    renderWithProviders(
      <WorkflowBuilder onNodeCreate={onNodeCreate} />
    );
    
    fireEvent.click(screen.getByText('Add LLM Node'));
    
    await waitFor(() => {
      expect(onNodeCreate).toHaveBeenCalledWith({ type: 'llm' });
    });
  });
});
```

## 🚀 Build and Deployment

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
```

### Environment Configuration

```bash
# Production environment
VITE_APP_ENV=production
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_SENTRY_DSN=your-sentry-dsn

# Development environment
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:3000
VITE_DEBUG=true
```

## 🔒 Security Considerations

### API Key Management

```typescript
// Secure storage for API keys
class SecureStorage {
  private static encrypt(value: string): string {
    // Implementation using Web Crypto API
    return encryptedValue;
  }

  private static decrypt(encryptedValue: string): string {
    // Implementation using Web Crypto API
    return decryptedValue;
  }

  static setApiKey(provider: string, key: string): void {
    const encrypted = this.encrypt(key);
    localStorage.setItem(`apiKey_${provider}`, encrypted);
  }

  static getApiKey(provider: string): string | null {
    const encrypted = localStorage.getItem(`apiKey_${provider}`);
    return encrypted ? this.decrypt(encrypted) : null;
  }
}
```

### Input Validation

```typescript
// Zod schema validation
const workflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

const validateWorkflow = (data: unknown): Workflow => {
  return workflowSchema.parse(data);
};
```

## 📈 Performance Optimization

### Code Splitting

```typescript
// Lazy loading components
const WorkflowBuilder = lazy(() => import('./components/WorkflowBuilder'));
const ChatInterface = lazy(() => import('./components/ChatInterface'));

// Route-based splitting
const AppRoutes = () => (
  <Routes>
    <Route path="/workflow" element={
      <Suspense fallback={<LoadingSpinner />}>
        <WorkflowBuilder />
      </Suspense>
    } />
  </Routes>
);
```

### Memoization

```typescript
// React.memo for expensive components
const ExpensiveComponent = React.memo(({ data, onAction }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveTransformation(item));
  }, [data]);

  const handleAction = useCallback((id: string) => {
    onAction(id);
  }, [onAction]);

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} data={item} onAction={handleAction} />
      ))}
    </div>
  );
});
```

### Bundle Optimization

```typescript
// Tree shaking configuration
import { debounce } from 'lodash-es';  // ✅ Tree-shakeable
// import _ from 'lodash';             // ❌ Imports entire library

// Dynamic imports for large dependencies
const loadChartLibrary = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};
```

## 🐛 Debugging

### Development Tools

```typescript
// React DevTools integration
if (process.env.NODE_ENV === 'development') {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.onCommitFiberRoot = (id, root) => {
    console.log('React render:', { id, root });
  };
}

// Custom debugging utilities
const debug = {
  log: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
  },
};
```

### Error Boundaries

```typescript
// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind Play](https://play.tailwindcss.com/)

---

This developer guide provides the foundation for working with the AI Platform codebase. For specific implementation details, refer to the individual guide sections.