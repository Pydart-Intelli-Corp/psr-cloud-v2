'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus } from 'lucide-react';
import { FormModal, FormActions } from '@/components/forms';

interface BMC {
  id: number;
  name: string;
  bmcId: string;
}

interface AssignBmcModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (bmcIds: number[]) => Promise<void>;
  chartId: number;
  fileName: string;
  currentBmcs: Array<{ bmcId: number; bmcName: string; bmcIdentifier: string }>;
  allBmcs: BMC[];
}

export default function AssignBmcModal({
  isOpen,
  onClose,
  onAssign,
  fileName,
  currentBmcs,
  allBmcs,
}: AssignBmcModalProps) {
  const [selectedBmcs, setSelectedBmcs] = useState<Set<number>>(new Set());
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedBmcs(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentBmcIds = new Set(currentBmcs.map(b => b.bmcId));
  const availableBmcs = allBmcs.filter(b => !currentBmcIds.has(b.id));

  const handleToggleBmc = (bmcId: number) => {
    const newSelected = new Set(selectedBmcs);
    if (newSelected.has(bmcId)) {
      newSelected.delete(bmcId);
    } else {
      newSelected.add(bmcId);
    }
    setSelectedBmcs(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedBmcs.size === availableBmcs.length) {
      setSelectedBmcs(new Set());
    } else {
      setSelectedBmcs(new Set(availableBmcs.map(b => b.id)));
    }
  };

  const handleAssign = async () => {
    if (selectedBmcs.size === 0) return;

    setIsAssigning(true);
    try {
      await onAssign(Array.from(selectedBmcs));
      onClose();
    } catch (error) {
      console.error('Error assigning BMCs:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign BMCs"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* File Name */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 dark:bg-blue-600 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-0.5">Rate Chart File</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={fileName}>
                {fileName}
              </p>
            </div>
          </div>
        </div>

        {/* Currently Assigned */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Currently Assigned ({currentBmcs.length})
          </h3>
          {currentBmcs.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">No BMCs assigned yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentBmcs.map(bmc => (
                <div
                  key={bmc.bmcId}
                  className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{bmc.bmcName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">BMC ID: {bmc.bmcIdentifier}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      Chart Uploaded
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* Available BMCs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Available BMCs ({availableBmcs.length})
            </h3>
            {availableBmcs.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
              >
                {selectedBmcs.size === availableBmcs.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {/* BMC List */}
          {availableBmcs.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">All BMCs assigned</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All available BMCs already have this chart</p>
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-h-80 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {availableBmcs.map(bmc => (
                  <label
                    key={bmc.id}
                    className="flex items-center gap-3 p-4 hover:bg-white dark:hover:bg-gray-800 cursor-pointer transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBmcs.has(bmc.id)}
                      onChange={() => handleToggleBmc(bmc.id)}
                      className="w-4 h-4 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2 cursor-pointer transition-all"
                    />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{bmc.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{bmc.bmcId}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Selected Count */}
          {selectedBmcs.size > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {selectedBmcs.size}
                </span>
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {selectedBmcs.size} {selectedBmcs.size === 1 ? 'BMC' : 'BMCs'} selected
              </span>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <FormActions
          onCancel={onClose}
          onSubmit={handleAssign}
          submitText={selectedBmcs.size > 0 ? `Assign to ${selectedBmcs.size} ${selectedBmcs.size === 1 ? 'BMC' : 'BMCs'}` : 'Select BMCs'}
          isLoading={isAssigning}
          isSubmitDisabled={selectedBmcs.size === 0}
          loadingText="Assigning..."
          submitIcon={<Plus className="w-4 h-4" />}
          submitType="button"
        />
      </div>
    </FormModal>
  );
}
