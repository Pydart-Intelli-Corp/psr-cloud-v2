'use client';

import React from 'react';
import { Building2 } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterControlsProps {
  icon?: React.ReactNode;
  showingText: string;
  filterLabel?: string;
  filterValue: string;
  filterOptions: FilterOption[];
  onFilterChange: (value: string) => void;
  className?: string;
}

/**
 * Reusable filter controls component
 * Used across all management pages for consistent filtering interface
 */
const FilterControls: React.FC<FilterControlsProps> = ({
  icon = <Building2 className="w-4 h-4 flex-shrink-0" />,
  showingText,
  filterLabel = 'Filter:',
  filterValue,
  filterOptions,
  onFilterChange,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        {icon}
        <span className="font-medium">{showingText}</span>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-3">
        <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">
          {filterLabel}
        </label>
        <select
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 !bg-white dark:!bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-xs sm:text-sm !text-gray-900 dark:!text-gray-100 focus:ring-2 focus:!ring-emerald-500 focus:!border-emerald-500 outline-none transition-all"
          style={{ 
            color: 'inherit',
            outlineColor: '#059669 !important',
            boxShadow: 'none'
          }}
        >
          {filterOptions.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="!bg-white dark:!bg-gray-900 !text-gray-900 dark:!text-gray-100" 
              style={{ color: '#1f2937' }}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterControls;