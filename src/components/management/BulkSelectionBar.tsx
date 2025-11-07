'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { StatusDropdown } from '@/components/management';

interface BulkSelectionBarProps {
  // Selection state
  selectAll: boolean;
  onSelectAll: (checked: boolean) => void;
  selectedCount: number;
  totalCount: number;
  onDeselectAll: () => void;
  
  // Filters state
  hasFilters: boolean;
  
  // Bulk actions
  bulkStatus: 'active' | 'inactive' | 'suspended' | 'maintenance';
  onBulkStatusChange: (status: string) => void;
  onBulkDelete: () => void;
}

/**
 * Reusable bulk selection bar for management pages
 * Shows select all, selected count, and bulk actions
 */
const BulkSelectionBar: React.FC<BulkSelectionBarProps> = ({
  selectAll,
  onSelectAll,
  selectedCount,
  totalCount,
  onDeselectAll,
  hasFilters,
  bulkStatus,
  onBulkStatusChange,
  onBulkDelete
}) => {
  if (totalCount === 0) return null;

  return (
    <div className={`rounded-lg border p-3 sm:p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between ${
      hasFilters 
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      {/* Top Row - Selection Controls */}
      <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3">
        {hasFilters && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
            <span>Filtered View</span>
          </div>
        )}
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            Select All ({totalCount})
          </span>
        </label>
        
        {selectedCount > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
              {selectedCount} selected
            </span>
            <button
              onClick={onDeselectAll}
              className="px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              Deselect All
            </button>
            <span className="hidden xs:inline text-xs text-gray-500 dark:text-gray-400">
              • Ready for bulk operations
            </span>
          </div>
        )}
      </div>
      
      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-600 sm:pl-4">
          <StatusDropdown
            currentStatus={bulkStatus}
            onStatusChange={onBulkStatusChange}
          />
          <button
            onClick={onBulkDelete}
            className="flex items-center justify-center space-x-2 px-3 py-2 text-xs sm:text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Delete Selected</span>
            <span className="xs:hidden">Delete ({selectedCount})</span>
            <span className="hidden xs:inline">({selectedCount})</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BulkSelectionBar;
