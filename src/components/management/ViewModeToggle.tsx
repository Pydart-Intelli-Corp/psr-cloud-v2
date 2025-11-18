'use client';

import React from 'react';
import { Folder, Grid3x3 } from 'lucide-react';

interface ViewModeToggleProps {
  viewMode: 'folder' | 'list';
  onViewModeChange: (mode: 'folder' | 'list') => void;
  folderLabel?: string;
  listLabel?: string;
}

/**
 * Reusable view mode toggle component
 * Switches between folder/grouped and list/flat views
 */
const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onViewModeChange,
  folderLabel = 'Folder View',
  listLabel = 'List View'
}) => {
  return (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => onViewModeChange('folder')}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
          viewMode === 'folder'
            ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        title={folderLabel}
      >
        <Folder className="w-4 h-4" />
        <span className="hidden sm:inline text-sm font-medium">{folderLabel}</span>
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
          viewMode === 'list'
            ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        title={listLabel}
      >
        <Grid3x3 className="w-4 h-4" />
        <span className="hidden sm:inline text-sm font-medium">{listLabel}</span>
      </button>
    </div>
  );
};

export default ViewModeToggle;
