'use client';

import React from 'react';
import { Receipt, Trash2 } from 'lucide-react';

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
  isSelected: boolean;
  onToggleSelection: () => void;
  onDelete: () => void;
  searchQuery?: string;
}

export default function RateChartMinimalCard({
  chartId,
  fileName,
  channel,
  uploadedBy,
  createdAt,
  societies,
  isSelected,
  onToggleSelection,
  onDelete,
  searchQuery = '',
}: RateChartMinimalCardProps) {
  return (
    <div
      className={`border rounded-lg p-2 transition-all duration-200 ${
        isSelected
          ? 'border-green-500 bg-green-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
      }`}
    >
      {/* Header with Checkbox and Actions */}
      <div className="flex items-start justify-between gap-1 mb-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelection}
          className="mt-0.5 w-3.5 h-3.5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-1 cursor-pointer flex-shrink-0"
        />
        <button
          onClick={onDelete}
          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
          title="Delete Chart"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chart Icon */}
      <div className="flex items-center justify-center mb-2">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
          <Receipt className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      {/* Filename */}
      <h3 className="text-xs font-semibold text-gray-900 truncate mb-1 text-center px-1" title={fileName}>
        {fileName.length > 20 ? highlightText(`${fileName.substring(0, 20)}...`, searchQuery) : highlightText(fileName, searchQuery)}
      </h3>

      {/* Channel Badge */}
      <div className="flex justify-center mb-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {highlightText(channel, searchQuery)}
        </span>
      </div>

      {/* Societies Count */}
      <div className="mb-2">
        <p className="text-xs font-medium text-gray-700 text-center">
          {societies.length} {societies.length === 1 ? 'Society' : 'Societies'}
        </p>
        <div className="flex flex-wrap gap-0.5 justify-center mt-1">
          {societies.slice(0, 2).map((society) => (
            <span
              key={society.societyId}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-50 text-green-700"
              title={`${society.societyName} ${society.societyIdentifier ? `(${society.societyIdentifier})` : ''}`}
            >
              {highlightText(society.societyName.substring(0, 8), searchQuery)}
            </span>
          ))}
          {societies.length > 2 && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
              title={societies.slice(2).map(s => s.societyName).join(', ')}
            >
              +{societies.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-1.5 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
