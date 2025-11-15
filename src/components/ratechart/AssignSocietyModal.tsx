'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Plus } from 'lucide-react';

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
  const [selectedSocieties, setSelectedSocieties] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
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
      setSearchQuery('');
      setConflicts(null);
      setShowConflictWarning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Get societies that are not already assigned
  const currentSocietyIds = new Set(currentSocieties.map(s => s.societyId));
  const availableSocieties = allSocieties.filter(s => !currentSocietyIds.has(s.id));

  // Filter societies based on search query
  const filteredSocieties = availableSocieties.filter(society =>
    society.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    society.society_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    if (selectedSocieties.size === filteredSocieties.length) {
      setSelectedSocieties(new Set());
    } else {
      setSelectedSocieties(new Set(filteredSocieties.map(s => s.id)));
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Assign to Additional Societies
                </h2>
                <p className="text-sm text-gray-500 truncate max-w-md">
                  {fileName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Currently Assigned */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Currently Assigned ({currentSocieties.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentSocieties.map(society => (
                  <span
                    key={society.societyId}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-sm bg-gray-100 text-gray-700 border border-gray-300"
                  >
                    {society.societyName}
                  </span>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Available Societies */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Available Societies ({availableSocieties.length})
                </h3>
                {filteredSocieties.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    {selectedSocieties.size === filteredSocieties.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search societies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3"
              />

              {/* Society List */}
              {availableSocieties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">All societies already have this chart assigned</p>
                </div>
              ) : filteredSocieties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No societies found matching &quot;{searchQuery}&quot;</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {filteredSocieties.map(society => (
                    <label
                      key={society.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSocieties.has(society.id)}
                        onChange={() => handleToggleSociety(society.id)}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{society.name}</p>
                        <p className="text-xs text-gray-500">{society.society_id}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              {selectedSocieties.size} {selectedSocieties.size === 1 ? 'society' : 'societies'} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={isAssigning}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssign(false)}
                disabled={selectedSocieties.size === 0 || isAssigning}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isAssigning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Assign to {selectedSocieties.size} {selectedSocieties.size === 1 ? 'Society' : 'Societies'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Conflict Warning Modal */}
        {showConflictWarning && conflicts && conflicts.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Replace Existing Charts?
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    The following {conflicts.length === 1 ? 'society already has' : 'societies already have'} a rate chart assigned for this channel:
                  </p>
                  <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                    {conflicts.map((conflict) => (
                      <div key={conflict.societyId} className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                        <p className="text-sm font-medium text-gray-900">{conflict.societyName}</p>
                        <p className="text-xs text-gray-600">Current: {conflict.currentFileName}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 font-medium">
                    Do you want to replace the existing {conflicts.length === 1 ? 'chart' : 'charts'} with this one?
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelReplace}
                  disabled={isAssigning}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReplace}
                  disabled={isAssigning}
                  className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center gap-2"
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
          </div>
        )}
      </div>
    </div>
  );
}
