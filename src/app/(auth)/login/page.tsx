'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle, Mail, Lock } from 'lucide-react';
import EmailVerificationPrompt from '@/components/auth/EmailVerificationPrompt';
import { FlowerSpinner } from '@/components';
import { checkAuthAndRedirect, getDashboardRoute, verifyUserSession } from '@/lib/clientAuth';

// Custom CSS to force text visibility and styling
const inputStyle = `
  .login-input {
    color: #111827 !important;
    background-color: #ffffff !important;
    -webkit-text-fill-color: #111827 !important;
  }
  .login-input:focus {
    color: #111827 !important;
    background-color: #ffffff !important;
    -webkit-text-fill-color: #111827 !important;
  }
  .login-input::-webkit-autofill,
  .login-input::-webkit-autofill:hover,
  .login-input::-webkit-autofill:focus,
  .login-input::-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: #111827 !important;
    color: #111827 !important;
  }
  
  /* Force link visibility */
  .login-link {
    color: #2563eb !important;
    text-decoration: none !important;
  }
  .login-link:hover {
    color: #1d4ed8 !important;
    text-decoration: none !important;
  }
  .login-link:visited {
    color: #2563eb !important;
  }
  .login-link:active {
    color: #1e40af !important;
  }
  
  /* Override any global link styles */
  a.login-link,
  a.login-link:hover,
  a.login-link:focus,
  a.login-link:active,
  a.login-link:visited {
    color: #2563eb !important;
    opacity: 1 !important;
    background: none !important;
    -webkit-background-clip: initial !important;
    background-clip: initial !important;
    -webkit-text-fill-color: #2563eb !important;
  }
  a.login-link:hover {
    color: #1d4ed8 !important;
    -webkit-text-fill-color: #1d4ed8 !important;
  }
  
  /* Background animation keyframes */
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  .float-animation {
    animation: float 6s ease-in-out infinite;
  }
  
  .pulse-animation {
    animation: pulse 4s ease-in-out infinite;
  }
  
  .slide-in-animation {
    animation: slideIn 0.8s ease-out;
  }
`;

// Style injection and title setting will be handled in useEffect

interface LoginForm {
  email: string;
  password: string;
  loginType: 'user' | 'farmer' | 'society';
  otp: string[];
  otpSent: boolean;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    refreshToken?: string;
    accessToken?: string;
    user?: {
      id: number;
      email: string;
      fullName: string;
      role: string;
    };
  };
  error?: {
    message: string;
    code: string;
  };
}

const LoginPage = () => {
  const [form, setForm] = useState<LoginForm>({ 
    email: '', 
    password: '', 
    loginType: 'user',
    otp: ['', '', '', '', '', ''],
    otpSent: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showEmailVerificationPrompt, setShowEmailVerificationPrompt] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [currentUser, setCurrentUser] = useState<{ fullName: string; role: string; email: string } | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Handle hydration and client-side setup
  useEffect(() => {
    setMounted(true);
    
    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.innerText = inputStyle;
    document.head.appendChild(styleSheet);
    
    // Set document title
    document.title = 'Login - Poornasree Equipments Cloud';
    
    return () => {
      // Cleanup styles on unmount
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  // Check if already logged in - Allow access to login page without auto-redirect
  useEffect(() => {
    console.log('🔍 Login useEffect: Checking user session validity');
    
    // Check if user has valid session but DON'T auto-redirect
    // This allows users to access login page even if they're already logged in
    verifyUserSession().then(({ isValid, user }) => {
      if (isValid && user) {
        console.log('ℹ️ Login: User has valid session but staying on login page for independent access');
        // Store current user info to show notification
        setCurrentUser({
          fullName: user.fullName,
          role: user.role,
          email: user.email
        });
      } else {
        console.log('ℹ️ Login: No valid session found, staying on login page');
        setCurrentUser(null);
      }
    }).catch((error) => {
      console.error('❌ Login: Session verification failed:', error);
      setCurrentUser(null);
    });
  }, [router]);

  // Check for verification success from URL params
  useEffect(() => {
    if (mounted) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('verified') === 'true') {
        setIsSuccess(true);
        setError('Email verified successfully! You can now sign in.');
        // Clean the URL
        window.history.replaceState({}, document.title, '/login');
      }
    }
  }, [mounted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
    setIsSuccess(false); // Clear success state when user types
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...form.otp];
    newOtp[index] = value;
    setForm(prev => ({ ...prev, otp: newOtp }));

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !form.otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const validateForm = (): boolean => {
    if (!form.email) {
      setError('Email is required');
      return false;
    }
    if (!form.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // For farmer or society login with OTP, only validate email if OTP not sent yet
    if ((form.loginType === 'farmer' || form.loginType === 'society') && !form.otpSent) {
      return true;
    }
    
    // For farmer or society login with OTP sent, validate OTP
    if ((form.loginType === 'farmer' || form.loginType === 'society') && form.otpSent) {
      if (form.otp.join('').length !== 6) {
        setError('Please enter the 6-digit OTP');
        return false;
      }
      return true;
    }
    
    // For user login, validate password
    if (!form.password) {
      setError('Password is required');
      return false;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!form.email || !form.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSendingOtp(true);
    setError('');

    try {
      // Use external API which supports both farmer and society login
      const endpoint = form.loginType === 'farmer' ? '/api/auth/farmer-send-otp' : '/api/external/auth/send-otp';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: form.email }),
      });

      const result = await response.json();

      if (result.success) {
        setForm(prev => ({ ...prev, otpSent: true }));
        setIsSuccess(true);
        const entityType = result.data?.entityType || form.loginType;
        setError(`OTP sent successfully! Please check your email. (${entityType} account found)`);
        setTimeout(() => {
          setIsSuccess(false);
          setError('');
        }, 4000);
      } else {
        setError(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleEmailVerificationPending = async (email: string) => {
    // Show the email verification prompt instead of auto-redirecting
    setPendingVerificationEmail(email);
    setShowEmailVerificationPrompt(true);
    setIsLoading(false);
  };

  const handleVerificationCancel = () => {
    setShowEmailVerificationPrompt(false);
    setPendingVerificationEmail('');
    setError('');
  };

  const handleVerificationProceed = () => {
    // This will be handled by the EmailVerificationPrompt component
    setShowEmailVerificationPrompt(false);
    setPendingVerificationEmail('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setIsSuccess(false);

    try {
      // For farmer or society login with OTP
      if (form.loginType === 'farmer' || form.loginType === 'society') {
        if (!form.otpSent) {
          // Send OTP first
          setIsLoading(false);
          await handleSendOtp();
          return;
        }

        // Verify OTP and login - use external API for society, farmer API for farmer
        const otpCode = form.otp.join('');
        const endpoint = form.loginType === 'farmer' ? '/api/auth/farmer-login' : '/api/external/auth/verify-otp';
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: form.email, otpCode, otp: otpCode }),
        });

        const result: LoginResponse = await response.json();

        if (result.success && result.data) {
          // Handle both farmer and society response structures
          const user = result.data.user || result.data;
          const token = result.data.token || result.data.accessToken;
          const refreshToken = result.data.refreshToken;
          
          // Store tokens and user info
          if (token) localStorage.setItem('authToken', token);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('userData', JSON.stringify(user));

          setIsSuccess(true);
          
          // Redirect based on login type
          const dashboardRoute = form.loginType === 'farmer' ? '/farmer/dashboard' : '/society/dashboard';
          setTimeout(() => {
            router.push(dashboardRoute);
          }, 1500);
        } else {
          const errorMessage = result.error?.message || result.message || 'Login failed. Please try again.';
          setError(errorMessage);
        }
        
        setIsLoading(false);
        return;
      }

      // For regular user login (existing flow)
      // Determine login endpoint based on login type
      const loginEndpoint = '/api/auth/login';

      // First check account status for regular users
      const statusResponse = await fetch('/api/auth/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: form.email }),
      });

      let accountExists = false;
      
      if (statusResponse.ok) {
        const statusResult = await statusResponse.json();
        
        if (statusResult.success && statusResult.data) {
          const accountStatus = statusResult.data;
          
          // Check if account exists
          if (accountStatus.exists === false) {
            setError('Account not found. Please check your email or register a new account.');
            setIsLoading(false);
            return;
          }
          
          accountExists = true;
          
          // Check if user can login
          if (!accountStatus.canLogin) {
            // Handle email verification pending case
            if (accountStatus.statusType === 'email_verification_pending' && accountStatus.nextAction === 'verify_email') {
              await handleEmailVerificationPending(form.email);
              return;
            }
            
            setError(accountStatus.statusMessage);
            setIsLoading(false);
            return;
          }
        }
      }

      // Proceed with login
      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const result: LoginResponse = await response.json();

      if (result.success && result.data && result.data.user) {
        const { user, token, refreshToken } = result.data;
        
        // Store tokens and user info
        localStorage.setItem('authToken', token!);
        localStorage.setItem('refreshToken', refreshToken!);
        localStorage.setItem('userData', JSON.stringify(user));

        setIsSuccess(true);
        
        // Redirect based on role using utility function
        setTimeout(() => {
          const dashboardRoute = getDashboardRoute(user.role);
          router.push(dashboardRoute);
        }, 1500);

      } else {
        // Handle specific error messages
        const errorMessage = result.error?.message || result.message || 'Login failed. Please try again.';
        
        // If account exists but login failed (wrong password) - only for user login
        if (accountExists && errorMessage === 'Invalid credentials') {
          setError('Incorrect password. Please try again or reset your password.');
        } 
        // Other errors
        else {
          setError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
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
              <div className="mb-8">
                <Image 
                  src="/fulllogo.png" 
                  alt="Poornasree Equipments Logo" 
                  width={120} 
                  height={120} 
                  className="object-contain mx-auto"
                />
              </div>
              
              <p className="text-xl text-gray-200 mb-12 leading-relaxed">
                Advanced dairy equipment management and cloud solutions. Join thousands who trust our integrated platform.
              </p>
              
              <div className="space-y-6 text-left">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                  <span className="text-gray-200 font-medium">Smart Equipment Tracking</span>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"></div>
                  <span className="text-gray-200 font-medium">Real-time Data Analytics</span>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-teal-400 to-green-400 rounded-full"></div>
                  <span className="text-gray-200 font-medium">Secure & Reliable Cloud</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Image 
                src="/fulllogo.png" 
                alt="Poornasree Equipments Logo" 
                width={100} 
                height={100} 
                className="object-contain mx-auto"
              />
            </div>

            {/* Form Container */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to your account to continue</p>
                
                {/* Login Type Selection */}
                <div className="mt-6 flex gap-2 justify-center flex-wrap">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, loginType: 'user', otpSent: false, otp: ['', '', '', '', '', ''] }))}
                    className={`px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
                      form.loginType === 'user'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Admin/User
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, loginType: 'society', otpSent: false, otp: ['', '', '', '', '', ''] }))}
                    className={`px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
                      form.loginType === 'society'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Society
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, loginType: 'farmer', otpSent: false, otp: ['', '', '', '', '', ''] }))}
                    className={`px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
                      form.loginType === 'farmer'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Farmer
                  </button>
                </div>

                <div className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700 font-medium">
                    {form.loginType === 'farmer' ? 'Farmer Portal' : form.loginType === 'society' ? 'Society Portal' : 'Admin Portal'}
                  </span>
                </div>
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
                      You can continue to login with different credentials or{' '}
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

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      disabled={form.loginType === 'farmer' && form.otpSent}
                      required
                      className="login-input w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="Enter your email address"
                      style={{ 
                        color: '#111827 !important',
                        backgroundColor: '#ffffff !important',
                        WebkitTextFillColor: '#111827 !important'
                      }}
                    />
                  </div>
                </div>

                {/* Password Field - Only show for user login */}
                {form.loginType === 'user' && (
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <div className="relative overflow-hidden rounded-xl">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleInputChange}
                        required
                        autoComplete="current-password"
                        className="login-input w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-xl placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all duration-200"
                        placeholder="Enter your password"
                        style={{ 
                          color: '#111827 !important',
                          backgroundColor: '#ffffff !important',
                          WebkitTextFillColor: '#111827 !important'
                        }}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 z-10">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none p-1"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* OTP Input - Show for farmer or society login after OTP sent */}
                {(form.loginType === 'farmer' || form.loginType === 'society') && form.otpSent && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Enter 6-Digit OTP Code
                    </label>
                    <div className="flex justify-center gap-3">
                      {form.otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none transition-all duration-200 shadow-sm"
                          placeholder="•"
                          style={{
                            color: '#111827',
                            backgroundColor: '#ffffff',
                            borderColor: digit ? '#10b981' : '#d1d5db',
                            boxShadow: digit ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : undefined
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="text-sm text-green-600 hover:text-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSendingOtp ? 'Sending...' : 'Resend OTP'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Error/Success Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center space-x-3 rounded-xl p-4 ${
                      isSuccess 
                        ? 'text-green-700 bg-green-50 border border-green-200' 
                        : 'text-red-700 bg-red-50 border border-red-200'
                    }`}
                  >
                    {isSuccess ? (
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isSendingOtp}
                  className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-700 hover:via-emerald-700 hover:to-green-800 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-green-500/25"
                >
                  {isLoading || isSendingOtp ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FlowerSpinner size={20} className="brightness-200" />
                      <span>{isSendingOtp ? 'Sending OTP...' : 'Signing In...'}</span>
                    </div>
                  ) : (
                    <>
                      {(form.loginType === 'farmer' || form.loginType === 'society') && !form.otpSent ? 'Send OTP' : 'Sign In'}
                    </>
                  )}
                </button>
              </form>

              {/* Links */}
              <div className="mt-8 space-y-4">
                {/* Only show forgot password and register links for user login */}
                {form.loginType === 'user' && (
                  <>
                    <div className="text-center">
                      <Link 
                        href="/forgot-password" 
                        className="login-link text-sm font-medium transition-colors"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6 text-center">
                      <p className="text-sm text-gray-600">
                        {mounted ? "Don't have an account?" : "Don\u2019t have an account?"}{' '}
                        <Link 
                          href="/register" 
                          className="login-link font-semibold transition-colors"
                        >
                          Create one here
                        </Link>
                      </p>
                    </div>
                  </>
                )}
                
                {/* Farmer login info */}
                {form.loginType === 'farmer' && (
                  <div className="border-t border-gray-200 pt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Contact your society administrator to create or reset your farmer account
                    </p>
                  </div>
                )}

                {/* Society login info */}
                {form.loginType === 'society' && (
                  <div className="border-t border-gray-200 pt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Contact your BMC or dairy administrator to manage your society account
                    </p>
                  </div>
                )}

                <div className="text-center">
                  <Link 
                    href="/superadmin" 
                    className="login-link text-sm transition-colors"
                  >
                    Super Admin Access
                  </Link>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-8 text-center">
              <Link 
                href="/" 
                className="text-sm text-gray-300 hover:text-white transition-colors inline-flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Home</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Email Verification Prompt Overlay */}
      {showEmailVerificationPrompt && (
        <EmailVerificationPrompt
          email={pendingVerificationEmail}
          onCancel={handleVerificationCancel}
          onVerify={handleVerificationProceed}
        />
      )}
    </div>
  );
};

export default LoginPage;
