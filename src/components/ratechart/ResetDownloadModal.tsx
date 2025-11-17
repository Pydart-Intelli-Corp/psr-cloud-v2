'use client';

import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { FlowerSpinner } from '@/components';

interface Machine {
  id: number;
  machineId: string;
  machineType: string;
  societyName: string;
  societyId: number;
  societyIdentifier?: string;
  location?: string;
}

interface ResetDownloadModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (machineIds: number[]) => Promise<void>;
  chartId: number;
  fileName: string;
  channel: string;
  societies: Array<{ societyId: number; societyName: string }>;
}

export default function ResetDownloadModal({
  show,
  onClose,
  onConfirm,
  chartId,
  fileName,
  channel,
  societies
}: ResetDownloadModalProps) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [societyFilter, setSocietyFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    const fetchMachines = async () => {
      if (!show) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch(`/api/user/ratechart/data?chartId=${chartId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const result = await response.json();
          setMachines(result.data?.machines || []);
        }
      } catch (error) {
        console.error('Error fetching machines:', error);
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchMachines();
      setSelectedMachines(new Set());
      setSocietyFilter('all');
    }
  }, [show, chartId]);

  const handleToggleSelection = (machineId: number) => {
    setSelectedMachines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(machineId)) {
        newSet.delete(machineId);
      } else {
        newSet.add(machineId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedMachines.size === filteredMachines.length) {
      setSelectedMachines(new Set());
    } else {
      setSelectedMachines(new Set(filteredMachines.map(m => m.id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedMachines.size === 0) return;

    setSubmitting(true);
    try {
      await onConfirm(Array.from(selectedMachines));
      onClose();
    } catch (error) {
      console.error('Error resetting download:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMachines = machines.filter(machine => {
    const matchesSociety = societyFilter === 'all' || 
      societies.find(s => s.societyId === societyFilter && s.societyName === machine.societyName);

    return matchesSociety;
  });

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  Reset Download Status
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    channel === 'COW' ? 'bg-blue-100 text-blue-700' :
                    channel === 'BUF' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {channel}
                  </span>
                </h3>
                <p className="text-sm text-gray-600">
                  {fileName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-sm text-gray-600 mb-4">
              Select machines to reset their <strong>{channel} channel</strong> download status. This will allow them to re-download this rate chart for the {channel} milk type.
            </p>

            {/* Filters */}
            <div className="mb-4">
              {/* Society Filter */}
              <select
                value={societyFilter}
                onChange={(e) => setSocietyFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Societies</option>
                {societies.map(society => (
                  <option key={society.societyId} value={society.societyId}>
                    {society.societyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Select All */}
            {filteredMachines.length > 0 && (
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMachines.size === filteredMachines.length && filteredMachines.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({filteredMachines.length})
                  </span>
                </label>
                <span className="text-sm text-gray-600">
                  {selectedMachines.size} selected
                </span>
              </div>
            )}

            {/* Machines List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <FlowerSpinner size={32} />
                </div>
              ) : filteredMachines.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No machines found</p>
                </div>
              ) : (
                filteredMachines.map(machine => (
                  <label
                    key={machine.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedMachines.has(machine.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMachines.has(machine.id)}
                      onChange={() => handleToggleSelection(machine.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {machine.machineId}
                        </p>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                          {machine.machineType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">{machine.societyName}</span>
                          {' '}
                          <span className="text-gray-400">({machine.societyIdentifier || `ID: ${machine.societyId}`})</span>
                        </p>
                        {machine.location && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-500">
                              {machine.location}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedMachines.size === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <FlowerSpinner size={16} className="brightness-200" />
                  <span>Resetting {channel}...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset {channel} Download ({selectedMachines.size})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
