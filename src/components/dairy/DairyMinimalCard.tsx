'use client';

import React from 'react';
import { Milk, Edit3, Trash2, Eye, MapPin, User, Phone, Mail, Calendar, Building2, MoreVertical, Activity } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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

// Helper function to get status color and styles
const getStatusStyles = (status: 'active' | 'inactive' | 'maintenance') => {
  switch (status) {
    case 'active':
      return {
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-700 dark:text-green-300',
        dotColor: 'bg-green-600 dark:bg-green-400',
        label: 'Active'
      };
    case 'inactive':
      return {
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-300',
        dotColor: 'bg-red-600 dark:bg-red-400',
        label: 'Inactive'
      };
    case 'maintenance':
      return {
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        textColor: 'text-amber-700 dark:text-amber-300',
        dotColor: 'bg-amber-600 dark:bg-amber-400',
        label: 'Maintenance'
      };
    default:
      return {
        bgColor: 'bg-gray-100 dark:bg-gray-900/30',
        textColor: 'text-gray-700 dark:text-gray-300',
        dotColor: 'bg-gray-600 dark:bg-gray-400',
        label: status
      };
  }
};

interface DairyMinimalCardProps {
  id: number;
  name: string;
  dairyId: string;
  location?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  monthlyTarget?: number;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onStatusChange: (newStatus: 'active' | 'inactive' | 'maintenance') => void;
  searchQuery?: string;
}

export default function DairyMinimalCard({
  name,
  dairyId,
  location,
  contactPerson,
  phone,
  email,
  capacity,
  monthlyTarget,
  status,
  createdAt,
  isSelected = false,
  onToggleSelection,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  searchQuery = '',
}: DairyMinimalCardProps) {
  const { t } = useLanguage();
  const [showActionsMenu, setShowActionsMenu] = React.useState(false);
  const [showStatusMenu, setShowStatusMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const statusRef = React.useRef<HTMLDivElement>(null);

  const statusStyles = getStatusStyles(status);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    };

    if (showActionsMenu || showStatusMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu, showStatusMenu]);

  return (
    <div
      className={`relative border rounded-xl p-5 transition-all duration-300 hover:shadow-lg ${
        isSelected
          ? 'border-blue-500 dark:border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-md ring-2 ring-blue-200 dark:ring-blue-700'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
      }`}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        {/* Left: Checkbox & Dairy Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {onToggleSelection && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelection}
              className="mt-1 w-4 h-4 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2 cursor-pointer transition-transform hover:scale-110"
            />
          )}
          
          {/* Dairy Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Milk className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={name}>
                {highlightText(name, searchQuery)}
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {highlightText(dairyId, searchQuery)}
              </span>
              
              {/* Status Badge - Clickable */}
              <div className="relative" ref={statusRef}>
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold transition-all hover:opacity-80 ${statusStyles.bgColor} ${statusStyles.textColor}`}
                >
                  <div className={`w-2 h-2 rounded-full ${statusStyles.dotColor}`} />
                  {statusStyles.label}
                </button>

                {/* Status Change Dropdown */}
                {showStatusMenu && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onStatusChange('active');
                          setShowStatusMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-green-50 dark:hover:bg-green-900/30 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-600" />
                        <span className="text-green-700 dark:text-green-300">Active</span>
                      </button>
                      <button
                        onClick={() => {
                          onStatusChange('inactive');
                          setShowStatusMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-red-600" />
                        <span className="text-red-700 dark:text-red-300">Inactive</span>
                      </button>
                      <button
                        onClick={() => {
                          onStatusChange('maintenance');
                          setShowStatusMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-amber-50 dark:hover:bg-amber-900/30 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-amber-600" />
                        <span className="text-amber-700 dark:text-amber-300">Maintenance</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions Menu */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Actions"
          >
            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Actions Dropdown */}
          {showActionsMenu && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
              <div className="py-1">
                <button
                  onClick={() => {
                    onView();
                    setShowActionsMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <Eye className="w-4 h-4" />
                  {t.common?.view || 'View Details'}
                </button>
                <button
                  onClick={() => {
                    onEdit();
                    setShowActionsMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <Edit3 className="w-4 h-4" />
                  {t.common?.edit || 'Edit'}
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700" />
                <button
                  onClick={() => {
                    onDelete();
                    setShowActionsMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-3 text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  {t.common?.delete || 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-2.5">
        {location && (
          <div className="flex items-start gap-2 text-xs">
            <MapPin className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300 break-words">
              {highlightText(location, searchQuery)}
            </span>
          </div>
        )}

        {contactPerson && (
          <div className="flex items-start gap-2 text-xs">
            <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300 break-words">
              {highlightText(contactPerson, searchQuery)}
            </span>
          </div>
        )}

        {phone && (
          <div className="flex items-start gap-2 text-xs">
            <Phone className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300">
              {highlightText(phone, searchQuery)}
            </span>
          </div>
        )}

        {email && (
          <div className="flex items-start gap-2 text-xs">
            <Mail className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300 break-all">
              {highlightText(email, searchQuery)}
            </span>
          </div>
        )}

        {capacity !== undefined && capacity > 0 && (
          <div className="flex items-start gap-2 text-xs">
            <Building2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300">
              Capacity: {capacity.toLocaleString()} L
            </span>
          </div>
        )}

        {monthlyTarget !== undefined && monthlyTarget > 0 && (
          <div className="flex items-start gap-2 text-xs">
            <Activity className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300">
              Target: {monthlyTarget.toLocaleString()} L/month
            </span>
          </div>
        )}

        <div className="flex items-start gap-2 text-xs">
          <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="text-gray-700 dark:text-gray-300">
            Created: {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Footer - View Button */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onView}
          className="w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          {t.dairyManagement?.viewDetails || 'View Details'}
        </button>
      </div>
    </div>
  );
}
