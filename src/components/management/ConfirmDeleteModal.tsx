'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: string;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  className?: string;
}

/**
 * Reusable confirmation delete modal component
 * Used across all management pages for consistent delete confirmation
 */
const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  className = ''
}) => {
  const defaultTitle = `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;
  const defaultMessage = `Are you sure you want to delete`;
  const defaultConfirmText = `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[9999] p-4 ${className}`}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-gray-100 mb-2">
                {title || defaultTitle}
              </h3>
              
              <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
                {message || defaultMessage}{' '}
                <span className="font-semibold text-gray-900 dark:text-gray-100">{itemName}</span>? 
                This action cannot be undone.
              </p>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full px-4 py-2.5 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="w-full flex items-center justify-center px-4 py-2.5 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {confirmText || defaultConfirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDeleteModal;