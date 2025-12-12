'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Building2, ArrowRight, Users, CheckCircle } from 'lucide-react';

interface Society {
  id: number;
  name: string;
  societyId: string;
}

interface BMC {
  id: number;
  name: string;
  bmcId: string;
}

interface TransferSocietiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newBmcId: number) => void;
  bmcName: string;
  bmcId: number;
  societies: Society[];
  availableBMCs: BMC[];
}

export default function TransferSocietiesModal({
  isOpen,
  onClose,
  onConfirm,
  bmcName,
  societies,
  availableBMCs
}: TransferSocietiesModalProps) {
  const [selectedBmcId, setSelectedBmcId] = useState<number | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedBmcId(null);
    }
  }, [isOpen]);

  const handleTransfer = async () => {
    if (!selectedBmcId) return;
    
    setIsTransferring(true);
    try {
      await onConfirm(selectedBmcId);
    } finally {
      setIsTransferring(false);
    }
  };

  const selectedBmc = availableBMCs.find(bmc => bmc.id === selectedBmcId);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Transfer Societies Required</h3>
                    <p className="text-sm text-white/90 mt-1">Cannot delete BMC with active societies</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Warning Message */}
              <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                      {societies.length} {societies.length === 1 ? 'Society' : 'Societies'} Under This BMC
                    </h4>
                    <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                      Before deleting <strong>{bmcName}</strong>, you must transfer all societies to another BMC.
                    </p>
                  </div>
                </div>
              </div>

              {/* Societies List */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Societies to Transfer ({societies.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  {societies.map((society) => (
                    <div
                      key={society.id}
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{society.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">ID: {society.societyId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BMC Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Select Target BMC
                </label>
                <div className="space-y-2">
                  {availableBMCs.length === 0 ? (
                    <div className="p-4 text-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No other BMCs available. Please create a new BMC first.
                      </p>
                    </div>
                  ) : (
                    availableBMCs.map((bmc) => (
                      <button
                        key={bmc.id}
                        onClick={() => setSelectedBmcId(bmc.id)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          selectedBmcId === bmc.id
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              selectedBmcId === bmc.id
                                ? 'bg-green-500'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              <Building2 className={`w-5 h-5 ${
                                selectedBmcId === bmc.id
                                  ? 'text-white'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{bmc.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {bmc.bmcId}</p>
                            </div>
                          </div>
                          {selectedBmcId === bmc.id && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Transfer Preview */}
              {selectedBmc && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                >
                  <div className="flex items-center justify-center gap-3 text-sm">
                    <div className="text-center">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{bmcName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Current BMC</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div className="text-center">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{selectedBmc.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">New BMC</p>
                    </div>
                  </div>
                  <p className="text-xs text-center text-blue-800 dark:text-blue-200 mt-2">
                    All {societies.length} {societies.length === 1 ? 'society' : 'societies'} will be transferred
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isTransferring}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={!selectedBmcId || isTransferring || availableBMCs.length === 0}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isTransferring ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Transferring...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      Transfer & Continue to Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
