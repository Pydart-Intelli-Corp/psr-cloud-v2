'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, MapPin, AlertCircle, CheckCircle, Building } from 'lucide-react';
import Link from 'next/link';
import { lookupPincode } from '@/lib/pincodeService';
import { FlowerSpinner } from '@/components';
import { checkAuthAndRedirect, verifyUserSession, getDashboardRoute } from '@/lib/clientAuth';

// Custom CSS to force text visibility and styling (matching login form)
const inputStyle = `
  .register-input {
    color: #111827 !important;
    background-color: #ffffff !important;
    -webkit-text-fill-color: #111827 !important;
  }
  .register-input:focus {
    color: #111827 !important;
    background-color: #ffffff !important;
    -webkit-text-fill-color: #111827 !important;
  }
  .register-input::-webkit-autofill,
  .register-input::-webkit-autofill:hover,
  .register-input::-webkit-autofill:focus,
  .register-input::-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: #111827 !important;
    color: #111827 !important;
  }
`;

// Types
interface FormData {
  fullName: string;
  email: string;
  companyName: string;
  companyPincode: string;
  companyCity: string;
  companyState: string;
  password: string;
  confirmPassword: string;
}

interface EmailStatus {
  isValid: boolean;
  isAvailable: boolean;
  message: string;
  type: 'error' | 'warning' | 'success';
}

interface ValidationResult {
  isValid: boolean;
  isDeliverable: boolean;
  isFree: boolean;
  suggestion?: string;
  error?: string;
}



export default function RegisterPage() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    companyName: '',
    companyPincode: '',
    companyCity: '',
    companyState: '',
    password: '',
    confirmPassword: ''
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Email validation state
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [emailDebounceTimer, setEmailDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Pincode state
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');

  // Password validation
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Form completion state
  const [canShowFullForm, setCanShowFullForm] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ fullName: string; role: string; email: string } | null>(null);

  // Inject styles and set document title
  useEffect(() => {
    // Inject custom styles
    const style = document.createElement('style');
    style.innerHTML = inputStyle;
    document.head.appendChild(style);

    // Set document title
    document.title = 'Admin Registration - Poornasree Equipments Cloud';

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Check if already logged in - Allow access to register page without auto-redirect
  useEffect(() => {
    console.log('🔍 Register useEffect: Checking user session validity');
    
    // Check if user has valid session but DON'T auto-redirect
    // This allows users to access register page even if they're already logged in
    verifyUserSession().then(({ isValid, user }) => {
      if (isValid && user) {
        console.log('ℹ️ Register: User has valid session but staying on register page for independent access');
        // Store current user info to show notification
        setCurrentUser({
          fullName: user.fullName,
          role: user.role,
          email: user.email
        });
      } else {
        console.log('ℹ️ Register: No valid session found, staying on register page');
        setCurrentUser(null);
      }
    }).catch((error) => {
      console.error('❌ Register: Session verification failed:', error);
      setCurrentUser(null);
    });
  }, [router]);

  // Email validation function
  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate email with API
  const validateEmailWithAPI = useCallback(async (email: string): Promise<void> => {
    if (!email.trim() || !validateEmailFormat(email)) {
      if (email.trim() && !validateEmailFormat(email)) {
        setEmailStatus({
          isValid: false,
          isAvailable: false,
          message: 'Invalid email format',
          type: 'error'
        });
      } else {
        setEmailStatus(null);
      }
      setCanShowFullForm(false);
      return;
    }

    setIsValidatingEmail(true);
    setEmailStatus(null);

    try {
      // First validate email deliverability
      const validationResponse = await fetch('/api/auth/validate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, deep: true })
      });

      const validationResult = await validationResponse.json();

      if (!validationResponse.ok || !validationResult.success) {
        setEmailStatus({
          isValid: false,
          isAvailable: false,
          message: 'Unable to validate email. Please try again.',
          type: 'error'
        });
        setCanShowFullForm(false);
        return;
      }

      const validation = validationResult.data as ValidationResult;

      // Check if email format is invalid
      if (!validation.isValid) {
        setEmailStatus({
          isValid: false,
          isAvailable: false,
          message: validation.error || 'Invalid email format',
          type: 'error'
        });
        setCanShowFullForm(false);
        return;
      }

      // Check if email is not deliverable
      if (!validation.isDeliverable) {
        const message = validation.suggestion 
          ? `Email domain cannot receive emails. Did you mean: ${validation.suggestion}?`
          : 'Email domain cannot receive emails';
        
        setEmailStatus({
          isValid: false,
          isAvailable: false,
          message,
          type: 'error'
        });
        setCanShowFullForm(false);
        return;
      }

      // Check if email already exists
      const statusResponse = await fetch('/api/auth/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (statusResponse.ok) {
        const statusResult = await statusResponse.json();
        
        if (statusResult.success && statusResult.data && statusResult.data.exists) {
          const accountStatus = statusResult.data;
          let message = '';
          
          switch (accountStatus.status) {
            case 'active':
              message = 'Email already registered and active. Please login instead.';
              break;
            case 'pending_approval':
              message = 'Email registered but pending admin approval.';
              break;
            case 'pending':
              if (accountStatus.isEmailVerified) {
                message = 'Email registered but account activation pending.';
              } else {
                message = 'Email registered but not verified. Check your email for verification code.';
              }
              break;
            case 'inactive':
              message = 'Previous registration with this email was rejected or deactivated.';
              break;
            case 'suspended':
              message = 'Account with this email has been suspended.';
              break;
            default:
              message = 'Email is already registered.';
          }
          
          setEmailStatus({
            isValid: true,
            isAvailable: false,
            message,
            type: 'error'
          });
          setCanShowFullForm(false);
          return;
        }
      }

      // Email is available for registration
      const successMessage = validation.isFree 
        ? 'Email is available. Note: Consider using a business email for professional accounts.'
        : 'Email is available for registration';
      
      setEmailStatus({
        isValid: true,
        isAvailable: true,
        message: successMessage,
        type: validation.isFree ? 'warning' : 'success'
      });
      setCanShowFullForm(true);

    } catch (error) {
      console.error('Email validation error:', error);
      setEmailStatus({
        isValid: false,
        isAvailable: false,
        message: 'Unable to validate email. Please try again.',
        type: 'error'
      });
      setCanShowFullForm(false);
    } finally {
      setIsValidatingEmail(false);
    }
  }, []);

  // Debounced email validation
  const handleEmailChange = (email: string) => {
    setFormData(prev => ({ ...prev, email }));
    
    // Clear existing timer
    if (emailDebounceTimer) {
      clearTimeout(emailDebounceTimer);
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      validateEmailWithAPI(email);
    }, 800);
    
    setEmailDebounceTimer(timer);
  };

  // Handle pincode change and auto-fill city/state
  const handlePincodeChange = async (pincode: string) => {
    setFormData(prev => ({ ...prev, companyPincode: pincode }));
    setPincodeError('');

    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      setIsPincodeLoading(true);
      
      try {
        const result = await lookupPincode(pincode);
        
        if (result.success && result.data) {
          setFormData(prev => ({
            ...prev,
            companyCity: result.data?.city || '',
            companyState: result.data?.state || ''
          }));
        } else {
          setPincodeError(result.error || 'Invalid pincode or unable to fetch location details');
        }
      } catch (error) {
        console.error('Pincode validation error:', error);
        setPincodeError('Unable to validate pincode. Please enter city and state manually.');
      } finally {
        setIsPincodeLoading(false);
      }
    }
  };

  // Validate password
  const validatePassword = (password: string) => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }
    
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  // Check if form can be submitted
  useEffect(() => {
    const isFormValid = 
      formData.fullName.trim() &&
      emailStatus?.isAvailable &&
      formData.companyName.trim() &&
      formData.companyPincode.trim() &&
      formData.companyCity.trim() &&
      formData.companyState.trim() &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      passwordErrors.length === 0;

    setCanSubmit(!!isFormValid);
  }, [formData, emailStatus, passwordErrors]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: 'admin' // All registrations through this form are for admin role
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Registration successful - redirect to OTP verification
        router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div className="flex flex-col justify-center items-center p-12 text-white w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-lg"
            >
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/25 overflow-hidden">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl opacity-20 blur-lg"></div>
              </div>
              
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-green-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
                Poornasree
              </h1>
              <p className="text-2xl font-semibold mb-4 text-gray-200">Equipments Cloud</p>
              
              <p className="text-xl text-gray-200 mb-12 leading-relaxed">
                Join the dairy revolution with our cloud-based platform. 
                Connect with thousands of professionals worldwide.
              </p>
              
              <div className="space-y-6 text-left">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                  <span className="text-gray-200 font-medium">Comprehensive User Management</span>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"></div>
                  <span className="text-gray-200 font-medium">Role-based Access Control</span>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"></div>
                  <span className="text-gray-200 font-medium">Cloud-based Infrastructure</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Registration</h1>
              <p className="text-gray-600">Create your admin account</p>
            </div>

        {/* Current User Notification */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start space-x-3 rounded-xl p-4 bg-blue-50 border border-blue-200"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                Already logged in as <strong>{currentUser.fullName}</strong> ({currentUser.role})
              </p>
              <p className="text-xs text-blue-600 mt-1">
                You can continue to register a new admin account or{' '}
                <button
                  onClick={() => {
                    const dashboardRoute = getDashboardRoute(currentUser.role);
                    router.push(dashboardRoute);
                  }}
                  className="font-medium hover:underline focus:outline-none"
                >
                  go to your dashboard
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="register-input w-full pl-10 pr-4 py-4 bg-white border border-gray-200 rounded-xl placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all duration-200"
                placeholder="Enter your full name"
                required
                style={{ 
                  color: '#111827 !important',
                  backgroundColor: '#ffffff !important',
                  WebkitTextFillColor: '#111827 !important'
                }}
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="register-input w-full pl-10 pr-12 py-4 bg-white border border-gray-200 rounded-xl placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all duration-200"
                placeholder="Enter your email address"
                required
                style={{ 
                  color: '#111827 !important',
                  backgroundColor: '#ffffff !important',
                  WebkitTextFillColor: '#111827 !important'
                }}
              />
              {isValidatingEmail && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <FlowerSpinner size={20} />
                </div>
              )}
              {!isValidatingEmail && emailStatus && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {emailStatus.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {emailStatus.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-500" />}
                  {emailStatus.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                </div>
              )}
            </div>

            {/* Email Status Display */}
            {emailStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-2 p-3 rounded-lg ${
                  emailStatus.type === 'success' ? 'bg-green-50 border border-green-200' :
                  emailStatus.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
                  'bg-red-50 border border-red-200'
                }`}
              >
                <p className={`text-sm flex items-center gap-2 ${
                  emailStatus.type === 'success' ? 'text-green-700' :
                  emailStatus.type === 'warning' ? 'text-amber-700' :
                  'text-red-700'
                }`}>
                  {emailStatus.type === 'success' && <CheckCircle className="h-4 w-4" />}
                  {emailStatus.type === 'warning' && <AlertCircle className="h-4 w-4" />}
                  {emailStatus.type === 'error' && <AlertCircle className="h-4 w-4" />}
                  {emailStatus.message}
                </p>
              </motion.div>
            )}
          </div>

          {/* Rest of the form - only show when email is available */}
          <AnimatePresence>
            {canShowFullForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="register-input w-full pl-10 pr-4 py-4 bg-white border border-gray-200 rounded-xl placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all duration-200"
                      placeholder="Enter company name"
                      required
                      style={{ 
                        color: '#111827 !important',
                        backgroundColor: '#ffffff !important',
                        WebkitTextFillColor: '#111827 !important'
                      }}
                    />
                  </div>
                </div>

                {/* Address Fields */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.companyPincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        className="register-input w-full pl-10 pr-12 py-4 bg-white border border-gray-200 rounded-xl placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all duration-200"
                        placeholder="Enter 6-digit pincode"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        required
                        style={{ 
                          color: '#111827 !important',
                          backgroundColor: '#ffffff !important',
                          WebkitTextFillColor: '#111827 !important'
                        }}
                      />
                      {isPincodeLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <FlowerSpinner size={20} />
                        </div>
                      )}
                    </div>
                    {pincodeError && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {pincodeError}
                      </p>
                    )}
                  </div>

                  {/* City and State */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.companyCity}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyCity: e.target.value }))}
                        className="register-input w-full px-4 py-4 bg-white border border-gray-200 rounded-xl placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all duration-200"
                        placeholder="City"
                        required
                        style={{ 
                          color: '#111827 !important',
                          backgroundColor: '#ffffff !important',
                          WebkitTextFillColor: '#111827 !important'
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.companyState}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyState: e.target.value }))}
                        className="register-input w-full px-4 py-4 bg-white border border-gray-200 rounded-xl placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all duration-200"
                        placeholder="State"
                        required
                        style={{ 
                          color: '#111827 !important',
                          backgroundColor: '#ffffff !important',
                          WebkitTextFillColor: '#111827 !important'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, password: e.target.value }));
                        validatePassword(e.target.value);
                      }}
                      className="register-input w-full pl-10 pr-12 py-4 bg-white border border-gray-200 rounded-xl placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all duration-200"
                      placeholder="Create a strong password"
                      required
                      autoComplete="new-password"
                      style={{ 
                        color: '#111827 !important',
                        backgroundColor: '#ffffff !important',
                        WebkitTextFillColor: '#111827 !important'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  {passwordErrors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {passwordErrors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600 flex items-center gap-2">
                          <AlertCircle className="h-3 w-3" />
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="register-input w-full pl-10 pr-12 py-4 bg-white border border-gray-200 rounded-xl placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all duration-200"
                      placeholder="Confirm your password"
                      required
                      autoComplete="new-password"
                      style={{ 
                        color: '#111827 !important',
                        backgroundColor: '#ffffff !important',
                        WebkitTextFillColor: '#111827 !important'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Match Validation */}
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Passwords do not match
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: canSubmit ? 1.02 : 1 }}
            whileTap={{ scale: canSubmit ? 0.98 : 1 }}
            type="submit"
            disabled={!canSubmit || isLoading}
            className={`w-full py-4 px-4 rounded-xl font-medium transition-all duration-200 ${
              canSubmit
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <FlowerSpinner size={20} />
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </motion.button>
        </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
