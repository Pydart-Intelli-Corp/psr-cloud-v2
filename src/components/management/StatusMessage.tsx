'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatusMessageProps {
  success?: string;
  error?: string;
  className?: string;
}

/**
 * Reusable status message component for success and error notifications
 * Used across all management pages for consistent feedback
 */
const StatusMessage: React.FC<StatusMessageProps> = ({
  success,
  error,
  className = ''
}) => {
  return (
    <AnimatePresence>
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg ${className}`}
        >
          ✓ {success}
        </motion.div>
      )}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg ${className}`}
        >
          ✕ {error}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatusMessage;