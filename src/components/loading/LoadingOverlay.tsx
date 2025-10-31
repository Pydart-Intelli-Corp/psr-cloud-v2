'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  className?: string;
  children?: React.ReactNode;
}

/**
 * LoadingOverlay - Wraps content and shows loading state when needed
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = 'Loading...',
  size = 'medium',
  className = '',
  children
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-40 flex items-center justify-center rounded-lg">
          <LoadingSpinner 
            size={size} 
            text={text}
            showText={true}
          />
        </div>
      )}
    </div>
  );
};

export default LoadingOverlay;