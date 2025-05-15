import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  name: string;
  avatarUrl: string;
}

interface UserContextType {
  user: User;
  setUser: (u: User) => void;
}

const defaultUser: User = {
  name: 'John Doe',
  avatarUrl: '/images/avatar.png',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(defaultUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
