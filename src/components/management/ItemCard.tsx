'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Eye, Lock, CheckCircle, Clock, Sliders } from 'lucide-react';
import StatusDropdown from './StatusDropdown';

interface DetailItem {
  icon: React.ReactNode;
  text: string | React.ReactNode;
  show?: boolean;
  highlight?: boolean; // New property for highlighting
  className?: string; // Custom className for styling
}

// Status section types for footer
interface StatusPill {
  label: string;
  type: 'ready' | 'downloaded' | 'none' | 'pending';
}

interface FooterStatusSection {
  title: string;
  icon: React.ReactNode;
  items?: StatusPill[];
  customContent?: React.ReactNode;
}

export interface FooterStatusProps {
  password?: {
    user: { status: 'downloaded' | 'pending' | 'none'; tooltip?: string };
    supervisor: { status: 'downloaded' | 'pending' | 'none'; tooltip?: string };
  };
  charts?: {
    pending: Array<{ channel: string }>;
    downloaded: Array<{ channel: string }>;
  };
  corrections?: {
    pending: Array<{ channel: string }>;
    downloaded: Array<{ channel: string }>;
  };
}

// Helper function to map channel codes to display names
const getChannelDisplayName = (channel: string): string => {
  const channelMap: Record<string, string> = {
    'COW': 'C1',
    'BUF': 'C2', 
    'MIX': 'C3',
    'Cow': 'C1',
    'Buf': 'C2',
    'Mix': 'C3',
    'C1': 'C1',
    'C2': 'C2',
    'C3': 'C3',
  };
  return channelMap[channel] || channel;
};

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
  // Footer status sections (like mobile app)
  footerStatus?: FooterStatusProps;
  // BLE Connection button (top right header)
  bleButton?: {
    status: 'connected' | 'connecting' | 'available' | 'offline';
    onClick: () => void;
    disabled?: boolean;
  };
  // Control Panel button
  onControlPanel?: () => void;
  controlPanelTitle?: string;
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
  onImageClick,
  footerStatus,
  bleButton,
  onControlPanel,
  controlPanelTitle = 'Control Panel'
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
          {bleButton && (() => {
            const getBleButtonConfig = () => {
              switch (bleButton.status) {
                case 'connected':
                  return {
                    label: 'Connected',
                    icon: (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" />
                      </svg>
                    ),
                    bgColor: 'bg-green-500/10 dark:bg-green-500/20',
                    textColor: 'text-green-600 dark:text-green-400',
                    borderColor: 'border-green-500/30',
                    pulseColor: 'bg-green-500'
                  };
                case 'connecting':
                  return {
                    label: 'Connecting',
                    icon: (
                      <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" />
                      </svg>
                    ),
                    bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
                    textColor: 'text-amber-600 dark:text-amber-400',
                    borderColor: 'border-amber-500/30',
                    pulseColor: 'bg-amber-500'
                  };
                case 'available':
                  return {
                    label: 'Connect',
                    icon: (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" />
                      </svg>
                    ),
                    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
                    textColor: 'text-blue-600 dark:text-blue-400',
                    borderColor: 'border-blue-500/30',
                    pulseColor: 'bg-blue-500'
                  };
                default:
                  return {
                    label: 'Offline',
                    icon: (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88zM17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29z" opacity="0.3" />
                      </svg>
                    ),
                    bgColor: 'bg-gray-500/10 dark:bg-gray-500/20',
                    textColor: 'text-gray-500 dark:text-gray-400',
                    borderColor: 'border-gray-500/30',
                    pulseColor: 'bg-gray-500'
                  };
              }
            };
            const config = getBleButtonConfig();
            return (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  bleButton.onClick();
                }}
                disabled={bleButton.disabled || bleButton.status === 'connecting' || bleButton.status === 'offline'}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${config.bgColor} ${config.textColor} ${config.borderColor} ${bleButton.disabled || bleButton.status === 'connecting' || bleButton.status === 'offline' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md active:scale-95'}`}
                title={`Bluetooth ${config.label}`}
              >
                <div className="relative">
                  {config.icon}
                  {bleButton.status === 'connected' && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pulseColor} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${config.pulseColor}`}></span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide">{config.label}</span>
              </button>
            );
          })()}
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

        {/* Footer Status Sections - responsive grid layout */}
        {footerStatus && (
          <div className="mb-3 sm:mb-4 py-3 px-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-0">
              {/* Section 1: Password Status */}
              <div className="flex flex-col items-center justify-center px-2 pb-3 sm:pb-0 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1 mb-2">
                  <Lock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                  <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Password</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* User Password */}
                  <div 
                    className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
                      footerStatus.password?.user.status === 'downloaded' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : footerStatus.password?.user.status === 'pending'
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                    title={footerStatus.password?.user.tooltip || 'User Password'}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      footerStatus.password?.user.status === 'downloaded' 
                        ? 'bg-green-500' 
                        : footerStatus.password?.user.status === 'pending'
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-gray-400'
                    }`} />
                    <span className={`text-[10px] font-semibold ${
                      footerStatus.password?.user.status === 'downloaded' 
                        ? 'text-green-600 dark:text-green-400' 
                        : footerStatus.password?.user.status === 'pending'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>U</span>
                  </div>
                  {/* Supervisor Password */}
                  <div 
                    className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
                      footerStatus.password?.supervisor.status === 'downloaded' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : footerStatus.password?.supervisor.status === 'pending'
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                    title={footerStatus.password?.supervisor.tooltip || 'Supervisor Password'}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      footerStatus.password?.supervisor.status === 'downloaded' 
                        ? 'bg-green-500' 
                        : footerStatus.password?.supervisor.status === 'pending'
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-gray-400'
                    }`} />
                    <span className={`text-[10px] font-semibold ${
                      footerStatus.password?.supervisor.status === 'downloaded' 
                        ? 'text-green-600 dark:text-green-400' 
                        : footerStatus.password?.supervisor.status === 'pending'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>S</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Rate Charts */}
              <div className="flex flex-col items-center justify-center px-2 py-3 sm:py-0 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1 mb-2">
                  <svg className="w-3 h-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Charts</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  {(() => {
                    const allChannels = ['C1', 'C2', 'C3'];
                    const pendingChannels = (footerStatus.charts?.pending || []).map(c => getChannelDisplayName(c.channel));
                    const downloadedChannels = (footerStatus.charts?.downloaded || []).map(c => getChannelDisplayName(c.channel));
                    const hasAny = pendingChannels.length > 0 || downloadedChannels.length > 0;
                    
                    if (!hasAny) {
                      return <span className="text-[10px] text-gray-400 dark:text-gray-500">None</span>;
                    }
                    
                    return allChannels.map(ch => {
                      const isPending = pendingChannels.includes(ch);
                      const isDownloaded = downloadedChannels.includes(ch);
                      if (!isPending && !isDownloaded) return null;
                      
                      return (
                        <span
                          key={ch}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                            isPending 
                              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                              : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                          }`}
                        >
                          {isPending ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          ) : (
                            <CheckCircle className="w-2.5 h-2.5" />
                          )}
                          {ch}
                        </span>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Section 3: Corrections */}
              <div className="flex flex-col items-center justify-center px-2 pt-3 sm:pt-0">
                <div className="flex items-center gap-1 mb-2">
                  <svg className="w-3 h-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Corrections</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  {(() => {
                    const allChannels = ['C1', 'C2', 'C3'];
                    const pendingChannels = (footerStatus.corrections?.pending || []).map(c => getChannelDisplayName(c.channel));
                    const downloadedChannels = (footerStatus.corrections?.downloaded || []).map(c => getChannelDisplayName(c.channel));
                    const hasAny = pendingChannels.length > 0 || downloadedChannels.length > 0;
                    
                    if (!hasAny) {
                      return <span className="text-[10px] text-gray-400 dark:text-gray-500">None</span>;
                    }
                    
                    return allChannels.map(ch => {
                      const isPending = pendingChannels.includes(ch);
                      const isDownloaded = downloadedChannels.includes(ch);
                      if (!isPending && !isDownloaded) return null;
                      
                      return (
                        <span
                          key={ch}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                            isPending 
                              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                              : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                          }`}
                        >
                          {isPending ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          ) : (
                            <CheckCircle className="w-2.5 h-2.5" />
                          )}
                          {ch}
                        </span>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
          <div className="flex space-x-1 sm:space-x-2">
            {showStatus && onStatusChange && (
              <StatusDropdown
                currentStatus={status}
                onStatusChange={onStatusChange}
              />
            )}
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
            {onControlPanel && (
              <button
                onClick={onControlPanel}
                className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/30 touch-target sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                title={controlPanelTitle}
              >
                <Sliders className="w-4 h-4" />
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