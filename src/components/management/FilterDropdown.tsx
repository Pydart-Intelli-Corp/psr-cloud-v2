'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Filter, X, ChevronDown, Calendar } from 'lucide-react';

interface FilterDropdownProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  dairyFilter?: string | string[];
  onDairyChange?: (value: string | string[]) => void;
  bmcFilter?: string | string[];
  onBmcChange?: (value: string | string[]) => void;
  societyFilter: string | string[];
  onSocietyChange: (value: string | string[]) => void;
  machineFilter: string | string[];
  onMachineChange: (value: string | string[]) => void;
  farmerFilter?: string | string[];
  onFarmerChange?: (value: string | string[]) => void;
  dairies?: Array<{ id: number; name: string; dairyId: string }>;
  bmcs?: Array<{ id: number; name: string; bmcId: string; dairyFarmId?: number }>;
  societies: Array<{ id: number; name: string; society_id: string; bmc_id?: number }>;
  machines: Array<{ id: number; machineId: string; machineType: string; societyId?: number; societyName?: string; societyIdentifier?: string; collectionCount?: number }>;
  farmers?: Array<{ id: number; farmerId: string; farmerName: string; farmeruid?: string; societyId?: number }>;
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
  showMachineFilter?: boolean;
  showFarmerFilter?: boolean;
  farmerFilterLabel?: string;
  simpleFarmerFilter?: boolean;
  hideMainFilterButton?: boolean;
  hideSocietyFilter?: boolean;
  hideDairyFilter?: boolean;
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
  farmerFilter,
  onFarmerChange,
  dairies = [],
  bmcs = [],
  societies,
  machines,
  farmers = [],
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
  showShiftFilter = false,
  showMachineFilter = false,
  showFarmerFilter = false,
  farmerFilterLabel = 'Farmer',
  simpleFarmerFilter = false,
  hideMainFilterButton = false,
  hideSocietyFilter = false,
  hideDairyFilter = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [societyDropdownOpen, setSocietyDropdownOpen] = useState(false);
  const [channelDropdownOpen, setChannelDropdownOpen] = useState(false);
  const [machineDropdownOpen, setMachineDropdownOpen] = useState(false);
  const [dairyDropdownOpen, setDairyDropdownOpen] = useState(false);
  const [bmcDropdownOpen, setBmcDropdownOpen] = useState(false);
  const [shiftDropdownOpen, setShiftDropdownOpen] = useState(false);
  const [farmerDropdownOpen, setFarmerDropdownOpen] = useState(false);
  const [farmerSearchTerm, setFarmerSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dateRangeRef = useRef<HTMLDivElement>(null);
  const societyDropdownRef = useRef<HTMLDivElement>(null);
  const channelDropdownRef = useRef<HTMLDivElement>(null);
  const machineDropdownRef = useRef<HTMLDivElement>(null);
  const dairyDropdownRef = useRef<HTMLDivElement>(null);
  const bmcDropdownRef = useRef<HTMLDivElement>(null);
  const shiftDropdownRef = useRef<HTMLDivElement>(null);
  const farmerDropdownRef = useRef<HTMLDivElement>(null);

  // Deduplicate and filter machines by society selection
  const uniqueMachines = useMemo(() => {
    // First filter by selected societies
    let filteredMachines = machines;
    if (Array.isArray(societyFilter) && societyFilter.length > 0) {
      filteredMachines = machines.filter(machine => 
        machine.societyId && societyFilter.includes(machine.societyId.toString())
      );
    }
    
    // Then deduplicate by machineId, machineType, AND societyId
    const seen = new Map<string, typeof machines[0]>();
    filteredMachines.forEach(machine => {
      const key = `${machine.machineId}-${machine.machineType}-${machine.societyId}`;
      if (!seen.has(key)) {
        seen.set(key, machine);
      }
    });
    return Array.from(seen.values());
  }, [machines, societyFilter]);

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
      if (channelDropdownRef.current && !channelDropdownRef.current.contains(event.target as Node)) {
        setChannelDropdownOpen(false);
      }
      if (machineDropdownRef.current && !machineDropdownRef.current.contains(event.target as Node)) {
        setMachineDropdownOpen(false);
      }
      if (dairyDropdownRef.current && !dairyDropdownRef.current.contains(event.target as Node)) {
        setDairyDropdownOpen(false);
      }
      if (bmcDropdownRef.current && !bmcDropdownRef.current.contains(event.target as Node)) {
        setBmcDropdownOpen(false);
      }
      if (shiftDropdownRef.current && !shiftDropdownRef.current.contains(event.target as Node)) {
        setShiftDropdownOpen(false);
      }
      if (farmerDropdownRef.current && !farmerDropdownRef.current.contains(event.target as Node)) {
        setFarmerDropdownOpen(false);
        setFarmerSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = statusFilter !== 'all' || 
    (Array.isArray(dairyFilter) ? dairyFilter.length > 0 : (dairyFilter !== undefined && dairyFilter !== 'all')) || 
    (Array.isArray(bmcFilter) ? bmcFilter.length > 0 : (bmcFilter !== undefined && bmcFilter !== 'all')) || 
    (Array.isArray(societyFilter) ? societyFilter.length > 0 : societyFilter !== 'all') || 
    (Array.isArray(machineFilter) ? machineFilter.length > 0 : machineFilter !== 'all') || 
    (Array.isArray(farmerFilter) ? farmerFilter.length > 0 : (farmerFilter !== undefined && farmerFilter !== 'all')) || 
    (dateFilter && dateFilter !== '') || 
    (dateFromFilter && dateFromFilter !== '') || 
    (dateToFilter && dateToFilter !== '') || 
    (channelFilter && channelFilter !== 'all');
  const activeFilterCount = [
    statusFilter !== 'all',
    Array.isArray(dairyFilter) ? dairyFilter.length > 0 : (dairyFilter !== undefined && dairyFilter !== 'all'),
    Array.isArray(bmcFilter) ? bmcFilter.length > 0 : (bmcFilter !== undefined && bmcFilter !== 'all'),
    Array.isArray(societyFilter) ? societyFilter.length > 0 : societyFilter !== 'all',
    Array.isArray(machineFilter) ? machineFilter.length > 0 : machineFilter !== 'all',
    Array.isArray(farmerFilter) ? farmerFilter.length > 0 : (farmerFilter !== undefined && farmerFilter !== 'all'),
    dateFilter && dateFilter !== '',
    dateFromFilter && dateFromFilter !== '',
    dateToFilter && dateToFilter !== '',
    channelFilter && channelFilter !== 'all'
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    onStatusChange('all');
    if (onDairyChange) onDairyChange([]);
    if (onBmcChange) onBmcChange([]);
    onSocietyChange([]);
    onMachineChange([]);
    if (onFarmerChange) onFarmerChange([]);
    if (onDateChange) onDateChange('');
    if (onDateFromChange) onDateFromChange('');
    if (onDateToChange) onDateToChange('');
    if (onChannelChange) onChannelChange('all');
    if (onSearchChange) onSearchChange('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact Filter Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Filter Dropdown Button */}
        {!hideMainFilterButton && (
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
        )}

        {/* Dairy Filter Button */}
        {!hideDairyFilter && dairies && dairies.length > 0 && onDairyChange && (
        <div className="relative" ref={dairyDropdownRef}>
          <button
            onClick={() => setDairyDropdownOpen(!dairyDropdownOpen)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all ${
              (Array.isArray(dairyFilter) && dairyFilter.length > 0) || (typeof dairyFilter === 'string' && dairyFilter !== 'all')
                ? 'bg-psr-primary-50 dark:bg-psr-primary-900/20 border-psr-primary-500 dark:border-psr-primary-400 text-psr-primary-700 dark:text-psr-primary-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">
              Dairy
              {Array.isArray(dairyFilter) && dairyFilter.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-psr-primary-600 dark:bg-psr-primary-500 text-white text-xs rounded-full min-w-[18px] text-center">
                  {dairyFilter.length}
                </span>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${dairyDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dairy Dropdown Popup */}
          {dairyDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Select Dairies
                    {Array.isArray(dairyFilter) && dairyFilter.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                        ({dairyFilter.length} selected)
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => setDairyDropdownOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md">
                  <div className="space-y-1 p-2">
                    {dairies.map((dairy) => {
                      const dairyIdStr = dairy.id.toString();
                      const isChecked = Array.isArray(dairyFilter) && dairyFilter.includes(dairyIdStr);
                      return (
                        <label
                          key={dairy.id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const currentFilters = Array.isArray(dairyFilter) ? dairyFilter : [];
                              if (e.target.checked) {
                                onDairyChange([...currentFilters, dairyIdStr]);
                              } else {
                                const newDairyFilters = currentFilters.filter(id => id !== dairyIdStr);
                                onDairyChange(newDairyFilters);
                                // Clear BMCs that belong to this dairy
                                if (onBmcChange && Array.isArray(bmcFilter)) {
                                  const bmcsToRemove = bmcs
                                    .filter(b => b.dairyFarmId?.toString() === dairyIdStr)
                                    .map(b => b.id.toString());
                                  const newBmcFilters = bmcFilter.filter(id => !bmcsToRemove.includes(id));
                                  onBmcChange(newBmcFilters);
                                }
                              }
                              onSocietyChange([]);
                            }}
                            className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {dairy.name}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({dairy.dairyId})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      onDairyChange([]);
                      if (onBmcChange) onBmcChange([]);
                      onSocietyChange([]);
                      setDairyDropdownOpen(false);
                    }}
                    className="flex-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setDairyDropdownOpen(false)}
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

        {/* BMC Filter Button */}
        {bmcs && bmcs.length > 0 && onBmcChange && (
        <div className="relative" ref={bmcDropdownRef}>
          <button
            onClick={() => setBmcDropdownOpen(!bmcDropdownOpen)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all ${
              (Array.isArray(bmcFilter) && bmcFilter.length > 0) || (typeof bmcFilter === 'string' && bmcFilter !== 'all')
                ? 'bg-psr-primary-50 dark:bg-psr-primary-900/20 border-psr-primary-500 dark:border-psr-primary-400 text-psr-primary-700 dark:text-psr-primary-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">
              BMC
              {Array.isArray(bmcFilter) && bmcFilter.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-psr-primary-600 dark:bg-psr-primary-500 text-white text-xs rounded-full min-w-[18px] text-center">
                  {bmcFilter.length}
                </span>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${bmcDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* BMC Dropdown Popup */}
          {bmcDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Select BMCs
                    {Array.isArray(bmcFilter) && bmcFilter.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                        ({bmcFilter.length} selected)
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => setBmcDropdownOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md">
                  <div className="space-y-1 p-2">
                    {(() => {
                      // Filter BMCs: only those with dairy filter match
                      const filteredBmcs = bmcs.filter(bmc => {
                        const dairyFilterArray = Array.isArray(dairyFilter) ? dairyFilter : [];
                        const matchesDairy = dairyFilterArray.length === 0 || 
                          dairyFilterArray.includes(bmc.dairyFarmId?.toString() || '');
                        return matchesDairy;
                      });

                      if (filteredBmcs.length === 0) {
                        const dairyFilterArray = Array.isArray(dairyFilter) ? dairyFilter : [];
                        const message = dairyFilterArray.length > 0
                          ? 'No BMCs available for selected dairies'
                          : 'No BMCs available';
                        return (
                          <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                            {message}
                          </div>
                        );
                      }

                      // Group BMCs by dairy if no specific dairy is selected
                      const dairyFilterArray = Array.isArray(dairyFilter) ? dairyFilter : [];
                      if (dairyFilterArray.length === 0) {
                        const bmcsByDairy = filteredBmcs.reduce((acc, bmc) => {
                          const dairyId = bmc.dairyFarmId || 'unassigned';
                          if (!acc[dairyId]) acc[dairyId] = [];
                          acc[dairyId].push(bmc);
                          return acc;
                        }, {} as Record<string | number, typeof filteredBmcs>);

                        return Object.entries(bmcsByDairy).map(([dairyId, dairyBmcs]) => {
                          const dairy = dairies.find(d => d.id.toString() === dairyId);
                          
                          return (
                            <div key={dairyId} className="mb-3">
                              {/* Dairy Header */}
                              {dairy && (
                                <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                                  {dairy.name} ({dairy.dairyId})
                                </div>
                              )}
                              
                              {/* BMCs under this dairy */}
                              {dairyBmcs.map((bmc) => {
                                const bmcIdStr = bmc.id.toString();
                                const isChecked = Array.isArray(bmcFilter) && bmcFilter.includes(bmcIdStr);
                                return (
                                  <label
                                    key={bmc.id}
                                    className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        const currentFilters = Array.isArray(bmcFilter) ? bmcFilter : [];
                                        if (e.target.checked) {
                                          onBmcChange([...currentFilters, bmcIdStr]);
                                        } else {
                                          onBmcChange(currentFilters.filter(id => id !== bmcIdStr));
                                        }
                                        onSocietyChange([]);
                                      }}
                                      className="w-4 h-4 text-emerald-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-900 dark:text-gray-100 flex-1">
                                      {bmc.name}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      ({bmc.bmcId})
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          );
                        });
                      }

                      // If specific dairy is selected, show flat list
                      return filteredBmcs.map((bmc) => {
                        const bmcIdStr = bmc.id.toString();
                        const isChecked = Array.isArray(bmcFilter) && bmcFilter.includes(bmcIdStr);
                        return (
                          <label
                            key={bmc.id}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const currentFilters = Array.isArray(bmcFilter) ? bmcFilter : [];
                                if (e.target.checked) {
                                  onBmcChange([...currentFilters, bmcIdStr]);
                                } else {
                                  onBmcChange(currentFilters.filter(id => id !== bmcIdStr));
                                }
                                onSocietyChange([]);
                              }}
                              className="w-4 h-4 text-emerald-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 cursor-pointer"
                            />
                            <span className="text-sm text-gray-900 dark:text-gray-100 flex-1">
                              {bmc.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({bmc.bmcId})
                            </span>
                          </label>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      onBmcChange([]);
                      onSocietyChange([]);
                      setBmcDropdownOpen(false);
                    }}
                    className="flex-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setBmcDropdownOpen(false)}
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

        {/* Society Filter Button */}
        {!hideSocietyFilter && societies && societies.length > 0 && (
        <div className="relative" ref={societyDropdownRef}>
          <button
            onClick={() => setSocietyDropdownOpen(!societyDropdownOpen)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all ${
              Array.isArray(societyFilter) && societyFilter.length > 0
                ? 'bg-psr-primary-50 dark:bg-psr-primary-900/20 border-psr-primary-500 dark:border-psr-primary-400 text-psr-primary-700 dark:text-psr-primary-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">
              Society
              {Array.isArray(societyFilter) && societyFilter.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-psr-primary-600 dark:bg-psr-primary-500 text-white text-xs rounded-full min-w-[18px] text-center">
                  {societyFilter.length}
                </span>
              )}
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
                        
                        const dairyFilterArray = Array.isArray(dairyFilter) ? dairyFilter : [];
                        const bmcFilterArray = Array.isArray(bmcFilter) ? bmcFilter : [];
                        
                        // If both dairy and BMC filters are active, combine them
                        if (dairyFilterArray.length > 0 && bmcFilterArray.length > 0) {
                          const selectedBmcIds = bmcFilterArray.map(id => parseInt(id));
                          const dairyBmcIds = bmcs
                            .filter(b => dairyFilterArray.includes(b.dairyFarmId?.toString() || ''))
                            .map(b => b.id);
                          // Show societies that match BOTH dairy (through BMC) AND selected BMC
                          const validBmcIds = selectedBmcIds.filter(id => dairyBmcIds.includes(id));
                          filteredSocieties = societies.filter(s => 
                            s.bmc_id && validBmcIds.includes(s.bmc_id)
                          );
                        }
                        // If only BMC filter is active, show societies under those BMCs
                        else if (bmcFilterArray.length > 0) {
                          const selectedBmcIds = bmcFilterArray.map(id => parseInt(id));
                          filteredSocieties = societies.filter(s => 
                            s.bmc_id && selectedBmcIds.includes(s.bmc_id)
                          );
                        }
                        // If only dairy filter is active, get BMCs under those dairies
                        else if (dairyFilterArray.length > 0) {
                          const dairyBmcIds = bmcs
                            .filter(b => dairyFilterArray.includes(b.dairyFarmId?.toString() || ''))
                            .map(b => b.id);
                          filteredSocieties = societies.filter(s => 
                            s.bmc_id && dairyBmcIds.includes(s.bmc_id)
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
                                      className="w-4 h-4 text-emerald-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 cursor-pointer"
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
                    onClick={() => {
                      onSocietyChange([]);
                      setSocietyDropdownOpen(false);
                    }}
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

        {/* Machine Filter Button */}
        {showMachineFilter && (
        <div className="relative" ref={machineDropdownRef}>
          <button
            onClick={() => setMachineDropdownOpen(!machineDropdownOpen)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all ${
              Array.isArray(machineFilter) && machineFilter.length > 0
                ? 'bg-psr-primary-50 dark:bg-psr-primary-900/20 border-psr-primary-500 dark:border-psr-primary-400 text-psr-primary-700 dark:text-psr-primary-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">
              Machine
              {Array.isArray(machineFilter) && machineFilter.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-psr-primary-600 dark:bg-psr-primary-500 text-white text-xs rounded-full min-w-[18px] text-center">
                  {machineFilter.length}
                </span>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${machineDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Machine Dropdown Popup */}
          {machineDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Select Machines
                    {Array.isArray(machineFilter) && machineFilter.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                        ({machineFilter.length} selected)
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => setMachineDropdownOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md">
                  <div className="space-y-1 p-2">
                    {uniqueMachines.length === 0 ? (
                      <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                        No machines available
                      </div>
                    ) : (
                      (() => {
                        // Group machines by society
                        const machinesBySociety = uniqueMachines.reduce((acc, machine) => {
                          const societyId = machine.societyId || 'unassigned';
                          if (!acc[societyId]) acc[societyId] = [];
                          acc[societyId].push(machine);
                          return acc;
                        }, {} as Record<string | number, typeof uniqueMachines>);

                        return Object.entries(machinesBySociety).map(([societyId, societyMachines]) => {
                          const society = societies.find(s => s.id.toString() === societyId);
                          const bmc = society?.bmc_id ? bmcs.find(b => b.id === society.bmc_id) : null;
                          const dairy = bmc?.dairyFarmId ? dairies.find(d => d.id === bmc.dairyFarmId) : null;
                          
                          return (
                            <div key={societyId} className="mb-3">
                              {/* Hierarchy Header: Dairy → BMC → Society */}
                              <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                                {societyId === 'unassigned' ? (
                                  'Unassigned Machines'
                                ) : (
                                  <>
                                    {dairy && <span className="text-blue-600 dark:text-blue-400">{dairy.name} → </span>}
                                    {bmc && <span className="text-emerald-600 dark:text-emerald-400">{bmc.name} → </span>}
                                    <span className="text-purple-600 dark:text-purple-400">{society?.name || `Society ${societyId}`}</span>
                                  </>
                                )}
                              </div>
                              
                              {/* Machines under this society */}
                              {societyMachines.map((machine) => (
                                <label
                                  key={machine.id}
                                  className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={Array.isArray(machineFilter) && machineFilter.includes(machine.id.toString())}
                                    onChange={(e) => {
                                      const currentFilter = Array.isArray(machineFilter) ? machineFilter : [];
                                      if (e.target.checked) {
                                        onMachineChange([...currentFilter, machine.id.toString()]);
                                      } else {
                                        onMachineChange(currentFilter.filter(id => id !== machine.id.toString()));
                                      }
                                    }}
                                    className="w-4 h-4 text-emerald-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 cursor-pointer"
                                  />
                                  <span className="text-sm text-gray-900 dark:text-gray-100 flex-1">
                                    {machine.machineType}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {machine.collectionCount !== undefined && (
                                      <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                                        {machine.collectionCount}
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      ({machine.machineId})
                                    </span>
                                  </div>
                                </label>
                              ))}
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      onMachineChange([]);
                      setMachineDropdownOpen(false);
                    }}
                    className="flex-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setMachineDropdownOpen(false)}
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

        {/* Farmer Filter Button */}
        {showFarmerFilter && farmers && farmers.length > 0 && onFarmerChange && (
        <div className="relative" ref={farmerDropdownRef}>
          <button
            onClick={() => setFarmerDropdownOpen(!farmerDropdownOpen)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all ${
              Array.isArray(farmerFilter) && farmerFilter.length > 0
                ? 'bg-psr-primary-50 dark:bg-psr-primary-900/20 border-psr-primary-500 dark:border-psr-primary-400 text-psr-primary-700 dark:text-psr-primary-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">
              {farmerFilterLabel}
              {Array.isArray(farmerFilter) && farmerFilter.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-psr-primary-600 dark:bg-psr-primary-500 text-white text-xs rounded-full min-w-[18px] text-center">
                  {farmerFilter.length}
                </span>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${farmerDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Farmer Dropdown Popup */}
          {farmerDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Select {farmerFilterLabel}s
                    {Array.isArray(farmerFilter) && farmerFilter.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                        ({farmerFilter.length} selected)
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => setFarmerDropdownOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search input for farmers */}
                {!simpleFarmerFilter && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Search by ${farmerFilterLabel.toLowerCase()} name, ID, or UID...`}
                    value={farmerSearchTerm}
                    onChange={(e) => setFarmerSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>
                )}

                <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md">
                  <div className="space-y-1 p-2">
                    {farmers.length === 0 ? (
                      <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                        No farmers available
                      </div>
                    ) : (
                      (() => {
                        // Filter farmers based on selected societies and search term
                        let filteredFarmers = farmers;
                        
                        const societyFilterArray = Array.isArray(societyFilter) ? societyFilter : [];
                        
                        // If society filter is active, show only farmers under those societies
                        if (societyFilterArray.length > 0) {
                          const selectedSocietyIds = societyFilterArray.map(id => parseInt(id));
                          filteredFarmers = farmers.filter(f => 
                            f.societyId && selectedSocietyIds.includes(f.societyId)
                          );
                        }

                        // Apply search filter
                        if (farmerSearchTerm.trim()) {
                          const searchLower = farmerSearchTerm.toLowerCase();
                          filteredFarmers = filteredFarmers.filter(f => 
                            f.farmerName.toLowerCase().includes(searchLower) ||
                            f.farmerId.toLowerCase().includes(searchLower) ||
                            (f.farmeruid && f.farmeruid.toLowerCase().includes(searchLower))
                          );
                        }

                        if (filteredFarmers.length === 0) {
                          const message = societyFilterArray.length > 0
                            ? `No ${farmerFilterLabel.toLowerCase()}s available for selected societies`
                            : `No ${farmerFilterLabel.toLowerCase()}s available`;
                          return (
                            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                              {message}
                            </div>
                          );
                        }

                        // Group farmers by society
                        const farmersBySociety = filteredFarmers.reduce((acc, farmer) => {
                          const societyId = farmer.societyId || 'unassigned';
                          if (!acc[societyId]) acc[societyId] = [];
                          acc[societyId].push(farmer);
                          return acc;
                        }, {} as Record<string | number, typeof filteredFarmers>);

                        return Object.entries(farmersBySociety).map(([societyId, societyFarmers]) => {
                          const society = societies.find(s => s.id.toString() === societyId);
                          const bmc = society?.bmc_id ? bmcs.find(b => b.id === society.bmc_id) : null;
                          const dairy = bmc?.dairyFarmId ? dairies.find(d => d.id === bmc.dairyFarmId) : null;
                          
                          return (
                            <div key={societyId} className="mb-3">
                              {/* Hierarchy Header: Dairy → BMC → Society */}
                              {!simpleFarmerFilter && (
                              <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                                {societyId === 'unassigned' ? (
                                  `Unassigned ${farmerFilterLabel}s`
                                ) : (
                                  <>
                                    {dairy && <span className="text-blue-600 dark:text-blue-400">{dairy.name} → </span>}
                                    {bmc && <span className="text-emerald-600 dark:text-emerald-400">{bmc.name} → </span>}
                                    <span className="text-purple-600 dark:text-purple-400">{society?.name || `Society ${societyId}`}</span>
                                  </>
                                )}
                              </div>
                              )}
                              
                              {/* Farmers under this society */}
                              {societyFarmers.map((farmer) => (
                                <label
                                  key={farmer.id}
                                  className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={Array.isArray(farmerFilter) && farmerFilter.includes(farmer.id.toString())}
                                    onChange={(e) => {
                                      const currentFilter = Array.isArray(farmerFilter) ? farmerFilter : [];
                                      if (e.target.checked) {
                                        onFarmerChange([...currentFilter, farmer.id.toString()]);
                                      } else {
                                        onFarmerChange(currentFilter.filter(id => id !== farmer.id.toString()));
                                      }
                                    }}
                                    className="w-4 h-4 text-emerald-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 cursor-pointer"
                                  />
                                  <div className="flex-1">
                                    <span className="text-sm text-gray-900 dark:text-gray-100 block">
                                      {farmer.farmerName}
                                    </span>
                                    {!simpleFarmerFilter && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      ID: {farmer.farmerId}
                                      {farmer.farmeruid && (
                                        <span className="ml-2">UID: {farmer.farmeruid}</span>
                                      )}
                                    </span>
                                    )}
                                  </div>
                                  {simpleFarmerFilter && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      ({farmer.farmerId})
                                    </span>
                                  )}
                                </label>
                              ))}
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      onFarmerChange([]);
                      setFarmerSearchTerm('');
                      setFarmerDropdownOpen(false);
                    }}
                    className="flex-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => {
                      setFarmerSearchTerm('');
                      setFarmerDropdownOpen(false);
                    }}
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

        {/* Channel Filter Button */}
        {showChannelFilter && (
        <div className="relative" ref={channelDropdownRef}>
          <button
            onClick={() => setChannelDropdownOpen(!channelDropdownOpen)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all ${
              channelFilter && channelFilter !== 'all'
                ? 'bg-psr-primary-50 dark:bg-psr-primary-900/20 border-psr-primary-500 dark:border-psr-primary-400 text-psr-primary-700 dark:text-psr-primary-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">
              Channel
              {channelFilter && channelFilter !== 'all' && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-psr-primary-600 dark:bg-psr-primary-500 text-white text-xs rounded-full min-w-[18px] text-center">
                  1
                </span>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${channelDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Channel Dropdown Popup */}
          {channelDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Select Channel
                  </h3>
                  <button
                    onClick={() => setChannelDropdownOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Channels' },
                    { value: 'COW', label: 'Cow' },
                    { value: 'BUFFALO', label: 'Buffalo' },
                    { value: 'MIXED', label: 'Mixed' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="channel"
                        checked={channelFilter === option.value}
                        onChange={() => {
                          if (onChannelChange) {
                            onChannelChange(option.value);
                          }
                        }}
                        className="w-4 h-4 text-psr-primary-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-psr-primary-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-900 dark:text-gray-100 flex-1">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      if (onChannelChange) onChannelChange('all');
                      setChannelDropdownOpen(false);
                    }}
                    className="flex-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setChannelDropdownOpen(false)}
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

        {/* Shift Filter Button */}
        {showShiftFilter && (
        <div className="relative" ref={shiftDropdownRef}>
          <button
            onClick={() => setShiftDropdownOpen(!shiftDropdownOpen)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all ${
              statusFilter !== 'all'
                ? 'bg-psr-primary-50 dark:bg-psr-primary-900/20 border-psr-primary-500 dark:border-psr-primary-400 text-psr-primary-700 dark:text-psr-primary-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">
              Shift
              {statusFilter !== 'all' && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-psr-primary-600 dark:bg-psr-primary-500 text-white text-xs rounded-full min-w-[18px] text-center">
                  1
                </span>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${shiftDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Shift Dropdown Popup */}
          {shiftDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Select Shift
                  </h3>
                  <button
                    onClick={() => setShiftDropdownOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="shift"
                      value="all"
                      checked={statusFilter === 'all'}
                      onChange={() => onStatusChange('all')}
                      className="w-4 h-4 text-amber-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 cursor-pointer"
                    />
                    <span className="text-sm text-gray-900 dark:text-gray-100">All Shifts</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="shift"
                      value="morning"
                      checked={statusFilter === 'morning'}
                      onChange={() => onStatusChange('morning')}
                      className="w-4 h-4 text-amber-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 cursor-pointer"
                    />
                    <span className="text-sm text-gray-900 dark:text-gray-100">Morning</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="shift"
                      value="evening"
                      checked={statusFilter === 'evening'}
                      onChange={() => onStatusChange('evening')}
                      className="w-4 h-4 text-indigo-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
                    />
                    <span className="text-sm text-gray-900 dark:text-gray-100">Evening</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      onStatusChange('all');
                      setShiftDropdownOpen(false);
                    }}
                    className="flex-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShiftDropdownOpen(false)}
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
                        setDateRangeOpen(false);
                      }}
                      className="flex-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Clear All
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
        {(filteredCount > 0 || totalCount > 0) && (
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {icon}
            <span className="font-medium">
              {filteredCount}/{totalCount} items
            </span>
          </div>
        )}

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
                        {dairy.name} ({dairy.dairyId})
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
                          {bmc.name} ({bmc.bmcId})
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
                  {Array.isArray(machineFilter) && machineFilter.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-psr-emerald-100 dark:bg-psr-emerald-900/30 text-psr-emerald-700 dark:text-psr-emerald-300 text-xs rounded">
                      Machine: {machineFilter.length} selected
                      <button onClick={() => onMachineChange([])} className="hover:text-psr-emerald-900 dark:hover:text-psr-emerald-100">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {Array.isArray(farmerFilter) && farmerFilter.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-psr-blue-100 dark:bg-psr-blue-900/30 text-psr-blue-700 dark:text-psr-blue-300 text-xs rounded">
                      {farmerFilterLabel}: {farmerFilter.length} selected
                      <button onClick={() => onFarmerChange && onFarmerChange([])} className="hover:text-psr-blue-900 dark:hover:text-psr-blue-100">
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
