'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { PageLoader, FlowerSpinner, FormInput, FormSelect } from '@/components';
import { 
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Bell,
  Mail,
  MessageSquare,
  Settings,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2
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
  whatsapp_api_key: string | null;
  whatsapp_api_url: string | null;
  whatsapp_from_number: string | null;
  sms_notifications: 'YES' | 'NO';
  sms_provider: 'twilio' | 'msg91' | 'textlocal' | null;
  sms_api_key: string | null;
  sms_api_secret: string | null;
  sms_api_url: string | null;
  sms_from_number: string | null;
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
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      setError('Failed to update payment settings');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            Payment Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure payment methods, Paytm integration, and notification preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300">{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Paytm Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Paytm Configuration
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Merchant ID
                </label>
                <input
                  type="text"
                  value={settings.paytm_merchant_id || ''}
                  onChange={(e) => setSettings({ ...settings, paytm_merchant_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Paytm Merchant ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Merchant Key
                </label>
                <div className="relative">
                  <input
                    type={showMerchantKey ? 'text' : 'password'}
                    value={settings.paytm_merchant_key || ''}
                    onChange={(e) => setSettings({ ...settings, paytm_merchant_key: e.target.value })}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Paytm Merchant Key"
                  />
                  <button
                    onClick={() => setShowMerchantKey(!showMerchantKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showMerchantKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website
                  </label>
                  <select
                    value={settings.paytm_website}
                    onChange={(e) => setSettings({ ...settings, paytm_website: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="WEBSTAGING">WEBSTAGING (Test)</option>
                    <option value="DEFAULT">DEFAULT (Production)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Industry Type
                  </label>
                  <input
                    type="text"
                    value={settings.paytm_industry_type}
                    onChange={(e) => setSettings({ ...settings, paytm_industry_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Callback URL
                </label>
                <input
                  type="text"
                  value={settings.paytm_callback_url || ''}
                  onChange={(e) => setSettings({ ...settings, paytm_callback_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourdomain.com/payment/callback"
                />
              </div>
            </div>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Wallet className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Payment Methods
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="checkbox"
                  checked={settings.paytm_enabled === 'YES'}
                  onChange={(e) => setSettings({ ...settings, paytm_enabled: e.target.checked ? 'YES' : 'NO' })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="text-gray-900 dark:text-white font-medium">Paytm</span>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="checkbox"
                  checked={settings.upi_enabled === 'YES'}
                  onChange={(e) => setSettings({ ...settings, upi_enabled: e.target.checked ? 'YES' : 'NO' })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <Smartphone className="w-5 h-5 text-purple-600" />
                <span className="text-gray-900 dark:text-white font-medium">UPI</span>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="checkbox"
                  checked={settings.bank_transfer_enabled === 'YES'}
                  onChange={(e) => setSettings({ ...settings, bank_transfer_enabled: e.target.checked ? 'YES' : 'NO' })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <Building2 className="w-5 h-5 text-green-600" />
                <span className="text-gray-900 dark:text-white font-medium">Bank Transfer</span>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="checkbox"
                  checked={settings.cash_payment_enabled === 'YES'}
                  onChange={(e) => setSettings({ ...settings, cash_payment_enabled: e.target.checked ? 'YES' : 'NO' })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <Wallet className="w-5 h-5 text-orange-600" />
                <span className="text-gray-900 dark:text-white font-medium">Cash</span>
              </label>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <span className="text-gray-900 dark:text-white font-medium">WhatsApp Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.whatsapp_notifications === 'YES'}
                  onChange={(e) => setSettings({ ...settings, whatsapp_notifications: e.target.checked ? 'YES' : 'NO' })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>

              {settings.whatsapp_notifications === 'YES' && (
                <div className="ml-8 space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <FormInput
                    label="WhatsApp API Key"
                    value={settings.whatsapp_api_key || ''}
                    onChange={(value) => setSettings({ ...settings, whatsapp_api_key: value })}
                    type="password"
                    placeholder="Enter Twilio Account SID or API Key"
                  />
                  <FormInput
                    label="WhatsApp API URL"
                    value={settings.whatsapp_api_url || ''}
                    onChange={(value) => setSettings({ ...settings, whatsapp_api_url: value })}
                    placeholder="https://api.twilio.com/2010-04-01"
                  />
                  <FormInput
                    label="WhatsApp From Number"
                    value={settings.whatsapp_from_number || ''}
                    onChange={(value) => setSettings({ ...settings, whatsapp_from_number: value })}
                    placeholder="whatsapp:+14155238886"
                  />
                </div>
              )}

              <label className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900 dark:text-white font-medium">SMS Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.sms_notifications === 'YES'}
                  onChange={(e) => setSettings({ ...settings, sms_notifications: e.target.checked ? 'YES' : 'NO' })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>

              {settings.sms_notifications === 'YES' && (
                <div className="ml-8 space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <FormSelect
                    label="SMS Provider"
                    value={settings.sms_provider || 'twilio'}
                    onChange={(value) => setSettings({ ...settings, sms_provider: value as any })}
                    options={[
                      { value: 'twilio', label: 'Twilio' },
                      { value: 'msg91', label: 'MSG91 (India)' },
                      { value: 'textlocal', label: 'TextLocal (UK/India)' }
                    ]}
                  />
                  <FormInput
                    label="SMS API Key"
                    value={settings.sms_api_key || ''}
                    onChange={(value) => setSettings({ ...settings, sms_api_key: value })}
                    type="password"
                    placeholder="Enter SMS API Key"
                  />
                  <FormInput
                    label="SMS API Secret"
                    value={settings.sms_api_secret || ''}
                    onChange={(value) => setSettings({ ...settings, sms_api_secret: value })}
                    type="password"
                    placeholder="Enter SMS API Secret (if required)"
                  />
                  <FormInput
                    label="SMS API URL"
                    value={settings.sms_api_url || ''}
                    onChange={(value) => setSettings({ ...settings, sms_api_url: value })}
                    placeholder="API URL (if required)"
                  />
                  <FormInput
                    label="SMS From Number"
                    value={settings.sms_from_number || ''}
                    onChange={(value) => setSettings({ ...settings, sms_from_number: value })}
                    placeholder="+1234567890 or Sender ID"
                  />
                </div>
              )}

              <label className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-red-600" />
                  <span className="text-gray-900 dark:text-white font-medium">Email Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email_notifications === 'YES'}
                  onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked ? 'YES' : 'NO' })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          </motion.div>

          {/* Automated Payments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Automated Payments
              </h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.auto_payment_enabled === 'YES'}
                  onChange={(e) => setSettings({ ...settings, auto_payment_enabled: e.target.checked ? 'YES' : 'NO' })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white font-medium">Enable Automated Payments</span>
              </label>

              {settings.auto_payment_enabled === 'YES' && (
                <div className="mt-4 space-y-4 pl-8 border-l-2 border-blue-500">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Threshold (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.payment_threshold}
                      onChange={(e) => setSettings({ ...settings, payment_threshold: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Cycle
                      </label>
                      <select
                        value={settings.payment_cycle}
                        onChange={(e) => setSettings({ ...settings, payment_cycle: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Day
                      </label>
                      <input
                        type="number"
                        value={settings.payment_day}
                        onChange={(e) => setSettings({ ...settings, payment_day: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max={settings.payment_cycle === 'monthly' ? 31 : 7}
                      />
                    </div>
                  </div>
                </div>
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
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <FlowerSpinner size={20} />
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
