'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { FlowerSpinner } from '@/components';

const inputStyle = `
  .forgot-password-input {
    color: #111827 !important;
    background-color: #ffffff !important;
    -webkit-text-fill-color: #111827 !important;
  }
  .forgot-password-input:focus {
    color: #111827 !important;
    background-color: #ffffff !important;
    -webkit-text-fill-color: #111827 !important;
  }
  .forgot-password-input::-webkit-autofill,
  .forgot-password-input::-webkit-autofill:hover,
  .forgot-password-input::-webkit-autofill:focus,
  .forgot-password-input::-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: #111827 !important;
    color: #111827 !important;
  }
  
  .forgot-link {
    color: #2563eb !important;
    text-decoration: none !important;
  }
  .forgot-link:hover {
    color: #1d4ed8 !important;
  }
`;

interface ForgotPasswordForm {
  email: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

const ForgotPasswordPage = () => {
  const [form, setForm] = useState<ForgotPasswordForm>({ email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const styleSheet = document.createElement('style');
    styleSheet.innerText = inputStyle;
    document.head.appendChild(styleSheet);
    
    document.title = 'Forgot Password - Poornasree Equipments Cloud';
    
    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setIsSuccess(false);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: form.email }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setError('Password reset link has been sent to your email. Please check your inbox.');
        setForm({ email: '' });
      } else {
        setError(data.message || 'Failed to send reset link. Please try again.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-600">
              {mounted ? "Don't worry! Enter your email and we'll send you a reset link." : "Don\u2019t worry! Enter your email and we\u2019ll send you a reset link."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative overflow-hidden rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  required
                  autoComplete="email"
                  className="forgot-password-input w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                  placeholder="Enter your registered email"
                  style={{ 
                    color: '#111827 !important',
                    backgroundColor: '#ffffff !important',
                    WebkitTextFillColor: '#111827 !important'
                  }}
                />
              </div>
            </div>

            {/* Error/Success Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start space-x-3 rounded-xl p-4 ${
                  isSuccess 
                    ? 'text-green-700 bg-green-50 border border-green-200' 
                    : 'text-red-700 bg-red-50 border border-red-200'
                }`}
              >
                {isSuccess ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-blue-500/25"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <FlowerSpinner size={20} className="brightness-200" />
                  <span>Sending Reset Link...</span>
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link 
              href="/login" 
              className="forgot-link text-sm font-medium inline-flex items-center space-x-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>

          {/* Additional Help */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-center space-y-2"
            >
              <p className="text-sm text-gray-600">
                {mounted ? "Didn't receive the email?" : "Didn\u2019t receive the email?"}
              </p>
              <p className="text-xs text-gray-500">
                Check your spam folder or{' '}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="forgot-link font-medium"
                >
                  try again
                </button>
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
