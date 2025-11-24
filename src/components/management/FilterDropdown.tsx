'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Filter, X, ChevronDown, Calendar } from 'lucide-react';

interface FilterDropdownProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  dairyFilter?: string;
  onDairyChange?: (value: string) => void;
  bmcFilter?: string;
  onBmcChange?: (value: string) => void;
  societyFilter: string | string[];
  onSocietyChange: (value: string | string[]) => void;
  machineFilter: string;
  onMachineChange: (value: string) => void;
  dairies?: Array<{ id: number; name: string; dairy_id: string }>;
  bmcs?: Array<{ id: number; name: string; bmc_id: string; dairyFarmId?: number }>;
  societies: Array<{ id: number; name: string; society_id: string; bmc_id?: number }>;
  machines: Array<{ id: number; machineId: string; machineType: string; societyId?: number }>;
  filteredCount: number;
  totalCount: number;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  icon?: React.ReactNode;
  // Optional additional filters
  dateFilter?: string;
  onDateChange?: (value: string) => void;
  dateFromFilter?: string;
  onDateFromChange?: (value: string) => void;
  dateToFilter?: string;
  onDateToChange?: (value: string) => void;
  channelFilter?: string;
  onChannelChange?: (value: string) => void;
  showDateFilter?: boolean;
  showChannelFilter?: boolean;
  showShiftFilter?: boolean;
}

/**
 * Compact filter dropdown for management pages
 * Space-saving design with dropdown panel
 */
const FilterDropdown: React.FC<FilterDropdownProps> = ({
  statusFilter,
  onStatusChange,
  dairyFilter,
  onDairyChange,
  bmcFilter,
  onBmcChange,
  societyFilter,
  onSocietyChange,
  machineFilter,
  onMachineChange,
  dairies = [],
  bmcs = [],
  societies,
  machines,
  filteredCount,
  totalCount,
  searchQuery,
  onSearchChange,
  icon,
  dateFilter,
  onDateChange,
  dateFromFilter,
  onDateFromChange,
  dateToFilter,
  onDateToChange,
  channelFilter,
  onChannelChange,
  showDateFilter = false,
  showChannelFilter = false,
  showShiftFilter = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [societyDropdownOpen, setSocietyDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dateRangeRef = useRef<HTMLDivElement>(null);
  const societyDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (dateRangeRef.current && !dateRangeRef.current.contains(event.target as Node)) {
        setDateRangeOpen(false);
      }
      if (societyDropdownRef.current && !societyDropdownRef.current.contains(event.target as Node)) {
        setSocietyDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = statusFilter !== 'all' || 
    (dairyFilter !== undefined && dairyFilter !== 'all') || 
    (bmcFilter !== undefined && bmcFilter !== 'all') || 
    (Array.isArray(societyFilter) ? societyFilter.length > 0 : societyFilter !== 'all') || 
    machineFilter !== 'all' || 
    (dateFilter && dateFilter !== '') || 
    (dateFromFilter && dateFromFilter !== '') || 
    (dateToFilter && dateToFilter !== '') || 
    (channelFilter && channelFilter !== 'all');
  const activeFilterCount = [
    statusFilter !== 'all',
    dairyFilter !== undefined && dairyFilter !== 'all',
    bmcFilter !== undefined && bmcFilter !== 'all',
    Array.isArray(societyFilter) ? societyFilter.length > 0 : societyFilter !== 'all',
    machineFilter !== 'all',
    dateFilter && dateFilter !== '',
    dateFromFilter && dateFromFilter !== '',
    dateToFilter && dateToFilter !== '',
    channelFilter && channelFilter !== 'all'
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    onStatusChange('all');
    if (onDairyChange) onDairyChange('all');
    if (onBmcChange) onBmcChange('all');
    onSocietyChange([]);
    onMachineChange('all');
    if (onDateChange) onDateChange('');
    if (onDateFromChange) onDateFromChange('');
    if (onDateToChange) onDateToChange('');
    if (onChannelChange) onChannelChange('all');
    if (onSearchChange) onSearchChange('');
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
              ? 'bg-psr-green-50 dark:bg-psr-green-900/20 border-psr-green-500 dark:border-psr-green-400 text-psr-green-700 dark:text-psr-green-300'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-psr-green-600 dark:bg-psr-green-500 text-white text-xs rounded-full min-w-[18px] text-center">
                {activeFilterCount}
              </span>
            )}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Society Filter Button - Only show when societies are selected */}
        {Array.isArray(societyFilter) && societyFilter.length > 0 && (
        <div className="relative" ref={societyDropdownRef}>
          <button
            onClick={() => setSocietyDropdownOpen(!societyDropdownOpen)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all bg-psr-primary-50 dark:bg-psr-primary-900/20 border-psr-primary-500 dark:border-psr-primary-400 text-psr-primary-700 dark:text-psr-primary-300"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">
              Society
              <span className="ml-1.5 px-1.5 py-0.5 bg-psr-primary-600 dark:bg-psr-primary-500 text-white text-xs rounded-full min-w-[18px] text-center">
                {societyFilter.length}
              </span>
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${societyDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Society Dropdown Popup */}
          {societyDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Select Societies
                    {Array.isArray(societyFilter) && societyFilter.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                        ({societyFilter.length} selected)
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => setSocietyDropdownOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md">
                  <div className="space-y-1 p-2">
                    {societies.length === 0 ? (
                      <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                        No societies available
                      </div>
                    ) : (
                      (() => {
                        // Filter societies based on selected dairy/BMC
                        let filteredSocieties = societies;
                        
                        // If dairy filter is active, get BMCs under that dairy
                        if (dairyFilter && dairyFilter !== 'all') {
                          const dairyBmcIds = bmcs
                            .filter(b => b.dairyFarmId?.toString() === dairyFilter)
                            .map(b => b.id);
                          filteredSocieties = societies.filter(s => 
                            s.bmc_id && dairyBmcIds.includes(s.bmc_id)
                          );
                        }
                        // If BMC filter is active, show only societies under that BMC
                        else if (bmcFilter && bmcFilter !== 'all') {
                          filteredSocieties = societies.filter(s => 
                            s.bmc_id?.toString() === bmcFilter
                          );
                        }

                        // Group societies by BMC
                        const societiesByBmc = filteredSocieties.reduce((acc, society) => {
                          const bmcId = society.bmc_id || 'unassigned';
                          if (!acc[bmcId]) acc[bmcId] = [];
                          acc[bmcId].push(society);
                          return acc;
                        }, {} as Record<string | number, typeof societies>);

                        return Object.entries(societiesByBmc).map(([bmcId, bmcSocieties]) => {
                          const bmc = bmcs.find(b => b.id.toString() === bmcId);
                          const dairy = bmc ? dairies.find(d => d.id === bmc.dairyFarmId) : null;
                          
                          return (
                            <div key={bmcId} className="mb-3">
                              {/* BMC/Dairy Header */}
                              <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                                {bmcId === 'unassigned' ? (
                                  'Unassigned Societies'
                                ) : (
                                  <>
                                    {dairy && <span className="text-blue-600 dark:text-blue-400">{dairy.name} → </span>}
                                    <span className="text-emerald-600 dark:text-emerald-400">{bmc?.name || `BMC ${bmcId}`}</span>
                                  </>
                                )}
                              </div>
                              
                              {/* Societies under this BMC */}
                              {bmcSocieties.map(society => {
                                const isChecked = Array.isArray(societyFilter) && societyFilter.includes(society.id.toString());
                                return (
                                  <label
                                    key={society.id}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        const currentFilters = Array.isArray(societyFilter) ? societyFilter : [];
                                        const societyId = society.id.toString();
                                        if (e.target.checked) {
                                          onSocietyChange([...currentFilters, societyId]);
                                        } else {
                                          onSocietyChange(currentFilters.filter(id => id !== societyId));
                                        }
                                      }}
                                      className="w-4 h-4 text-psr-primary-600 rounded focus:ring-2 focus:ring-psr-primary-500 cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-900 dark:text-gray-100 flex-1">
                                      {society.name}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      ({society.society_id})
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => onSocietyChange([])}
                    className="flex-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setSocietyDropdownOpen(false)}
                    className="flex-1 px-3 py-2 text-sm text-white bg-psr-primary-600 rounded-md hover:bg-psr-primary-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Date Range Filter Button */}
        {showDateFilter && (
          <div className="relative" ref={dateRangeRef}>
            <button
              onClick={() => setDateRangeOpen(!dateRangeOpen)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all ${
                (dateFromFilter && dateFromFilter !== '') || (dateToFilter && dateToFilter !== '')
                  ? 'bg-psr-primary-50 dark:bg-psr-primary-900/20 border-psr-primary-500 dark:border-psr-primary-400 text-psr-primary-700 dark:text-psr-primary-300'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Date Range</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${dateRangeOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Date Range Popup */}
            {dateRangeOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Select Date Range</h3>
                    <button
                      onClick={() => setDateRangeOpen(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-2">
                        From Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={dateFromFilter || ''}
                          onChange={(e) => onDateFromChange && onDateFromChange(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-psr-primary-500 dark:focus:ring-psr-primary-400 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-2">
                        To Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={dateToFilter || ''}
                          onChange={(e) => onDateToChange && onDateToChange(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-psr-primary-500 dark:focus:ring-psr-primary-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        if (onDateFromChange) onDateFromChange('');
                        if (onDateToChange) onDateToChange('');
                      }}
                      className="flex-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setDateRangeOpen(false)}
                      className="flex-1 px-3 py-2 text-sm text-white bg-psr-primary-600 rounded-md hover:bg-psr-primary-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Item Count */}
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {icon}
          <span className="font-medium">
            {filteredCount}/{totalCount} items
          </span>
        </div>

        {/* Active Search Query Badge */}
        {searchQuery && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-psr-green-50 dark:bg-psr-green-900/20 border border-psr-green-200 dark:border-psr-green-700 rounded-md text-psr-green-700 dark:text-psr-green-300 text-xs font-medium">
            <span>&ldquo;{searchQuery}&rdquo;</span>
            {onSearchChange && (
              <button
                onClick={() => {
                  onSearchChange('');
                  // Clear header search as well
                  const event = new CustomEvent('globalSearch', {
                    detail: { query: '' }
                  });
                  window.dispatchEvent(event);
                }}
                className="hover:bg-psr-green-100 dark:hover:bg-psr-green-800 rounded p-0.5 transition-colors"
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
        <div className="absolute top-full left-0 mt-2 w-full sm:w-auto sm:min-w-[600px] sm:max-w-4xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-4">
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

            {/* All Filters in Single Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Status/Shift Filter */}
              {showShiftFilter ? (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                    Shift
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-psr-green-500 dark:focus:ring-psr-green-400 focus:border-transparent"
                  >
                    <option value="all">All Shifts</option>
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>
              ) : statusFilter !== 'all' && statusFilter !== '' ? (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-psr-green-500 dark:focus:ring-psr-green-400 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              ) : null}

              {/* Dairy Filter */}
              {dairies && dairies.length > 0 && onDairyChange && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                    Dairy Farm
                  </label>
                  <select
                    value={dairyFilter || 'all'}
                    onChange={(e) => {
                      onDairyChange(e.target.value);
                      if (onBmcChange) onBmcChange('all');
                      onSocietyChange([]);
                    }}
                    className="w-full min-w-[150px] px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-psr-green-500 dark:focus:ring-psr-green-400 focus:border-transparent"
                  >
                    <option value="all">All Dairies</option>
                    {dairies.map(dairy => (
                      <option key={dairy.id} value={dairy.id.toString()}>
                        {dairy.name} ({dairy.dairy_id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* BMC Filter */}
              {bmcs && bmcs.length > 0 && onBmcChange && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                    BMC
                  </label>
                  <select
                    value={bmcFilter || 'all'}
                    onChange={(e) => {
                      onBmcChange(e.target.value);
                      onSocietyChange([]);
                    }}
                    className="w-full min-w-[150px] px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-psr-green-500 dark:focus:ring-psr-green-400 focus:border-transparent"
                  >
                    <option value="all">All BMCs</option>
                    {bmcs
                      .filter(bmc => 
                        !dairyFilter || dairyFilter === 'all' || 
                        bmc.dairyFarmId?.toString() === dairyFilter
                      )
                      .map(bmc => (
                        <option key={bmc.id} value={bmc.id.toString()}>
                          {bmc.name} ({bmc.bmc_id})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Machine Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                  Machine
                </label>
                <select
                  value={machineFilter}
                  onChange={(e) => onMachineChange(e.target.value)}
                  className="w-full min-w-[150px] px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-psr-green-500 dark:focus:ring-psr-green-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="all">All Machines</option>
                  {machines
                    .filter(machine => {
                      if (Array.isArray(societyFilter) && societyFilter.length > 0) {
                        return societyFilter.includes(machine.societyId?.toString() || '');
                      }
                      return true;
                    })
                    .map(machine => (
                      <option key={machine.id} value={machine.id.toString()}>
                        {machine.machineId} ({machine.machineType})
                      </option>
                    ))}
                </select>
              </div>

              {/* Channel Filter */}
              {showChannelFilter && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                    Channel
                  </label>
                  <select
                    value={channelFilter || 'all'}
                    onChange={(e) => onChannelChange && onChannelChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-psr-green-500 dark:focus:ring-psr-green-400 focus:border-transparent"
                  >
                    <option value="all">All Channels</option>
                    <option value="COW">Cow</option>
                    <option value="BUFFALO">Buffalo</option>
                    <option value="MIXED">Mixed</option>
                  </select>
                </div>
              )}
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Active filters:</span>
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-psr-green-100 dark:bg-psr-green-900/30 text-psr-green-700 dark:text-psr-green-300 text-xs rounded">
                      {showShiftFilter ? 'Shift' : 'Status'}: {statusFilter}
                      <button onClick={() => onStatusChange('all')} className="hover:text-psr-green-900 dark:hover:text-psr-green-100">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {Array.isArray(societyFilter) && societyFilter.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-psr-primary-100 dark:bg-psr-primary-900/30 text-psr-primary-700 dark:text-psr-primary-300 text-xs rounded">
                      Society: {societyFilter.length} selected
                      <button onClick={() => onSocietyChange([])} className="hover:text-psr-primary-900 dark:hover:text-psr-primary-100">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {machineFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-psr-emerald-100 dark:bg-psr-emerald-900/30 text-psr-emerald-700 dark:text-psr-emerald-300 text-xs rounded">
                      Machine: {machines.find(m => m.id.toString() === machineFilter)?.machineId}
                      <button onClick={() => onMachineChange('all')} className="hover:text-psr-emerald-900 dark:hover:text-psr-emerald-100">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {dateFilter && dateFilter !== '' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded">
                      Date: {dateFilter}
                      <button onClick={() => onDateChange && onDateChange('')} className="hover:text-orange-900 dark:hover:text-orange-100">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {dateFromFilter && dateFromFilter !== '' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-psr-primary-100 dark:bg-psr-primary-900/30 text-psr-primary-700 dark:text-psr-primary-300 text-xs rounded">
                      From: {dateFromFilter}
                      <button onClick={() => onDateFromChange && onDateFromChange('')} className="hover:text-psr-primary-900 dark:hover:text-psr-primary-100">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {dateToFilter && dateToFilter !== '' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-psr-primary-100 dark:bg-psr-primary-900/30 text-psr-primary-700 dark:text-psr-primary-300 text-xs rounded">
                      To: {dateToFilter}
                      <button onClick={() => onDateToChange && onDateToChange('')} className="hover:text-psr-primary-900 dark:hover:text-psr-primary-100">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {channelFilter && channelFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded">
                      Channel: {channelFilter}
                      <button onClick={() => onChannelChange && onChannelChange('all')} className="hover:text-yellow-900 dark:hover:text-yellow-100">
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
