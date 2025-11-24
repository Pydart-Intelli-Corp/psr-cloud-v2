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
  isActive?: boolean;
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
  clickable = false,
  isActive = false
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

  const getActiveClasses = () => {
    if (!isActive) return '';
    
    switch (color) {
      case 'green':
        return 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20';
      case 'red':
        return 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20';
      case 'yellow':
        return 'ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'blue':
        return 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'ring-2 ring-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all ${
        clickable ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''
      } ${getActiveClasses()} ${className}`}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-lg ${colorClasses.bg} flex-shrink-0`}>
            <div className={`w-3 h-3 ${colorClasses.text}`}>
              {icon}
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">
            {title}
          </p>
        </div>
        <p className={`text-xl sm:text-2xl font-bold ${colorClasses.valueText} leading-none overflow-hidden text-ellipsis`}>
          {value}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;