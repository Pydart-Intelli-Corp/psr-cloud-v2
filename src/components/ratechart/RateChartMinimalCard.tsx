'use client';

import React from 'react';
import { Receipt, Trash2, UserPlus, Power, PowerOff, Eye, RefreshCw, FileText } from 'lucide-react';

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
  searchQuery = '',
}: RateChartMinimalCardProps) {
  return (
    <div
      className={`relative border rounded-xl p-4 transition-all duration-300 hover:shadow-lg group ${
        isSelected
          ? 'border-green-500 dark:border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 shadow-md ring-2 ring-green-200 dark:ring-green-700'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-green-600'
      }`}
    >
      {/* Selection Checkbox - Top Left */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelection}
          className="w-4 h-4 text-green-600 dark:text-green-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 dark:focus:ring-green-400 focus:ring-2 cursor-pointer transition-transform hover:scale-110"
        />
      </div>

      {/* Status Badge - Top Right */}
      <div className="absolute top-3 right-3 z-10">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
          status === 1 
            ? 'bg-green-500 dark:bg-green-600 text-white' 
            : 'bg-gray-400 dark:bg-gray-600 text-white'
        }`}>
          {status === 1 ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {/* Details Section */}
        <div className="flex-1 min-w-0">
          {/* File Name */}
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1 truncate" title={fileName}>
            {highlightText(fileName, searchQuery)}
          </h3>

          {/* Channel Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 text-white shadow-sm">
              {highlightText(channel, searchQuery)}
            </span>
          </div>

          {/* Societies Section */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              📍 {societies.length} {societies.length === 1 ? 'Society' : 'Societies'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {societies.slice(0, 3).map((society) => (
                <span
                  key={society.societyId}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 shadow-sm"
                  title={`${society.societyName} ${society.societyIdentifier ? `(${society.societyIdentifier})` : ''}`}
                >
                  {highlightText(society.societyName.length > 12 ? `${society.societyName.substring(0, 12)}...` : society.societyName, searchQuery)}
                </span>
              ))}
              {societies.length > 3 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                  +{societies.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Date */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            📅 {new Date(createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Action Buttons - Bottom */}
      <div className="flex items-center justify-end gap-1.5 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onToggleStatus(chartId, status)}
          className={`p-2 rounded-lg transition-all duration-200 ${
            status === 1 
              ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:shadow-sm' 
              : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm'
          }`}
          title={status === 1 ? 'Active - Click to Deactivate' : 'Inactive - Click to Activate'}
        >
          {status === 1 ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
        </button>
        <button
          onClick={onView}
          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 hover:shadow-sm"
          title="View Chart Data"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={onResetDownload}
          className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-all duration-200 hover:shadow-sm"
          title="Reset Download for Machines"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={onAssignSociety}
          className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-all duration-200 hover:shadow-sm"
          title="Assign to More Societies"
        >
          <UserPlus className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:shadow-sm"
          title="Delete Chart"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
