import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getUsers, User } from '../api/api';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AUTH_USER_ID_KEY = 'auth_user_id';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync(AUTH_USER_ID_KEY);

        if (!storedUserId) {
          return;
        }

        const users = await getUsers();
        const restoredUser = users.find(user => user.id === storedUserId);

        if (restoredUser) {
          setCurrentUser(restoredUser);
        } else {
          await SecureStore.deleteItemAsync(AUTH_USER_ID_KEY);
        }
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const users = await getUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find(
      item => item.email.toLowerCase() === normalizedEmail && item.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    await SecureStore.setItemAsync(AUTH_USER_ID_KEY, user.id);
    setCurrentUser(user);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(AUTH_USER_ID_KEY);
    setCurrentUser(null);
  };

  const value: AuthContextType = {
    currentUser,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
