'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface BulkDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemCount: number;
  itemType: string; // e.g., 'farmer', 'BMC', 'society'
  hasFilters?: boolean;
  additionalInfo?: string; // Optional additional information to display
}

/**
 * Reusable bulk delete confirmation modal
 * Used across all entity management pages
 * Note: Loading state is handled by LoadingSnackbar in parent component
 */
const BulkDeleteConfirmModal: React.FC<BulkDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemCount,
  itemType,
  hasFilters = false,
  additionalInfo
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Delete Selected {itemType.charAt(0).toUpperCase() + itemType.slice(1)}s
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Are you sure you want to delete {itemCount} selected {itemType}(s)
            {hasFilters ? ' from the filtered results' : ''}? 
            This action cannot be undone.
          </p>
          {additionalInfo && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-4 font-medium break-words">
              {additionalInfo}
            </p>
          )}
          <div className="flex space-x-4 justify-center mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkDeleteConfirmModal;
