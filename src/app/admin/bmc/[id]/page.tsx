'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Factory,
  ArrowLeft,
  Edit3,
  Trash2,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Activity,
  Building2,
  TrendingUp,
  Users,
  Milk,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  LoadingSpinner, 
  EmptyState, 
  StatusMessage, 
  ConfirmDeleteModal 
} from '@/components';

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
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  details: string;
  type: 'info' | 'success' | 'warning' | 'error';
}



export default function BMCDetails() {
  const router = useRouter();
  const params = useParams();
  const bmcIdParam = params.id;
  const { user } = useUser();
  const { t } = useLanguage();
  
  const [bmc, setBMC] = useState<BMCDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'activity'>('overview');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      
      // Generate mock activity logs
      setActivityLogs([
        {
          id: '1',
          action: 'BMC Created',
          timestamp: bmcData.createdAt,
          details: `BMC ${bmcData.name} was created`,
          type: 'success'
        },
        {
          id: '2',
          action: 'Status Updated',
          timestamp: new Date().toISOString(),
          details: `Status changed to ${bmcData.status}`,
          type: 'info'
        }
      ]);
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <Activity className="w-5 h-5 text-blue-500" />;
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
                    onClick={() => router.push('/admin/bmc')}
                    className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-green-600 dark:text-green-500 border border-green-600 dark:border-green-500 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors min-h-[44px]"
                  >
                    <Edit3 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t.common.edit}</span>
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
                { id: 'analytics' as const, label: t.nav.analytics, icon: BarChart3 },
                { id: 'activity' as const, label: t.dashboard.recentActivity, icon: Clock }
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
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                      {t.bmcManagement.basicInformation}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Factory className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.bmcManagement.bmcName}</p>
                          <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {bmc.name}
                          </p>
                        </div>
                      </div>

                      {bmc.dairyFarmName && (
                        <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Milk className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.bmcManagement.dairyFarm}</p>
                            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {bmc.dairyFarmName}
                            </p>
                          </div>
                        </div>
                      )}

                      {bmc.location && (
                        <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.bmcManagement.location}</p>
                            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {bmc.location}
                            </p>
                          </div>
                        </div>
                      )}

                      {bmc.capacity && (
                        <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.bmcManagement.capacity}</p>
                            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                              {bmc.capacity.toLocaleString()} L
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                      {t.bmcManagement.contactInformation}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {bmc.contactPerson && (
                        <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.bmcManagement.contactPerson}</p>
                            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {bmc.contactPerson}
                            </p>
                          </div>
                        </div>
                      )}

                      {bmc.phone && (
                        <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.bmcManagement.phone}</p>
                            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                              {bmc.phone}
                            </p>
                          </div>
                        </div>
                      )}

                      {bmc.email && (
                        <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                            <Mail className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.bmcManagement.email}</p>
                            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {bmc.email}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                      Timeline
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                          <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Created At</p>
                          <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                            {new Date(bmc.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {bmc.updatedAt && (
                        <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.bmcManagement.lastUpdated}</p>
                            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                              {new Date(bmc.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Statistics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {bmc.societyCount || 0}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{t.bmcManagement.societies}</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-2">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {bmc.farmerCount || 0}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{t.bmcManagement.farmers}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <Milk className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {bmc.totalCollection?.toLocaleString() || 0} L
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{t.bmcManagement.totalCollection}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {bmc.avgQuality || 0}%
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{t.bmcManagement.avgQuality}</p>
                    </div>
                  </div>

                  {/* Monthly Target Progress */}
                  {bmc.monthlyTarget && (
                    <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                        {t.bmcManagement.monthlyTargetProgress}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{t.bmcManagement.current}: {bmc.totalCollection || 0} L</span>
                          <span className="text-gray-600 dark:text-gray-400">{t.bmcManagement.target}: {bmc.monthlyTarget.toLocaleString()} L</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min(((bmc.totalCollection || 0) / bmc.monthlyTarget) * 100, 100)}%` 
                            }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          {((bmc.totalCollection || 0) / bmc.monthlyTarget * 100).toFixed(1)}% {t.bmcManagement.complete}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Placeholder for charts */}
                  <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                      {t.bmcManagement.performanceTrends}
                    </h4>
                    <div className="flex items-center justify-center h-48 sm:h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t.bmcManagement.chartsComingSoon}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'activity' && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 sm:space-y-4"
                >
                  {activityLogs.length > 0 ? (
                    <div className="space-y-3">
                      {activityLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {getActivityIcon(log.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                              {log.action}
                            </p>
                            {log.details && (
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {log.details}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t.bmcManagement.noActivityLogs}</p>
                    </div>
                  )}
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
    </>
  );
}
