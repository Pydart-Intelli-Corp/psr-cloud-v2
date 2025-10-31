'use client';

import React from 'react';

interface FormErrorProps {
  error?: string | null;
  className?: string;
}

/**
 * Reusable form error display component
 * Used across dairy, BMC, society, and machine forms
 */
const FormError: React.FC<FormErrorProps> = ({
  error,
  className = ''
}) => {
  if (!error) return null;

  return (
    <div className={`p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-xl text-sm ${className}`}>
      {error}
    </div>
  );
};

export default FormError;