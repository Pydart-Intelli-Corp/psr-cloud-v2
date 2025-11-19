'use client';

import React from 'react';
import { Receipt, Trash2, UserPlus, Power, PowerOff, Eye, RefreshCw, FileText, X, MoreVertical, ChevronDown, ChevronUp, Building2, CheckCircle, Download, Clock } from 'lucide-react';
import { ConfirmDeleteModal } from '@/components/management';
import { useLanguage } from '@/contexts/LanguageContext';

interface DownloadStatus {
  allDownloaded: boolean;
  totalMachines: number;
  totalDownloaded: number;
  totalPending: number;
  societies: Record<number, {
    societyId: number;
    societyName: string;
    societyIdentifier: string;
    totalMachines: number;
    downloadedMachines: number;
    pendingMachines: number;
    machines: Array<{
      id: number;
      machineId: string;
      machineType: string;
      location: string | null;
      downloaded: boolean;
      downloadedAt: string | null;
    }>;
  }>;
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

// Helper function to render status indicator with download info
const getStatusIndicator = (
  status: number, 
  downloadStatus: DownloadStatus | null, 
  isLoading: boolean,
  onClick?: () => void,
  hasDropdown?: boolean
) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse" />
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  // Status 0 means chart is inactive
  if (status === 0) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400" />
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Inactive</span>
      </div>
    );
  }

  // If we have download status data
  if (downloadStatus) {
    const { allDownloaded, totalDownloaded, totalMachines } = downloadStatus;

    if (totalMachines === 0) {
      // No machines assigned
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Ready</span>
        </div>
      );
    }

    const baseClasses = "flex items-center gap-1.5";
    const clickableClasses = onClick 
      ? "cursor-pointer hover:opacity-80 transition-opacity" 
      : "";

    if (allDownloaded) {
      // All machines have downloaded
      return (
        <div className={`${baseClasses} ${clickableClasses}`} onClick={onClick}>
          <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          <span className="text-xs font-medium text-green-600 dark:text-green-400">
            Downloaded ({totalDownloaded}/{totalMachines})
          </span>
          {hasDropdown && <ChevronDown className="w-3 h-3 text-green-600 dark:text-green-400" />}
        </div>
      );
    } else {
      // Partial downloads
      return (
        <div className={`${baseClasses} ${clickableClasses}`} onClick={onClick}>
          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
            Pending ({totalDownloaded}/{totalMachines})
          </span>
          {hasDropdown && <ChevronDown className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
        </div>
      );
    }
  }

  // Fallback to old behavior
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Ready</span>
    </div>
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
  const { t } = useLanguage();
  const [showActionsMenu, setShowActionsMenu] = React.useState(false);
  const [showSocietiesDropdown, setShowSocietiesDropdown] = React.useState(false);
  const [showMachineStatusDropdown, setShowMachineStatusDropdown] = React.useState(false);
  const [societyToRemove, setSocietyToRemove] = React.useState<{ chartRecordId: number; societyId: number; societyName: string } | null>(null);
  const [downloadStatus, setDownloadStatus] = React.useState<DownloadStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Fetch download status when component mounts or chartId changes
  React.useEffect(() => {
    const fetchDownloadStatus = async () => {
      if (status === 0) return; // Don't fetch if chart is inactive
      
      setLoadingStatus(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch(`/api/user/ratechart/download-status?chartId=${chartId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          setDownloadStatus(data.data);
        }
      } catch (error) {
        console.error('Error fetching download status:', error);
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchDownloadStatus();
  }, [chartId, status]);

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
              
              {/* Status Indicator - Now Clickable with Dropdown */}
              <div className="relative">
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-md ${
                  status === 0
                    ? 'bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800'
                    : downloadStatus?.allDownloaded
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : downloadStatus?.totalMachines === 0
                    ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                }`}>
                  {getStatusIndicator(
                    status,
                    downloadStatus,
                    loadingStatus,
                    downloadStatus && downloadStatus.totalMachines > 0
                      ? () => setShowMachineStatusDropdown(!showMachineStatusDropdown)
                      : undefined,
                    downloadStatus && downloadStatus.totalMachines > 0
                  )}
                </div>

                {/* Compact Machine Status Dropdown */}
                {showMachineStatusDropdown && downloadStatus && downloadStatus.totalMachines > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10 max-h-80 overflow-y-auto">
                    {/* Dropdown Header */}
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-lg flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {downloadStatus.totalDownloaded}/{downloadStatus.totalMachines} Downloaded
                        </h4>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMachineStatusDropdown(false);
                        }}
                        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Society-wise Machine List */}
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {Object.entries(downloadStatus.societies).map(([societyName, societyData]) => (
                        <div key={societyName} className="p-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                              {societyName}
                            </h5>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {societyData.downloaded}/{societyData.total}
                            </span>
                          </div>

                          {/* Downloaded Machines */}
                          {societyData.machines.filter(m => m.downloaded).length > 0 && (
                            <div className="mb-1.5">
                              <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1 flex items-center gap-1">
                                <CheckCircle className="w-2.5 h-2.5" />
                                <span>Done</span>
                              </div>
                              <div className="space-y-0.5">
                                {societyData.machines
                                  .filter(m => m.downloaded)
                                  .map((machine) => (
                                    <div
                                      key={machine.id}
                                      className="text-xs bg-green-50 dark:bg-green-900/20 rounded px-1.5 py-1"
                                    >
                                      <div className="font-medium text-green-700 dark:text-green-300 truncate">
                                        {machine.machineId}
                                      </div>
                                      <div className="text-[10px] text-green-600 dark:text-green-400 truncate">
                                        {machine.machineType} • {machine.location}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Pending Machines */}
                          {societyData.machines.filter(m => !m.downloaded).length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>Pending</span>
                              </div>
                              <div className="space-y-0.5">
                                {societyData.machines
                                  .filter(m => !m.downloaded)
                                  .map((machine) => (
                                    <div
                                      key={machine.id}
                                      className="text-xs bg-amber-50 dark:bg-amber-900/20 rounded px-1.5 py-1"
                                    >
                                      <div className="font-medium text-amber-700 dark:text-amber-300 truncate">
                                        {machine.machineId}
                                      </div>
                                      <div className="text-[10px] text-amber-600 dark:text-amber-400 truncate">
                                        {machine.machineType} • {machine.location}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                <span>{t.common.view || 'View'} {t.ratechartManagement.rateChart}</span>
              </button>
              <button
                onClick={() => {
                  onAssignSociety();
                  setShowActionsMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <UserPlus className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>{t.common.add} {t.ratechartManagement.societies}</span>
              </button>
              <button
                onClick={() => {
                  onResetDownload();
                  setShowActionsMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{t.ratechartManagement.resetDownload}</span>
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
                    <span>{t.ratechartManagement.inactive}</span>
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>{t.ratechartManagement.active}</span>
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
                <span>{t.common.delete}</span>
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
      <div className="relative bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 mb-3">
        <button
          onClick={() => setShowSocietiesDropdown(!showSocietiesDropdown)}
          className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span>{t.ratechartManagement.societies} ({societies.length})</span>
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
        itemType={t.ratechartManagement.society}
        title={`${t.common.delete} ${t.ratechartManagement.society}`}
        message={t.common.confirm}
        confirmText={`${t.common.delete} ${t.ratechartManagement.society}`}
      />
    </div>
  );
}
