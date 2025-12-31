'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Eye, Lock } from 'lucide-react';
import StatusDropdown from './StatusDropdown';

interface DetailItem {
  icon: React.ReactNode;
  text: string | React.ReactNode;
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
  // Badge support (e.g., for master machine)
  badge?: {
    text: string;
    color: string;
    onClick?: () => void; // Make badge clickable
  };
  // Selection support
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  // Search highlighting
  searchQuery?: string;
  // Display options
  showStatus?: boolean;
  // Image support
  imageUrl?: string;
  onImageClick?: () => void;
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
  badge,
  selectable = false,
  selected = false,
  onSelect,
  searchQuery = '',
  showStatus = true,
  imageUrl,
  onImageClick
}) => {
  const [imageLoading, setImageLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-green-200 dark:hover:border-green-700 flex flex-col ${selected ? 'ring-2 ring-green-500 border-green-500' : ''} ${className}`}
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
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {highlightText(name, searchQuery)}
                </h3>
                {badge && (
                  <span 
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full border shadow-sm ${badge.color} ${badge.onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                    onClick={(e) => {
                      if (badge.onClick) {
                        e.stopPropagation();
                        badge.onClick();
                      }
                    }}
                    title={badge.onClick ? 'Click to change master machine' : undefined}
                  >
                    {badge.text}
                  </span>
                )}
              </div>
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
        <div className="mb-3 sm:mb-4 flex-1">
          <div className="flex gap-4">
            {/* Details list - left side */}
            <div className="flex-1 space-y-2 sm:space-y-3">
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
                    <span className={typeof detail.text === 'string' && (detail.text.includes('@') || detail.text.length > 30) ? 'truncate' : ''}>
                      {typeof detail.text === 'string' ? highlightText(detail.text, searchQuery) : detail.text}
                    </span>
                  </div>
                )
              ))}
            </div>

            {/* Machine Image - right side */}
            {imageUrl && (
              <motion.div
                className="flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95, rotate: 2 }}
                transition={{ duration: 0.2 }}
              >
                <div 
                  className={`relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-xl overflow-hidden bg-transparent ${onImageClick ? 'cursor-pointer' : ''}`}
                  onClick={onImageClick}
                  style={{ transform: 'translateY(-20px)' }}
                >
                  {imageLoading && !imageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                      <div className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {imageError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                      <div className="text-gray-400 dark:text-gray-500">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={imageUrl}
                      alt="Machine"
                      className={`w-full h-full object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                      onLoad={() => setImageLoading(false)}
                      onError={() => {
                        setImageLoading(false);
                        setImageError(true);
                      }}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </div>
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