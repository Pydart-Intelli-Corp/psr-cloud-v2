'use client';

import { useState, useEffect } from 'react';

export interface ColumnOption {
  key: string;
  label: string;
  required?: boolean;
}

interface ColumnSelectorProps {
  columns: ColumnOption[];
  selectedColumns: string[];
  onSelectionChange: (selectedColumns: string[]) => void;
  className?: string;
}

const ColumnSelector = ({ 
  columns, 
  selectedColumns, 
  onSelectionChange, 
  className = '' 
}: ColumnSelectorProps) => {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedColumns);

  useEffect(() => {
    setLocalSelected(selectedColumns);
  }, [selectedColumns]);

  const handleColumnToggle = (columnKey: string, isRequired: boolean = false) => {
    if (isRequired) return; // Don't allow toggling required columns
    
    const newSelected = localSelected.includes(columnKey)
      ? localSelected.filter(key => key !== columnKey)
      : [...localSelected, columnKey];
    
    setLocalSelected(newSelected);
    onSelectionChange(newSelected);
  };

  const handleSelectAll = () => {
    const allKeys = columns.map(col => col.key);
    setLocalSelected(allKeys);
    onSelectionChange(allKeys);
  };

  const handleSelectDefault = () => {
    // Default columns: farmer ID, RF-ID, name, mobile, SMS, bonus
    const defaultColumns = ['farmerId', 'rfId', 'farmerName', 'contactNumber', 'smsEnabled', 'bonus'];
    const availableDefaults = defaultColumns.filter(key => 
      columns.some(col => col.key === key)
    );
    setLocalSelected(availableDefaults);
    onSelectionChange(availableDefaults);
  };

  const handleClearAll = () => {
    // Keep only required columns
    const requiredColumns = columns
      .filter(col => col.required)
      .map(col => col.key);
    setLocalSelected(requiredColumns);
    onSelectionChange(requiredColumns);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick selection buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSelectDefault}
          className="px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
        >
          Default
        </button>
        <button
          type="button"
          onClick={handleSelectAll}
          className="px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
        >
          Select All
        </button>
        <button
          type="button"
          onClick={handleClearAll}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-900/50 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Column checkboxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
        {columns.map((column) => {
          const isSelected = localSelected.includes(column.key);
          const isRequired = column.required || false;
          
          return (
            <label
              key={column.key}
              className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                  : 'bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900/40'
              } ${isRequired ? 'opacity-75' : ''}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleColumnToggle(column.key, isRequired)}
                disabled={isRequired}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 disabled:opacity-50"
              />
              <span className={`text-sm ${isRequired ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                {column.label}
                {isRequired && <span className="text-xs text-green-600 dark:text-green-400 ml-1">(Required)</span>}
              </span>
            </label>
          );
        })}
      </div>

      {/* Selection summary */}
      <div className="text-xs text-gray-600 dark:text-gray-400">
        Selected: {localSelected.length} of {columns.length} columns
      </div>
    </div>
  );
};

export default ColumnSelector;