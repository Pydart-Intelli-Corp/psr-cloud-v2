'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Building2, X, Mail } from 'lucide-react';

interface BMC {
  id: number;
  name: string;
  bmcId: string;
}

interface TransferBMCsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newDairyId: number | null, deleteAll: boolean, otp?: string) => void;
  bmcs: BMC[];
  dairies: Array<{ id: number; name: string; }>;
  dairyName: string;
  currentDairyId: number;
  adminEmail?: string;
}

export default function TransferBMCsModal({
  isOpen,
  onClose,
  onConfirm,
  bmcs,
  dairies,
  dairyName,
  currentDairyId,
  adminEmail = ''
}: TransferBMCsModalProps) {
  const [selectedDairyId, setSelectedDairyId] = useState<number | null>(null);
  const [deleteAll, setDeleteAll] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Filter out current dairy from options
  const availableDairies = dairies.filter(d => d.id !== currentDairyId);

  useEffect(() => {
    if (!isOpen) {
      setSelectedDairyId(null);
      setDeleteAll(false);
      setOtp(['', '', '', '', '', '']);
      setOtpSent(false);
      setOtpError('');
      setShowOtpInput(false);
      setIsSendingOtp(false);
    }
  }, [isOpen]);

  // Auto-focus first OTP input when shown
  useEffect(() => {
    if (showOtpInput && otpInputRefs.current[0]) {
      otpInputRefs.current[0]?.focus();
    }
  }, [showOtpInput]);

  const handleCheckboxChange = (checked: boolean) => {
    setDeleteAll(checked);
    if (checked) {
      setSelectedDairyId(null);
    }
    setOtp(['', '', '', '', '', '']);
    setOtpSent(false);
    setOtpError('');
    setShowOtpInput(false);
    setIsSendingOtp(false);
  };

  const sendOTP = async () => {
    setIsSendingOtp(true);
    setOtpError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/dairy/send-delete-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ dairyId: currentDairyId })
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        setShowOtpInput(true);
        setOtpError('');
      } else {
        setOtpError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setOtpError('Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, idx) => {
      if (idx < 6) newOtp[idx] = char;
    });
    setOtp(newOtp);

    // Focus the last filled input or first empty
    const nextIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = () => {
    if (deleteAll) {
      if (!otpSent) {
        sendOTP();
      } else {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
          setOtpError('Please enter complete 6-digit OTP');
          return;
        }
        onConfirm(null, true, otpCode);
      }
    } else {
      if (!selectedDairyId) return;
      // For transfer, also require OTP
      if (!otpSent) {
        sendOTP();
      } else {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
          setOtpError('Please enter complete 6-digit OTP');
          return;
        }
        onConfirm(selectedDairyId, false, otpCode);
      }
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Delete Dairy - Action Required
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Message */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Warning:</strong> This dairy has <strong>{bmcs.length}</strong> BMC{bmcs.length !== 1 ? 's' : ''} under it.
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
              You must either transfer these BMCs to another dairy or delete everything.
            </p>
          </div>

          {/* BMCs List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              BMCs under <strong>{dairyName}</strong>:
            </h3>
            <div className="max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-1">
              {bmcs.map((bmc) => (
                <div key={bmc.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  <span>{bmc.name} ({bmc.bmcId})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delete All Checkbox */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={deleteAll}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                    Delete All Data (Permanent)
                  </span>
                  <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                    DANGER
                  </span>
                </div>
                <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                  Delete all BMCs, societies, farmers, machines, machine statistics, machine corrections, rate charts, collections, sales, dispatches, and section pulse data under this dairy. 
                  <strong className="block mt-1">This action cannot be undone!</strong>
                </p>

                {deleteAll && (
                  <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/40 rounded-lg">
                    <p className="text-xs font-bold text-red-900 dark:text-red-100 mb-2">
                      ⚠️ The following will be permanently deleted:
                    </p>
                    <ul className="text-sm text-red-800 dark:text-red-200 mt-2 space-y-1 list-disc list-inside">
                      <li>{bmcs.length} BMC{bmcs.length !== 1 ? 's' : ''}</li>
                      <li>All societies under these BMCs</li>
                      <li>All farmers under these societies</li>
                      <li>All machines linked to these societies</li>
                      <li>All machine statistics</li>
                      <li>All machine corrections (admin & device saved)</li>
                      <li>All rate charts and rate chart data</li>
                      <li>All milk collection records</li>
                      <li>All milk sales records</li>
                      <li>All milk dispatch records</li>
                      <li>All section pulse tracking data</li>
                      <li>Dairy: <strong>{dairyName}</strong></li>
                    </ul>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Transfer Option */}
          {!deleteAll && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Select New Dairy for BMC Transfer:
              </label>
              <select
                value={selectedDairyId || ''}
                onChange={(e) => setSelectedDairyId(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select a dairy --</option>
                {availableDairies.map((dairy) => (
                  <option key={dairy.id} value={dairy.id}>
                    {dairy.name}
                  </option>
                ))}
              </select>
              {availableDairies.length === 0 && (
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  No other dairies available. You must delete all data instead.
                </p>
              )}
            </div>
          )}

          {/* OTP Section */}
          {otpSent && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  OTP sent to: {adminEmail}
                </p>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Please enter the 6-digit verification code to confirm {deleteAll ? 'deletion' : 'transfer and deletion'}:
              </p>
              
              {/* OTP Input Boxes */}
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpInputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
                  />
                ))}
              </div>

              {otpError && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{otpError}</span>
                </div>
              )}

              <p className="text-xs text-blue-700 dark:text-blue-300">
                OTP is valid for 10 minutes. Didn&apos;t receive it? Close and try again.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>

          {deleteAll ? (
            <button
              onClick={handleSubmit}
              disabled={isSendingOtp || (otpSent && !isOtpComplete)}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isSendingOtp ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending OTP...
                </>
              ) : otpSent ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Verify OTP & Delete All
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send OTP & Confirm Delete
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!selectedDairyId || isSendingOtp || (otpSent && !isOtpComplete)}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isSendingOtp ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending OTP...
                </>
              ) : otpSent ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Verify OTP & Transfer
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send OTP & Confirm Transfer
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
