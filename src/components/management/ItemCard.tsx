'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Eye, Lock } from 'lucide-react';
import StatusDropdown from './StatusDropdown';

interface DetailItem {
  icon: React.ReactNode;
  text: string;
  show?: boolean;
  highlight?: boolean; // New property for highlighting
  className?: string; // Custom className for styling
}

// Helper function to highlight matching text
const highlightText = (text: string, searchQuery: string) => {
  if (!searchQuery) return text;
  
  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <span key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
        {part}
      </span>
    ) : (
      part
    )
  );
};

interface ItemCardProps {
  id: string | number;
  name: string;
  identifier: string;
  status: string;
  icon: React.ReactNode;
  details: DetailItem[];
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onStatusChange?: (status: string) => void;
  onPasswordSettings?: () => void;
  editTitle?: string;
  deleteTitle?: string;
  viewText?: string;
  passwordTitle?: string;
  className?: string;
  // Selection support
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  // Search highlighting
  searchQuery?: string;
  // Display options
  showStatus?: boolean;
}

/**
 * Reusable item card component for displaying management items
 * Used across dairy, BMC, society, and machine management
 */
const ItemCard: React.FC<ItemCardProps> = ({
  id,
  name,
  identifier,
  status,
  icon,
  details,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  onPasswordSettings,
  editTitle = 'Edit',
  deleteTitle = 'Delete',
  viewText = 'View Details',
  passwordTitle = 'Password Settings',
  className = '',
  selectable = false,
  selected = false,
  onSelect,
  searchQuery = '',
  showStatus = true
}) => {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-green-200 dark:hover:border-green-700 flex flex-col ${selected ? 'ring-2 ring-green-500 border-green-500' : ''} ${className}`}
    >
      <div className="p-4 sm:p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            {selectable && (
              <input
                type="checkbox"
                checked={selected}
                onChange={onSelect}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            )}
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex-shrink-0">
              <div className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400">
                {icon}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {highlightText(name, searchQuery)}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {highlightText(identifier, searchQuery)}
              </p>
            </div>
          </div>
          {showStatus && onStatusChange && (
            <StatusDropdown
              currentStatus={status}
              onStatusChange={onStatusChange}
            />
          )}
        </div>

        {/* Details */}
        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 flex-1">
          {details.map((detail, index) => (
            detail.show !== false && (
              <div key={index} className={`flex items-center text-xs sm:text-sm ${
                detail.highlight 
                  ? 'text-green-600 dark:text-green-400 font-medium' 
                  : detail.className || 'text-gray-600 dark:text-gray-400'
              }`}>
                <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 flex-shrink-0 ${
                  detail.highlight ? 'text-green-600 dark:text-green-400' : ''
                }`}>
                  {detail.icon}
                </div>
                <span className={detail.text.includes('@') || detail.text.length > 30 ? 'truncate' : ''}>
                  {highlightText(detail.text, searchQuery)}
                </span>
              </div>
            )
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
          <div className="flex space-x-1 sm:space-x-2">
            <button
              onClick={onEdit}
              className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 touch-target sm:min-h-0 sm:min-w-0 flex items-center justify-center"
              title={editTitle}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            {onPasswordSettings && (
              <button
                onClick={onPasswordSettings}
                className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 touch-target sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                title={passwordTitle}
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onDelete}
              className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 touch-target sm:min-h-0 sm:min-w-0 flex items-center justify-center"
              title={deleteTitle}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={onView}
            className="flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors touch-target sm:min-h-0"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">{viewText}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;