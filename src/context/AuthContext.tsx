
import React, { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Simulate async login
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Dummy login attempt:', { email, password });
    // Simulate successful login with a dummy user
    setUser({
      id: 'dummy-user-123',
      name: 'Dummy User',
      email: email,
    });
  };

  const logout = () => {
    // Simulate logout
    console.log('Dummy logout');
    setUser(null);
  };

  const register = async (name: string, email: string, password: string) => {
    // Simulate async registration
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Dummy registration attempt:', { name, email, password });
    // In a real scenario, you might log the user in after registration
    // For this dummy service, we'll just resolve
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
