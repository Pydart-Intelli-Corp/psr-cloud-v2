'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { AlertCircle, CheckCircle, Clock, XCircle, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { FlowerSpinner } from '@/components';

interface AccountStatus {
  email: string;
  fullName: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
  statusMessage: string;
  statusType: string;
  canLogin: boolean;
  nextAction: string;
  accountExists: boolean;
}

export default function AccountStatusPage() {
  const [email, setEmail] = useState('');
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();

  const checkStatus = useCallback(async (emailToCheck?: string) => {
    const targetEmail = emailToCheck || email;
    
    if (!targetEmail) {
      setError('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setAccountStatus(null);

    try {
      const response = await fetch('/api/auth/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: targetEmail }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const status = result.data;
        setAccountStatus(status);
      } else {
        setError(result.message || 'Account not found');
      }
    } catch (error) {
      console.error('Status check error:', error);
      setError('Failed to check account status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  // Check for email parameter in URL
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      checkStatus(emailParam);
    }
  }, [searchParams, checkStatus]);

  const getStatusIcon = (statusType: string) => {
    switch (statusType) {
      case 'active':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'admin_approval_pending':
      case 'activation_pending':
      case 'email_verification_pending':
        return <Clock className="h-12 w-12 text-yellow-500" />;
      case 'admin_rejected':
      case 'inactive':
      case 'suspended':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <AlertCircle className="h-12 w-12 text-gray-500" />;
    }
  };

  const getStatusColor = (statusType: string) => {
    switch (statusType) {
      case 'active':
        return 'border-green-200 bg-green-50';
      case 'admin_approval_pending':
      case 'activation_pending':
      case 'email_verification_pending':
        return 'border-yellow-200 bg-yellow-50';
      case 'admin_rejected':
      case 'inactive':
      case 'suspended':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getNextActionButton = (nextAction: string, email: string) => {
    switch (nextAction) {
      case 'verify_email':
        return (
          <Link
            href={`/verify-otp?email=${encodeURIComponent(email)}`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Verify Email <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        );
      case 'login':
        return (
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Login to Account <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        );
      case 'wait_for_approval':
        return (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Your application is being reviewed by our admin team.
            </p>
            <button
              onClick={() => checkStatus()}
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Refresh Status
            </button>
          </div>
        );
      case 'contact_support':
        return (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Please contact our support team for assistance.
            </p>
            <a
              href="mailto:support@poornasree.com"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                <Image
                  src="/logo.svg"
                  alt="PSR Logo"
                  width={40}
                  height={40}
                  className="text-white"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<div class="text-white font-bold text-xl">PSR</div>';
                  }}
                />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Status</h1>
            <p className="text-gray-600">Check your account registration status</p>
          </div>

          {/* Status Check Form */}
          {!accountStatus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
            >
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={() => checkStatus()}
                  disabled={isLoading || !email.trim()}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FlowerSpinner size={20} className="brightness-200" />
                      <span>Checking Status...</span>
                    </div>
                  ) : (
                    'Check Status'
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Status Display */}
          {accountStatus && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-white rounded-2xl shadow-xl border p-8 ${getStatusColor(accountStatus.statusType)}`}
            >
              <div className="text-center space-y-6">
                {/* Status Icon */}
                <div className="flex justify-center">
                  {getStatusIcon(accountStatus.statusType)}
                </div>

                {/* Account Info */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {accountStatus.fullName}
                  </h2>
                  <p className="text-gray-600 mb-1">{accountStatus.email}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    {accountStatus.role.replace('_', ' ')} Account
                  </p>
                </div>

                {/* Status Message */}
                <div className="bg-white/50 rounded-lg p-4">
                  <p className="text-gray-800 font-medium">
                    {accountStatus.statusMessage}
                  </p>
                </div>

                {/* Action Button */}
                <div>
                  {getNextActionButton(accountStatus.nextAction, accountStatus.email)}
                </div>

                {/* Check Another Account */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setAccountStatus(null);
                      setEmail('');
                      setError('');
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Check Another Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}