'use client';

import React, { useState } from 'react';
import { Receipt } from 'lucide-react';
import { FormModal } from '@/components/forms';
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

interface RateChart {
  id: number;
  societyId: number;
  societyName: string;
  societyIdentifier: string;
  channel: 'COW' | 'BUF' | 'MIX';
  uploadedAt: string;
  uploadedBy: string;
  fileName: string;
  recordCount: number;
  shared_chart_id: number | null;
}

interface TotalAssignmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rateCharts: RateChart[];
}

export default function TotalAssignmentsModal({
  isOpen,
  onClose,
  rateCharts,
}: TotalAssignmentsModalProps) {
  const { t } = useLanguage();
  const [channelFilter, setChannelFilter] = useState<string>('all');

  if (!isOpen) return null;

  // Filter assignments
  const filteredAssignments = rateCharts.filter(chart => {
    if (channelFilter !== 'all' && chart.channel !== channelFilter) return false;
    return true;
  });

  // Group by channel
  const cowAssignments = filteredAssignments.filter(c => c.channel === 'COW');
  const bufAssignments = filteredAssignments.filter(c => c.channel === 'BUF');
  const mixAssignments = filteredAssignments.filter(c => c.channel === 'MIX');

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t.ratechartManagement.totalAssignments} (${rateCharts.length})`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Info Text */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t.ratechartManagement.allRateChartAssignments}
        </p>

        {/* Channel Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setChannelFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              channelFilter === 'all'
                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {t.dashboard.all} ({rateCharts.length})
          </button>
          <button
            onClick={() => setChannelFilter('COW')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              channelFilter === 'COW'
                ? 'bg-green-600 dark:bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {t.ratechartManagement.cow} ({rateCharts.filter(c => c.channel === 'COW').length})
          </button>
          <button
            onClick={() => setChannelFilter('BUF')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              channelFilter === 'BUF'
                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {t.ratechartManagement.buf} ({rateCharts.filter(c => c.channel === 'BUF').length})
          </button>
          <button
            onClick={() => setChannelFilter('MIX')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              channelFilter === 'MIX'
                ? 'bg-purple-600 dark:bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {t.ratechartManagement.mix} ({rateCharts.filter(c => c.channel === 'MIX').length})
          </button>
        </div>

        {/* Assignments List */}
        <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-900/50">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.ratechartManagement.noAssignmentsFound}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.ratechartManagement.tryChangingFilter}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* COW Assignments */}
              {(channelFilter === 'all' || channelFilter === 'COW') && cowAssignments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    {t.ratechartManagement.cow} {t.ratechartManagement.channel} ({cowAssignments.length})
                  </h3>
                  <div className="space-y-2">
                    {cowAssignments.map((chart) => (
                      <AssignmentRow key={chart.id} chart={chart} />
                    ))}
                  </div>
                </div>
              )}

              {/* BUF Assignments */}
              {(channelFilter === 'all' || channelFilter === 'BUF') && bufAssignments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                    {t.ratechartManagement.buffalo} {t.ratechartManagement.channel} ({bufAssignments.length})
                  </h3>
                  <div className="space-y-2">
                    {bufAssignments.map((chart) => (
                      <AssignmentRow key={chart.id} chart={chart} />
                    ))}
                  </div>
                </div>
              )}

              {/* MIX Assignments */}
              {(channelFilter === 'all' || channelFilter === 'MIX') && mixAssignments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
                    {t.ratechartManagement.mixed} {t.ratechartManagement.channel} ({mixAssignments.length})
                  </h3>
                  <div className="space-y-2">
                    {mixAssignments.map((chart) => (
                      <AssignmentRow key={chart.id} chart={chart} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t.ratechartManagement.showing} {filteredAssignments.length} {t.ratechartManagement.of} {rateCharts.length} {t.ratechartManagement.assignments}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </FormModal>
  );
}

// Assignment Row Component
function AssignmentRow({ chart }: { chart: RateChart }) {
  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'COW': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'BUF': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'MIX': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {chart.societyName}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({chart.societyIdentifier})
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getChannelColor(chart.channel)}`}>
            {getChannelDisplay(chart.channel)}
          </span>
          {chart.shared_chart_id && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              Shared
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
          {chart.fileName}
        </p>
      </div>
      <div className="text-right ml-4 flex-shrink-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(chart.uploadedAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{chart.recordCount} records</p>
      </div>
    </div>
  );
}
