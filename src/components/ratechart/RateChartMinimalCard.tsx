'use client';

import React from 'react';
import { Receipt, Trash2, UserPlus, Power, PowerOff, Eye, RefreshCw, FileText, X, MoreVertical, ChevronDown, ChevronUp, Building2, CheckCircle, Download, Clock } from 'lucide-react';
import { ConfirmDeleteModal } from '@/components/management';
import { useLanguage } from '@/contexts/LanguageContext';

// Helper function to convert database channel values to display format
const getChannelDisplay = (channel: string): string => {
  const channelMap: { [key: string]: string } = {
    'COW': 'COW',
    'BUF': 'BUFFALO',
    'MIX': 'MIXED',
    'BUFFALO': 'BUFFALO',
    'MIXED': 'MIXED'
  };
  return channelMap[channel] || channel;
};

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

interface BMC {
  bmcId: number;
  bmcName: string;
  bmcIdentifier: string;
  chartRecordId: number;
}

interface RateChartMinimalCardProps {
  chartId: number;
  fileName: string;
  channel: string;
  uploadedBy: string;
  createdAt: string;
  societies: Society[];
  bmcs?: BMC[];
  status: number;
  isBmcAssigned?: boolean;
  bmcId?: number;
  bmcName?: string;
  bmcIdentifier?: string;
  isSelected: boolean;
  onToggleSelection: () => void;
  onDelete: () => void;
  onAssignSociety: () => void;
  onToggleStatus: (chartId: number, currentStatus: number) => void;
  onView: () => void;
  onResetDownload: () => void;
  onRemoveSociety?: (chartRecordId: number, societyId: number, societyName: string) => void;
  onRemoveBmc?: (chartRecordId: number, bmcId: number, bmcName: string) => void;
  searchQuery?: string;
}

export default function RateChartMinimalCard({
  chartId,
  fileName,
  channel,
  uploadedBy,
  createdAt,
  societies,
  bmcs = [],
  status,
  isBmcAssigned = false,
  bmcId,
  bmcName,
  bmcIdentifier,
  isSelected,
  onToggleSelection,
  onDelete,
  onAssignSociety,
  onToggleStatus,
  onView,
  onResetDownload,
  onRemoveSociety,
  onRemoveBmc,
  searchQuery = '',
}: RateChartMinimalCardProps) {
  const { t } = useLanguage();
  const [showActionsMenu, setShowActionsMenu] = React.useState(false);
  const [showSocietiesDropdown, setShowSocietiesDropdown] = React.useState(false);
  const [showBmcsDropdown, setShowBmcsDropdown] = React.useState(false);
  const [showMachineStatusDropdown, setShowMachineStatusDropdown] = React.useState(false);
  const [societyToRemove, setSocietyToRemove] = React.useState<{ chartRecordId: number; societyId: number; societyName: string } | null>(null);
  const [bmcToRemove, setBmcToRemove] = React.useState<{ chartRecordId: number; bmcId: number; bmcName: string } | null>(null);
  const [downloadStatus, setDownloadStatus] = React.useState<DownloadStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const statusButtonRef = React.useRef<HTMLDivElement>(null);

  // Fetch download status when component mounts or chartId/status changes
  React.useEffect(() => {
    const fetchDownloadStatus = async () => {
      if (status === 0) return;
      
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
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDownloadStatus, 30000);
    return () => clearInterval(interval);
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
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {/* Assignment Type Badge */}
              {isBmcAssigned ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                  <Building2 className="w-3 h-3" />
                  BMC
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                  <Building2 className="w-3 h-3" />
                  Society
                </span>
              )}
              
              {/* Channel Badge */}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                channel === 'COW' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                  : channel === 'BUF'
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700'
                  : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700'
              }`}>
                {highlightText(getChannelDisplay(channel), searchQuery)}
              </span>
              
              {/* Status Indicator */}
              <div 
                ref={statusButtonRef}
                className={`relative inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-medium ${
                status === 0
                  ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  : downloadStatus?.allDownloaded
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300'
                  : downloadStatus?.totalMachines === 0
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
              } ${
                downloadStatus && downloadStatus.totalMachines > 0 ? 'cursor-pointer hover:opacity-80' : ''
              }`}
              onClick={downloadStatus && downloadStatus.totalMachines > 0 ? () => setShowMachineStatusDropdown(!showMachineStatusDropdown) : undefined}
              >
                {getStatusIndicator(
                  status,
                  downloadStatus,
                  loadingStatus,
                  undefined,
                  !!(downloadStatus && downloadStatus.totalMachines > 0)
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
                <span>{t.common.add} {isBmcAssigned ? 'BMCs' : t.ratechartManagement.societies}</span>
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

      {/* Societies/BMC Section */}
      <div className="relative bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 mb-3">
        {isBmcAssigned && bmcs && bmcs.length > 0 ? (
          // BMC Card - Show BMCs dropdown with management
          <button
            onClick={() => setShowBmcsDropdown(!showBmcsDropdown)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>BMCs ({bmcs.length})</span>
            </div>
            {showBmcsDropdown ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        ) : (
          // Society Card - Show societies dropdown
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
        )}

        {/* BMCs Dropdown */}
        {isBmcAssigned && showBmcsDropdown && bmcs && bmcs.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden max-h-64 overflow-y-auto">
            {bmcs.map((bmc) => (
              <div
                key={`${bmc.bmcId}-${bmc.chartRecordId}`}
                className="group flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={bmc.bmcName}>
                      {highlightText(bmc.bmcName, searchQuery)}
                    </p>
                    {bmc.bmcIdentifier && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {highlightText(bmc.bmcIdentifier, searchQuery)}
                      </p>
                    )}
                  </div>
                </div>
                
                {onRemoveBmc && bmcs.length > 1 && (
                  <button
                    onClick={() => {
                      setBmcToRemove({
                        chartRecordId: bmc.chartRecordId,
                        bmcId: bmc.bmcId,
                        bmcName: bmc.bmcName
                      });
                    }}
                    className="ml-2 p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title={`Remove ${bmc.bmcName}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Societies Dropdown - Only show for society-assigned cards */}
        {!isBmcAssigned && showSocietiesDropdown && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden max-h-64 overflow-y-auto">
            {societies.map((society) => (
              <div
                key={`${society.societyId}-${society.chartRecordId}`}
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

      {/* Machine Status Dropdown */}
      {showMachineStatusDropdown && downloadStatus && downloadStatus.totalMachines > 0 && statusButtonRef.current && (
        <div 
          className="absolute w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-64 overflow-y-auto z-[60]"
          style={{
            top: `${statusButtonRef.current.offsetTop + statusButtonRef.current.offsetHeight + 4}px`,
            left: `${statusButtonRef.current.offsetLeft}px`
          }}
        >
          {Object.values(downloadStatus.societies).map((society) => (
            <div key={society.societyId} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <div className="bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{society.societyName}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {society.downloadedMachines}/{society.totalMachines} downloaded
                </p>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {society.machines.map((machine) => (
                  <div key={machine.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        machine.downloaded ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{machine.machineId}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{machine.machineType}</p>
                      </div>
                    </div>
                    {machine.downloaded && machine.downloadedAt && (
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {new Date(machine.downloadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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

      {/* Remove BMC Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!bmcToRemove}
        onClose={() => setBmcToRemove(null)}
        onConfirm={() => {
          if (bmcToRemove && onRemoveBmc) {
            onRemoveBmc(bmcToRemove.chartRecordId, bmcToRemove.bmcId, bmcToRemove.bmcName);
            if (bmcs && bmcs.length === 2) {
              setShowBmcsDropdown(false);
            }
          }
          setBmcToRemove(null);
        }}
        itemName={bmcToRemove?.bmcName || ''}
        itemType="BMC"
        title={`${t.common.delete} BMC`}
        message={t.common.confirm}
        confirmText={`${t.common.delete} BMC`}
      />
    </div>
  );
}
