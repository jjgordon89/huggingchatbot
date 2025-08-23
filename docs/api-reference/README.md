# API Reference

Complete reference for all APIs and services in the AI Platform.

## 📋 Overview

The AI Platform provides several APIs and service layers:
- **Workflow API**: Create and execute workflows
- **Chat API**: Manage conversations and messages
- **Knowledge Base API**: Document management and RAG
- **Model Services**: AI model integrations
- **Storage APIs**: Data persistence and retrieval

## 🔧 Core Services

### Workflow Execution Service

```typescript
interface WorkflowExecutionService {
  executeWorkflow(workflow: Workflow, inputs: Record<string, any>): Promise<WorkflowExecutionResult>;
  validateWorkflow(workflow: Workflow): ValidationResult;
  getExecutionHistory(workflowId: string): Promise<ExecutionHistory[]>;
  cancelExecution(executionId: string): Promise<void>;
}
```

#### Methods

##### `executeWorkflow(workflow, inputs)`
Executes a workflow with provided inputs.

**Parameters:**
- `workflow: Workflow` - The workflow definition
- `inputs: Record<string, any>` - Input variables

**Returns:** `Promise<WorkflowExecutionResult>`

**Example:**
```typescript
const result = await workflowExecutionService.executeWorkflow(
  {
    id: 'workflow-1',
    nodes: [/* nodes */],
    edges: [/* edges */]
  },
  { userQuery: 'Hello, world!' }
);

console.log(result.output); // Final workflow output
console.log(result.logs);   // Execution logs
```

##### `validateWorkflow(workflow)`
Validates workflow structure and configuration.

**Parameters:**
- `workflow: Workflow` - The workflow to validate

**Returns:** `ValidationResult`

**Example:**
```typescript
const validation = workflowExecutionService.validateWorkflow(workflow);

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

### Chat Service

```typescript
interface ChatService {
  sendMessage(chatId: string, message: Message): Promise<Message>;
  createChat(workspaceId: string, title?: string): Promise<Chat>;
  getChatHistory(chatId: string): Promise<Message[]>;
  deleteChat(chatId: string): Promise<void>;
}
```

#### Methods

##### `sendMessage(chatId, message)`
Sends a message and gets AI response.

**Parameters:**
- `chatId: string` - Chat session identifier
- `message: Message` - The message to send

**Returns:** `Promise<Message>` - AI response

**Example:**
```typescript
const response = await chatService.sendMessage('chat-123', {
  role: 'user',
  content: 'Explain quantum computing',
  timestamp: new Date().toISOString()
});
```

### Knowledge Base Service

```typescript
interface KnowledgeBaseService {
  uploadDocument(file: File, metadata?: DocumentMetadata): Promise<Document>;
  searchDocuments(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  deleteDocument(documentId: string): Promise<void>;
  getDocumentChunks(documentId: string): Promise<DocumentChunk[]>;
}
```

#### Methods

##### `uploadDocument(file, metadata)`
Uploads and processes a document.

**Parameters:**
- `file: File` - The document file
- `metadata?: DocumentMetadata` - Optional metadata

**Returns:** `Promise<Document>` - Processed document

**Example:**
```typescript
const document = await knowledgeBaseService.uploadDocument(
  pdfFile,
  {
    title: 'Company Handbook',
    category: 'HR',
    tags: ['policy', 'handbook']
  }
);
```

##### `searchDocuments(query, options)`
Searches documents using similarity or keyword search.

**Parameters:**
- `query: string` - Search query
- `options?: SearchOptions` - Search configuration

**Returns:** `Promise<SearchResult[]>` - Matching documents

**Example:**
```typescript
const results = await knowledgeBaseService.searchDocuments(
  'vacation policy',
  {
    topK: 5,
    threshold: 0.7,
    filters: { category: 'HR' }
  }
);
```

## 🤖 AI Model Services

### OpenAI Service

```typescript
interface OpenAIService {
  generateText(prompt: string, options?: GenerationOptions): Promise<string>;
  generateChat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatMessage>;
  createEmbeddings(texts: string[], model?: string): Promise<number[][]>;
  generateImage(prompt: string, options?: ImageOptions): Promise<string>;
}
```

#### Configuration
```typescript
const openAIService = new OpenAIService({
  apiKey: 'your-api-key',
  model: 'gpt-4',
  baseURL: 'https://api.openai.com/v1' // Optional
});
```

#### Methods

##### `generateText(prompt, options)`
Generates text completion.

**Parameters:**
- `prompt: string` - Input prompt
- `options?: GenerationOptions` - Generation settings

**Returns:** `Promise<string>` - Generated text

**Example:**
```typescript
const text = await openAIService.generateText(
  'Write a haiku about AI',
  {
    temperature: 0.8,
    maxTokens: 100,
    stop: ['\n\n']
  }
);
```

### Anthropic Service

```typescript
interface AnthropicService {
  generateText(prompt: string, options?: AnthropicOptions): Promise<string>;
  generateChat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatMessage>;
}
```

#### Configuration
```typescript
const anthropicService = new AnthropicService({
  apiKey: 'your-api-key',
  model: 'claude-3-sonnet-20240229'
});
```

### Hugging Face Service

```typescript
interface HuggingFaceService {
  generateText(prompt: string, model: string, options?: HFOptions): Promise<string>;
  createEmbeddings(texts: string[], model: string): Promise<number[][]>;
  classifyText(text: string, labels: string[], model?: string): Promise<Classification>;
}
```

## 💾 Storage Services

### SQLite Service

```typescript
interface SQLiteService {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<number>;
  transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>;
}
```

#### Methods

##### `query<T>(sql, params)`
Executes a SELECT query.

**Parameters:**
- `sql: string` - SQL query
- `params?: any[]` - Query parameters

**Returns:** `Promise<T[]>` - Query results

**Example:**
```typescript
const chats = await sqliteService.query<Chat>(
  'SELECT * FROM chats WHERE workspace_id = ?',
  [workspaceId]
);
```

##### `execute(sql, params)`
Executes INSERT, UPDATE, or DELETE.

**Parameters:**
- `sql: string` - SQL statement
- `params?: any[]` - Statement parameters

**Returns:** `Promise<number>` - Affected rows count

**Example:**
```typescript
const rowsAffected = await sqliteService.execute(
  'INSERT INTO messages (chat_id, content, role) VALUES (?, ?, ?)',
  [chatId, content, role]
);
```

### LanceDB Service

```typescript
interface LanceDBService {
  createTable(name: string, schema: Schema): Promise<Table>;
  insertVectors(tableName: string, data: VectorData[]): Promise<void>;
  searchSimilar(tableName: string, query: number[], limit?: number): Promise<SearchResult[]>;
  deleteTable(name: string): Promise<void>;
}
```

#### Methods

##### `insertVectors(tableName, data)`
Inserts vector data into a table.

**Parameters:**
- `tableName: string` - Table name
- `data: VectorData[]` - Vector data with metadata

**Returns:** `Promise<void>`

**Example:**
```typescript
await lanceDBService.insertVectors('documents', [
  {
    vector: [0.1, 0.2, 0.3, ...],
    metadata: {
      documentId: 'doc-1',
      text: 'Document content...',
      title: 'Document Title'
    }
  }
]);
```

##### `searchSimilar(tableName, query, limit)`
Searches for similar vectors.

**Parameters:**
- `tableName: string` - Table name
- `query: number[]` - Query vector
- `limit?: number` - Max results (default: 10)

**Returns:** `Promise<SearchResult[]>`

**Example:**
```typescript
const results = await lanceDBService.searchSimilar(
  'documents',
  queryEmbedding,
  5
);

results.forEach(result => {
  console.log(`Score: ${result.score}, Text: ${result.metadata.text}`);
});
```

## 🌐 Web Search Services

### SerpAPI Service

```typescript
interface SerpAPIService {
  search(query: string, options?: SearchOptions): Promise<SearchResult>;
  newsSearch(query: string, options?: NewsOptions): Promise<NewsResult>;
  imageSearch(query: string, options?: ImageOptions): Promise<ImageResult>;
}
```

#### Configuration
```typescript
const serpAPIService = new SerpAPIService({
  apiKey: 'your-serpapi-key',
  engine: 'google' // google, bing, yahoo, etc.
});
```

### DuckDuckGo Service

```typescript
interface DuckDuckGoService {
  search(query: string, options?: DDGOptions): Promise<SearchResult>;
  instantAnswer(query: string): Promise<InstantAnswer>;
}
```

## 🔧 Utility Services

### Model Service

```typescript
interface ModelService {
  getAllModels(): ModelInfo[];
  getModelById(id: string): ModelInfo | undefined;
  getModelsByProvider(provider: string): ModelInfo[];
  calculateCost(modelId: string, promptTokens: number, completionTokens: number): number | null;
  getRecommendedModel(task: string, needsVision: boolean, prefersFree: boolean): ModelInfo;
}
```

#### Methods

##### `getRecommendedModel(task, needsVision, prefersFree)`
Recommends the best model for a specific task.

**Parameters:**
- `task: string` - Task description
- `needsVision: boolean` - Whether vision capabilities are needed
- `prefersFree: boolean` - Whether to prefer free models

**Returns:** `ModelInfo` - Recommended model

**Example:**
```typescript
const model = modelService.getRecommendedModel(
  'Generate creative content',
  false,
  true
);

console.log(`Recommended: ${model.name} by ${model.provider}`);
```

### Error Handling Service

```typescript
interface ErrorHandlingService {
  handleError(error: Error, context?: string): void;
  reportError(error: Error, metadata?: Record<string, any>): Promise<void>;
  getErrorSuggestions(error: Error): string[];
}
```

## 📊 Type Definitions

### Core Types

```typescript
interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: EdgeType;
  data?: EdgeData;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface Document {
  id: string;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  chunks: DocumentChunk[];
  createdAt: string;
}

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  type: 'text' | 'vision' | 'embedding';
  contextLength: number;
  costPerToken?: {
    input: number;
    output: number;
  };
}
```

### Configuration Types

```typescript
interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

interface SearchOptions {
  topK?: number;
  threshold?: number;
  filters?: Record<string, any>;
  rerank?: boolean;
}

interface DocumentMetadata {
  title?: string;
  author?: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
}
```

## 🔒 Authentication

### API Key Management

```typescript
interface APIKeyManager {
  setKey(provider: string, key: string): void;
  getKey(provider: string): string | null;
  removeKey(provider: string): void;
  validateKey(provider: string, key: string): Promise<boolean>;
}
```

### Workspace Context

```typescript
interface WorkspaceContext {
  workspaceId: string;
  apiKeys: Record<string, string>;
  settings: WorkspaceSettings;
  permissions: Permission[];
}
```

## 📈 Monitoring and Analytics

### Execution Metrics

```typescript
interface ExecutionMetrics {
  workflowId: string;
  executionTime: number;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
  success: boolean;
  errors?: string[];
}
```

### Usage Analytics

```typescript
interface UsageAnalytics {
  trackWorkflowExecution(workflowId: string, metrics: ExecutionMetrics): void;
  trackChatMessage(chatId: string, messageCount: number, tokenCount: number): void;
  trackDocumentUpload(documentId: string, size: number, processingTime: number): void;
  getUsageReport(timeRange: TimeRange): Promise<UsageReport>;
}
```

---

This API reference provides comprehensive documentation for all services and APIs in the AI Platform. For implementation examples and advanced usage patterns, refer to the Developer Guide.