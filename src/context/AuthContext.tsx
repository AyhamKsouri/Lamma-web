import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { login, checkToken, AuthResponse } from '../services/authService';

interface AuthContextType {
  user: AuthResponse | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);

  // On mount, try to restore session
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const fresh = await checkToken();
          setUser(fresh);
        } catch {
          // invalid token
          localStorage.clear();
        }
      }
    };
    init();
  }, []);

  const signIn = async (email: string, password: string) => {
    const auth = await login(email, password);
    localStorage.setItem('token', auth.token);
    localStorage.setItem('user', JSON.stringify(auth));
    setUser(auth);
  };

  const signOut = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
