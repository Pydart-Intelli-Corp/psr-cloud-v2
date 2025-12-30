'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, X, FileDown, Settings, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ColumnSelector, { ColumnConfig } from './ColumnSelector';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (format: 'csv' | 'pdf', selectedColumns: string[]) => void;
  recordCount?: number;
  reportType?: string;
  availableColumns: ColumnConfig[];
  defaultColumns: string[];
}

export default function DownloadModal({
  isOpen,
  onClose,
  onDownload,
  recordCount = 0,
  reportType = 'Report',
  availableColumns,
  defaultColumns
}: DownloadModalProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(defaultColumns);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedColumns(defaultColumns);
    }
  }, [isOpen, defaultColumns]);

  const handleDownload = (format: 'csv' | 'pdf') => {
    if (selectedColumns.length === 0) return;
    onDownload(format, selectedColumns);
    onClose();
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
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Download {reportType}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Choose format and columns
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
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

                  {/* Format Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Download Format
                    </label>
                    <div className="space-y-2">
                      {/* CSV Option */}
                      <button
                        onClick={() => handleDownload('csv')}
                        disabled={selectedColumns.length === 0}
                        className="w-full p-4 border-2 border-green-200 dark:border-green-800 rounded-lg 
                                  hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 
                                  dark:hover:bg-green-900/20 transition-all group
                                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-green-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                            <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              Download as CSV
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Spreadsheet-compatible format with {recordCount} records
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* PDF Option */}
                      <button
                        onClick={() => handleDownload('pdf')}
                        disabled={selectedColumns.length === 0}
                        className="w-full p-4 border-2 border-red-200 dark:border-red-800 rounded-lg 
                                  hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 
                                  dark:hover:bg-red-900/20 transition-all group
                                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-red-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors">
                            <FileDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              Download as PDF
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Print-ready document with {recordCount} records
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  {selectedColumns.length === 0 && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                        <span>
                          Please select at least one column to download the report
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                              bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                              rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
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