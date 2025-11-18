'use client';

import React from 'react';
import { Receipt, Trash2, UserPlus, Power, PowerOff, Eye, RefreshCw, FileText, X, MoreVertical, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { ConfirmDeleteModal } from '@/components/management';

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

interface Society {
  societyId: number;
  societyName: string;
  societyIdentifier: string;
  chartRecordId: number;
}

interface RateChartMinimalCardProps {
  chartId: number;
  fileName: string;
  channel: string;
  uploadedBy: string;
  createdAt: string;
  societies: Society[];
  status: number;
  isSelected: boolean;
  onToggleSelection: () => void;
  onDelete: () => void;
  onAssignSociety: () => void;
  onToggleStatus: (chartId: number, currentStatus: number) => void;
  onView: () => void;
  onResetDownload: () => void;
  onRemoveSociety?: (chartRecordId: number, societyId: number, societyName: string) => void;
  searchQuery?: string;
}

export default function RateChartMinimalCard({
  chartId,
  fileName,
  channel,
  uploadedBy,
  createdAt,
  societies,
  status,
  isSelected,
  onToggleSelection,
  onDelete,
  onAssignSociety,
  onToggleStatus,
  onView,
  onResetDownload,
  onRemoveSociety,
  searchQuery = '',
}: RateChartMinimalCardProps) {
  const [showActionsMenu, setShowActionsMenu] = React.useState(false);
  const [showSocietiesDropdown, setShowSocietiesDropdown] = React.useState(false);
  const [societyToRemove, setSocietyToRemove] = React.useState<{ chartRecordId: number; societyId: number; societyName: string } | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

  return (
    <div
      className={`relative border rounded-xl p-5 transition-all duration-300 hover:shadow-lg ${
        isSelected
          ? 'border-green-500 dark:border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 shadow-md ring-2 ring-green-200 dark:ring-green-700'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-green-600'
      }`}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        {/* Left: Checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelection}
            className="mt-1 w-4 h-4 text-green-600 dark:text-green-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 dark:focus:ring-green-400 focus:ring-2 cursor-pointer transition-transform hover:scale-110"
          />
          
          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={fileName}>
                {highlightText(fileName, searchQuery)}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                channel === 'COW' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : channel === 'BUF'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
              }`}>
                {highlightText(channel, searchQuery)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                status === 1 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {status === 1 ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Actions"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Dropdown Menu */}
          {showActionsMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1">
              <button
                onClick={() => {
                  onView();
                  setShowActionsMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>View Chart Data</span>
              </button>
              <button
                onClick={() => {
                  onAssignSociety();
                  setShowActionsMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <UserPlus className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>Assign to Societies</span>
              </button>
              <button
                onClick={() => {
                  onResetDownload();
                  setShowActionsMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Reset Download</span>
              </button>
              <button
                onClick={() => {
                  onToggleStatus(chartId, status);
                  setShowActionsMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {status === 1 ? (
                  <>
                    <PowerOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span>Deactivate Chart</span>
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>Activate Chart</span>
                  </>
                )}
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              <button
                onClick={() => {
                  onDelete();
                  setShowActionsMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Chart</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Section */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          <span>{uploadedBy}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>•</span>
          <span>{new Date(createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}</span>
        </div>
      </div>

      {/* Societies Section */}
      <div className="relative bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowSocietiesDropdown(!showSocietiesDropdown)}
          className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span>Assigned Societies ({societies.length})</span>
          </div>
          {showSocietiesDropdown ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {/* Societies Dropdown */}
        {showSocietiesDropdown && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden max-h-64 overflow-y-auto">
            {societies.map((society) => (
              <div
                key={society.societyId}
                className="group flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-green-700 dark:text-green-300">
                      {society.societyName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={society.societyName}>
                      {highlightText(society.societyName, searchQuery)}
                    </p>
                    {society.societyIdentifier && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {highlightText(society.societyIdentifier, searchQuery)}
                      </p>
                    )}
                  </div>
                </div>
                
                {onRemoveSociety && societies.length > 1 && (
                  <button
                    onClick={() => {
                      setSocietyToRemove({
                        chartRecordId: society.chartRecordId,
                        societyId: society.societyId,
                        societyName: society.societyName
                      });
                    }}
                    className="ml-2 p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title={`Remove ${society.societyName}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Remove Society Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!societyToRemove}
        onClose={() => setSocietyToRemove(null)}
        onConfirm={() => {
          if (societyToRemove && onRemoveSociety) {
            onRemoveSociety(societyToRemove.chartRecordId, societyToRemove.societyId, societyToRemove.societyName);
            if (societies.length === 2) {
              setShowSocietiesDropdown(false);
            }
          }
          setSocietyToRemove(null);
        }}
        itemName={societyToRemove?.societyName || ''}
        itemType="society"
        title="Remove Society Assignment"
        message="Are you sure you want to remove"
        confirmText="Remove Society"
      />
    </div>
  );
}
