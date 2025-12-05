'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Users, MapPin, Phone, User, Building2,
  Info, Truck, ShoppingCart, Settings, BarChart3,
  Droplet, DollarSign, TrendingUp, AlertCircle, Zap
} from 'lucide-react';
import { 
  LoadingSpinner, 
  EmptyState,
  StatusMessage
} from '@/components';

interface Society {
  id: number;
  societyId: string;
  name: string;
  location?: string;
  presidentName?: string;
  contactPhone?: string;
  bmcId: number;
  bmcName?: string;
  bmcIdentifier?: string;
  dairyId?: number;
  dairyName?: string;
  dairyIdentifier?: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

interface Machine {
  id: number;
  machineId: string;
  machineType: string;
  location?: string;
  status: string;
  isMasterMachine?: boolean;
  totalCollections?: number;
  totalQuantity?: number;
  totalRevenue?: number;
  lastCollectionDate?: string;
}

interface Farmer {
  id: number;
  farmerId: string;
  name: string;
  contactNumber?: string;
  status: string;
  totalCollections?: number;
  totalQuantity?: number;
  totalRevenue?: number;
  avgFat?: number;
  avgSnf?: number;
  lastCollectionDate?: string;
}

interface Collection {
  id: number;
  farmerId: string;
  farmerName?: string;
  machineId: string;
  collectionDate: string;
  collectionTime: string;
  shiftType: string;
  channel: string;
  fat?: number;
  snf?: number;
  quantity: number;
  rate: number;
  amount: number;
}

interface Dispatch {
  id: number;
  dispatchId: string;
  machineId: string;
  dispatchDate: string;
  dispatchTime: string;
  shiftType: string;
  channel: string;
  fat?: number;
  snf?: number;
  quantity: number;
  rate: number;
  amount: number;
}

interface Sale {
  id: number;
  count: string;
  machineId: string;
  salesDate: string;
  salesTime: string;
  channel: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Analytics {
  totalFarmers: number;
  activeFarmers: number;
  totalMachines: number;
  activeMachines: number;
  totalCollections: number;
  totalDispatches: number;
  totalSales: number;
  totalQuantityCollected: number;
  totalQuantityDispatched: number;
  totalQuantitySold: number;
  totalRevenue: number;
  avgFat: number;
  avgSnf: number;
  avgRate: number;
}

interface DailyTrend {
  date: string;
  collections: number;
  farmers: number;
  totalQuantity: number;
  totalRevenue: number;
  avgFat: number;
  avgSnf: number;
}

interface ShiftAnalysis {
  shiftType: string;
  collections: number;
  totalQuantity: number;
  totalRevenue: number;
  avgFat: number;
  avgSnf: number;
}

interface TopFarmer {
  farmerId: string;
  name: string;
  collections: number;
  totalQuantity: number;
  totalRevenue: number;
  avgFat: number;
  avgSnf: number;
}

interface ChannelBreakdown {
  channel: string;
  collections: number;
  totalQuantity: number;
  totalRevenue: number;
  avgFat: number;
  avgSnf: number;
}

interface SectionPulse {
  id: number;
  pulseDate: string;
  pulseStatus: 'not_started' | 'active' | 'paused' | 'ended' | 'inactive';
  firstCollectionTime?: string;
  lastCollectionTime?: string;
  sectionEndTime?: string;
  totalCollections: number;
  inactiveDays: number;
  lastChecked: string;
  createdAt: string;
  updatedAt: string;
}

interface SocietyData {
  society: Society;
  machines: Machine[];
  farmers: Farmer[];
  collections: Collection[];
  dispatches: Dispatch[];
  sales: Sale[];
  analytics: Analytics;
  dailyTrends: DailyTrend[];
  shiftAnalysis: ShiftAnalysis[];
  topPerformers: {
    farmers: TopFarmer[];
  };
  channelBreakdown: ChannelBreakdown[];
  sections?: SectionPulse[];
}

export default function SocietyDetails() {
  const params = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<SocietyData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sections' | 'farmers' | 'machines' | 'reports' | 'analytics'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSocietyDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/user/society/${params.id}`, {
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
        throw new Error('Failed to fetch society details');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to load society details');
      }
    } catch (error) {
      console.error('Error fetching society details:', error);
      setError('Failed to load society details');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (params.id) {
      fetchSocietyDetails();
    }
  }, [params.id, fetchSocietyDetails]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatNumber = (num: number | string | undefined) => {
    if (num === undefined || num === null) return '0';
    const value = typeof num === 'string' ? parseFloat(num) : num;
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatCurrency = (amount: number | string | undefined) => {
    if (amount === undefined || amount === null) return '₹0';
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return (
      <EmptyState
        icon={<AlertCircle className="w-10 h-10" />}
        title="Failed to Load Society Details"
        message={error || 'Unable to fetch society information'}
        actionText="Back to Societies"
        onAction={() => router.push('/admin/society')}
        showAction={true}
      />
    );
  }

  const { society, machines, farmers, collections, dispatches, sales, analytics, dailyTrends, shiftAnalysis, topPerformers, channelBreakdown, sections } = data;

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Info },
    { id: 'sections' as const, label: `Sections (${sections?.length || 0})`, icon: BarChart3 },
    { id: 'farmers' as const, label: `Farmers (${farmers.length})`, icon: Users },
    { id: 'machines' as const, label: `Machines (${machines.length})`, icon: Settings },
    { id: 'reports' as const, label: 'Reports', icon: Truck },
    { id: 'analytics' as const, label: 'Analytics', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pb-8">
      {/* Status/Error Messages */}
      <StatusMessage
        error={error}
      />

      {/* Header - Mobile Responsive */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile: Stack layout */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Top Row: Back button + Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/society')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{society.name}</h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">ID: {society.societyId}</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 flex-wrap px-2">
              <span className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getStatusColor(society.status)}`}>
                {society.status}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs - Horizontal Scroll on Mobile */}
        <div className="px-4 sm:px-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 sm:gap-2 border-b border-gray-200 dark:border-gray-700 min-w-max sm:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm md:text-base">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content - Responsive Padding */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }} 
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {/* Main Content - Full width on mobile, 2/3 on desktop */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Society Information Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Society Information</h3>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {society.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Location</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{society.location}</p>
                        </div>
                      </div>
                    )}

                    {society.presidentName && (
                      <div className="flex items-start gap-3">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">President</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{society.presidentName}</p>
                        </div>
                      </div>
                    )}

                    {society.contactPhone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Contact Phone</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{society.contactPhone}</p>
                        </div>
                      </div>
                    )}

                    {society.bmcName && (
                      <div className="flex items-start gap-3">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">BMC</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{society.bmcName}</p>
                          {society.bmcIdentifier && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{society.bmcIdentifier}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {society.dairyName && (
                      <div className="flex items-start gap-3">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Dairy</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{society.dairyName}</p>
                          {society.dairyIdentifier && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{society.dairyIdentifier}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Key Metrics (Last 30 Days)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Avg FAT %</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatNumber(analytics.avgFat)}%</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">Avg SNF %</p>
                      </div>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{formatNumber(analytics.avgSnf)}%</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Avg Rate</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{formatCurrency(analytics.avgRate)}/L</p>
                    </div>
                  </div>
                </div>

                {/* Top Performing Farmers */}
                {topPerformers.farmers.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Top Performing Farmers</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Farmer</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Collections</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantity (L)</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {topPerformers.farmers.map((farmer) => (
                            <tr key={farmer.farmerId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{farmer.name}</p>
                                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{farmer.farmerId}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right text-sm sm:text-base text-gray-900 dark:text-white">{formatNumber(farmer.collections)}</td>
                              <td className="px-4 py-3 text-right text-sm sm:text-base text-gray-900 dark:text-white">{formatNumber(farmer.totalQuantity)}</td>
                              <td className="px-4 py-3 text-right text-sm sm:text-base text-gray-900 dark:text-white">{formatCurrency(farmer.totalRevenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Full width on mobile, 1/3 on desktop */}
              <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                {/* Quick Stats Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Quick Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Farmers</span>
                      <span className="text-lg font-bold text-blue-900 dark:text-blue-100">{analytics.totalFarmers}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">Total Machines</span>
                      <span className="text-lg font-bold text-green-900 dark:text-green-100">{analytics.totalMachines}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Collections</span>
                      <span className="text-lg font-bold text-purple-900 dark:text-purple-100">{formatNumber(analytics.totalCollections)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">Dispatches</span>
                      <span className="text-lg font-bold text-orange-900 dark:text-orange-100">{formatNumber(analytics.totalDispatches)}</span>
                    </div>
                  </div>
                </div>

                {/* Channel Breakdown */}
                {channelBreakdown.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Channel Breakdown</h3>
                    <div className="space-y-3">
                      {channelBreakdown.map((channel) => (
                        <div key={channel.channel} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{channel.channel}</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">{formatNumber(channel.totalQuantity)} L</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{formatNumber(channel.collections)} collections</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Society ID</span>
                      <span className="font-mono text-sm text-gray-900 dark:text-gray-100">{society.societyId}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{formatDate(society.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{formatDate(society.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sections' && (
            <motion.div key="sections" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Section Pulse Details ({sections?.length || 0})
                </h3>
                {sections && sections.length > 0 ? (
                  <div className="overflow-x-auto -mx-4 sm:-mx-6">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">First Collection</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Collection</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">End Time</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Collections</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inactive Days</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Checked</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {sections.map((section) => (
                          <tr key={section.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white font-medium">
                              {formatDate(section.pulseDate)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${section.pulseStatus === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                                ${section.pulseStatus === 'paused' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                                ${section.pulseStatus === 'ended' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                                ${section.pulseStatus === 'not_started' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' : ''}
                                ${section.pulseStatus === 'inactive' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-500' : ''}
                              `}>
                                {section.pulseStatus === 'active' && '● Active'}
                                {section.pulseStatus === 'paused' && '⏸ Paused'}
                                {section.pulseStatus === 'ended' && '✓ Ended'}
                                {section.pulseStatus === 'not_started' && '○ Not Started'}
                                {section.pulseStatus === 'inactive' && '- Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-400">
                              {section.firstCollectionTime || '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-400">
                              {section.lastCollectionTime || '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-400">
                              {section.sectionEndTime || '-'}
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                              {formatNumber(section.totalCollections)}
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {section.inactiveDays}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-500">
                              {section.lastChecked || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No section data</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      No section pulse data available for this society.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'farmers' && (
            <motion.div key="farmers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                  Farmers List ({farmers.length})
                </h3>
                {farmers.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">No farmers registered under this society</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Farmer ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Collections</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantity (L)</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {farmers.map((farmer) => (
                          <tr key={farmer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="px-4 py-3 text-sm sm:text-base text-gray-900 dark:text-white">{farmer.farmerId}</td>
                            <td className="px-4 py-3 text-sm sm:text-base text-gray-900 dark:text-white font-medium">{farmer.name}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(farmer.status)}`}>
                                {farmer.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-sm sm:text-base text-gray-900 dark:text-white">{formatNumber(farmer.totalCollections)}</td>
                            <td className="px-4 py-3 text-right text-sm sm:text-base text-gray-900 dark:text-white">{formatNumber(farmer.totalQuantity)}</td>
                            <td className="px-4 py-3 text-right text-sm sm:text-base text-gray-900 dark:text-white">{formatCurrency(farmer.totalRevenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'machines' && (
            <motion.div key="machines" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="space-y-4 sm:space-y-6">
                {/* Machine Statistics Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Machines */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Machines</p>
                    </div>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{machines.length}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {machines.filter(m => m.isMasterMachine).length} Master
                    </p>
                  </div>

                  {/* Active Machines */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">Active</p>
                    </div>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                      {machines.filter(m => m.status?.toLowerCase() === 'active').length}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Operational</p>
                  </div>

                  {/* Total Collections */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Collections</p>
                    </div>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                      {formatNumber(machines.reduce((sum, m) => sum + (m.totalCollections || 0), 0))}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Total records</p>
                  </div>

                  {/* Total Quantity */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Total Quantity</p>
                    </div>
                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                      {formatNumber(machines.reduce((sum, m) => sum + (m.totalQuantity || 0), 0))}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Liters</p>
                  </div>
                </div>

                {/* Machine Type Distribution & Status Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Machine Types */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      Machine Types
                    </h3>
                    <div className="space-y-3">
                      {Array.from(new Set(machines.map(m => m.machineType))).map((type) => {
                        const count = machines.filter(m => m.machineType === type).length;
                        const percentage = ((count / machines.length) * 100).toFixed(0);
                        return (
                          <div key={type} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Distribution */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-green-600" />
                      Status Distribution
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['active', 'inactive', 'maintenance', 'suspended'].map((status) => {
                        const count = machines.filter(m => m.status?.toLowerCase() === status).length;
                        const colorMap: Record<string, string> = {
                          active: 'from-green-50 to-emerald-50 dark:from-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
                          inactive: 'from-gray-50 to-slate-50 dark:from-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100',
                          maintenance: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
                          suspended: 'from-red-50 to-rose-50 dark:from-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
                        };
                        return (
                          <div key={status} className={`bg-gradient-to-br border rounded-lg p-3 ${colorMap[status]}`}>
                            <p className="text-xs font-medium capitalize opacity-75">{status}</p>
                            <p className="text-2xl font-bold mt-1">{count}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Machines List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    All Machines ({machines.length})
                  </h3>
                  {machines.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <Settings className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">No machines registered under this society</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {machines.map((machine) => (
                        <div 
                          key={machine.id} 
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50"
                        >
                          {/* Machine Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white truncate">{machine.machineId}</h4>
                                {machine.isMasterMachine && (
                                  <span className="px-1.5 py-0.5 text-xs font-semibold bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 rounded border border-yellow-600 shadow-sm flex-shrink-0" title="Master Machine">
                                    M
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{machine.machineType}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(machine.status)}`}>
                              {machine.status}
                            </span>
                          </div>

                          {/* Machine Stats */}
                          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                              <p className="text-xs text-blue-600 dark:text-blue-400 mb-0.5">Collections</p>
                              <p className="text-sm font-bold text-blue-900 dark:text-blue-100">{formatNumber(machine.totalCollections)}</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                              <p className="text-xs text-green-600 dark:text-green-400 mb-0.5">Quantity</p>
                              <p className="text-sm font-bold text-green-900 dark:text-green-100">{formatNumber(machine.totalQuantity)} L</p>
                            </div>
                          </div>

                          {/* Additional Info */}
                          {machine.lastCollectionDate && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
                              <div className="flex items-center gap-2">
                                <Droplet className="w-3 h-3 text-gray-400" />
                                <p className="text-xs text-gray-600 dark:text-gray-400">Last: {formatDate(machine.lastCollectionDate)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Performance Metrics */}
                {machines.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      Top Performing Machines
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Machine</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Collections</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantity (L)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {machines
                            .sort((a, b) => (b.totalQuantity || 0) - (a.totalQuantity || 0))
                            .slice(0, 5)
                            .map((machine, index) => (
                              <tr key={machine.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {index < 3 && (
                                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-xs font-bold flex items-center justify-center">
                                        {index + 1}
                                      </span>
                                    )}
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">{machine.machineId}</p>
                                      {machine.isMasterMachine && (
                                        <span className="text-xs text-yellow-600 dark:text-yellow-400">Master</span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{machine.machineType}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(machine.status)}`}>
                                    {machine.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                  {formatNumber(machine.totalCollections)}
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                  {formatNumber(machine.totalQuantity)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div key="reports" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="space-y-4 sm:space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Collections Summary */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Droplet className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100">Collections</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{collections.length}</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">records</p>
                      </div>
                      <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Quantity</p>
                        <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                          {formatNumber(collections.reduce((sum, c) => sum + (parseFloat(String(c.quantity)) || 0), 0))} L
                        </p>
                      </div>
                      <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Amount</p>
                        <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                          {formatCurrency(collections.reduce((sum, c) => sum + (parseFloat(String(c.amount)) || 0), 0))}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dispatches Summary */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-green-900 dark:text-green-100">Dispatches</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-green-900 dark:text-green-100">{dispatches.length}</p>
                        <p className="text-sm text-green-600 dark:text-green-400">records</p>
                      </div>
                      <div className="pt-2 border-t border-green-200 dark:border-green-700">
                        <p className="text-xs text-green-600 dark:text-green-400 mb-1">Total Quantity</p>
                        <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                          {formatNumber(dispatches.reduce((sum, d) => sum + (parseFloat(String(d.quantity)) || 0), 0))} L
                        </p>
                      </div>
                      <div className="pt-2 border-t border-green-200 dark:border-green-700">
                        <p className="text-xs text-green-600 dark:text-green-400 mb-1">Total Amount</p>
                        <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                          {formatCurrency(dispatches.reduce((sum, d) => sum + (parseFloat(String(d.amount)) || 0), 0))}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sales Summary */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-600 rounded-lg">
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-purple-900 dark:text-purple-100">Sales</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{sales.length}</p>
                        <p className="text-sm text-purple-600 dark:text-purple-400">records</p>
                      </div>
                      <div className="pt-2 border-t border-purple-200 dark:border-purple-700">
                        <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Total Quantity</p>
                        <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                          {formatNumber(sales.reduce((sum, s) => sum + (parseFloat(String(s.quantity)) || 0), 0))} L
                        </p>
                      </div>
                      <div className="pt-2 border-t border-purple-200 dark:border-purple-700">
                        <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Total Amount</p>
                        <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                          {formatCurrency(sales.reduce((sum, s) => sum + (parseFloat(String(s.amount)) || 0), 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Recent Collections */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Droplet className="w-5 h-5 text-blue-600" />
                        Recent Collections
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Last 5</span>
                    </div>
                    {collections.length === 0 ? (
                      <div className="text-center py-8">
                        <Droplet className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">No collections yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {collections.slice(0, 5).map((collection) => (
                          <div key={collection.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{collection.farmerName || 'N/A'}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(collection.collectionDate)} • {collection.channel}</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">{formatNumber(collection.quantity)} L</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{formatCurrency(collection.amount)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Dispatches */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-green-600" />
                        Recent Dispatches
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Last 5</span>
                    </div>
                    {dispatches.length === 0 ? (
                      <div className="text-center py-8">
                        <Truck className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">No dispatches yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dispatches.slice(0, 5).map((dispatch) => (
                          <div key={dispatch.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{dispatch.dispatchId}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(dispatch.dispatchDate)} • {dispatch.shiftType}</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm font-semibold text-green-900 dark:text-green-100">{formatNumber(dispatch.quantity)} L</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{formatCurrency(dispatch.amount)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Sales - Full Width */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-purple-600" />
                      Recent Sales
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Last 5</span>
                  </div>
                  {sales.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">No sales yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sales.slice(0, 6).map((sale, index) => (
                        <div key={sale.id || index} className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{sale.channel}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">#{sale.count}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{formatDate(sale.salesDate)}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">{formatNumber(sale.quantity)} L</p>
                            <p className="text-sm font-bold text-purple-900 dark:text-purple-100">{formatCurrency(sale.amount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                  Analytics & Trends
                </h3>
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Collections</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(analytics.totalCollections)}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Dispatches</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(analytics.totalDispatches)}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Sales</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(analytics.totalSales)}</p>
                    </div>
                  </div>

                  {shiftAnalysis.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shift-wise Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {shiftAnalysis.map((shift) => (
                          <div key={shift.shiftType} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">{shift.shiftType} Shift</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">{formatNumber(shift.totalQuantity)} L</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{formatNumber(shift.collections)} collections</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dailyTrends.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Trends (Last 7 Days)</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Collections</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantity (L)</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {dailyTrends.map((trend) => (
                              <tr key={trend.date} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <td className="px-4 py-3 text-gray-900 dark:text-white">{formatDate(trend.date)}</td>
                                <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{formatNumber(trend.collections)}</td>
                                <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{formatNumber(trend.totalQuantity)}</td>
                                <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{formatCurrency(trend.totalRevenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
