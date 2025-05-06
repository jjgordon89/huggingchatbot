
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeDatabase } from './lib/sqliteService';

// Initialize SQLite database before rendering the app
try {
  initializeDatabase();
  console.log("SQLite database initialized successfully");
} catch (error) {
  console.error("Failed to initialize SQLite database:", error);
}

createRoot(document.getElementById("root")!).render(<App />);
