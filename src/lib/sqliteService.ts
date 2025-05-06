
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

// SQLite database instance
let db: Database.Database | null = null;

/**
 * Initialize the SQLite database
 */
export function initializeDatabase(): void {
  try {
    // Use in-memory database for web context
    db = new Database(':memory:');
    
    console.log('SQLite database initialized successfully');
    createSchema();
  } catch (error) {
    console.error('Error initializing SQLite database:', error);
    throw new Error(`Failed to initialize SQLite database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create the database schema for workspaces, documents, and chats
 */
function createSchema(): void {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    // Create workspaces table
    db.exec(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        llm_config TEXT,
        agent_config TEXT,
        tags TEXT,
        pinned INTEGER DEFAULT 0,
        last_accessed TEXT
      )
    `);

    // Create documents table
    db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        content TEXT,
        type TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE
      )
    `);

    // Create chat_messages table
    db.exec(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        chat_id TEXT NOT NULL,
        content TEXT NOT NULL,
        role TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE
      )
    `);
    
    // Create chats table
    db.exec(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        title TEXT,
        created_at TEXT NOT NULL,
        last_message_at TEXT,
        FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE
      )
    `);
    
    // Create vector_documents table for RAG
    db.exec(`
      CREATE TABLE IF NOT EXISTS vector_documents (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        metadata TEXT,
        FOREIGN KEY (workspace_id) REFERENCES workspaces (id) ON DELETE CASCADE
      )
    `);

    console.log('Database schema created successfully');
  } catch (error) {
    console.error('Error creating database schema:', error);
    throw new Error(`Failed to create database schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all workspaces from the database
 */
export function getAllWorkspaces(): any[] {
  if (!db) {
    initializeDatabase();
  }
  
  try {
    const stmt = db!.prepare('SELECT * FROM workspaces ORDER BY last_accessed DESC');
    const rows = stmt.all();
    
    // Convert JSON strings back to objects
    return rows.map((row: any) => ({
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : [],
      llmConfig: row.llm_config ? JSON.parse(row.llm_config) : undefined,
      agentConfig: row.agent_config ? JSON.parse(row.agent_config) : undefined,
      createdAt: new Date(row.created_at),
      lastAccessed: row.last_accessed ? new Date(row.last_accessed) : undefined,
      pinned: Boolean(row.pinned)
    }));
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return [];
  }
}

/**
 * Create a new workspace
 */
export function createWorkspace(workspace: {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  llmConfig?: any;
  agentConfig?: any;
  tags?: string[];
  pinned?: boolean;
}): any {
  if (!db) {
    initializeDatabase();
  }
  
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = db!.prepare(`
      INSERT INTO workspaces (
        id, name, description, created_at, icon, color, 
        llm_config, agent_config, tags, pinned, last_accessed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      workspace.name,
      workspace.description || null,
      now,
      workspace.icon || null,
      workspace.color || null,
      workspace.llmConfig ? JSON.stringify(workspace.llmConfig) : null,
      workspace.agentConfig ? JSON.stringify(workspace.agentConfig) : null,
      workspace.tags ? JSON.stringify(workspace.tags) : null,
      workspace.pinned ? 1 : 0,
      now
    );
    
    return {
      id,
      name: workspace.name,
      description: workspace.description,
      createdAt: new Date(now),
      lastAccessed: new Date(now),
      icon: workspace.icon,
      color: workspace.color,
      llmConfig: workspace.llmConfig,
      agentConfig: workspace.agentConfig,
      tags: workspace.tags || [],
      pinned: Boolean(workspace.pinned)
    };
  } catch (error) {
    console.error('Error creating workspace:', error);
    throw new Error(`Failed to create workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update an existing workspace
 */
export function updateWorkspace(id: string, data: Partial<{
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  llmConfig?: any;
  agentConfig?: any;
  tags?: string[];
  pinned?: boolean;
}>): boolean {
  if (!db) {
    initializeDatabase();
  }
  
  try {
    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];
    
    Object.entries(data).forEach(([key, value]) => {
      let column: string;
      let processedValue: any = value;
      
      switch (key) {
        case 'llmConfig':
          column = 'llm_config';
          processedValue = value ? JSON.stringify(value) : null;
          break;
        case 'agentConfig':
          column = 'agent_config';
          processedValue = value ? JSON.stringify(value) : null;
          break;
        case 'tags':
          column = 'tags';
          processedValue = value ? JSON.stringify(value) : null;
          break;
        case 'pinned':
          column = 'pinned';
          processedValue = value ? 1 : 0;
          break;
        default:
          column = key.replace(/([A-Z])/g, '_$1').toLowerCase(); // Convert camelCase to snake_case
      }
      
      updates.push(`${column} = ?`);
      values.push(processedValue);
    });
    
    // Always update last_accessed
    updates.push('last_accessed = ?');
    values.push(now);
    
    // Add id as the last parameter for WHERE clause
    values.push(id);
    
    const stmt = db!.prepare(`
      UPDATE workspaces SET ${updates.join(', ')} WHERE id = ?
    `);
    
    const result = stmt.run(...values);
    return result.changes > 0;
  } catch (error) {
    console.error('Error updating workspace:', error);
    return false;
  }
}

/**
 * Delete a workspace
 */
export function deleteWorkspace(id: string): boolean {
  if (!db) {
    initializeDatabase();
  }
  
  try {
    const stmt = db!.prepare('DELETE FROM workspaces WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return false;
  }
}

/**
 * Get workspace by ID
 */
export function getWorkspace(id: string): any | null {
  if (!db) {
    initializeDatabase();
  }
  
  try {
    const stmt = db!.prepare('SELECT * FROM workspaces WHERE id = ?');
    const row = stmt.get(id);
    
    if (!row) return null;
    
    return {
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : [],
      llmConfig: row.llm_config ? JSON.parse(row.llm_config) : undefined,
      agentConfig: row.agent_config ? JSON.parse(row.agent_config) : undefined,
      createdAt: new Date(row.created_at),
      lastAccessed: row.last_accessed ? new Date(row.last_accessed) : undefined,
      pinned: Boolean(row.pinned)
    };
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return null;
  }
}

/**
 * Add a document to a workspace
 */
export function addDocument(workspaceId: string, document: { id: string; name: string; path: string; content?: string; type?: string }): boolean {
  if (!db) {
    initializeDatabase();
  }
  
  try {
    const now = new Date().toISOString();
    
    const stmt = db!.prepare(`
      INSERT INTO documents (id, workspace_id, name, path, content, type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      document.id,
      workspaceId,
      document.name,
      document.path,
      document.content || null,
      document.type || null,
      now
    );
    
    return true;
  } catch (error) {
    console.error('Error adding document:', error);
    return false;
  }
}

/**
 * List documents in a workspace
 */
export function listDocuments(workspaceId: string): any[] {
  if (!db) {
    initializeDatabase();
  }
  
  try {
    const stmt = db!.prepare('SELECT id, name, path FROM documents WHERE workspace_id = ?');
    return stmt.all(workspaceId);
  } catch (error) {
    console.error('Error listing documents:', error);
    return [];
  }
}

/**
 * Delete a document
 */
export function deleteDocument(workspaceId: string, documentId: string): boolean {
  if (!db) {
    initializeDatabase();
  }
  
  try {
    const stmt = db!.prepare('DELETE FROM documents WHERE workspace_id = ? AND id = ?');
    const result = stmt.run(workspaceId, documentId);
    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
}

/**
 * Create a new chat in a workspace
 */
export function createChat(workspaceId: string, title?: string): string {
  if (!db) {
    initializeDatabase();
  }
  
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = db!.prepare(`
      INSERT INTO chats (id, workspace_id, title, created_at, last_message_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, workspaceId, title || null, now, now);
    return id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw new Error(`Failed to create chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get chats for a workspace
 */
export function getChats(workspaceId: string): any[] {
  if (!db) {
    initializeDatabase();
  }
  
  try {
    const stmt = db!.prepare(`
      SELECT c.*, 
        (SELECT content FROM chat_messages 
         WHERE chat_id = c.id ORDER BY timestamp DESC LIMIT 1) as last_message
      FROM chats c
      WHERE c.workspace_id = ?
      ORDER BY c.last_message_at DESC
    `);
    
    const rows = stmt.all(workspaceId);
    
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      createdAt: new Date(row.created_at),
      lastMessageAt: row.last_message_at ? new Date(row.last_message_at) : null,
      lastMessage: row.last_message
    }));
  } catch (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
}

/**
 * Delete chats for a workspace
 */
export function deleteChats(workspaceId: string): boolean {
  if (!db) {
    initializeDatabase();
  }
  
  try {
    // First delete all messages
    const deleteMessagesStmt = db!.prepare('DELETE FROM chat_messages WHERE workspace_id = ?');
    deleteMessagesStmt.run(workspaceId);
    
    // Then delete all chats
    const deleteChatsStmt = db!.prepare('DELETE FROM chats WHERE workspace_id = ?');
    const result = deleteChatsStmt.run(workspaceId);
    
    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting chats:', error);
    return false;
  }
}

/**
 * Add a message to a chat
 */
export function addMessage(chatId: string, workspaceId: string, message: { role: string; content: string }): string {
  if (!db) {
    initializeDatabase();
  }
  
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    // Add the message
    const msgStmt = db!.prepare(`
      INSERT INTO chat_messages (id, chat_id, workspace_id, role, content, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    msgStmt.run(id, chatId, workspaceId, message.role, message.content, now);
    
    // Update the chat's last_message_at
    const chatStmt = db!.prepare(`
      UPDATE chats SET last_message_at = ? WHERE id = ?
    `);
    
    chatStmt.run(now, chatId);
    
    return id;
  } catch (error) {
    console.error('Error adding message:', error);
    throw new Error(`Failed to add message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get messages for a chat
 */
export function getMessages(chatId: string): any[] {
  if (!db) {
    initializeDatabase();
  }
  
  try {
    const stmt = db!.prepare(`
      SELECT * FROM chat_messages
      WHERE chat_id = ?
      ORDER BY timestamp ASC
    `);
    
    const rows = stmt.all(chatId);
    
    return rows.map((row: any) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      timestamp: new Date(row.timestamp)
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

// Initialize the database when this module is loaded
try {
  initializeDatabase();
} catch (error) {
  console.error('Failed to initialize database on module load:', error);
}

// Export the SQLite service
export const sqliteService = {
  initializeDatabase,
  getAllWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspace,
  addDocument,
  listDocuments,
  deleteDocument,
  createChat,
  getChats,
  deleteChats,
  addMessage,
  getMessages
};

export default sqliteService;
