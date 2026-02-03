'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { FlowerSpinner, StatusMessage } from '@/components';
import { 
  Lock,
  Bell,
  Globe,
  Moon,
  Sun,
  Save,
  Eye,
  EyeOff,
  Shield,
  Database,
  AlertCircle,
  CheckCircle2,
  Settings as SettingsIcon,
  CreditCard,
  Wallet
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface SettingsData {
  security: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
  };
  preferences: {
    language: string;
    theme: string;
    timezone: string;
    dateFormat: string;
  };
  payment: {
    paytmEnabled: boolean;
    upiEnabled: boolean;
    bankTransferEnabled: boolean;
    cashPaymentEnabled: boolean;
    autoPaymentEnabled: boolean;
    paymentCycle: string;
  };
}

export default function SettingsPage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'security' | 'notifications' | 'preferences' | 'payment'>('preferences');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [settings, setSettings] = useState<SettingsData>({
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      weeklyReports: true,
      monthlyReports: true
    },
    preferences: {
      language: language,
      theme: theme,
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD-MM-YYYY'
    },
    payment: {
      paytmEnabled: false,
      upiEnabled: true,
      bankTransferEnabled: true,
      cashPaymentEnabled: true,
      autoPaymentEnabled: false,
      paymentCycle: 'monthly'
    }
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedTimezone = localStorage.getItem('userTimezone');
    const savedDateFormat = localStorage.getItem('userDateFormat');
    
    if (savedTimezone || savedDateFormat) {
      setSettings(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          timezone: savedTimezone || prev.preferences.timezone,
          dateFormat: savedDateFormat || prev.preferences.dateFormat
        }
      }));
    }
  }, []);

  // Update settings when theme or language changes from context
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme,
        language
      }
    }));
  }, [theme, language]);

  const handlePasswordChange = async () => {
    if (!settings.security.currentPassword) {
      setErrorMessage('Please enter your current password');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    if (settings.security.newPassword !== settings.security.confirmPassword) {
      setErrorMessage('New passwords do not match');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    if (settings.security.newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    // Validate password strength
    const hasUpperCase = /[A-Z]/.test(settings.security.newPassword);
    const hasLowerCase = /[a-z]/.test(settings.security.newPassword);
    const hasNumber = /[0-9]/.test(settings.security.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setErrorMessage('Password must contain uppercase, lowercase, and numbers');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          currentPassword: settings.security.currentPassword,
          newPassword: settings.security.newPassword
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Password changed successfully!');
        setSettings(prev => ({
          ...prev,
          security: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        }));
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(data.error || 'Failed to change password');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      setErrorMessage('An error occurred while changing password');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setSaving(true);
    try {
      // Save timezone and date format to localStorage
      // (Theme and language are already applied immediately when changed)
      localStorage.setItem('userTimezone', settings.preferences.timezone);
      localStorage.setItem('userDateFormat', settings.preferences.dateFormat);
      
      // Show success message
      setSuccessMessage('Preferences saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to save preferences');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    // { id: 'payment', label: 'Payment', icon: Wallet },
    // { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'security', label: 'Security', icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-psr-primary-500 to-psr-green-500 rounded-xl">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tabs Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-64"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-psr-primary-500 to-psr-green-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              {/* Profile Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Change Password
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.current ? 'text' : 'password'}
                          value={settings.security.currentPassword}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            security: { ...prev.security, currentPassword: e.target.value }
                          }))}
                          className="psr-input pr-12"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          value={settings.security.newPassword}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            security: { ...prev.security, newPassword: e.target.value }
                          }))}
                          className="psr-input pr-12"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {settings.security.newPassword && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1.5">
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2">Password Requirements:</p>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              settings.security.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'
                            }`} />
                            <span className={settings.security.newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                              At least 8 characters
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              /[A-Z]/.test(settings.security.newPassword) ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'
                            }`} />
                            <span className={/[A-Z]/.test(settings.security.newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                              One uppercase letter
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              /[0-9]/.test(settings.security.newPassword) ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'
                            }`} />
                            <span className={/[0-9]/.test(settings.security.newPassword) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                              One number
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.confirm ? 'text' : 'password'}
                          value={settings.security.confirmPassword}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            security: { ...prev.security, confirmPassword: e.target.value }
                          }))}
                          className="psr-input pr-12"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handlePasswordChange}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-psr-primary-500 to-psr-green-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {saving ? <FlowerSpinner size={20} /> : <Lock className="w-5 h-5" />}
                      {saving ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </h2>

                  <div className="space-y-4">
                    {Object.entries({
                      emailNotifications: 'Email Notifications',
                      smsNotifications: 'SMS Notifications',
                      pushNotifications: 'Push Notifications',
                      weeklyReports: 'Weekly Reports',
                      monthlyReports: 'Monthly Reports'
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-gray-900 dark:text-white font-medium">{label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications[key as keyof typeof settings.notifications]}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, [key]: e.target.checked }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-psr-primary-300 dark:peer-focus:ring-psr-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-psr-primary-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setSuccessMessage('Notification preferences saved!');
                        setTimeout(() => setSuccessMessage(''), 3000);
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-psr-primary-500 to-psr-green-500 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <Save className="w-5 h-5" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    App Preferences
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => {
                          const newLang = e.target.value as 'en' | 'hi' | 'ml';
                          setSettings(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, language: newLang }
                          }));
                          setLanguage(newLang);
                        }}
                        className="psr-input"
                      >
                        <option value="en">English</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                        <option value="ml">മലയാളം (Malayalam)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Theme
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => {
                            setSettings(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, theme: 'light' }
                            }));
                            setTheme('light');
                          }}
                          className={`flex items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all ${
                            settings.preferences.theme === 'light'
                              ? 'border-psr-primary-500 bg-gradient-to-br from-psr-primary-50 to-green-50 dark:from-psr-primary-900/30 dark:to-green-900/30 shadow-lg'
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-psr-primary-300 dark:hover:border-psr-primary-600'
                          }`}
                        >
                          <Sun className={`w-7 h-7 ${
                            settings.preferences.theme === 'light' 
                              ? 'text-psr-primary-600 dark:text-psr-primary-400' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                          <div className="text-left">
                            <div className={`font-semibold text-base ${
                              settings.preferences.theme === 'light'
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>Light</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Bright theme</div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setSettings(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, theme: 'dark' }
                            }));
                            setTheme('dark');
                          }}
                          className={`flex items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all ${
                            settings.preferences.theme === 'dark'
                              ? 'border-psr-primary-500 bg-gradient-to-br from-psr-primary-50 to-green-50 dark:from-psr-primary-900/30 dark:to-green-900/30 shadow-lg'
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-psr-primary-300 dark:hover:border-psr-primary-600'
                          }`}
                        >
                          <Moon className={`w-7 h-7 ${
                            settings.preferences.theme === 'dark'
                              ? 'text-psr-primary-600 dark:text-psr-primary-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                          <div className="text-left">
                            <div className={`font-semibold text-base ${
                              settings.preferences.theme === 'dark'
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>Dark</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Easy on eyes</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.preferences.timezone}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, timezone: e.target.value }
                        }))}
                        className="psr-input"
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date Format
                      </label>
                      <select
                        value={settings.preferences.dateFormat}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, dateFormat: e.target.value }
                        }))}
                        className="psr-input"
                      >
                        <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                        <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div> */}
                  </div>

                  {/* <div className="flex justify-end">
                    <button
                      onClick={handlePreferencesUpdate}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-psr-primary-500 to-psr-green-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <FlowerSpinner size="sm" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Preferences
                        </>
                      )}
                    </button>
                  </div> */}
                </div>
              )}

              {/* Payment Tab */}
              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Payment Settings
                  </h2>

                  <div className="space-y-6">
                    {/* Payment Methods */}
                    <div>
                      <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">Payment Methods</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'paytmEnabled', label: 'Paytm Gateway', icon: CreditCard, description: 'Accept payments via Paytm' },
                          { key: 'upiEnabled', label: 'UPI Payments', icon: Wallet, description: 'Accept UPI payments' },
                          { key: 'bankTransferEnabled', label: 'Bank Transfer', icon: Database, description: 'Accept bank transfers' },
                          { key: 'cashPaymentEnabled', label: 'Cash Payments', icon: Wallet, description: 'Accept cash payments' }
                        ].map(({ key, label, icon: Icon, description }) => (
                          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              <div>
                                <p className="text-gray-900 dark:text-white font-medium">{label}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.payment[key as keyof typeof settings.payment] as boolean}
                                onChange={(e) => setSettings(prev => ({
                                  ...prev,
                                  payment: { ...prev.payment, [key]: e.target.checked }
                                }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-psr-primary-300 dark:peer-focus:ring-psr-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-psr-primary-500"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Auto Payment */}
                    <div>
                      <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">Auto Payment</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">Enable Auto Payment</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Automatically process payments based on cycle</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.payment.autoPaymentEnabled}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                payment: { ...prev.payment, autoPaymentEnabled: e.target.checked }
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-psr-primary-300 dark:peer-focus:ring-psr-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-psr-primary-500"></div>
                          </label>
                        </div>

                        {settings.payment.autoPaymentEnabled && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Payment Cycle
                            </label>
                            <select
                              value={settings.payment.paymentCycle}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                payment: { ...prev.payment, paymentCycle: e.target.value }
                              }))}
                              className="psr-input"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="biweekly">Bi-weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setSuccessMessage('Payment settings saved!');
                        setTimeout(() => setSuccessMessage(''), 3000);
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-psr-primary-500 to-psr-green-500 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <Save className="w-5 h-5" />
                      Save Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* User Info Card */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">User ID</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.uid}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{user.role}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Database Key</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.dbKey || 'N/A'}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Status Messages */}
      <StatusMessage 
        success={successMessage}
        error={errorMessage}
        onClose={() => {
          setSuccessMessage('');
          setErrorMessage('');
        }}
      />
    </div>
  );
}
