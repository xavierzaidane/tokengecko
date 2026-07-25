'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge/client';

export interface UserProfile {
  name?: string;
  avatar_url?: string;
  [key: string]: any;
}

export interface User {
  id: string;
  email: string;
  emailVerified?: boolean;
  providers?: string[];
  createdAt?: string;
  updatedAt?: string;
  profile?: UserProfile;
  metadata?: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await insforge.auth.getCurrentUser();
      if (data?.user) {
        setUser(data.user as User);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to get current user:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    if (data?.user) {
      setUser(data.user as User);
    }
    setIsLoading(false);
    return { error };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name,
    });
    if (data?.user && data.accessToken) {
      setUser(data.user as User);
    }
    setIsLoading(false);
    return { error };
  };

  const signOut = async () => {
    setIsLoading(true);
    await insforge.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/inspector` : '';
    await insforge.auth.signInWithOAuth(provider, { redirectTo });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signInWithPassword,
        signUp,
        signOut,
        signInWithOAuth,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
