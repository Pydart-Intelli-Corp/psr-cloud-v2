'use client';

import { useState } from 'react';
import { AlertTriangle, X, Mail, Trash2 } from 'lucide-react';

interface DeleteSocietyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (otp: string) => void;
  societyName: string;
  loading?: boolean;
}

export default function DeleteSocietyModal({
  isOpen,
  onClose,
  societyName,
  onConfirm,
  loading = false
}: DeleteSocietyModalProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  if (!isOpen) return null;

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = Array(6).fill('');
    pastedData.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setOtpError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const societyId = (window as { selectedSocietyId?: number }).selectedSocietyId;
      
      const response = await fetch('/api/user/society/send-delete-otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ societyId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleConfirm = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter complete 6-digit OTP');
      return;
    }
    onConfirm(otpString);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Delete Society
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Message */}
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-semibold mb-2">
              ⚠️ THIS ACTION CANNOT BE UNDONE!
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Deleting <strong className="font-bold">{societyName}</strong> will permanently remove:
            </p>
          </div>

          {/* Data to be deleted */}
          <div className="mb-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span>All farmers under this society</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span>All machines linked to this society</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span>All machine statistics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span>All machine corrections</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span>All rate charts and rate chart data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span>All milk collections</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span>All sales records</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span>All dispatch records</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span>All section pulse tracking data</span>
            </div>
          </div>

          {!otpSent ? (
            // Send OTP Button
            <button
              onClick={handleSendOtp}
              disabled={sendingOtp}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {sendingOtp ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending OTP...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Send OTP to Email
                </>
              )}
            </button>
          ) : (
            <>
              {/* OTP Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                  Enter 6-digit OTP sent to your email
                </label>
                <div className="flex justify-center gap-2 mb-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 active:bg-white dark:active:bg-gray-700 focus:text-gray-900 dark:focus:text-white focus:outline-none transition-colors"
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">{otpError}</p>
                )}
              </div>

              {/* Resend OTP */}
              <button
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4 w-full text-center"
              >
                {sendingOtp ? 'Resending...' : 'Resend OTP'}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        {otpSent && (
          <div className="flex gap-3 p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || otp.join('').length !== 6}
              className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Delete All
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
