'use client';

import React from 'react';
import { Download, Upload, Plus, RefreshCw, BarChart3 } from 'lucide-react';

interface ManagementPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onRefresh: () => void;
  onDownload?: () => void;
  onUpload?: () => void;
  onAdd?: () => void;
  onStatistics?: () => void;
  isDownloading?: boolean;
  hasData?: boolean;
  addButtonText?: string;
}

/**
 * Reusable page header for farmer/user management pages
 * Includes title, refresh, download, upload CSV, and add new item buttons
 */
const ManagementPageHeader: React.FC<ManagementPageHeaderProps> = ({
  title,
  subtitle = '',
  icon,
  onRefresh,
  onDownload,
  onUpload,
  onAdd,
  onStatistics,
  isDownloading = false,
  hasData = true,
  addButtonText = 'Add Farmer'
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center sm:justify-between">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl">
          {icon}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
        <button
          onClick={onRefresh}
          className="flex items-center justify-center w-full sm:w-auto px-4 py-2.5 text-sm sm:text-base text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
        
        {onStatistics && (
          <button
            onClick={onStatistics}
            className="flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm sm:text-base bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/25"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistics
          </button>
        )}
        
        {onDownload && (
          <button
            onClick={onDownload}
            disabled={!hasData || isDownloading}
            className="flex items-center justify-center w-full sm:w-auto px-4 py-2.5 text-sm sm:text-base text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download
              </>
            )}
          </button>
        )}
        
        {onUpload && (
          <button
            onClick={onUpload}
            className="flex items-center justify-center w-full sm:w-auto px-4 py-2.5 text-sm sm:text-base text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV
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

export default ManagementPageHeader;
