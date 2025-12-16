'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Building2, ArrowRight, Users, CheckCircle, Mail, RefreshCw } from 'lucide-react';

interface Society {
  id: number;
  name: string;
  society_id: string;
}

interface BMC {
  id: number;
  name: string;
  bmcId: string;
}

interface TransferSocietiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newBmcId: number | null, deleteAll: boolean, otp?: string) => void;
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
  bmcId,
  societies,
  availableBMCs
}: TransferSocietiesModalProps) {
  const [selectedBmcId, setSelectedBmcId] = useState<number | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [deleteAll, setDeleteAll] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedBmcId(null);
      setDeleteAll(false);
      setShowOtpInput(false);
      setOtp(['', '', '', '', '', '']);
      setOtpSent(false);
      setOtpError('');
    }
  }, [isOpen]);

  const sendOTP = async () => {
    setIsSendingOtp(true);
    setOtpError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/bmc/send-delete-otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bmcId, bmcName })
      });

      const result = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setShowOtpInput(true);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setOtpError(result.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setOtpError('Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
    }
  };

  const handleTransfer = async () => {
    if (!deleteAll && !selectedBmcId) return;
    
    // Always require OTP for both transfer and delete-all
    if (!otpSent) {
      await sendOTP();
      return;
    }
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setOtpError('Please enter the 6-digit OTP');
      return;
    }

    setIsTransferring(true);
    try {
      await onConfirm(selectedBmcId, deleteAll, otpCode);
    } catch {
      setOtpError('Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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
                      Before deleting <strong>{bmcName}</strong>, you must either transfer all societies to another BMC or delete everything.
                    </p>
                  </div>
                </div>
              </div>

              {/* Delete All Option */}
              <div className="mb-6">
                <label className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={deleteAll}
                    onChange={(e) => {
                      setDeleteAll(e.target.checked);
                      if (e.target.checked) {
                        setSelectedBmcId(null);
                      }
                    }}
                    className="mt-0.5 w-5 h-5 text-red-600 bg-white dark:bg-gray-700 border-red-300 dark:border-red-700 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <span className="font-semibold text-red-900 dark:text-red-100">
                        Delete All Data (Permanent)
                      </span>
                    </div>
                    <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                      Delete all societies, farmers, machines, machine statistics, machine corrections, rate charts, collections, sales, dispatches, and section pulse data under this BMC. 
                      <strong className="block mt-1">This action cannot be undone!</strong>
                    </p>
                  </div>
                </label>
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
                        <p className="text-xs text-gray-500 dark:text-gray-400">ID: {society.society_id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BMC Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Select Target BMC {!deleteAll && <span className="text-red-500">*</span>}
                </label>
                {deleteAll && (
                  <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Delete All</strong> is enabled. BMC selection is disabled.
                    </p>
                  </div>
                )}
                <div className={`space-y-2 ${deleteAll ? 'opacity-50 pointer-events-none' : ''}`}>
                  {availableBMCs.length === 0 ? (
                    <div className="p-4 text-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No other BMCs available. {!deleteAll && 'Please create a new BMC first or use Delete All option.'}
                      </p>
                    </div>
                  ) : (
                    availableBMCs.map((bmc) => (
                      <button
                        key={bmc.id}
                        onClick={() => setSelectedBmcId(bmc.id)}
                        disabled={deleteAll}
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
              {selectedBmc && !deleteAll && (
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

              {/* Delete All Preview */}
              {deleteAll && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                      <h5 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                        Complete Data Deletion
                      </h5>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        The following will be permanently deleted:
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 mt-2 space-y-1 list-disc list-inside">
                        <li>{societies.length} {societies.length === 1 ? 'Society' : 'Societies'}</li>
                        <li>All farmers under these societies</li>
                        <li>All machines linked to these societies</li>
                        <li>All machine statistics</li>
                        <li>All machine corrections (admin & device saved)</li>
                        <li>All rate charts and rate chart data</li>
                        <li>All milk collection records</li>
                        <li>All milk sales records</li>
                        <li>All milk dispatch records</li>
                        <li>All section pulse tracking data</li>
                        <li>BMC: <strong>{bmcName}</strong></li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* OTP Input Section */}
              {otpSent && showOtpInput && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-lg"
                >
                  <div className="text-center">
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center justify-center gap-2">
                      <Mail className="w-5 h-5" />
                      OTP Verification Required
                    </h4>
                    <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
                      We&apos;ve sent a 6-digit OTP to your registered email. Please enter it below to confirm {deleteAll ? 'deletion' : 'transfer'}.
                    </p>
                    
                    {/* OTP Input Boxes */}
                    <div className="flex justify-center gap-2 mb-4">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={el => { inputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={handleOtpPaste}
                          className="w-12 h-14 text-center text-2xl font-bold border-2 border-orange-300 dark:border-orange-700 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          disabled={isTransferring}
                        />
                      ))}
                    </div>

                    {otpError && (
                      <p className="text-sm text-red-600 dark:text-red-400 mb-2">{otpError}</p>
                    )}

                    <button
                      onClick={sendOTP}
                      disabled={isSendingOtp}
                      className="text-sm text-orange-700 dark:text-orange-300 hover:text-orange-900 dark:hover:text-orange-100 flex items-center justify-center gap-1 mx-auto transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Resend OTP
                    </button>
                  </div>
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
                  disabled={(!selectedBmcId && !deleteAll) || isTransferring || (otpSent && otp.join('').length !== 6)}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    deleteAll 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                  }`}
                >
                  {isTransferring ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {deleteAll ? 'Deleting All...' : 'Transferring...'}
                    </>
                  ) : !otpSent ? (
                    <>
                      <Mail className="w-4 h-4" />
                      Send OTP to Confirm
                    </>
                  ) : (
                    <>
                      {deleteAll ? <AlertTriangle className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      Verify OTP & {deleteAll ? 'Delete All' : 'Transfer'}
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
