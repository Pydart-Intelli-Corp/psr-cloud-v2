'use client';

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface FolderControlsProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
  expandedCount?: number;
  totalCount?: number;
}

/**
 * Reusable folder expand/collapse controls
 */
const FolderControls: React.FC<FolderControlsProps> = ({
  onExpandAll,
  onCollapseAll,
  expandedCount,
  totalCount
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onExpandAll}
        className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-1"
        title="Expand all folders"
      >
        <ChevronDown className="w-3.5 h-3.5" />
        <span>Expand All</span>
      </button>
      <button
        onClick={onCollapseAll}
        className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-1"
        title="Collapse all folders"
      >
        <ChevronRight className="w-3.5 h-3.5" />
        <span>Collapse All</span>
      </button>
      {expandedCount !== undefined && totalCount !== undefined && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({expandedCount}/{totalCount} expanded)
        </span>
      )}
    </div>
  );
};

export default FolderControls;
