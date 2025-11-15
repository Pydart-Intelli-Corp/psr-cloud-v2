'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { FlowerSpinner } from '@/components';

const inputStyle = `
  .reset-password-input {
    color: #111827 !important;
    background-color: #ffffff !important;
    -webkit-text-fill-color: #111827 !important;
  }
  .reset-password-input:focus {
    color: #111827 !important;
    background-color: #ffffff !important;
    -webkit-text-fill-color: #111827 !important;
  }
  .reset-password-input::-webkit-autofill,
  .reset-password-input::-webkit-autofill:hover,
  .reset-password-input::-webkit-autofill:focus,
  .reset-password-input::-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: #111827 !important;
    color: #111827 !important;
  }
  
  .reset-link {
    color: #2563eb !important;
    text-decoration: none !important;
  }
  .reset-link:hover {
    color: #1d4ed8 !important;
  }
`;

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

const ResetPasswordContent = () => {
  const [form, setForm] = useState<ResetPasswordForm>({ 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    setMounted(true);
    
    const styleSheet = document.createElement('style');
    styleSheet.innerText = inputStyle;
    document.head.appendChild(styleSheet);
    
    document.title = 'Reset Password - Poornasree Equipments Cloud';
    
    // Validate token presence
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
    
    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, [token]);

  // Countdown and redirect after success
  useEffect(() => {
    if (isSuccess && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && redirectCountdown === 0) {
      router.push('/login');
    }
  }, [isSuccess, redirectCountdown, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
      return;
    }

    if (!form.newPassword || !form.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(form.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);
    setError('');
    setIsSuccess(false);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setError('Password reset successfully! Redirecting to login...');
        setForm({ newPassword: '', confirmPassword: '' });
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string; width: string } => {
    if (!password) return { strength: '', color: '', width: '0%' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2) return { strength: 'Weak', color: 'bg-red-500', width: '33%' };
    if (strength <= 4) return { strength: 'Medium', color: 'bg-yellow-500', width: '66%' };
    return { strength: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(form.newPassword);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
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
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700">
                New Password
              </label>
              <div className="relative overflow-hidden rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleInputChange}
                  required
                  autoComplete="new-password"
                  className="reset-password-input w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-xl placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200"
                  placeholder="Enter new password"
                  style={{ 
                    color: '#111827 !important',
                    backgroundColor: '#ffffff !important',
                    WebkitTextFillColor: '#111827 !important'
                  }}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 z-10">
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none p-1"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Password Strength Indicator */}
              {form.newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Password Strength:</span>
                    <span className={`font-semibold ${
                      passwordStrength.strength === 'Weak' ? 'text-red-600' :
                      passwordStrength.strength === 'Medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.strength}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: passwordStrength.width }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="relative overflow-hidden rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleInputChange}
                  required
                  autoComplete="new-password"
                  className="reset-password-input w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-xl placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200"
                  placeholder="Confirm new password"
                  style={{ 
                    color: '#111827 !important',
                    backgroundColor: '#ffffff !important',
                    WebkitTextFillColor: '#111827 !important'
                  }}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 z-10">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none p-1"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-700 mb-2">Password must contain:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>At least 8 characters</li>
                <li>One uppercase letter (A-Z)</li>
                <li>One lowercase letter (a-z)</li>
                <li>One number (0-9)</li>
                <li>One special character (@$!%*?&)</li>
              </ul>
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
                <div className="flex-1">
                  <span className="text-sm font-medium block">{error}</span>
                  {isSuccess && (
                    <span className="text-xs text-green-600 mt-1 block">
                      Redirecting in {redirectCountdown} seconds...
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !token || isSuccess}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-800 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-emerald-500/25"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <FlowerSpinner size={20} className="brightness-200" />
                  <span>Resetting Password...</span>
                </div>
              ) : isSuccess ? (
                'Password Reset Successfully!'
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Back to Login */}
          {!isSuccess && (
            <div className="mt-8 text-center">
              <Link 
                href="/login" 
                className="reset-link text-sm font-medium transition-colors"
              >
                Back to Login
              </Link>
            </div>
          )}
        </motion.div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <FlowerSpinner size={40} />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;
