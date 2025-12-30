'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw, Eye, EyeOff } from 'lucide-react';

export interface ColumnConfig {
  key: string;
  label: string;
  required?: boolean;
  description?: string;
}

interface ColumnSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (selectedColumns: string[]) => void;
  availableColumns: ColumnConfig[];
  selectedColumns: string[];
  defaultColumns: string[];
  title?: string;
}

export default function ColumnSelector({
  isOpen,
  onClose,
  onApply,
  availableColumns,
  selectedColumns: initialSelectedColumns,
  defaultColumns,
  title = 'Select Columns'
}: ColumnSelectorProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(initialSelectedColumns);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset selectedColumns when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedColumns(initialSelectedColumns);
      setSearchQuery('');
    }
  }, [isOpen, initialSelectedColumns]);

  // Filter columns based on search
  const filteredColumns = availableColumns.filter(column =>
    column.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    column.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleColumn = (columnKey: string) => {
    const column = availableColumns.find(col => col.key === columnKey);
    if (column?.required) return; // Don't allow toggling required columns

    setSelectedColumns(prev => {
      if (prev.includes(columnKey)) {
        return prev.filter(key => key !== columnKey);
      } else {
        // Insert in the same order as availableColumns to maintain consistency
        const insertIndex = availableColumns.findIndex(col => col.key === columnKey);
        const newColumns = [...prev];
        let insertPosition = newColumns.length;
        
        // Find the correct position to maintain order
        for (let i = 0; i < newColumns.length; i++) {
          const currentIndex = availableColumns.findIndex(col => col.key === newColumns[i]);
          if (currentIndex > insertIndex) {
            insertPosition = i;
            break;
          }
        }
        
        newColumns.splice(insertPosition, 0, columnKey);
        return newColumns;
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedColumns(availableColumns.map(col => col.key));
  };

  const handleClearOptional = () => {
    setSelectedColumns(availableColumns.filter(col => col.required).map(col => col.key));
  };

  const handleResetDefault = () => {
    setSelectedColumns(defaultColumns);
  };

  const handleApply = () => {
    onApply(selectedColumns);
    onClose();
  };

  if (!isOpen) return null;

  return (
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
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedColumns.length} of {availableColumns.length} columns selected
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

          {/* Search and Actions */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search columns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 
                          text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 
                          dark:hover:bg-blue-800 transition-colors"
              >
                <Check className="w-3 h-3" />
                Select All
              </button>
              <button
                onClick={handleClearOptional}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-red-100 dark:bg-red-900 
                          text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 
                          dark:hover:bg-red-800 transition-colors"
              >
                <EyeOff className="w-3 h-3" />
                Clear Optional
              </button>
              <button
                onClick={handleResetDefault}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-green-100 dark:bg-green-900 
                          text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 
                          dark:hover:bg-green-800 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset to Default
              </button>
            </div>
          </div>

          {/* Columns Grid */}
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredColumns.map((column) => {
                const isSelected = selectedColumns.includes(column.key);
                const isRequired = column.required;

                return (
                  <motion.div
                    key={column.key}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }
                      ${isRequired ? 'opacity-75 cursor-not-allowed' : ''}
                    `}
                    onClick={() => !isRequired && handleToggleColumn(column.key)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center
                        ${isSelected 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300 dark:border-gray-600'
                        }
                        ${isRequired ? 'bg-gray-400 border-gray-400' : ''}
                      `}>
                        {isSelected && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`
                            text-sm font-medium truncate
                            ${isSelected 
                              ? 'text-blue-700 dark:text-blue-300' 
                              : 'text-gray-900 dark:text-white'
                            }
                          `}>
                            {column.label}
                          </h4>
                          {isRequired && (
                            <span className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 
                                           text-gray-600 dark:text-gray-400 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        {column.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {column.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredColumns.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No columns found matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selectedColumns.length} columns selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                          bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                          rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
                          rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Apply Selection
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}