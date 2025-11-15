'use client';

import React, { useState } from 'react';
import { X, Receipt, Search } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  if (!isOpen) return null;

  // Filter assignments
  const filteredAssignments = rateCharts.filter(chart => {
    if (channelFilter !== 'all' && chart.channel !== channelFilter) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        chart.societyName.toLowerCase().includes(query) ||
        chart.societyIdentifier.toLowerCase().includes(query) ||
        chart.fileName.toLowerCase().includes(query) ||
        chart.channel.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Group by channel
  const cowAssignments = filteredAssignments.filter(c => c.channel === 'COW');
  const bufAssignments = filteredAssignments.filter(c => c.channel === 'BUF');
  const mixAssignments = filteredAssignments.filter(c => c.channel === 'MIX');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Total Assignments ({rateCharts.length})
                </h2>
                <p className="text-sm text-gray-500">
                  All rate chart assignments across societies
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by society, identifier, filename, or channel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Channel Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setChannelFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  channelFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({rateCharts.length})
              </button>
              <button
                onClick={() => setChannelFilter('COW')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  channelFilter === 'COW'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                COW ({rateCharts.filter(c => c.channel === 'COW').length})
              </button>
              <button
                onClick={() => setChannelFilter('BUF')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  channelFilter === 'BUF'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                BUF ({rateCharts.filter(c => c.channel === 'BUF').length})
              </button>
              <button
                onClick={() => setChannelFilter('MIX')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  channelFilter === 'MIX'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                MIX ({rateCharts.filter(c => c.channel === 'MIX').length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No assignments found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* COW Assignments */}
                {(channelFilter === 'all' || channelFilter === 'COW') && cowAssignments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                      COW Channel ({cowAssignments.length})
                    </h3>
                    <div className="space-y-2">
                      {cowAssignments.map((chart) => (
                        <AssignmentRow key={chart.id} chart={chart} searchQuery={searchQuery} />
                      ))}
                    </div>
                  </div>
                )}

                {/* BUF Assignments */}
                {(channelFilter === 'all' || channelFilter === 'BUF') && bufAssignments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                      BUFFALO Channel ({bufAssignments.length})
                    </h3>
                    <div className="space-y-2">
                      {bufAssignments.map((chart) => (
                        <AssignmentRow key={chart.id} chart={chart} searchQuery={searchQuery} />
                      ))}
                    </div>
                  </div>
                )}

                {/* MIX Assignments */}
                {(channelFilter === 'all' || channelFilter === 'MIX') && mixAssignments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
                      MIXED Channel ({mixAssignments.length})
                    </h3>
                    <div className="space-y-2">
                      {mixAssignments.map((chart) => (
                        <AssignmentRow key={chart.id} chart={chart} searchQuery={searchQuery} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {filteredAssignments.length} of {rateCharts.length} assignments
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Assignment Row Component
function AssignmentRow({ chart, searchQuery }: { chart: RateChart; searchQuery: string }) {
  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'COW': return 'bg-green-100 text-green-700 border-green-200';
      case 'BUF': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'MIX': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-gray-900">
            {highlightText(chart.societyName)}
          </p>
          <span className="text-xs text-gray-500">
            ({highlightText(chart.societyIdentifier)})
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getChannelColor(chart.channel)}`}>
            {highlightText(chart.channel)}
          </span>
          {chart.shared_chart_id && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700 border border-purple-200">
              Shared
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 truncate">
          {highlightText(chart.fileName)}
        </p>
      </div>
      <div className="text-right ml-4 flex-shrink-0">
        <p className="text-xs text-gray-500">
          {new Date(chart.uploadedAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
        <p className="text-xs text-gray-400">{chart.recordCount} records</p>
      </div>
    </div>
  );
}
