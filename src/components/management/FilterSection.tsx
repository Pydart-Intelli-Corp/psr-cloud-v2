'use client';

import React from 'react';

interface FilterSectionProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  societyFilter: string;
  onSocietyChange: (value: string) => void;
  machineFilter: string;
  onMachineChange: (value: string) => void;
  societies: Array<{ id: number; name: string; society_id: string }>;
  machines: Array<{ id: number; machineId: string; machineType: string; societyId?: number }>;
  filteredCount: number;
  totalCount: number;
  searchQuery?: string;
  icon?: React.ReactNode;
}

/**
 * Reusable filter section for management pages
 * Includes status, society, and machine filters
 */
const FilterSection: React.FC<FilterSectionProps> = ({
  statusFilter,
  onStatusChange,
  societyFilter,
  onSocietyChange,
  machineFilter,
  onMachineChange,
  societies,
  machines,
  filteredCount,
  totalCount,
  searchQuery,
  icon
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
      {/* Header Info */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {icon}
          <span className="font-medium text-xs sm:text-sm">
            {filteredCount}/{totalCount} items
          </span>
        </div>
        {searchQuery && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-300 text-xs font-medium">
            <span>&ldquo;{searchQuery}&rdquo;</span>
          </div>
        )}
      </div>
      
      {/* Filters Grid - Mobile First */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Status Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Society Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
            Society
          </label>
          <select
            value={societyFilter}
            onChange={(e) => onSocietyChange(e.target.value)}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            <option value="all">All Societies</option>
            {societies.map(society => (
              <option key={society.id} value={society.id.toString()}>
                {society.name} ({society.society_id})
              </option>
            ))}
          </select>
        </div>

        {/* Machine Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
            Machine
          </label>
          <select
            value={machineFilter}
            onChange={(e) => onMachineChange(e.target.value)}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            <option value="all">All Machines</option>
            <option value="unassigned">Unassigned</option>
            {machines
              .filter(machine => 
                societyFilter === 'all' || 
                machine.societyId?.toString() === societyFilter
              )
              .map(machine => (
                <option key={machine.id} value={machine.id.toString()}>
                  {machine.machineId} ({machine.machineType})
                </option>
              ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block invisible">
            Actions
          </label>
          <button
            onClick={() => {
              onStatusChange('all');
              onSocietyChange('all');
              onMachineChange('all');
            }}
            disabled={statusFilter === 'all' && societyFilter === 'all' && machineFilter === 'all'}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
