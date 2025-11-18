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
  compact?: boolean;
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
  className = '',
  compact = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': 
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'inactive': 
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'maintenance': 
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'suspended': 
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      default: 
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <button
        className={`${compact ? 'px-3 py-1.5' : 'px-3 py-1.5'} text-xs font-medium rounded-lg transition-colors flex items-center space-x-1 ${getStatusColor(currentStatus)}`}
        onClick={(e) => {
          e.stopPropagation();
          const btn = e.currentTarget;
          const dropdown = btn.nextElementSibling as HTMLElement;
          if (dropdown) {
            dropdown.classList.toggle('hidden');
          }
        }}
      >
        <span>{currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="hidden absolute right-0 bottom-full mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[140px]">
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