'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowLeft,
  Milk,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Activity,
  Edit3,
  Trash2,
  Building2,
  Users,
  TrendingUp,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { 
  FlowerSpinner,
  LoadingSpinner,
  StatusMessage,
  EmptyState,
  ConfirmDeleteModal
} from '@/components';

interface DairyDetails {
  id: number;
  name: string;
  dairyId: string;
  location?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  lastActivity?: string;
  bmcCount?: number;
  societyCount?: number;
  farmerCount?: number;
  totalMilkProduction?: number;
  monthlyTarget?: number;
}

interface BMC {
  id: number;
  bmcId: string;
  name: string;
  location?: string;
  capacity?: number;
  status: string;
  createdAt: string;
  societyCount: number;
  farmerCount: number;
  totalCollections: number;
}

interface Society {
  id: number;
  societyId: string;
  name: string;
  location?: string;
  contactPerson?: string;
  phone?: string;
  status: string;
  bmcName: string;
  bmcId: string;
  farmerCount: number;
  totalCollections: number;
}

interface Farmer {
  id: number;
  farmerId: string;
  rfId?: string;
  name: string;
  phone?: string;
  status: string;
  societyName: string;
  societyId: string;
  bmcName: string;
  totalCollections: number;
  totalQuantity: number;
  avgFat: number;
  avgSnf: number;
}

interface Machine {
  id: number;
  machineId: string;
  machineType: string;
  status: string;
  isMasterMachine: boolean;
  societyName: string;
  societyId: string;
  bmcName: string;
  totalCollections: number;
  lastCollection?: string;
}

interface Collection {
  id: number;
  collectionDate: string;
  shift: string;
  quantity: number;
  fat: number;
  snf: number;
  rate: number;
  totalAmount: number;
  farmerName: string;
  farmerId: string;
  societyName: string;
  societyId: string;
}

interface Analytics {
  totalBmcs: number;
  totalSocieties: number;
  totalFarmers: number;
  totalMachines: number;
  totalCollections: number;
  totalQuantity: number;
  totalRevenue: number;
  avgFat: number;
  avgSnf: number;
  avgRate: number;
}

interface DailyTrend {
  date: string;
  collections: number;
  quantity: number;
  revenue: number;
  avgFat: number;
  avgSnf: number;
}

interface ShiftAnalysis {
  shift: string;
  collections: number;
  quantity: number;
  avgFat: number;
  avgSnf: number;
}

interface TopPerformer {
  farmerId?: string;
  societyId?: string;
  name: string;
  societyName?: string;
  bmcName?: string;
  farmerCount?: number;
  collections: number;
  totalQuantity: number;
  totalRevenue?: number;
  avgFat?: number;
  avgSnf?: number;
}

interface DairyDetailsData {
  dairy: DairyDetails;
  bmcs: BMC[];
  societies: Society[];
  farmers: Farmer[];
  machines: Machine[];
  collections: Collection[];
  analytics: Analytics;
  trends: {
    daily: DailyTrend[];
    byShift: ShiftAnalysis[];
  };
  topPerformers: {
    farmers: TopPerformer[];
    societies: TopPerformer[];
  };
}

interface DairyFormData {
  name: string;
  dairyId: string;
  password: string;
  location: string;
  contactPerson: string;
  phone: string;
  email: string;
  capacity: string;
  status: 'active' | 'inactive' | 'maintenance';
  monthlyTarget: string;
}

export default function DairyDetails() {
  const router = useRouter();
  const params = useParams();
  const dairyId = params.id;
  const { user } = useUser();
  const { t } = useLanguage();
  
  const [dairyData, setDairyData] = useState<DairyDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'bmcs' | 'societies' | 'farmers' | 'machines' | 'collections' | 'analytics'>('overview');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState<DairyFormData>({
    name: '',
    dairyId: '',
    password: '',
    location: '',
    contactPerson: '',
    phone: '',
    email: '',
    capacity: '',
    status: 'active',
    monthlyTarget: ''
  });

  const fetchDairyDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch comprehensive dairy data from new API endpoint
      const response = await fetch(`/api/user/dairy/${dairyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dairy details');
      }

      const result = await response.json();
      
      if (!result.data) {
        setError('Dairy not found');
        setDairyData(null);
        return;
      }

      setDairyData(result.data);
    } catch (error) {
      console.error('Error fetching dairy details:', error);
      setError('Failed to load dairy details');
    } finally {
      setLoading(false);
    }
  }, [dairyId, router]);

  // Open edit modal
  const handleEditClick = () => {
    if (!dairyData?.dairy) return;
    
    const dairy = dairyData.dairy;
    setFormData({
      name: dairy.name,
      dairyId: dairy.dairyId,
      password: '', // Don't populate password for security
      location: dairy.location || '',
      contactPerson: dairy.contactPerson || '',
      phone: dairy.phone || '',
      email: dairy.email || '',
      capacity: dairy.capacity?.toString() || '',
      status: dairy.status || 'active',
      monthlyTarget: dairy.monthlyTarget?.toString() || ''
    });
    setShowEditForm(true);
  };

  // Update dairy
  const handleUpdateDairy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dairyData?.dairy) return;

    setFormLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const dairy = dairyData.dairy;
      const updateData: {
        id: number;
        name: string;
        location: string;
        contactPerson: string;
        phone: string;
        email: string;
        capacity?: number;
        status?: 'active' | 'inactive' | 'maintenance';
        monthlyTarget?: number;
        password?: string;
      } = {
        id: dairy.id,
        name: formData.name,
        location: formData.location,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        status: formData.status,
        monthlyTarget: formData.monthlyTarget ? parseInt(formData.monthlyTarget) : undefined
      };

      // Only include password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch('/api/user/dairy', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setSuccess('Dairy updated successfully!');
        setShowEditForm(false);
        await fetchDairyDetails();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to update dairy');
      }
    } catch (error) {
      console.error('Error updating dairy:', error);
      setError('Failed to update dairy');
    } finally {
      setFormLoading(false);
    }
  };

  // Open delete confirmation modal
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  // Delete dairy
  const handleConfirmDelete = async () => {
    if (!dairyData?.dairy) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/dairy`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: dairyData.dairy.id })
      });

      if (response.ok) {
        setSuccess('Dairy deleted successfully!');
        setShowDeleteModal(false);
        
        // Redirect to dairy list after successful deletion
        setTimeout(() => {
          router.push('/admin/dairy');
        }, 1000);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to delete dairy');
      }
    } catch (error) {
      console.error('Error deleting dairy:', error);
      setError('Failed to delete dairy');
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof DairyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'inactive': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'maintenance': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  useEffect(() => {
    fetchDairyDetails();
  }, [dairyId, fetchDairyDetails]);

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !dairyData) {
    return (
      <EmptyState
        icon={<AlertCircle className="w-10 h-10" />}
        title={`${t.dairyManagement.dairyDetails} ${t.common.noDataAvailable}`}
        message={error || t.dairyManagement.noDairiesFound}
        actionText={`${t.common.back} to ${t.nav.dairyManagement}`}
        onAction={() => router.push('/admin/dairy')}
        showAction={true}
      />
    );
  }

  const dairy = dairyData.dairy;
  const analytics = dairyData.analytics;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pb-8">
      {/* Header - Mobile Responsive */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile: Stack layout */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Top Row: Back button + Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/dairy')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Milk className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{dairy.name}</h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Dairy ID: {dairy.dairyId}</p>
                </div>
              </div>
            </div>

            {/* Bottom Row: Status + Actions */}
            <div className="flex items-center justify-between gap-3">
              <span className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getStatusColor(dairy.status)}`}>
                {dairy.status}
              </span>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  onClick={handleEditClick}
                  className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-green-600 dark:text-green-500 border border-green-600 dark:border-green-500 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors min-h-[44px]"
                >
                  <Edit3 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t.common.edit}</span>
                </button>
                <button 
                  onClick={handleDeleteClick}
                  className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-red-600 dark:text-red-500 border border-red-600 dark:border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t.common.delete}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Horizontal Scroll on Mobile */}
          <div className="px-4 sm:px-6 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 sm:gap-2 border-b border-gray-200 dark:border-gray-700 min-w-max sm:min-w-0">
              {[
                { id: 'overview' as const, label: t.dashboard.overview, icon: Building2 },
                { id: 'bmcs' as const, label: 'BMCs', icon: Building2 },
                { id: 'societies' as const, label: 'Societies', icon: Users },
                { id: 'farmers' as const, label: 'Farmers', icon: User },
                { id: 'machines' as const, label: 'Machines', icon: Activity },
                { id: 'collections' as const, label: 'Collections', icon: Milk },
                { id: 'analytics' as const, label: t.nav.analytics, icon: BarChart3 }
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

        {/* Content - Responsive Padding */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Basic Information - Full width on mobile */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">{t.dairyManagement.dairyDetails}</h3>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {dairy.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.dairyManagement.location}</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{dairy.location}</p>
                        </div>
                      </div>
                    )}
                    {dairy.contactPerson && (
                      <div className="flex items-start gap-3">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.dairyManagement.contactPerson}</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{dairy.contactPerson}</p>
                        </div>
                      </div>
                    )}
                    {dairy.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.dairyManagement.phone}</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-all">{dairy.phone}</p>
                        </div>
                      </div>
                    )}
                    {dairy.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.dairyManagement.email}</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 break-all">{dairy.email}</p>
                        </div>
                      </div>
                    )}
                    {dairy.capacity && (
                      <div className="flex items-start gap-3">
                        <Milk className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.dashboard.capacity}</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">{dairy.capacity.toLocaleString()} Liters</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.common.createdAt}</p>
                        <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">{new Date(dairy.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Cards - Mobile: 1 column, Tablet: 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Connected BMCs</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{analytics.totalBmcs || 0}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Bulk Milk Coolers</p>
                      </div>
                      <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-500 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Active Societies</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{analytics.totalSocieties || 0}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Registered societies</p>
                      </div>
                      <Users className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 dark:text-green-500 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Registered Farmers</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{analytics.totalFarmers || 0}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Total farmers</p>
                      </div>
                      <User className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Machines</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{analytics.totalMachines || 0}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Active machines</p>
                      </div>
                      <Activity className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600 dark:text-indigo-500 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">30-Day Collections</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{analytics.totalCollections?.toLocaleString() || 0}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{analytics.totalQuantity?.toLocaleString() || 0}L collected</p>
                      </div>
                      <Milk className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-500 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue (30d)</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">₹{analytics.totalRevenue?.toLocaleString() || 0}</p>
                        {dairy.monthlyTarget && dairy.monthlyTarget > 0 ? (
                          <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                            Target: {dairy.monthlyTarget.toLocaleString()}L
                          </p>
                        ) : (
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Avg rate: ₹{analytics.avgRate?.toFixed(2) || 0}/L</p>
                        )}
                      </div>
                      <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-500 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions - Moved to bottom on mobile, sidebar on desktop */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4 sm:space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">{t.dashboard.quickActions}</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <button className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px]">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="truncate">Manage BMCs</span>
                      </button>
                      <button className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px]">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="truncate">View Societies</span>
                      </button>
                      <button className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px]">
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="truncate">Production Reports</span>
                      </button>
                      <button className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px]">
                        <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="truncate">Quality Monitoring</span>
                      </button>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Last Activity</h3>
                    {dairy.lastActivity && (
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <Activity className="w-4 h-4 flex-shrink-0" />
                        <span className="break-words">Last seen: {new Date(dairy.lastActivity).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bmcs' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">BMCs ({dairyData.bmcs.length})</h3>
              {dairyData.bmcs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">BMC ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Societies</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Farmers</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Collections (30d)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {dairyData.bmcs.map((bmc) => (
                        <tr key={bmc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{bmc.bmcId}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{bmc.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{bmc.location || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{bmc.societyCount}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{bmc.farmerCount}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{bmc.totalCollections?.toLocaleString()}L</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bmc.status)}`}>
                              {bmc.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No BMCs found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'societies' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Societies ({dairyData.societies.length})</h3>
              {dairyData.societies.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Society ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">BMC</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Farmers</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Collections (30d)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {dairyData.societies.map((society) => (
                        <tr key={society.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{society.societyId}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{society.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{society.bmcName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{society.contactPerson || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{society.farmerCount}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{society.totalCollections?.toLocaleString()}L</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(society.status)}`}>
                              {society.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No societies found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'farmers' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Farmers ({dairyData.farmers.length})</h3>
              {dairyData.farmers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Farmer ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Society</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">BMC</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Collections</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg FAT</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg SNF</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {dairyData.farmers.map((farmer) => (
                        <tr key={farmer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{farmer.farmerId}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{farmer.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{farmer.societyName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{farmer.bmcName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{farmer.totalCollections}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{farmer.totalQuantity?.toLocaleString()}L</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{farmer.avgFat?.toFixed(2)}%</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{farmer.avgSnf?.toFixed(2)}%</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(farmer.status)}`}>
                              {farmer.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No farmers found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'machines' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Machines ({dairyData.machines.length})</h3>
              {dairyData.machines.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Machine ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Society</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">BMC</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Master</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Collections (30d)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Collection</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {dairyData.machines.map((machine) => (
                        <tr key={machine.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{machine.machineId}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{machine.machineType}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{machine.societyName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{machine.bmcName}</td>
                          <td className="px-4 py-3">
                            {machine.isMasterMachine ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <X className="w-5 h-5 text-gray-400" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{machine.totalCollections}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {machine.lastCollection ? new Date(machine.lastCollection).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(machine.status)}`}>
                              {machine.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No machines found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'collections' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Collections ({dairyData.collections.length})</h3>
              {dairyData.collections.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shift</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Farmer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Society</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">FAT</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SNF</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rate</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {dairyData.collections.map((collection) => (
                        <tr key={collection.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            {new Date(collection.collectionDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{collection.shift}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {collection.farmerName}
                            <div className="text-xs text-gray-500">{collection.farmerId}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{collection.societyName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{collection.quantity}L</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{collection.fat?.toFixed(2)}%</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{collection.snf?.toFixed(2)}%</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">₹{collection.rate?.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">₹{collection.totalAmount?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Milk className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No collections found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Quality Metrics */}
              <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quality Metrics (30 Days)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average FAT</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-500 mt-2">{analytics.avgFat?.toFixed(2) || '0.00'}%</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average SNF</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-500 mt-2">{analytics.avgSnf?.toFixed(2) || '0.00'}%</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Rate</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-500 mt-2">₹{analytics.avgRate?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>

              {/* Daily Trends */}
              {dairyData.trends.daily.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Daily Collection Trends (Last 7 Days)</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Collections</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity (L)</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg FAT</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg SNF</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {dairyData.trends.daily.map((trend, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{new Date(trend.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{trend.collections}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{trend.quantity?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">₹{trend.revenue?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{trend.avgFat?.toFixed(2)}%</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{trend.avgSnf?.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Shift Analysis */}
              {dairyData.trends.byShift.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Shift-wise Analysis (30 Days)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dairyData.trends.byShift.map((shift, index) => (
                      <div key={index} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{shift.shift}</span>
                          <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Collections:</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{shift.collections}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{shift.quantity?.toLocaleString()}L</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Avg FAT:</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{shift.avgFat?.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Avg SNF:</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{shift.avgSnf?.toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Performers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Top Farmers */}
                {dairyData.topPerformers.farmers.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top 10 Farmers (30 Days)</h3>
                    <div className="space-y-3">
                      {dairyData.topPerformers.farmers.slice(0, 10).map((farmer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full font-bold text-sm">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{farmer.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{farmer.farmerId} • {farmer.societyName}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <p className="font-bold text-gray-900 dark:text-gray-100">{farmer.totalQuantity?.toLocaleString()}L</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{farmer.collections} collections</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Societies */}
                {dairyData.topPerformers.societies.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top 10 Societies (30 Days)</h3>
                    <div className="space-y-3">
                      {dairyData.topPerformers.societies.slice(0, 10).map((society, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full font-bold text-sm">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{society.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{society.societyId} • {society.bmcName}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <p className="font-bold text-gray-900 dark:text-gray-100">{society.totalQuantity?.toLocaleString()}L</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{society.farmerCount} farmers</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      {/* Status Messages */}
      <StatusMessage success={success} error={error} />

      {/* Edit Dairy Modal */}
      <AnimatePresence>
        {showEditForm && dairyData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-end sm:items-center justify-center z-[9999] p-0 sm:p-4"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEditForm(false);
                setFormData({
                  name: '',
                  dairyId: '',
                  password: '',
                  location: '',
                  contactPerson: '',
                  phone: '',
                  email: '',
                  capacity: '',
                  status: 'active',
                  monthlyTarget: ''
                });
              }
            }}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile drag handle */}
              <div className="sm:hidden flex justify-center pt-3 pb-1">
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Edit {dairyData.dairy.name}
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setFormData({
                        name: '',
                        dairyId: '',
                        password: '',
                        location: '',
                        contactPerson: '',
                        phone: '',
                        email: '',
                        capacity: '',
                        status: 'active',
                        monthlyTarget: ''
                      });
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 touch-target sm:min-h-0 sm:min-w-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateDairy} className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dairy Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter dairy name"
                      autoComplete="off"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dairy ID
                    </label>
                    <input
                      type="text"
                      value={formData.dairyId}
                      className="psr-input !bg-gray-100 dark:!bg-gray-700 !text-gray-500 dark:!text-gray-400 cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter new password"
                      autoComplete="new-password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter contact person name"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter phone number"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter email"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter location"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Capacity (Liters)
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter capacity"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive' | 'maintenance')}
                      className="psr-input !text-gray-900 dark:!text-gray-100"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monthly Target (Liters)
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyTarget}
                      onChange={(e) => handleInputChange('monthlyTarget', e.target.value)}
                      className="psr-input placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:opacity-100 !text-gray-900 dark:!text-gray-100"
                      placeholder="Enter monthly target"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setFormData({
                        name: '',
                        dairyId: '',
                        password: '',
                        location: '',
                        contactPerson: '',
                        phone: '',
                        email: '',
                        capacity: '',
                        status: 'active',
                        monthlyTarget: ''
                      });
                    }}
                    className="w-full sm:w-auto px-6 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-green-500/25"
                  >
                    {formLoading ? (
                      <>
                        <FlowerSpinner size={16} className="mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Update Dairy
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        itemName={dairyData?.dairy.name || 'this dairy'}
        itemType="Dairy"
      />
    </div>
  );
}