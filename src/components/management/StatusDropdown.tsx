'use client';

import React from 'react';

interface StatusOption {
  status: string;
  label: string;
  color: string;
  bgColor: string;
}

interface StatusDropdownProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  options?: StatusOption[];
  className?: string;
}

const defaultStatusOptions: StatusOption[] = [
  {
    status: 'active',
    label: 'Active',
    color: 'bg-green-500',
    bgColor: 'hover:bg-green-50 dark:hover:bg-green-900/30'
  },
  {
    status: 'inactive',
    label: 'Inactive',
    color: 'bg-red-500',
    bgColor: 'hover:bg-red-50 dark:hover:bg-red-900/30'
  },
  {
    status: 'suspended',
    label: 'Suspended',
    color: 'bg-yellow-500',
    bgColor: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
  },
  {
    status: 'maintenance',
    label: 'Maintenance',
    color: 'bg-blue-500',
    bgColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/30'
  }
];

/**
 * Reusable status dropdown component
 * Used across all management pages for changing item status
 */
const StatusDropdown: React.FC<StatusDropdownProps> = ({
  currentStatus,
  onStatusChange,
  options = defaultStatusOptions,
  className = ''
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': 
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'inactive': 
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      case 'maintenance': 
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      default: 
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <button
        className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium rounded-full border flex-shrink-0 ${getStatusColor(currentStatus)} hover:shadow-md transition-all cursor-pointer`}
        onClick={(e) => {
          e.stopPropagation();
          const btn = e.currentTarget;
          const dropdown = btn.nextElementSibling as HTMLElement;
          if (dropdown) {
            dropdown.classList.toggle('hidden');
          }
        }}
      >
        {currentStatus}
      </button>
      <div className="hidden absolute right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[140px]">
        {options.map((option, index) => (
          <button
            key={option.status}
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(option.status);
              (e.currentTarget.parentElement as HTMLElement).classList.add('hidden');
            }}
            className={`w-full px-3 py-2 text-left text-sm ${option.bgColor} text-gray-700 dark:text-gray-300 flex items-center space-x-2 ${
              index === 0 ? 'rounded-t-lg' : ''
            } ${index === options.length - 1 ? 'rounded-b-lg' : ''}`}
          >
            <span className={`w-2 h-2 rounded-full ${option.color}`}></span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusDropdown;