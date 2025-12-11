'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Factory,
  ArrowLeft,
  Trash2,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Activity,
  Building2,
  TrendingUp,
  Milk,
  Clock,
  RefreshCw,
  Droplet,
  Award,
  Eye,
  Settings,
  Edit,
  Save,
  X
} from 'lucide-react';
import { 
  LoadingSpinner, 
  EmptyState, 
  StatusMessage, 
  ConfirmDeleteModal 
} from '@/components';
import NavigationConfirmModal from '@/components/NavigationConfirmModal';

interface BMCDetails {
  id: number;
  name: string;
  bmcId: string;
  dairyFarmId: number;
  dairyFarmName?: string;
  location?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  updatedAt?: string;
  lastActivity?: string;
  societyCount?: number;
  farmerCount?: number;
  totalCollection?: number;
  monthlyTarget?: number;
  avgQuality?: number;
  totalCollections30d?: number;
  totalQuantity30d?: number;
  totalAmount30d?: number;
  weightedFat30d?: number;
  weightedSnf30d?: number;
  weightedClr30d?: number;
  weightedWater30d?: number;
}

export default function BMCDetails() {
  const router = useRouter();
  const params = useParams();
  const bmcIdParam = params.id;
  const { user } = useUser();
  const { t } = useLanguage();
  
  const [bmc, setBMC] = useState<BMCDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSocietiesNavigateConfirm, setShowSocietiesNavigateConfirm] = useState(false);
  const [showDairyNavigateConfirm, setShowDairyNavigateConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    location: '',
    contactPerson: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive' | 'maintenance'
  });

  // Fetch BMC details
  const fetchBMCDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/bmc', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch BMC details');
      }

      const result = await response.json();
      const bmcData = result.data?.find((b: BMCDetails) => b.id === parseInt(bmcIdParam as string));
      
      if (!bmcData) {
        setError('BMC not found');
        setTimeout(() => router.push('/admin/bmc'), 2000);
        return;
      }

      setBMC(bmcData);
      setEditFormData({
        name: bmcData.name || '',
        location: bmcData.location || '',
        contactPerson: bmcData.contactPerson || '',
        phone: bmcData.phone || '',
        email: bmcData.email || '',
        status: bmcData.status || 'active'
      });
    } catch (error) {
      console.error('Error fetching BMC details:', error);
      setError('Failed to load BMC details');
    } finally {
      setLoading(false);
    }
  }, [bmcIdParam, router]);

  // Delete BMC
  const handleDeleteBMC = async () => {
    if (!bmc) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/bmc', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: bmc.id })
      });

      if (response.ok) {
        setSuccess('BMC deleted successfully! Redirecting...');
        setTimeout(() => router.push('/admin/bmc'), 2000);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to delete BMC');
      }
    } catch (error) {
      console.error('Error deleting BMC:', error);
      setError('Failed to delete BMC');
    }
  };

  useEffect(() => {
    fetchBMCDetails();
  }, [fetchBMCDetails]);

  if (!user || loading) {
    return <LoadingSpinner />;
  }

  if (!bmc) {
    return (
      <EmptyState
        icon={<Factory className="w-16 h-16 text-gray-400" />}
        title="BMC Not Found"
        message="The BMC you're looking for doesn't exist or has been removed."
        actionText="Back to BMCs"
        onAction={() => router.push('/admin/bmc')}
      />
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'inactive': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      case 'maintenance': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form data
      if (bmc) {
        setEditFormData({
          name: bmc.name || '',
          location: bmc.location || '',
          contactPerson: bmc.contactPerson || '',
          phone: bmc.phone || '',
          email: bmc.email || '',
          status: bmc.status || 'active'
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleSaveDetails = async () => {
    try {
      setSaveLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/bmc', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: bmc?.id,
          ...editFormData
        })
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          router.push('/login');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to update BMC details (${response.status})`;
        setError(errorMessage);
        return;
      }

      const result = await response.json();
      if (result.success) {
        // Refresh the data
        await fetchBMCDetails();
        setIsEditing(false);
        setSuccess('BMC details updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to update BMC details');
      }
    } catch (error) {
      console.error('Error updating BMC:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update BMC details';
      setError(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:pb-8">
        {/* Success/Error Messages */}
        <StatusMessage
          success={success}
          error={error}
        />

        {/* Header - Mobile First */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Top Row: Back Button + Icon + Title */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/admin/bmc')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex-shrink-0">
                    <Factory className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{bmc.name}</h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{t.bmcManagement.bmcId}: {bmc.bmcId}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Status + Actions */}
              <div className="flex items-center justify-between gap-3">
                <span className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getStatusColor(bmc.status)}`}>
                  {bmc.status}
                </span>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <button 
                    onClick={() => fetchBMCDetails()}
                    className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[44px]"
                  >
                    <RefreshCw className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t.common.refresh}</span>
                  </button>
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-red-600 dark:text-red-500 border border-red-600 dark:border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px]"
                  >
                    <Trash2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t.common.delete}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
              {[
                { id: 'overview' as const, label: t.dashboard.overview, icon: Factory },
                { id: 'details' as const, label: 'Details', icon: Building2 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'text-green-600 dark:text-green-500'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm md:text-base">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Comprehensive Statistics Grid - 30 Day Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Total Collections */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <Droplet className="w-8 h-8 text-white/80" />
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{bmc.totalCollections30d || 0}</span>
                        </div>
                      </div>
                      <p className="text-white/90 font-medium text-sm">Collections</p>
                      <p className="text-white/70 text-xs mt-1">Last 30 days</p>
                    </div>

                    {/* Total Quantity */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <Milk className="w-8 h-8 text-white/80" />
                        <div className="flex-1 text-right">
                          <span className="text-xl sm:text-2xl font-bold text-white block">{Number(bmc.totalQuantity30d || 0).toFixed(0)} L</span>
                        </div>
                      </div>
                      <p className="text-white/90 font-medium text-sm">Volume</p>
                      <p className="text-white/70 text-xs mt-1">Last 30 days</p>
                    </div>

                    {/* Total Revenue */}
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-white/80" />
                        <div className="flex-1 text-right">
                          <span className="text-lg sm:text-xl font-bold text-white block">₹{((bmc.totalAmount30d || 0) / 100000).toFixed(1)}L</span>
                        </div>
                      </div>
                      <p className="text-white/90 font-medium text-sm">Total Revenue</p>
                      <p className="text-white/70 text-xs mt-1">Last 30 days</p>
                    </div>

                    {/* Societies Count */}
                    <div 
                      onClick={() => (bmc.societyCount || 0) > 0 && setShowSocietiesNavigateConfirm(true)}
                      className={`bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all ${
                        (bmc.societyCount || 0) > 0 ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Building2 className="w-8 h-8 text-white/80" />
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{bmc.societyCount || 0}</span>
                        </div>
                      </div>
                      <p className="text-white/90 font-medium text-sm">Societies</p>
                      <p className="text-white/70 text-xs mt-1">{(bmc.societyCount || 0) > 0 ? 'Click to view' : 'No societies'}</p>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left Column - BMC Info & Quality Metrics */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                      {/* BMC Information Card */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <Factory className="w-5 h-5 text-green-600 dark:text-green-400" />
                          BMC Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Hierarchy Information */}
                          <div className="space-y-3">
                            {bmc.dairyFarmName && (
                              <div 
                                onClick={() => bmc.dairyFarmId && setShowDairyNavigateConfirm(true)}
                                className={`flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 transition-all ${
                                  bmc.dairyFarmId ? 'cursor-pointer hover:shadow-md hover:scale-105 active:scale-95' : 'cursor-default'
                                }`}
                              >
                                <Milk className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Dairy Farm {bmc.dairyFarmId && '• Click to view'}</p>
                                  <p className="font-semibold text-sm text-gray-900 dark:text-white break-words">{bmc.dairyFarmName}</p>
                                </div>
                              </div>
                            )}

                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <Building2 className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 dark:text-gray-400">BMC ID</p>
                                <p className="font-medium text-sm text-gray-900 dark:text-white font-mono break-words">{bmc.bmcId}</p>
                              </div>
                            </div>

                            {bmc.capacity && (
                              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <Activity className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Capacity</p>
                                  <p className="font-medium text-sm text-gray-900 dark:text-white">{bmc.capacity.toLocaleString()} L</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Contact & Location */}
                          <div className="space-y-3">
                            {bmc.location && (
                              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Location</p>
                                  <p className="font-medium text-sm text-gray-900 dark:text-white break-words">{bmc.location}</p>
                                </div>
                              </div>
                            )}

                            {bmc.contactPerson && (
                              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <User className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Contact Person</p>
                                  <p className="font-medium text-sm text-gray-900 dark:text-white break-words">{bmc.contactPerson}</p>
                                </div>
                              </div>
                            )}

                            {bmc.phone && (
                              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Contact Phone</p>
                                  <p className="font-medium text-sm text-gray-900 dark:text-white break-words">{bmc.phone}</p>
                                </div>
                              </div>
                            )}

                            {bmc.email && (
                              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Email</p>
                                  <p className="font-medium text-sm text-gray-900 dark:text-white break-words">{bmc.email}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quality Metrics - 30 Days */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          Quality Metrics (Last 30 Days)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                          {/* Fat */}
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Avg Fat %</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{Number(bmc.weightedFat30d || 0).toFixed(2)}%</p>
                              </div>
                            </div>
                          </div>

                          {/* SNF */}
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Avg SNF %</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{Number(bmc.weightedSnf30d || 0).toFixed(2)}%</p>
                              </div>
                            </div>
                          </div>

                          {/* CLR */}
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                                <Activity className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Avg CLR</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{Number(bmc.weightedClr30d || 0).toFixed(1)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Water */}
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                                <Droplet className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Avg Water %</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{Number(bmc.weightedWater30d || 0).toFixed(2)}%</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Timeline & Status */}
                    <div className="space-y-4 sm:space-y-6">
                      {/* Timeline */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          Timeline
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 dark:text-gray-400">Created At</p>
                              <p className="font-medium text-sm text-gray-900 dark:text-white">{new Date(bmc.createdAt).toLocaleString()}</p>
                            </div>
                          </div>

                          {bmc.updatedAt && (
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Last Updated</p>
                                <p className="font-medium text-sm text-gray-900 dark:text-white">{new Date(bmc.updatedAt).toLocaleString()}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'details' && (
                <motion.div 
                  key="details" 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-green-600 dark:text-green-400" />
                        BMC Details
                      </h3>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={handleEditToggle}
                              disabled={saveLoading}
                              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveDetails}
                              disabled={saveLoading}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Save className="w-4 h-4" />
                              {saveLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={handleEditToggle}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Details
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* BMC Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          BMC Name <span className="text-red-500">*</span>
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter BMC name"
                            required
                          />
                        ) : (
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-gray-900 dark:text-white">{bmc.name}</p>
                          </div>
                        )}
                      </div>

                      {/* BMC ID (Read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          BMC ID
                        </label>
                        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <p className="text-gray-600 dark:text-gray-400 font-mono">{bmc.bmcId}</p>
                        </div>
                      </div>

                      {/* Contact Person */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Contact Person
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.contactPerson}
                            onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter contact person"
                          />
                        ) : (
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-gray-900 dark:text-white">{bmc.contactPerson || 'N/A'}</p>
                          </div>
                        )}
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.location}
                            onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter location"
                          />
                        ) : (
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-gray-900 dark:text-white">{bmc.location || 'N/A'}</p>
                          </div>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editFormData.phone}
                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter phone number"
                          />
                        ) : (
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-gray-900 dark:text-white">{bmc.phone || 'N/A'}</p>
                          </div>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter email"
                          />
                        ) : (
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-gray-900 dark:text-white">{bmc.email || 'N/A'}</p>
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Status
                        </label>
                        {isEditing ? (
                          <select
                            value={editFormData.status}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'active' | 'inactive' | 'maintenance' })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="maintenance">Maintenance</option>
                          </select>
                        ) : (
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(bmc.status)}`}>
                              {bmc.status}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Dairy (Read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Associated Dairy
                        </label>
                        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <p className="text-gray-600 dark:text-gray-400">{bmc.dairyFarmName || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Additional Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{new Date(bmc.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{bmc.updatedAt ? new Date(bmc.updatedAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteBMC}
        title={t.bmcManagement.deleteBMC}
        itemName={bmc?.name || ''}
        message={`${t.bmcManagement.confirmDelete} ${bmc?.name}? ${t.bmcManagement.deleteWarning}`}
      />

      {/* Societies Navigation Confirmation Modal */}
      <NavigationConfirmModal
        isOpen={showSocietiesNavigateConfirm}
        onClose={() => setShowSocietiesNavigateConfirm(false)}
        onConfirm={() => {
          setShowSocietiesNavigateConfirm(false);
          if (bmc) {
            router.push(`/admin/society?bmcFilter=${bmc.id}`);
          }
        }}
        title="Navigate to Society Management"
        message={`View all societies under ${bmc?.name} in the Society Management page with filters applied.`}
        confirmText="Go to Society Management"
        cancelText="Cancel"
      />

      {/* Dairy Navigation Confirmation Modal */}
      <NavigationConfirmModal
        isOpen={showDairyNavigateConfirm}
        onClose={() => setShowDairyNavigateConfirm(false)}
        onConfirm={() => {
          setShowDairyNavigateConfirm(false);
          if (bmc?.dairyFarmId) {
            router.push(`/admin/dairy/${bmc.dairyFarmId}`);
          }
        }}
        title="Navigate to Dairy Details"
        message={`View complete details of ${bmc?.dairyFarmName} in the Dairy Management page.`}
        confirmText="Go to Dairy Details"
        cancelText="Cancel"
      />
    </>
  );
}
