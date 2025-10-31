'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import PageLoading from './PageLoading';

interface LoadingContextType {
  isLoading: boolean;
  loadingText: string;
  setLoading: (loading: boolean, text?: string) => void;
  showPageLoading: (text?: string) => void;
  hidePageLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');

  const setLoading = (loading: boolean, text: string = 'Loading...') => {
    setIsLoading(loading);
    setLoadingText(text);
  };

  const showPageLoading = (text: string = 'Loading...') => {
    setLoading(true, text);
  };

  const hidePageLoading = () => {
    setLoading(false);
  };

  const value: LoadingContextType = {
    isLoading,
    loadingText,
    setLoading,
    showPageLoading,
    hidePageLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && <PageLoading text={loadingText} />}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export default LoadingContext;