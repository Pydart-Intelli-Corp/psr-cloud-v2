'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FlowerSpinner } from '@/components';

// Custom CSS to force text visibility and BTCBot-inspired styling
const inputStyle = `
  .otp-input {
    color: #111827 !important;
    background-color: #ffffff !important;
    -webkit-text-fill-color: #111827 !important;
  }
  .otp-input:focus {
    color: #111827 !important;
    background-color: #ffffff !important;
    -webkit-text-fill-color: #111827 !important;
  }
  .otp-input::-webkit-autofill,
  .otp-input::-webkit-autofill:hover,
  .otp-input::-webkit-autofill:focus,
  .otp-input::-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: #111827 !important;
    color: #111827 !important;
  }
  
  /* Force link visibility */
  .otp-link {
    color: #10b981 !important;
    text-decoration: none !important;
  }
  .otp-link:hover {
    color: #059669 !important;
    text-decoration: none !important;
  }
  .otp-link:visited {
    color: #10b981 !important;
  }
  .otp-link:active {
    color: #047857 !important;
  }
  
  /* Override any global link styles */
  a.otp-link,
  a.otp-link:hover,
  a.otp-link:focus,
  a.otp-link:active,
  a.otp-link:visited {
    color: #10b981 !important;
    opacity: 1 !important;
    background: none !important;
    -webkit-background-clip: initial !important;
    background-clip: initial !important;
    -webkit-text-fill-color: #10b981 !important;
  }
  a.otp-link:hover {
    color: #059669 !important;
    -webkit-text-fill-color: #059669 !important;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = inputStyle;
  document.head.appendChild(styleSheet);
}

interface UserInfo {
  email: string;
  fullName: string;
  welcomeEmailSent?: boolean;
  token?: string;
  refreshToken?: string;
  user?: {
    id: number;
    email: string;
    fullName: string;
    role: string;
  };
}

export default function VerifyOTPPage() {
  const [status, setStatus] = useState<'input' | 'verifying' | 'success' | 'error'>('input');
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Set document title
    document.title = 'Verify Email - Poornasree Equipments Cloud';

    // Get email from URL params, localStorage, or other sources
    const emailParam = searchParams.get('email');
    const storedEmail = localStorage.getItem('verificationEmail') || 
                       localStorage.getItem('registrationEmail') || 
                       localStorage.getItem('loginEmail');

    const emailToUse = emailParam || storedEmail || '';
    if (emailToUse) {
      setEmail(decodeURIComponent(emailToUse));
    }

    // Check if OTP was just sent (from resent=true parameter)
    const resentParam = searchParams.get('resent');
    const resendRequiredParam = searchParams.get('resend_required');
    
    if (resentParam === 'true') {
      setMessage('');
      setTimeLeft(600); // Reset timer
    } else if (resendRequiredParam === 'true') {
      setMessage('Please verify your email to continue.');
    }

    // Auto-focus first input
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, [searchParams]);

  useEffect(() => {
    // Start countdown timer
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newOtp.every(digit => digit) && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      handleVerifyOTP(pastedData);
    }
  };

  const handleVerifyOTP = async (otpCode: string) => {
    if (!email.trim()) {
      setStatus('error');
      setMessage('Email address is required. Please go back to login.');
      return;
    }

    setStatus('verifying');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email, 
          otpCode: otpCode 
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Email verified successfully!');
        setUserInfo(result.data);

        // Clear verification data from localStorage
        localStorage.removeItem('verificationEmail');
        localStorage.removeItem('registrationEmail');
        localStorage.removeItem('loginEmail');

        // Handle automatic login if tokens are provided
        if (result.autoLogin && result.data?.token) {
          const { token, refreshToken, user, redirectTo } = result.data;
          
          // Store authentication tokens
          localStorage.setItem('authToken', token);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('userData', JSON.stringify(user));

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push(redirectTo || '/user/dashboard');
          }, 2000);
        }
      } else {
        setStatus('error');
        setMessage(result.message || 'Invalid OTP code. Please try again.');
        
        // Extract attempts left from error message
        const match = result.message?.match(/(\d+) attempts remaining/);
        if (match) {
          setAttemptsLeft(parseInt(match[1]));
        }
        
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (!email.trim()) {
      alert('Email address is required');
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('input');
        setMessage('');
        setOtp(['', '', '', '', '', '']);
        setAttemptsLeft(5);
        setTimeLeft(600); // 10 minutes
        inputRefs.current[0]?.focus();
        alert('A new OTP has been sent to your email address.');
      } else {
        alert(result.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    switch (status) {
      case 'input':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-6">
              <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
            <p className="text-gray-600 mb-6">
              We&apos;ve sent a 6-digit verification code to
              <br />
              <span className="font-medium text-gray-900">{email}</span>
            </p>

            <div className="space-y-6">
              <div className="flex justify-center space-x-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="otp-input w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition-all bg-white hover:border-emerald-400"
                    placeholder="0"
                    style={{
                      color: '#111827 !important',
                      backgroundColor: '#ffffff !important',
                      WebkitTextFillColor: '#111827 !important'
                    }}
                  />
                ))}
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <p className="text-sm text-red-700">{message}</p>
                  {attemptsLeft < 5 && (
                    <p className="text-xs text-red-600 mt-1">
                      {attemptsLeft} attempts remaining
                    </p>
                  )}
                </motion.div>
              )}

              <div className="text-sm text-gray-500">
                {timeLeft > 0 ? (
                  <p>Code expires in {formatTime(timeLeft)}</p>
                ) : (
                  <p className="text-red-600">Code has expired. Please request a new one.</p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleVerifyOTP(otp.join(''))}
                  disabled={otp.join('').length !== 6}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Verify Code
                </button>

                <button
                  onClick={handleResendOTP}
                  disabled={isResending || timeLeft > 540} // Disable for first 60 seconds
                  className="w-full text-emerald-600 px-6 py-2 rounded-lg font-medium hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isResending ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 'verifying':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <FlowerSpinner size={64} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Code</h2>
            <p className="text-gray-600">Please wait while we verify your code...</p>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Email Verified Successfully!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            {userInfo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  Welcome {userInfo.fullName || userInfo.user?.fullName}! Your account is now active.
                  {userInfo.welcomeEmailSent && " A welcome email has been sent to your inbox."}
                </p>
                {userInfo.token && (
                  <div className="mt-3 flex items-center justify-center text-emerald-600">
                    <FlowerSpinner size={16} className="mr-2" />
                    <span className="text-sm font-medium">Logging you in and redirecting to dashboard...</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              {!userInfo?.token && (
                <Link 
                  href="/login"
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-green-700 transition-all duration-200 inline-block text-center transform hover:scale-[1.02]"
                >
                  Login to Your Account
                </Link>
              )}
              <Link 
                href="/"
                className="otp-link w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors inline-block text-center hover:bg-gray-200"
                style={{ color: '#374151 !important' }}
              >
                Back to Homepage
              </Link>
            </div>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center"
          >
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-red-800 mb-2">Need help?</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Make sure you entered all 6 digits correctly</li>
                <li>• Check your email for the latest code</li>
                <li>• The code expires after 10 minutes</li>
                {attemptsLeft > 0 && <li>• You have {attemptsLeft} attempts remaining</li>}
              </ul>
            </div>

            <div className="space-y-3">
              {attemptsLeft > 0 ? (
                <button
                  onClick={() => {
                    setStatus('input');
                    setMessage('');
                    setOtp(['', '', '', '', '', '']);
                    inputRefs.current[0]?.focus();
                  }}
                  className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors transform hover:scale-[1.02]"
                >
                  Try Again
                </button>
              ) : (
                <button
                  onClick={handleResendOTP}
                  disabled={isResending}
                  className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isResending ? 'Sending...' : 'Get New Code'}
                </button>
              )}
              
              <Link 
                href="/login"
                className="otp-link w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors inline-block text-center hover:bg-gray-200"
                style={{ color: '#374151 !important' }}
              >
                Back to Login
              </Link>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-green-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-6000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col justify-center py-12 sm:px-6 lg:px-8 min-h-screen">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="mb-4">
              <Image 
                src="/fulllogo.png" 
                alt="Poornasree Equipments Logo" 
                width={100} 
                height={100} 
                className="object-contain mx-auto"
              />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              Poornasree Equipments
            </h1>
            <p className="mt-2 text-sm text-gray-300">Email Verification</p>
          </motion.div>

          {/* Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/95 backdrop-blur-xl py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-white/20"
          >
            {renderContent()}
          </motion.div>

          {/* Footer Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-gray-300 mb-2">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@poornasreeequipments.com" className="text-emerald-400 hover:text-emerald-300">
                support@poornasreeequipments.com
              </a>
            </p>
            
            {/* Back to Login */}
            <div className="flex justify-center space-x-4 text-xs text-gray-400 mt-4">
              <Link 
                href="/login" 
                className="otp-link transition-colors text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                ← Back to Login
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}