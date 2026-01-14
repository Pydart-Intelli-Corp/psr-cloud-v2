'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { FlowerSpinner } from '@/components';
import { FormModal, FormActions, FormSelect } from '@/components/forms';
import { useLanguage } from '@/contexts/LanguageContext';

interface Machine {
  id: number;
  machineId: string;
  machineType: string;
  societyName?: string;
  societyId?: number;
  societyIdentifier?: string;
  bmcName?: string;
  bmcId?: number;
  bmcIdentifier?: string;
  location?: string;
  downloaded?: number;
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
  const { t } = useLanguage();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<number | 'all'>('all');
  const [isBmcAssigned, setIsBmcAssigned] = useState(false);

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
          setIsBmcAssigned(result.data?.isBmcAssigned || false);
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
      setFilter('all');
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
    if (filter === 'all') return true;
    if (isBmcAssigned) {
      return machine.bmcId === filter;
    } else {
      return societies.find(s => s.societyId === filter && s.societyName === machine.societyName);
    }
  });

  if (!show) return null;

  return (
    <FormModal
      isOpen={show}
      onClose={onClose}
      title={`${t.common.reset} ${t.ratechartManagement.channelDownloadStatus}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Channel Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
            channel === 'COW' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
            channel === 'BUF' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
            'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
          }`}>
            {channel} {t.ratechartManagement.channel}
          </span>
        </div>

        {/* File Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 dark:bg-blue-600 rounded-lg">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-0.5">{t.ratechartManagement.rateChartFile}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={fileName}>
                {fileName}
              </p>
            </div>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t.ratechartManagement.selectMachinesToReset} <span className="font-semibold text-gray-900 dark:text-gray-100">{channel} {t.ratechartManagement.channel}</span> {t.ratechartManagement.downloadStatusAllowRedownload} {channel} {t.ratechartManagement.milkType}. Only machines that have already downloaded can be reset.
        </p>

        {/* Filter */}
        <FormSelect
          label={isBmcAssigned ? 'Filter by BMC' : t.ratechartManagement.filterBySociety}
          value={filter.toString()}
          onChange={(value) => setFilter(value === 'all' ? 'all' : parseInt(value))}
          options={[
            { value: 'all', label: isBmcAssigned ? 'All BMCs' : t.ratechartManagement.allSocieties },
            ...(isBmcAssigned 
              ? Array.from(new Set(machines.map(m => m.bmcId))).filter(Boolean).map(bmcId => {
                  const machine = machines.find(m => m.bmcId === bmcId);
                  return {
                    value: bmcId!.toString(),
                    label: machine?.bmcName || `BMC ${bmcId}`
                  };
                })
              : societies.map(society => ({
                  value: society.societyId.toString(),
                  label: society.societyName
                }))
            )
          ]}
        />

        {/* Select All */}
        {filteredMachines.length > 0 && (
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedMachines.size === filteredMachines.length && filteredMachines.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2 cursor-pointer transition-all"
              />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {t.common.selectAll} ({filteredMachines.length})
              </span>
            </label>
            {selectedMachines.size > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {selectedMachines.size}
                  </span>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">selected</span>
              </div>
            )}
          </div>
        )}

        {/* Machines List */}
        <div className="max-h-80 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-900/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FlowerSpinner size={32} />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{t.ratechartManagement.loadingMachines}</p>
            </div>
          ) : filteredMachines.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.ratechartManagement.noMachinesFound}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.ratechartManagement.tryChangingSocietyFilter}</p>
            </div>
          ) : (
            filteredMachines.map(machine => (
              <label
                key={machine.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all group ${
                  !machine.downloaded
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 opacity-60 cursor-not-allowed'
                    : selectedMachines.has(machine.id)
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 cursor-pointer'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedMachines.has(machine.id)}
                  onChange={() => handleToggleSelection(machine.id)}
                  disabled={!machine.downloaded}
                  className="w-4 h-4 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                    {machine.machineId.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {machine.machineId}
                    </p>
                    <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-medium">
                      {machine.machineType}
                    </span>
                    {machine.downloaded ? (
                      <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium">
                        Downloaded
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded font-medium">
                        Not Downloaded
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {isBmcAssigned ? machine.bmcName : machine.societyName}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {isBmcAssigned 
                        ? (machine.bmcIdentifier || `ID: ${machine.bmcId}`)
                        : (machine.societyIdentifier || `ID: ${machine.societyId}`)}
                    </span>
                    {machine.location && (
                      <>
                        <span className="text-gray-400 dark:text-gray-500">•</span>
                        <span className="text-gray-500 dark:text-gray-400">{machine.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </label>
            ))
          )}
        </div>

        {/* Form Actions */}
        <FormActions
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitText={selectedMachines.size > 0 ? `${t.common.reset} ${channel} ${t.ratechartManagement.download} (${selectedMachines.size})` : t.ratechartManagement.selectMachines}
          isLoading={submitting}
          isSubmitDisabled={selectedMachines.size === 0}
          loadingText={`${t.ratechartManagement.resetting} ${channel}...`}
          submitIcon={<RefreshCw className="w-4 h-4" />}
          submitType="button"
        />
      </div>
    </FormModal>
  );
}
