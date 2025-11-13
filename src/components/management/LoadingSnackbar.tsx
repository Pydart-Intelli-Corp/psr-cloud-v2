'use client';

import React from 'react';
import { FlowerSpinner } from '@/components';

interface LoadingSnackbarProps {
  isVisible: boolean;
  message: string;
  submessage?: string;
  progress?: number; // 0-100
  showProgress?: boolean;
}

/**
 * Reusable loading snackbar with progress indicator
 * Appears in top-right corner
 */
const LoadingSnackbar: React.FC<LoadingSnackbarProps> = ({
  isVisible,
  message,
  submessage = 'Please wait',
  progress = 0,
  showProgress = true
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-6 right-6 z-[99999] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[320px] max-w-sm animate-slide-down">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <FlowerSpinner size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {message}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {submessage}
          </p>
          {showProgress && (
            <>
              {/* Progress Bar */}
              <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {/* Progress Percentage */}
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Progress
                </span>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                  {Math.round(progress)}%
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingSnackbar;
