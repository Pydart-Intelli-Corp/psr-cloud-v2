'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, AlertTriangle } from 'lucide-react';
import { FormModal, FormActions } from '@/components/forms';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface Society {
  id: number;
  name: string;
  society_id: string;
}

interface AssignSocietyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (societyIds: number[], replaceExisting: boolean) => Promise<{ requiresConfirmation?: boolean; conflicts?: Array<{ societyId: number; societyName: string; currentFileName: string }> } | void>;
  chartId: number;
  fileName: string;
  currentSocieties: Array<{ societyId: number; societyName: string; societyIdentifier: string }>;
  allSocieties: Society[];
}

export default function AssignSocietyModal({
  isOpen,
  onClose,
  onAssign,
  fileName,
  currentSocieties,
  allSocieties,
}: AssignSocietyModalProps) {
  const { t } = useLanguage();
  const [selectedSocieties, setSelectedSocieties] = useState<Set<number>>(new Set());
  const [isAssigning, setIsAssigning] = useState(false);
  const [conflicts, setConflicts] = useState<Array<{
    societyId: number;
    societyName: string;
    currentFileName: string;
  }> | null>(null);
  const [showConflictWarning, setShowConflictWarning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedSocieties(new Set());
      setConflicts(null);
      setShowConflictWarning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Get societies that are not already assigned
  const currentSocietyIds = new Set(currentSocieties.map(s => s.societyId));
  const availableSocieties = allSocieties.filter(s => !currentSocietyIds.has(s.id));

  const handleToggleSociety = (societyId: number) => {
    const newSelected = new Set(selectedSocieties);
    if (newSelected.has(societyId)) {
      newSelected.delete(societyId);
    } else {
      newSelected.add(societyId);
    }
    setSelectedSocieties(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSocieties.size === availableSocieties.length) {
      setSelectedSocieties(new Set());
    } else {
      setSelectedSocieties(new Set(availableSocieties.map(s => s.id)));
    }
  };

  const handleAssign = async (replaceExisting = false) => {
    if (selectedSocieties.size === 0) return;

    setIsAssigning(true);
    try {
      const result = await onAssign(Array.from(selectedSocieties), replaceExisting);
      
      // Check if result indicates conflicts
      if (result && result.requiresConfirmation && result.conflicts) {
        setConflicts(result.conflicts);
        setShowConflictWarning(true);
        setIsAssigning(false);
        return;
      }
      
      onClose();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'requiresConfirmation' in error && 'conflicts' in error) {
        const err = error as { requiresConfirmation: boolean; conflicts: Array<{ societyId: number; societyName: string; currentFileName: string }> };
        setConflicts(err.conflicts);
        setShowConflictWarning(true);
      } else {
        console.error('Error assigning societies:', error);
      }
    } finally {
      setIsAssigning(false);
    }
  };

  const handleConfirmReplace = () => {
    setShowConflictWarning(false);
    handleAssign(true);
  };

  const handleCancelReplace = () => {
    setShowConflictWarning(false);
    setConflicts(null);
  };

  return (
    <>
      <FormModal
        isOpen={isOpen}
        onClose={onClose}
        title={t.ratechartManagement.chartAssignedSuccessfully.split(' ')[0] + ' ' + t.ratechartManagement.societies}
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* File Name */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 dark:bg-green-600 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-0.5">Rate Chart File</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={fileName}>
                  {fileName}
                </p>
              </div>
            </div>
          </div>

          {/* Currently Assigned */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Currently Assigned ({currentSocieties.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentSocieties.map(society => (
                <span
                  key={society.societyId}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                >
                  {society.societyName}
                </span>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* Available Societies */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Available Societies ({availableSocieties.length})
              </h3>
              {availableSocieties.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold transition-colors"
                >
                  {selectedSocieties.size === availableSocieties.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {/* Society List */}
            {availableSocieties.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">All societies assigned</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All available societies already have this chart</p>
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-h-80 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {availableSocieties.map(society => (
                    <label
                      key={society.id}
                      className="flex items-center gap-3 p-4 hover:bg-white dark:hover:bg-gray-800 cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSocieties.has(society.id)}
                        onChange={() => handleToggleSociety(society.id)}
                        className="w-4 h-4 text-green-600 dark:text-green-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 dark:focus:ring-green-400 focus:ring-2 cursor-pointer transition-all"
                      />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <span className="text-xs font-bold text-green-700 dark:text-green-300">
                          {society.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{society.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{society.society_id}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Count */}
            {selectedSocieties.size > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">
                    {selectedSocieties.size}
                  </span>
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {selectedSocieties.size} {selectedSocieties.size === 1 ? 'society' : 'societies'} selected
                </span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <FormActions
            onCancel={onClose}
            onSubmit={() => handleAssign(false)}
            submitText={selectedSocieties.size > 0 ? `Assign to ${selectedSocieties.size} ${selectedSocieties.size === 1 ? 'Society' : 'Societies'}` : 'Select Societies'}
            isLoading={isAssigning}
            isSubmitDisabled={selectedSocieties.size === 0}
            loadingText="Assigning..."
            submitIcon={<Plus className="w-4 h-4" />}
            submitType="button"
          />
        </div>
      </FormModal>

      {/* Conflict Warning Modal */}
      <AnimatePresence>
        {showConflictWarning && conflicts && conflicts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-[10000] p-4"
            onClick={handleCancelReplace}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Warning Icon */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                      Replace Existing Charts?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The following {conflicts.length === 1 ? 'society already has' : 'societies already have'} a rate chart assigned:
                    </p>
                  </div>
                </div>

                {/* Conflicts List */}
                <div className="space-y-2 mb-5 max-h-48 overflow-y-auto">
                  {conflicts.map((conflict) => (
                    <div 
                      key={conflict.societyId}
                      className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3"
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{conflict.societyName}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        Current: <span className="font-medium">{conflict.currentFileName}</span>
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-6">
                  Do you want to replace {conflicts.length === 1 ? 'this chart' : 'these charts'} with the new one?
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelReplace}
                    disabled={isAssigning}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReplace}
                    disabled={isAssigning}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-yellow-600 dark:bg-yellow-600 hover:bg-yellow-700 dark:hover:bg-yellow-500 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAssigning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Replacing...
                      </>
                    ) : (
                      'Yes, Replace'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
