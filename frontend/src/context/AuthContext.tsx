'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Mock user for development
const mockUser: User = {
  id: 'usr_001',
  username: 'Carlos_M',
  email: 'carlos@example.com',
  displayName: 'Carlos M.',
  role: 'admin', // Admin for dev purposes
  favoriteClub: 'Real Madrid',
  country: 'Spain',
  elo: 1247,
  rank: 3,
  createdAt: '2025-01-15T00:00:00Z',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(mockUser); // Default to mock user for dev
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Call backend API
      // const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      setUser(mockUser);
      localStorage.setItem('ppw-token', 'mock-jwt-token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Call backend API
      setUser({ ...mockUser, username, email });
      localStorage.setItem('ppw-token', 'mock-jwt-token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('ppw-token');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
