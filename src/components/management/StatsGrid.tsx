'use client';

import React from 'react';
import { StatsCard } from '@/components';
import { Users, UserCheck, UserX, AlertTriangle } from 'lucide-react';

interface ItemWithStatus {
  status: string;
}

interface StatsGridProps<T extends ItemWithStatus> {
  allItems: T[];
  filteredItems: T[];
  hasFilters: boolean;
  onStatusFilterChange?: (status: 'all' | 'active' | 'inactive' | 'suspended' | 'maintenance') => void;
  currentStatusFilter?: string;
}

/**
 * Reusable stats grid for management pages
 * Displays total, active, inactive, suspended, and maintenance counts
 */
const StatsGrid = <T extends ItemWithStatus>({
  allItems,
  filteredItems,
  hasFilters,
  onStatusFilterChange,
  currentStatusFilter = 'all'
}: StatsGridProps<T>) => {
  const getStatusCount = (items: T[], status: string) => {
    return items.filter(item => item.status === status).length;
  };

  const formatValue = (filteredCount: number, totalCount: number) => {
    return hasFilters ? `${filteredCount}/${totalCount}` : totalCount;
  };

  return (
    <div className="grid grid-cols-2 xs:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
      <StatsCard
        title="Total"
        value={hasFilters ? `${filteredItems.length}/${allItems.length}` : allItems.length}
        icon={<Users className="w-3 h-3 sm:w-4 sm:h-4" />}
        color="green"
        className="p-2 sm:p-3"
        onClick={onStatusFilterChange ? () => onStatusFilterChange('all') : undefined}
        clickable={!!onStatusFilterChange}
        isActive={currentStatusFilter === 'all'}
      />
      
      <StatsCard
        title="Active"
        value={formatValue(
          getStatusCount(filteredItems, 'active'),
          getStatusCount(allItems, 'active')
        )}
        icon={<UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />}
        color="green"
        className="p-2 sm:p-3"
        onClick={onStatusFilterChange ? () => onStatusFilterChange('active') : undefined}
        clickable={!!onStatusFilterChange}
        isActive={currentStatusFilter === 'active'}
      />

      <StatsCard
        title="Inactive"
        value={formatValue(
          getStatusCount(filteredItems, 'inactive'),
          getStatusCount(allItems, 'inactive')
        )}
        icon={<UserX className="w-3 h-3 sm:w-4 sm:h-4" />}
        color="red"
        className="p-2 sm:p-3"
        onClick={onStatusFilterChange ? () => onStatusFilterChange('inactive') : undefined}
        clickable={!!onStatusFilterChange}
        isActive={currentStatusFilter === 'inactive'}
      />

      <StatsCard
        title="Suspended"
        value={formatValue(
          getStatusCount(filteredItems, 'suspended'),
          getStatusCount(allItems, 'suspended')
        )}
        icon={<AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />}
        color="yellow"
        className="p-2 sm:p-3"
        onClick={onStatusFilterChange ? () => onStatusFilterChange('suspended') : undefined}
        clickable={!!onStatusFilterChange}
        isActive={currentStatusFilter === 'suspended'}
      />

      <StatsCard
        title="Maintenance"
        value={formatValue(
          getStatusCount(filteredItems, 'maintenance'),
          getStatusCount(allItems, 'maintenance')
        )}
        icon={<AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />}
        color="blue"
        className="p-2 sm:p-3"
        onClick={onStatusFilterChange ? () => onStatusFilterChange('maintenance') : undefined}
        clickable={!!onStatusFilterChange}
        isActive={currentStatusFilter === 'maintenance'}
      />
    </div>
  );
};

export default StatsGrid;
