import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { login, checkToken, AuthResponse } from '../services/authService';
import api from '../services/api';

// Add specific error types
export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Extend the AuthContextType to include error handling and loading states
interface AuthContextType {
  user: AuthResponse | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isChecking: boolean;
  isLoading: boolean;
  error: string | null;
  reloadUser: () => Promise<void>;
  clearError: () => void;
}

// Create a more specific initial context state
const initialAuthContext: AuthContextType = {
  user: null,
  signIn: async () => {
    throw new AuthError('AuthContext not initialized');
  },
  signOut: () => {
    throw new AuthError('AuthContext not initialized');
  },
  isChecking: true,
  isLoading: false,
  error: null,
  reloadUser: async () => {
    throw new AuthError('AuthContext not initialized');
  },
  clearError: () => {
    throw new AuthError('AuthContext not initialized');
  },
};

export const AuthContext = createContext<AuthContextType>(initialAuthContext);

// Add props interface
interface AuthProviderProps {
  children: ReactNode;
  tokenKey?: string; // Allow custom token key
}

export function AuthProvider({ children, tokenKey = 'token' }: AuthProviderProps) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper functions for token management
  const setAuthToken = useCallback((token: string | null) => {
    if (token) {
      localStorage.setItem(tokenKey, token);
      api.defaults.headers.common['Authorization'] = token;
      console.log('✅ Token set:', token);
    } else {
      localStorage.removeItem(tokenKey);
      delete api.defaults.headers.common['Authorization'];
      console.log('🗑️ Token cleared');
    }
  }, [tokenKey]);

  // Initialize auth state
  const init = useCallback(async () => {
    const token = localStorage.getItem(tokenKey);

    if (!token) {
      setIsChecking(false);
      return;
    }

    console.log('📦 Token found during init');
    setAuthToken(token);

    try {
      const fresh = await checkToken();
      setUser(fresh);
      console.log('✅ Token validated');
    } catch (err) {
      console.error('❌ Token validation failed:', err);
      setAuthToken(null);
      setUser(null);
      setError('Session expired. Please sign in again.');
    } finally {
      setIsChecking(false);
    }
  }, [tokenKey, setAuthToken]);

  useEffect(() => {
    init();
  }, [init]);

  // Sign in implementation
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const auth = await login(email, password);
      setAuthToken(auth.token);
      setUser(auth);
      console.log('✅ Login successful');
    } catch (err) {
      console.error('❌ Login failed:', err);
      const errorMessage = err instanceof Error ? 
        err.message : 
        'Failed to sign in. Please try again.';
      setError(errorMessage);
      throw new AuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out implementation
  const signOut = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    console.log('👋 User signed out');
  }, [setAuthToken]);

  // Reload user implementation
  const reloadUser = async () => {
    const token = localStorage.getItem(tokenKey);
    if (!token) {
      console.log('⚠️ No token found during reload');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setAuthToken(token);
      const fresh = await checkToken();
      setUser(fresh);
      console.log('✅ User reloaded successfully');
    } catch (err) {
      console.error('❌ User reload failed:', err);
      setAuthToken(null);
      setUser(null);
      setError('Failed to reload user session');
      throw new AuthError('Session refresh failed');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider 
      value={{
        user,
        signIn,
        signOut,
        isChecking,
        isLoading,
        error,
        reloadUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth context
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new AuthError('useAuth must be used within an AuthProvider');
  }
  return context;
}