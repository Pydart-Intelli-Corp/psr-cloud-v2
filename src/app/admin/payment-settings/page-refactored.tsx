'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { PageLoader } from '@/components';
import { FormInput, FormSelect } from '@/components/forms';
import { PageHeader, StatusMessage } from '@/components/management';
import { 
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Bell,
  Settings,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

interface PaymentSettings {
  id: number;
  paytm_merchant_id: string | null;
  paytm_merchant_key: string | null;
  paytm_website: string;
  paytm_industry_type: string;
  paytm_channel_id: string;
  paytm_callback_url: string | null;
  paytm_enabled: 'YES' | 'NO';
  upi_enabled: 'YES' | 'NO';
  bank_transfer_enabled: 'YES' | 'NO';
  cash_payment_enabled: 'YES' | 'NO';
  whatsapp_notifications: 'YES' | 'NO';
  sms_notifications: 'YES' | 'NO';
  email_notifications: 'YES' | 'NO';
  auto_payment_enabled: 'YES' | 'NO';
  payment_threshold: number;
  payment_cycle: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  payment_day: number;
  created_at: string;
  updated_at: string;
}

export default function PaymentSettingsPage() {
  const { user } = useUser();
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMerchantKey, setShowMerchantKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch payment settings
  const fetchSettings = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/payment-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          return;
        }
        throw new Error(`Failed to fetch settings: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error('❌ Error fetching payment settings:', error);
      setError('Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  // Update payment settings
  const handleSave = async () => {
    if (!settings) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
        setSuccess('Payment settings updated successfully!');
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      setError('Failed to update payment settings');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading || !settings) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Page Header */}
        <PageHeader
          title="Payment Settings"
          subtitle="Configure payment methods, Paytm integration, and notification preferences"
          icon={<Settings className="w-6 h-6 sm:w-8 sm:h-8 text-white" />}
          className="mb-6 sm:mb-8"
        />

        {/* Status Messages */}
        <StatusMessage 
          success={success || undefined} 
          error={error || undefined}
          onClose={() => {
            setSuccess(null);
            setError(null);
          }}
        />

        <div className="space-y-6">
          {/* Paytm Configuration Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Paytm Configuration
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Merchant ID"
                value={settings.paytm_merchant_id || ''}
                onChange={(value) => setSettings({ ...settings, paytm_merchant_id: value })}
                placeholder="Enter Paytm Merchant ID"
                colSpan={2}
              />

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Merchant Key
                </label>
                <div className="relative">
                  <input
                    type={showMerchantKey ? 'text' : 'password'}
                    value={settings.paytm_merchant_key || ''}
                    onChange={(e) => setSettings({ ...settings, paytm_merchant_key: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none"
                    placeholder="Enter Paytm Merchant Key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMerchantKey(!showMerchantKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {showMerchantKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <FormSelect
                label="Website"
                value={settings.paytm_website}
                onChange={(value) => setSettings({ ...settings, paytm_website: value })}
                options={[
                  { value: 'WEBSTAGING', label: 'WEBSTAGING (Test)' },
                  { value: 'DEFAULT', label: 'DEFAULT (Production)' }
                ]}
              />

              <FormInput
                label="Industry Type"
                value={settings.paytm_industry_type}
                onChange={(value) => setSettings({ ...settings, paytm_industry_type: value })}
                placeholder="Retail"
              />

              <FormInput
                label="Callback URL"
                type="text"
                value={settings.paytm_callback_url || ''}
                onChange={(value) => setSettings({ ...settings, paytm_callback_url: value })}
                placeholder="https://yourdomain.com/payment/callback"
                colSpan={2}
              />
            </div>
          </motion.div>

          {/* Payment Methods Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Payment Methods
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.paytm_enabled === 'YES'}
                  onChange={(e) => setSettings({ ...settings, paytm_enabled: e.target.checked ? 'YES' : 'NO' })}
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-900 dark:text-white font-medium">Paytm</span>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.upi_enabled === 'YES'}
                  onChange={(e) => setSettings({ ...settings, upi_enabled: e.target.checked ? 'YES' : 'NO' })}
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-gray-900 dark:text-white font-medium">UPI</span>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.bank_transfer_enabled === 'YES'}
                  onChange={(e) => setSettings({ ...settings, bank_transfer_enabled: e.target.checked ? 'YES' : 'NO' })}
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-gray-900 dark:text-white font-medium">Bank Transfer</span>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.cash_payment_enabled === 'YES'}
                  onChange={(e) => setSettings({ ...settings, cash_payment_enabled: e.target.checked ? 'YES' : 'NO' })}
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-gray-900 dark:text-white font-medium">Cash</span>
              </label>
            </div>
          </motion.div>

          {/* Notification Settings Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Notification Settings
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.whatsapp_notifications === 'YES'}
                  onChange={(e) => setSettings({ ...settings, whatsapp_notifications: e.target.checked ? 'YES' : 'NO' })}
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-2xl">💬</span>
                <span className="text-gray-900 dark:text-white font-medium">WhatsApp</span>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.sms_notifications === 'YES'}
                  onChange={(e) => setSettings({ ...settings, sms_notifications: e.target.checked ? 'YES' : 'NO' })}
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-2xl">📱</span>
                <span className="text-gray-900 dark:text-white font-medium">SMS</span>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.email_notifications === 'YES'}
                  onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked ? 'YES' : 'NO' })}
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-2xl">📧</span>
                <span className="text-gray-900 dark:text-white font-medium">Email</span>
              </label>
            </div>
          </motion.div>

          {/* Automated Payments Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Automated Payments
              </h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.auto_payment_enabled === 'YES'}
                  onChange={(e) => setSettings({ ...settings, auto_payment_enabled: e.target.checked ? 'YES' : 'NO' })}
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-gray-900 dark:text-white font-medium">Enable Automated Payments</span>
              </label>

              {settings.auto_payment_enabled === 'YES' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4"
                >
                  <FormInput
                    label="Payment Threshold (₹)"
                    type="number"
                    value={settings.payment_threshold.toString()}
                    onChange={(value) => setSettings({ ...settings, payment_threshold: parseFloat(value) || 0 })}
                    placeholder="1000"
                    min="0"
                    step="100"
                  />

                  <FormSelect
                    label="Payment Cycle"
                    value={settings.payment_cycle}
                    onChange={(value) => setSettings({ ...settings, payment_cycle: value as 'daily' | 'weekly' | 'biweekly' | 'monthly' })}
                    options={[
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'biweekly', label: 'Bi-weekly' },
                      { value: 'monthly', label: 'Monthly' }
                    ]}
                  />

                  <FormInput
                    label="Payment Day"
                    type="number"
                    value={settings.payment_day.toString()}
                    onChange={(value) => setSettings({ ...settings, payment_day: parseInt(value) || 1 })}
                    placeholder="1-31"
                    min="1"
                    max="31"
                    helperText={settings.payment_cycle === 'monthly' ? 'Day of month (1-31)' : 'Day of week (1-7)'}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end"
          >
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
