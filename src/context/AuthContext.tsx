import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { login, checkToken, AuthResponse } from '../services/authService';
import api from '../services/api'; // Axios instance

interface AuthContextType {
  user: AuthResponse | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isChecking: boolean;
  reloadUser: () => Promise<void>; // ✅ Added here
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: async () => {},
  signOut: () => {},
  isChecking: true,
  reloadUser: async () => {}, // ✅ Provide default
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const token = localStorage.getItem('token');

    if (token) {
      console.log('📦 Token found:', token);
      api.defaults.headers.common['Authorization'] = token;
      console.log('✅ Axios header set:', api.defaults.headers.common['Authorization']);

      try {
        const fresh = await checkToken();
        setUser(fresh);
      } catch (err) {
        console.error('❌ Invalid token, clearing auth header');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      }
    }

    setIsChecking(false);
  };

  const signIn = async (email: string, password: string) => {
    const auth = await login(email, password);
    console.log('✅ Login successful:', auth.token);
    localStorage.setItem('token', auth.token);
    api.defaults.headers.common['Authorization'] = auth.token;
    setUser(auth);
  };

  const signOut = () => {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    setUser(null);
  };

  const reloadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = token;
      try {
        const fresh = await checkToken();
        setUser(fresh);
      } catch (err) {
        console.error('❌ Failed to reload user from token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isChecking, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
}
