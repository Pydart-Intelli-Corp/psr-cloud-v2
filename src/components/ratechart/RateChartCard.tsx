'use client';

import React from 'react';
import { Trash2, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';

interface RateChartCardProps {
  id: number;
  channel: 'COW' | 'BUF' | 'MIX';
  recordCount: number;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  onDelete: () => void;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

const channelColors = {
  COW: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300'
  },
  BUF: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-300'
  },
  MIX: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-300'
  }
};

/**
 * Reusable rate chart card component
 * Displays rate chart information in a consistent card format
 */
const RateChartCard: React.FC<RateChartCardProps> = ({
  id,
  channel,
  recordCount,
  fileName,
  uploadedAt,
  uploadedBy,
  onDelete,
  isSelected = false,
  onToggleSelection
}) => {
  const colors = channelColors[channel];

  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`p-4 border rounded-lg hover:shadow-md transition-all duration-200 ${
        isSelected 
          ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 shadow-md' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-green-600'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {onToggleSelection && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelection}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          )}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} flex items-center space-x-1`}>
            <Receipt className="w-3 h-3" />
            <span>{channel}</span>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          title="Delete rate chart"
          aria-label="Delete rate chart"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Records:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{recordCount.toLocaleString()}</span>
        </div>
        
        <div className="flex flex-col space-y-1">
          <span className="text-gray-600 dark:text-gray-400 text-xs">File:</span>
          <span className="font-medium text-gray-900 dark:text-white text-xs truncate" title={fileName}>
            {fileName}
          </span>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(uploadedAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate ml-2" title={uploadedBy}>
            {uploadedBy}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default RateChartCard;
