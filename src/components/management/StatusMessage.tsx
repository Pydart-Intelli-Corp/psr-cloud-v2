'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

interface StatusMessageProps {
  success?: string;
  error?: string;
  className?: string;
  onClose?: () => void;
}

/**
 * Reusable status message component for success and error notifications
 * Used across all management pages for consistent feedback
 * Styled as a modern snackbar with Material Design 3 principles
 */
const StatusMessage: React.FC<StatusMessageProps> = ({
  success,
  error,
  className = '',
  onClose
}) => {
  return (
    <AnimatePresence>
      {success && (
        <motion.div
          key="success-message"
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed top-6 right-6 z-[99999] flex items-center gap-3 p-4 pr-12 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-l-4 border-green-600 dark:border-green-500 text-green-800 dark:text-green-200 rounded-lg shadow-lg shadow-green-500/20 dark:shadow-green-500/10 backdrop-blur-sm max-w-md ${className}`}
        >
          <div className="flex-shrink-0 p-1 bg-green-100 dark:bg-green-900/50 rounded-full">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="flex-1 font-medium text-sm">{success}</p>
          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4 text-green-600 dark:text-green-400" />
            </button>
          )}
        </motion.div>
      )}
      {error && (
        <motion.div
          key="error-message"
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed top-6 right-6 z-[99999] flex items-center gap-3 p-4 pr-12 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-l-4 border-red-600 dark:border-red-500 text-red-800 dark:text-red-200 rounded-lg shadow-lg shadow-red-500/20 dark:shadow-red-500/10 backdrop-blur-sm max-w-md ${className}`}
        >
          <div className="flex-shrink-0 p-1 bg-red-100 dark:bg-red-900/50 rounded-full">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <p className="flex-1 font-medium text-sm">{error}</p>
          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatusMessage;