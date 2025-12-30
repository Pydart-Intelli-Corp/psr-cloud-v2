'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Mail, X, Send, Settings, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ColumnSelector, { ColumnConfig } from './ColumnSelector';

interface EnhancedEmailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: string, selectedColumns: string[]) => Promise<void>;
  defaultEmail?: string;
  recordCount?: number;
  reportType?: string;
  availableColumns: ColumnConfig[];
  defaultColumns: string[];
}

export default function EnhancedEmailReportModal({
  isOpen,
  onClose,
  onSend,
  defaultEmail = '',
  recordCount = 0,
  reportType = 'Report',
  availableColumns,
  defaultColumns
}: EnhancedEmailReportModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(defaultColumns);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // Update email when defaultEmail changes
  useEffect(() => {
    if (isOpen && defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [isOpen, defaultEmail]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedColumns(defaultColumns);
      setError('');
    }
  }, [isOpen, defaultColumns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError('Email address is required');
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (selectedColumns.length === 0) {
      setError('Please select at least one column to include in the report');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSend(email, selectedColumns);
      onClose();
      setEmail('');
      setSelectedColumns(defaultColumns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedColumnLabels = () => {
    return selectedColumns
      .map(key => availableColumns.find(col => col.key === key)?.label)
      .filter(Boolean)
      .slice(0, 8); // Show first 8 columns
  };

  if (!isOpen) return null;

  const modalContent = (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={onClose}
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Email {reportType}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Send report to your email
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    disabled={loading}
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                  disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter your email address"
                        disabled={loading}
                        required
                      />
                    </div>

                    {/* Column Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Report Columns
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowColumnSelector(true)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 
                                    text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 
                                    dark:hover:bg-blue-800 transition-colors"
                          disabled={loading}
                        >
                          <Settings className="w-3 h-3" />
                          Customize
                        </button>
                      </div>
                      
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {selectedColumns.length} columns selected
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {getSelectedColumnLabels().map((label, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 
                                        text-blue-700 dark:text-blue-300 rounded"
                            >
                              {label}
                            </span>
                          ))}
                          {selectedColumns.length > 8 && (
                            <span className="inline-block px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 
                                            text-gray-600 dark:text-gray-400 rounded">
                              +{selectedColumns.length - 8} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Report Info */}
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>
                          Report will include {recordCount} records in both CSV and PDF formats
                        </span>
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                      >
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                                  bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                  rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors
                                  disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 
                                  rounded-lg hover:bg-blue-700 transition-colors flex items-center 
                                  justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || !email.trim() || selectedColumns.length === 0}
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {loading ? 'Sending...' : 'Send Report'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Column Selector Modal */}
      <ColumnSelector
        isOpen={showColumnSelector}
        onClose={() => setShowColumnSelector(false)}
        onApply={setSelectedColumns}
        availableColumns={availableColumns}
        selectedColumns={selectedColumns}
        defaultColumns={defaultColumns}
        title={`Select ${reportType} Columns`}
      />
    </>
  );

  return createPortal(modalContent, document.body);
}