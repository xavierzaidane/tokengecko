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
  logout: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_KEY = 'tokengecko_user_session';
const TOKEN_KEY = 'tokengecko_access_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedToken = localStorage.getItem(TOKEN_KEY);
        if (cachedToken) {
          insforge.setAccessToken(cachedToken);
        }
        const cachedUser = localStorage.getItem(SESSION_KEY);
        if (cachedUser) {
          return JSON.parse(cachedUser);
        }
      } catch {
        // Fallback
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (typeof window !== 'undefined') {
        const cachedToken = localStorage.getItem(TOKEN_KEY);
        if (cachedToken) {
          insforge.setAccessToken(cachedToken);
        }
        const cached = localStorage.getItem(SESSION_KEY);
        if (cached && !user) {
          try {
            setUser(JSON.parse(cached));
          } catch {
            // Ignore parse error
          }
        }
      }

      const { data, error } = await insforge.auth.getCurrentUser();
      if (data?.user) {
        const updatedUser = data.user as User;
        setUser(updatedUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
        }
      } else if (error && (error as any)?.status === 401 && typeof window !== 'undefined') {
        // Only clear session if explicitly unauthenticated (401) by server
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
        insforge.setAccessToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to get current user:', err);
      // Preserve cached session on network error or offline mode
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
      const signedInUser = data.user as User;
      setUser(signedInUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_KEY, JSON.stringify(signedInUser));
        if ((data as any).accessToken) {
          localStorage.setItem(TOKEN_KEY, (data as any).accessToken);
          insforge.setAccessToken((data as any).accessToken);
        }
      }
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
    if (data?.user) {
      const newUser = data.user as User;
      setUser(newUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
        if ((data as any).accessToken) {
          localStorage.setItem(TOKEN_KEY, (data as any).accessToken);
          insforge.setAccessToken((data as any).accessToken);
        }
      }
    }
    setIsLoading(false);
    return { error };
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await insforge.auth.signOut();
    } catch {
      // Ignore sign out errors
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
        insforge.setAccessToken(null);
      }
      setUser(null);
      setIsLoading(false);
    }
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
        logout: signOut,
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
