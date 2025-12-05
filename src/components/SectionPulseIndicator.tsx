'use client';

import React from 'react';
import { Activity, Clock, XCircle, AlertCircle } from 'lucide-react';

export interface PulseStatus {
  societyId: number;
  pulseDate: string;
  firstCollectionTime: Date | null;
  lastCollectionTime: Date | null;
  sectionEndTime: Date | null;
  pulseStatus: 'not_started' | 'active' | 'paused' | 'ended' | 'inactive';
  totalCollections: number;
  inactiveDays: number;
  statusMessage?: string;
  createdAt?: Date | string | null;
}

interface SectionPulseIndicatorProps {
  pulse: PulseStatus;
  societyName?: string;
  compact?: boolean;
}

/**
 * Section Pulse Indicator Component
 * 
 * Displays visual indicator for section pulse status:
 * - Green (Active): Collections happening
 * - Orange (Paused): No collection for 5 minutes
 * - Yellow (Not Started): No collections yet today
 * - Red (Ended): Section ended (60+ min since last collection)
 * - Gray (Inactive): No pulse for multiple days
 */
export function SectionPulseIndicator({ 
  pulse, 
  societyName, 
  compact = false 
}: SectionPulseIndicatorProps) {
  const getStatusColor = () => {
    switch (pulse.pulseStatus) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-orange-500';
      case 'not_started':
        return 'bg-yellow-500';
      case 'ended':
        return 'bg-red-500';
      case 'inactive':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusIcon = () => {
    const iconClass = "w-5 h-5";
    switch (pulse.pulseStatus) {
      case 'active':
        return <Activity className={`${iconClass} text-green-600`} />;
      case 'paused':
        return <Clock className={`${iconClass} text-orange-600`} />;
      case 'not_started':
        return <Clock className={`${iconClass} text-yellow-600`} />;
      case 'ended':
        return <XCircle className={`${iconClass} text-red-600`} />;
      case 'inactive':
        return <AlertCircle className={`${iconClass} text-gray-600`} />;
      default:
        return null;
    }
  };

  const formatTime = (dateTime: Date | null) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {pulse.statusMessage || pulse.pulseStatus}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            {societyName && (
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {societyName}
              </h4>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {pulse.statusMessage || pulse.pulseStatus}
            </p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${pulse.pulseStatus === 'active' ? 'animate-pulse' : ''}`} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Start Time</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatTime(pulse.firstCollectionTime)}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Last Collection</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatTime(pulse.lastCollectionTime)}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Total Collections</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {pulse.totalCollections}
          </p>
        </div>
        {pulse.pulseStatus === 'inactive' && pulse.inactiveDays > 0 && (
          <div>
            <p className="text-gray-500 dark:text-gray-400">Inactive Days</p>
            <p className="font-medium text-red-600">
              {pulse.inactiveDays} {pulse.inactiveDays === 1 ? 'day' : 'days'}
            </p>
          </div>
        )}
        {pulse.pulseStatus === 'ended' && pulse.sectionEndTime && (
          <div>
            <p className="text-gray-500 dark:text-gray-400">End Time</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatTime(pulse.sectionEndTime)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface PulseSummaryCardProps {
  totalSocieties: number;
  active: number;
  ended: number;
  notStarted: number;
  inactive: number;
}

/**
 * Pulse Summary Card Component
 * Shows overall pulse statistics
 */
export function PulseSummaryCard({
  totalSocieties,
  active,
  ended,
  notStarted,
  inactive
}: PulseSummaryCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Section Pulse Summary
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
          </div>
          <p className="text-2xl font-bold text-green-600">{active}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">Active</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{notStarted}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">Not Started</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{ended}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">Ended</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-4 h-4 rounded-full bg-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-600">{inactive}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">Inactive</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          Total Societies: <span className="font-bold">{totalSocieties}</span>
        </p>
      </div>
    </div>
  );
}
