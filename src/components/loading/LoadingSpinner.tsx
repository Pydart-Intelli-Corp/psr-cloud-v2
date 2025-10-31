'use client';

import React from 'react';
import Image from 'next/image';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
  className?: string;
  showText?: boolean;
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  className = '',
  showText = true,
  text = 'Loading...',
  fullScreen = false
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      container: 'w-6 h-6',
      text: 'text-sm'
    },
    medium: {
      container: 'w-10 h-10',
      text: 'text-base'
    },
    large: {
      container: 'w-16 h-16',
      text: 'text-lg'
    },
    xl: {
      container: 'w-24 h-24',
      text: 'text-xl'
    }
  };

  const config = sizeConfig[size];

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {/* Rotating Flower Spinner */}
      <div className={`relative ${config.container} animate-flower-spin`}>
        <Image
          src="/flower.png"
          alt="Loading"
          fill
          className="object-contain"
          priority
        />
      </div>
      
      {/* Loading Text */}
      {showText && (
        <p className={`${config.text} text-gray-600 font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  // Full screen overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;