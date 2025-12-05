'use client';

import React from 'react';
import { Trash2, Download } from 'lucide-react';
import StatusDropdown from './StatusDropdown';

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onBulkDelete: () => void;
  onBulkDownload?: (format: 'csv' | 'pdf') => void;
  onBulkStatusUpdate?: (status: string) => void;
  onClearSelection?: () => void;
  onSelectAll?: () => void;
  itemType: string; // e.g., 'farmer', 'BMC'
  showStatusUpdate?: boolean;
  currentBulkStatus?: string;
  onBulkStatusChange?: (status: string) => void;
  statusOptions?: Array<{
    status: string;
    label: string;
    color: string;
    bgColor: string;
  }>;
}

/**
 * Reusable bulk actions toolbar
 * Appears when items are selected
 */
const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  totalCount,
  onBulkDelete,
  onBulkDownload,
  onBulkStatusUpdate,
  onClearSelection,
  onSelectAll,
  itemType,
  showStatusUpdate = true,
  currentBulkStatus = 'active',
  onBulkStatusChange,
  statusOptions
}) => {
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center space-x-4">
        {/* Selection Count */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              {selectedCount}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedCount} {itemType}{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Bulk Actions */}
        <div className="flex items-center space-x-2">
          {/* Select All Checkbox */}
          {onSelectAll && onClearSelection && (
            <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={() => {
                  if (isAllSelected && onClearSelection) {
                    onClearSelection();
                  } else if (onSelectAll) {
                    onSelectAll();
                  }
                }}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Select All
              </span>
            </label>
          )}

          {/* Bulk Status Update */}
          {showStatusUpdate && onBulkStatusChange && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">Status:</span>
              <StatusDropdown
                currentStatus={currentBulkStatus}
                onStatusChange={(status) => {
                  onBulkStatusChange(status);
                  if (onBulkStatusUpdate) {
                    onBulkStatusUpdate(status);
                  }
                }}
                options={statusOptions}
                compact
              />
            </div>
          )}

          {/* Download */}
          {onBulkDownload && (
            <button
              onClick={() => onBulkDownload('csv')}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-1"
              title={`Download selected ${itemType}s`}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}

          {/* Delete */}
          <button
            onClick={onBulkDelete}
            className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-1"
            title={`Delete selected ${itemType}s`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          {/* Clear Selection */}
          {onClearSelection && (
            <button
              onClick={onClearSelection}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Clear selection"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkActionsToolbar;
