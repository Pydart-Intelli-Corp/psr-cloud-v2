'use client';

import React from 'react';
import FlowerSpinner from '../loading/FlowerSpinner';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit?: () => void;
  submitText: string;
  isLoading?: boolean;
  isSubmitDisabled?: boolean;
  showBorder?: boolean;
  cancelText?: string;
  submitType?: 'button' | 'submit';
  loadingText?: string;
  submitIcon?: React.ReactNode;
}

/**
 * Reusable form actions component with consistent button styling
 * Used across dairy, BMC, society, and machine forms
 */
const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  submitText,
  isLoading = false,
  isSubmitDisabled = false,
  showBorder = true,
  cancelText = 'Cancel',
  submitType = 'submit',
  loadingText,
  submitIcon
}) => {
  const borderClass = showBorder ? 'border-t border-gray-200 dark:border-gray-700' : '';

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
    }
  };

  const displayText = isLoading && loadingText ? loadingText : submitText;

  return (
    <div className={`flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 mt-6 sm:justify-end ${borderClass}`}>
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 sm:flex-none px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors font-medium disabled:opacity-50"
        disabled={isLoading}
      >
        {cancelText}
      </button>
      <button
        type={submitType}
        onClick={submitType === 'button' ? handleSubmit : undefined}
        disabled={isLoading || isSubmitDisabled}
        className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <FlowerSpinner size={16} />
        ) : (
          submitIcon && <span>{submitIcon}</span>
        )}
        <span>{displayText}</span>
      </button>
    </div>
  );
};

export default FormActions;