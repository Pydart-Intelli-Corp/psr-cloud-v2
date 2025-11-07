'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

interface FilterDropdownProps {
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
  onSearchChange?: (value: string) => void;
  icon?: React.ReactNode;
}

/**
 * Compact filter dropdown for management pages
 * Space-saving design with dropdown panel
 */
const FilterDropdown: React.FC<FilterDropdownProps> = ({
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
  onSearchChange,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = statusFilter !== 'all' || societyFilter !== 'all' || machineFilter !== 'all';
  const activeFilterCount = [
    statusFilter !== 'all',
    societyFilter !== 'all',
    machineFilter !== 'all'
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    onStatusChange('all');
    onSocietyChange('all');
    onMachineChange('all');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact Filter Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Filter Dropdown Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all ${
            hasActiveFilters
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded-full min-w-[18px] text-center">
                {activeFilterCount}
              </span>
            )}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Item Count */}
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {icon}
          <span className="font-medium">
            {filteredCount}/{totalCount} items
          </span>
        </div>

        {/* Active Search Query Badge */}
        {searchQuery && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md text-blue-700 dark:text-blue-300 text-xs font-medium">
            <span>&ldquo;{searchQuery}&rdquo;</span>
            {onSearchChange && (
              <button
                onClick={() => onSearchChange('')}
                className="hover:bg-blue-100 dark:hover:bg-blue-800 rounded p-0.5 transition-colors"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Clear All Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full sm:w-[600px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filter Options</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              {/* Society Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                  Society
                </label>
                <select
                  value={societyFilter}
                  onChange={(e) => {
                    onSocietyChange(e.target.value);
                    onMachineChange('all'); // Reset machine filter when society changes
                  }}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent"
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
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                  Machine
                </label>
                <select
                  value={machineFilter}
                  onChange={(e) => onMachineChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="all">All Machines</option>
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
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Active filters:</span>
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded">
                      Status: {statusFilter}
                      <button onClick={() => onStatusChange('all')} className="hover:text-green-900 dark:hover:text-green-100">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {societyFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                      Society: {societies.find(s => s.id.toString() === societyFilter)?.name}
                      <button onClick={() => onSocietyChange('all')} className="hover:text-blue-900 dark:hover:text-blue-100">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {machineFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded">
                      Machine: {machines.find(m => m.id.toString() === machineFilter)?.machineId}
                      <button onClick={() => onMachineChange('all')} className="hover:text-purple-900 dark:hover:text-purple-100">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
