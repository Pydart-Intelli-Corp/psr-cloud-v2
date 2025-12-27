'use client';

import React from 'react';
import FlowerSpinner from '../loading/FlowerSpinner';

interface PageLoaderProps {
  text?: string;
  size?: number;
}

/**
 * Reusable page loader component for consistent loading experience across all pages
 * Used when navigating between pages or loading page data
 */
export const PageLoader: React.FC<PageLoaderProps> = ({ 
  text, 
  size = 48 
}) => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] w-full bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <FlowerSpinner size={size} />
        {text && (
          <p className="text-gray-600 dark:text-gray-400 text-sm animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};
