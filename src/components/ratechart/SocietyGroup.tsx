'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import RateChartCard from './RateChartCard';

interface RateChart {
  id: number;
  channel: 'COW' | 'BUF' | 'MIX';
  recordCount: number;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface SocietyGroupProps {
  societyId: number;
  societyName: string;
  societyIdentifier: string;
  charts: RateChart[];
  onDeleteChart: (id: number) => void;
  selectedCharts?: Set<number>;
  onToggleSelection?: (chartId: number) => void;
}

/**
 * Reusable society group component for rate charts
 * Groups rate charts by society with collapsible header
 */
const SocietyGroup: React.FC<SocietyGroupProps> = ({
  societyName,
  societyIdentifier,
  charts,
  onDeleteChart,
  selectedCharts = new Set(),
  onToggleSelection
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Society Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {societyName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ID: {societyIdentifier}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm">
              <span className="font-semibold text-gray-900 dark:text-white">{charts.length}</span>
              {' '}
              <span>{charts.length === 1 ? 'chart' : 'charts'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {charts.map(chart => (
          <RateChartCard
            key={chart.id}
            {...chart}
            onDelete={() => onDeleteChart(chart.id)}
            isSelected={selectedCharts.has(chart.id)}
            onToggleSelection={onToggleSelection ? () => onToggleSelection(chart.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default SocietyGroup;
