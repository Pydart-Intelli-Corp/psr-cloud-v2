'use client';

import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray';
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

/**
 * Reusable statistics card component
 * Used across all management pages for displaying key metrics
 */
const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'green',
  className = '',
  onClick,
  clickable = false
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          text: 'text-green-600 dark:text-green-400',
          valueText: 'text-green-600 dark:text-green-400'
        };
      case 'red':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-600 dark:text-red-400',
          valueText: 'text-red-600 dark:text-red-400'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-600 dark:text-yellow-400',
          valueText: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'blue':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-600 dark:text-blue-400',
          valueText: 'text-blue-600 dark:text-blue-400'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-900/30',
          text: 'text-gray-600 dark:text-gray-400',
          valueText: 'text-gray-900 dark:text-gray-100'
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <div 
      className={`bg-white dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow ${clickable ? 'cursor-pointer hover:border-green-500' : ''} ${className}`}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className={`text-lg sm:text-xl lg:text-2xl font-bold mt-1 ${colorClasses.valueText}`}>
            {value}
          </p>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${colorClasses.bg} ml-2 flex-shrink-0`}>
          <div className={`w-4 h-4 sm:w-5 sm:h-5 ${colorClasses.text}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;