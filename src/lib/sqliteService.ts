
import { v4 as uuidv4 } from 'uuid';

// Mock database tables using IndexedDB
let db: IDBDatabase | null = null;
const DB_NAME = "app_database";
const DB_VERSION = 1;

// Define store names
const STORES = {
  WORKSPACES: "workspaces",
  DOCUMENTS: "documents",
  CHAT_MESSAGES: "chat_messages",
  CHATS: "chats",
  VECTOR_DOCUMENTS: "vector_documents"
};

/**
 * Initialize the database
 */
export function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = (event) => {
        console.error('Database error:', (event.target as IDBRequest).error);
        reject('Failed to initialize database');
      };
      
      request.onsuccess = (event) => {
        db = (event.target as IDBOpenDBRequest).result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;
        
        // Create workspaces store
        if (!database.objectStoreNames.contains(STORES.WORKSPACES)) {
          const workspacesStore = database.createObjectStore(STORES.WORKSPACES, { keyPath: 'id' });
          workspacesStore.createIndex('name', 'name', { unique: false });
          workspacesStore.createIndex('pinned', 'pinned', { unique: false });
          workspacesStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        }
        
        // Create documents store
        if (!database.objectStoreNames.contains(STORES.DOCUMENTS)) {
          const documentsStore = database.createObjectStore(STORES.DOCUMENTS, { keyPath: 'id' });
          documentsStore.createIndex('workspaceId', 'workspaceId', { unique: false });
          documentsStore.createIndex('name', 'name', { unique: false });
        }
        
        // Create chat messages store
        if (!database.objectStoreNames.contains(STORES.CHAT_MESSAGES)) {
          const chatMessagesStore = database.createObjectStore(STORES.CHAT_MESSAGES, { keyPath: 'id' });
          chatMessagesStore.createIndex('workspaceId', 'workspaceId', { unique: false });
          chatMessagesStore.createIndex('chatId', 'chatId', { unique: false });
          chatMessagesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Create chats store
        if (!database.objectStoreNames.contains(STORES.CHATS)) {
          const chatsStore = database.createObjectStore(STORES.CHATS, { keyPath: 'id' });
          chatsStore.createIndex('workspaceId', 'workspaceId', { unique: false });
          chatsStore.createIndex('lastMessageAt', 'lastMessageAt', { unique: false });
        }
        
        // Create vector documents store
        if (!database.objectStoreNames.contains(STORES.VECTOR_DOCUMENTS)) {
          const vectorDocsStore = database.createObjectStore(STORES.VECTOR_DOCUMENTS, { keyPath: 'id' });
          vectorDocsStore.createIndex('workspaceId', 'workspaceId', { unique: false });
          vectorDocsStore.createIndex('type', 'type', { unique: false });
        }
      };
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
      reject('Failed to initialize database');
    }
  });
}

/**
 * Generic method to run a transaction
 */
function runTransaction<T>(
  storeName: string, 
  mode: IDBTransactionMode, 
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    try {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      
      const request = callback(store);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get all workspaces from the database
 */
export async function getAllWorkspaces(): Promise<any[]> {
  try {
    return await runTransaction<any[]>(STORES.WORKSPACES, 'readonly', (store) => {
      return store.getAll();
    });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return [];
  }
}

/**
 * Create a new workspace
 */
export async function createWorkspace(workspace: {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  llmConfig?: any;
  agentConfig?: any;
  tags?: string[];
  pinned?: boolean;
}): Promise<any> {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newWorkspace = {
      id,
      name: workspace.name,
      description: workspace.description || null,
      createdAt: now,
      icon: workspace.icon || null,
      color: workspace.color || null,
      llmConfig: workspace.llmConfig || null,
      agentConfig: workspace.agentConfig || null,
      tags: workspace.tags || [],
      pinned: workspace.pinned || false,
      lastAccessed: now
    };
    
    await runTransaction(STORES.WORKSPACES, 'readwrite', (store) => {
      return store.add(newWorkspace);
    });
    
    return newWorkspace;
  } catch (error) {
    console.error('Error creating workspace:', error);
    throw new Error(`Failed to create workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update an existing workspace
 */
export async function updateWorkspace(id: string, data: any): Promise<boolean> {
  try {
    const workspace = await getWorkspace(id);
    
    if (!workspace) {
      return false;
    }
    
    const updateData = { ...workspace, ...data, lastAccessed: new Date().toISOString() };
    
    await runTransaction(STORES.WORKSPACES, 'readwrite', (store) => {
      return store.put(updateData);
    });
    
    return true;
  } catch (error) {
    console.error('Error updating workspace:', error);
    return false;
  }
}

/**
 * Delete a workspace
 */
export async function deleteWorkspace(id: string): Promise<boolean> {
  try {
    await runTransaction(STORES.WORKSPACES, 'readwrite', (store) => {
      return store.delete(id);
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return false;
  }
}

/**
 * Get workspace by ID
 */
export async function getWorkspace(id: string): Promise<any | null> {
  try {
    return await runTransaction<any>(STORES.WORKSPACES, 'readonly', (store) => {
      return store.get(id);
    });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return null;
  }
}

/**
 * Add a document to a workspace
 */
export async function addDocument(workspaceId: string, document: { 
  id?: string; 
  name: string; 
  path: string; 
  content?: string; 
  type?: string;
}): Promise<boolean> {
  try {
    const docId = document.id || uuidv4();
    const now = new Date().toISOString();
    
    const newDoc = {
      id: docId,
      workspaceId,
      name: document.name,
      path: document.path,
      content: document.content || null,
      type: document.type || null,
      createdAt: now
    };
    
    await runTransaction(STORES.DOCUMENTS, 'readwrite', (store) => {
      return store.add(newDoc);
    });
    
    return true;
  } catch (error) {
    console.error('Error adding document:', error);
    return false;
  }
}

/**
 * List documents in a workspace
 */
export async function listDocuments(workspaceId: string): Promise<any[]> {
  try {
    return await runTransaction<any[]>(STORES.DOCUMENTS, 'readonly', (store) => {
      const index = store.index('workspaceId');
      return index.getAll(workspaceId);
    });
  } catch (error) {
    console.error('Error listing documents:', error);
    return [];
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(workspaceId: string, documentId: string): Promise<boolean> {
  try {
    const doc = await runTransaction<any>(STORES.DOCUMENTS, 'readonly', (store) => {
      return store.get(documentId);
    });
    
    if (doc && doc.workspaceId === workspaceId) {
      await runTransaction(STORES.DOCUMENTS, 'readwrite', (store) => {
        return store.delete(documentId);
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
}

/**
 * Create a new chat in a workspace
 */
export async function createChat(workspaceId: string, title?: string): Promise<string> {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newChat = {
      id,
      workspaceId,
      title: title || null,
      createdAt: now,
      lastMessageAt: now
    };
    
    await runTransaction(STORES.CHATS, 'readwrite', (store) => {
      return store.add(newChat);
    });
    
    return id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw new Error(`Failed to create chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get chats for a workspace
 */
export async function getChats(workspaceId: string): Promise<any[]> {
  try {
    const chats = await runTransaction<any[]>(STORES.CHATS, 'readonly', (store) => {
      const index = store.index('workspaceId');
      return index.getAll(workspaceId);
    });
    
    // Get the last message for each chat
    const chatsWithLastMessage = await Promise.all(
      chats.map(async (chat) => {
        const messages = await runTransaction<any[]>(STORES.CHAT_MESSAGES, 'readonly', (store) => {
          const index = store.index('chatId');
          return index.getAll(chat.id);
        });
        
        // Sort messages by timestamp in descending order
        messages.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        return {
          ...chat,
          lastMessage: messages.length > 0 ? messages[0].content : null
        };
      })
    );
    
    // Sort chats by lastMessageAt in descending order
    return chatsWithLastMessage.sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
}

/**
 * Delete chats for a workspace
 */
export async function deleteChats(workspaceId: string): Promise<boolean> {
  try {
    // Get all chats for the workspace
    const chats = await runTransaction<any[]>(STORES.CHATS, 'readonly', (store) => {
      const index = store.index('workspaceId');
      return index.getAll(workspaceId);
    });
    
    // Delete all messages for each chat
    for (const chat of chats) {
      const messages = await runTransaction<any[]>(STORES.CHAT_MESSAGES, 'readonly', (store) => {
        const index = store.index('chatId');
        return index.getAll(chat.id);
      });
      
      for (const message of messages) {
        await runTransaction(STORES.CHAT_MESSAGES, 'readwrite', (store) => {
          return store.delete(message.id);
        });
      }
      
      // Delete the chat
      await runTransaction(STORES.CHATS, 'readwrite', (store) => {
        return store.delete(chat.id);
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting chats:', error);
    return false;
  }
}

/**
 * Add a message to a chat
 */
export async function addMessage(chatId: string, workspaceId: string, message: { role: string; content: string }): Promise<string> {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newMessage = {
      id,
      chatId,
      workspaceId,
      role: message.role,
      content: message.content,
      timestamp: now
    };
    
    // Add the message
    await runTransaction(STORES.CHAT_MESSAGES, 'readwrite', (store) => {
      return store.add(newMessage);
    });
    
    // Update the chat's last_message_at
    const chat = await runTransaction<any>(STORES.CHATS, 'readonly', (store) => {
      return store.get(chatId);
    });
    
    if (chat) {
      chat.lastMessageAt = now;
      await runTransaction(STORES.CHATS, 'readwrite', (store) => {
        return store.put(chat);
      });
    }
    
    return id;
  } catch (error) {
    console.error('Error adding message:', error);
    throw new Error(`Failed to add message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get messages for a chat
 */
export async function getMessages(chatId: string): Promise<any[]> {
  try {
    const messages = await runTransaction<any[]>(STORES.CHAT_MESSAGES, 'readonly', (store) => {
      const index = store.index('chatId');
      return index.getAll(chatId);
    });
    
    // Sort messages by timestamp
    return messages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

// Export the SQLite service as an object with all the functions
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
