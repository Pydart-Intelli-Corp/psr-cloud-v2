'use client';

import React from 'react';
import { RefreshCw, Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  refreshText?: string;
  addButtonText?: string;
  onRefresh?: () => void;
  onAdd?: () => void;
  className?: string;
}

/**
 * Reusable page header component with icon, title, subtitle and action buttons
 * Used across dairy, BMC, society, and machine management pages
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  refreshText = 'Refresh',
  addButtonText = 'Add',
  onRefresh,
  onAdd,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center sm:justify-between ${className}`}>
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl">
          {icon}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
            {subtitle}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center justify-center w-full sm:w-auto px-4 py-2.5 text-sm sm:text-base text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {refreshText}
          </button>
        )}
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm sm:text-base bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            {addButtonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;