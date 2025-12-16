'use client';

import { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { X, AlertTriangle, Trash2, Send, ShieldCheck } from 'lucide-react';

interface DeleteBMCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (otp: string) => Promise<void>;
  bmcName: string;
  loading?: boolean;
  societyCount?: number;
  farmerCount?: number;
  collectionCount?: number;
  machineCount?: number;
}

export default function DeleteBMCModal({
  isOpen,
  onClose,
  onConfirm,
  bmcName,
  loading = false,
  societyCount = 0,
  farmerCount = 0,
  collectionCount = 0,
  machineCount = 0
}: DeleteBMCModalProps) {
  const [step, setStep] = useState<'confirm' | 'otp'>('confirm');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOTP = async () => {
    try {
      setOtpLoading(true);
      setOtpError('');

      // Get BMC ID from window (stored by parent component)
      const bmcId = (window as Window & { selectedBmcIdForDelete?: number }).selectedBmcIdForDelete;
      if (!bmcId) {
        setOtpError('BMC ID not found. Please try again.');
        return;
      }

      const response = await fetch('/api/user/bmc/send-delete-otp', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ bmcId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setStep('otp');
      // Auto-focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (error: unknown) {
      setOtpError(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex(val => !val);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter the complete 6-digit OTP');
      return;
    }

    try {
      await onConfirm(otpString);
      handleClose();
    } catch (error: unknown) {
      setOtpError(error instanceof Error ? error.message : 'Invalid or expired OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              {step === 'confirm' ? 'Delete BMC' : 'Verify OTP'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={loading || otpLoading}
            className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'confirm' ? (
            <>
              {/* Warning Message */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100 mb-1">
                      Warning: This action cannot be undone
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Deleting this BMC will permanently remove:
                    </p>
                  </div>
                </div>
              </div>

              {/* Deletion Details */}
              <div className="space-y-3 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">BMC Name</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{bmcName}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">The following data will be deleted:</p>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    {societyCount > 0 && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        {societyCount} societ{societyCount > 1 ? 'ies' : 'y'}
                      </li>
                    )}
                    {farmerCount > 0 && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        {farmerCount} farmer{farmerCount > 1 ? 's' : ''} and their data
                      </li>
                    )}
                    {collectionCount > 0 && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        {collectionCount} collection record{collectionCount > 1 ? 's' : ''}
                      </li>
                    )}
                    {machineCount > 0 && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        {machineCount} machine{machineCount > 1 ? 's' : ''} and settings
                      </li>
                    )}
                    {societyCount === 0 && farmerCount === 0 && collectionCount === 0 && machineCount === 0 && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        The BMC details only
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={loading || otpLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendOTP}
                  disabled={loading || otpLoading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-medium text-white hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {otpLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send OTP
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* OTP Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      OTP Sent to Your Email
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Please enter the 6-digit OTP to confirm deletion. The code will expire in 10 minutes.
                    </p>
                  </div>
                </div>
              </div>

              {/* OTP Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Enter OTP Code
                </label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={loading}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2 text-center">{otpError}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep('confirm');
                    setOtp(['', '', '', '', '', '']);
                    setOtpError('');
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.some(d => !d)}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-medium text-white hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete BMC
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
