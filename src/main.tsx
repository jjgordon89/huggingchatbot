
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeDatabase } from './lib/sqliteService';
import FallbackPage from './pages/FallbackPage.tsx';
import { AppSettingsProvider } from './context/AppSettingsContext';
import { AuthProvider } from './context/AuthContext';

const root = createRoot(document.getElementById("root")!);

// Render loading state first
root.render(<FallbackPage />);

// Initialize database then render the app
initializeDatabase()
  .then(() => {
    console.log("Database initialized successfully");
    root.render(
      <AuthProvider>
        <AppSettingsProvider>
          <App />
        </AppSettingsProvider>
      </AuthProvider>
    );
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    // Still render the app, it will handle database failure gracefully
    root.render(
      <AuthProvider>
        <AppSettingsProvider>
          <App />
        </AppSettingsProvider>
      </AuthProvider>
    );
  });
