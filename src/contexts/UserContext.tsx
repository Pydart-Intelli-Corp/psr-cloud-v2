'use client';

import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/user';
import { useUserProfile } from '@/hooks/useEntityData';
import { useQueryClient } from '@tanstack/react-query';

interface User {
  id: number;
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  dbKey?: string;
  companyName?: string;
  companyPincode?: string;
  companyCity?: string;
  companyState?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Use React Query hook for cached profile data
  const { data: user, isLoading: loading, error: queryError, refetch } = useUserProfile();
  const error = queryError ? String(queryError) : null;

  const fetchUser = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      // Clear all cached queries on logout
      queryClient.clear();
      router.push('/login');
    }
  }, [router, queryClient]);

  const updateUser = useCallback((userData: Partial<User>) => {
    // Update cache with new user data
    queryClient.setQueryData(['userProfile'], (old: User | undefined) => 
      old ? { ...old, ...userData } : undefined
    );
  }, [queryClient]);

  // Redirect to login if authentication fails
  useEffect(() => {
    if (error && error.includes('Authentication failed')) {
      router.push('/login');
    }
  }, [error, router]);

  return (
    <UserContext.Provider value={{ user, loading, error, fetchUser, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
