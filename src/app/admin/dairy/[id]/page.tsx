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
  Trash2,
  Building2,
  TrendingUp,
  BarChart3,
  AlertCircle,
  X,
  RefreshCw,
  Edit3,
  Eye,
  EyeOff,
  Award,
  Clock,
  Users
} from 'lucide-react';
import { 
  FlowerSpinner,
  LoadingSpinner,
  PageLoader,
  StatusMessage,
  EmptyState,
  FormInput,
  FormSelect
} from '@/components';
import DeleteDairyModal from '@/components/modals/DeleteDairyModal';
import NavigationConfirmModal from '@/components/NavigationConfirmModal';
import TransferBMCsModal from '@/components/modals/TransferBMCsModal';
import { formatPhoneInput, validatePhoneOnBlur } from '@/lib/validation/phoneValidation';
import { validateEmailQuick } from '@/lib/emailValidation';

interface DairyDetails {
  id: number;
  name: string;
  dairyId: string;
  location?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  password?: string;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    phone?: string;
    email?: string;
  }>({});
  const [editFormData, setEditFormData] = useState({
    name: '',
    location: '',
    contactPerson: '',
    phone: '',
    email: '',
    password: '',
    status: 'active' as 'active' | 'inactive' | 'maintenance'
  });
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [bmcsForTransfer, setBmcsForTransfer] = useState<Array<{ id: number; name: string; bmcId: string }>>([]);
  const [allDairies, setAllDairies] = useState<Array<{ id: number; name: string }>>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [showBmcsNavigateConfirm, setShowBmcsNavigateConfirm] = useState(false);
  const [showSocietiesNavigateConfirm, setShowSocietiesNavigateConfirm] = useState(false);
  const [showMachinesNavigateConfirm, setShowMachinesNavigateConfirm] = useState(false);
  const [showFarmersNavigateConfirm, setShowFarmersNavigateConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
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

  // Fetch all dairies for transfer dropdown
  const fetchDairies = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/dairy', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAllDairies(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching dairies:', error);
    }
  }, []);

  // Fetch BMCs for this dairy
  const fetchBMCsForDairy = async (dairyIdToCheck: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/bmc', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const allBmcs = result.data || [];
        const filteredBmcs = allBmcs.filter((b: { dairyFarmId: number }) => b.dairyFarmId === dairyIdToCheck);
        return filteredBmcs.map((b: { id: number; name: string; bmcId: string }) => ({
          id: b.id,
          name: b.name,
          bmcId: b.bmcId
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching BMCs:', error);
      return [];
    }
  };

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

  // Handle delete click
  const handleDeleteClick = async () => {
    if (!dairyData?.dairy) return;
    
    // Fetch BMCs for this dairy
    const bmcs = await fetchBMCsForDairy(dairyData.dairy.id);
    setBmcsForTransfer(bmcs);
    
    if (bmcs.length > 0) {
      // Fetch all dairies for transfer dropdown
      await fetchDairies();
      setShowTransferModal(true);
    } else {
      // Store dairy ID for OTP modal (used by DeleteDairyModal component)
      (window as any).selectedDairyIdForDelete = dairyData.dairy.id;
      setShowDeleteModal(true);
    }
  };

  // Handle transfer and delete (or cascade delete)
  const handleTransferAndDelete = async (newDairyId: number | null, deleteAll: boolean, otp?: string) => {
    if (!dairyData?.dairy) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/dairy', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: dairyData.dairy.id,
          newDairyId,
          deleteAll,
          otp
        })
      });

      const result = await response.json();

      if (response.ok) {
        if (deleteAll) {
          setSuccess('Dairy and all related data deleted successfully!');
        } else {
          setSuccess(`${result.data.transferredBMCs} BMC(s) transferred and dairy deleted successfully!`);
        }
        setShowTransferModal(false);
        
        // Redirect to dairy list after 2 seconds
        setTimeout(() => {
          router.push('/admin/dairy');
        }, 2000);
      } else {
        setError(result.message || 'Failed to delete dairy');
      }
    } catch (error) {
      console.error('Error deleting dairy:', error);
      setError('Failed to delete dairy');
    }
  };

  // Handle simple delete (no BMCs)
  const handleConfirmDelete = async (otp?: string) => {
    if (!dairyData?.dairy) return;

    try {
      const token = localStorage.getItem('authToken');
      const body: {
        id: number;
        otp?: string;
      } = { id: dairyData.dairy.id };
      
      if (otp) {
        body.otp = otp;
      }

      const response = await fetch('/api/user/dairy', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setSuccess('Dairy deleted successfully!');
        setShowDeleteModal(false);
        
        // Redirect to dairy list after 2 seconds
        setTimeout(() => {
          router.push('/admin/dairy');
        }, 2000);
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to delete dairy');
      }
    } catch (error) {
      console.error('Error deleting dairy:', error);
      setError('Failed to delete dairy');
    }
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

  // Fetch password when entering edit mode
  useEffect(() => {
    const fetchPassword = async () => {
      if (isEditing && dairyData?.dairy && !currentPassword) {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`/api/user/dairy/password?id=${dairyData.dairy.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            let fetchedPassword = '';
            
            if (typeof result.data === 'object' && result.data.password) {
              fetchedPassword = String(result.data.password);
            } else if (result.data) {
              fetchedPassword = String(result.data);
            } else if (result.password) {
              fetchedPassword = String(result.password);
            }
            
            setCurrentPassword(fetchedPassword);
            setEditFormData(prev => ({ ...prev, password: fetchedPassword }));
          }
        } catch (error) {
          console.error('Error fetching password:', error);
        }
      }
    };
    
    fetchPassword();
  }, [isEditing, dairyData, currentPassword]);

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
    return <PageLoader />;
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
    <>
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
                  onClick={fetchDairyDetails}
                  className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-blue-600 dark:text-blue-500 border border-blue-600 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors min-h-[44px]"
                >
                  <RefreshCw className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t.common.refresh || 'Refresh'}</span>
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
                { id: 'details' as const, label: 'Details', icon: Activity }
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
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                        <Milk className="w-8 h-8 text-white/80" />
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{analytics.totalCollections || 0}</span>
                        </div>
                      </div>
                      <p className="text-white/90 font-medium text-sm">Collections</p>
                      <p className="text-white/70 text-xs mt-1">Last 30 days</p>
                    </div>

                    {/* Total Quantity */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-white/80" />
                        <div className="flex-1 text-right">
                          <span className="text-xl sm:text-2xl font-bold text-white block">{Number(analytics.totalQuantity || 0).toFixed(0)} L</span>
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
                          <span className="text-lg sm:text-xl font-bold text-white block">₹{Number(analytics.totalRevenue || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-white/90 font-medium text-sm">Total Revenue</p>
                      <p className="text-white/70 text-xs mt-1">Last 30 days</p>
                    </div>

                    {/* Average Rate */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <Award className="w-8 h-8 text-white/80" />
                        <div className="flex-1 text-right">
                          <span className="text-xl sm:text-2xl font-bold text-white block">₹{Number(analytics.avgRate || 0).toFixed(2)}/L</span>
                        </div>
                      </div>
                      <p className="text-white/90 font-medium text-sm">Avg Rate</p>
                      <p className="text-white/70 text-xs mt-1">Last 30 days</p>
                    </div>
                  </div>

                  {/* Hierarchy Stats - BMCs, Societies, Machines and Farmers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* BMCs Section */}
                    <div 
                      onClick={() => (analytics.totalBmcs || 0) > 0 && setShowBmcsNavigateConfirm(true)}
                      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 transition-all ${
                        (analytics.totalBmcs || 0) > 0 ? 'cursor-pointer hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600' : 'cursor-default'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white">BMCs</h3>
                        </div>
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analytics.totalBmcs || 0}</span>
                      </div>
                      {(analytics.totalBmcs || 0) > 0 && (
                        <p className="text-xs text-purple-600 dark:text-purple-400">Click to view all BMCs →</p>
                      )}
                    </div>

                    {/* Societies Section */}
                    <div 
                      onClick={() => (analytics.totalSocieties || 0) > 0 && setShowSocietiesNavigateConfirm(true)}
                      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 transition-all ${
                        (analytics.totalSocieties || 0) > 0 ? 'cursor-pointer hover:shadow-md hover:border-pink-300 dark:hover:border-pink-600' : 'cursor-default'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                            <Building2 className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Societies</h3>
                        </div>
                        <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">{analytics.totalSocieties || 0}</span>
                      </div>
                      {(analytics.totalSocieties || 0) > 0 && (
                        <p className="text-xs text-pink-600 dark:text-pink-400">Click to view all societies →</p>
                      )}
                    </div>

                    {/* Machines Section */}
                    <div 
                      onClick={() => (analytics.totalMachines || 0) > 0 && setShowMachinesNavigateConfirm(true)}
                      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 transition-all ${
                        (analytics.totalMachines || 0) > 0 ? 'cursor-pointer hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-600' : 'cursor-default'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                            <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Machines</h3>
                        </div>
                        <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{analytics.totalMachines || 0}</span>
                      </div>
                      {(analytics.totalMachines || 0) > 0 && (
                        <p className="text-xs text-cyan-600 dark:text-cyan-400">Click to view all machines →</p>
                      )}
                    </div>

                    {/* Farmers Section (new) */}
                    <div 
                      onClick={() => (analytics.totalFarmers || 0) > 0 && setShowFarmersNavigateConfirm(true)}
                      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 transition-all ${
                        (analytics.totalFarmers || 0) > 0 ? 'cursor-pointer hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-600' : 'cursor-default'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                            <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Farmers</h3>
                        </div>
                        <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{analytics.totalFarmers || 0}</span>
                      </div>
                      {(analytics.totalFarmers || 0) > 0 && (
                        <p className="text-xs text-cyan-600 dark:text-cyan-400">Click to view all farmers →</p>
                      )}
                    </div>
                  </div>

                  {/* Top & Bottom Performers - Societies */}
                  {dairyData?.topPerformers?.societies && dairyData.topPerformers.societies.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        Society Performance (Last 30 Days)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Best Society */}
                        {dairyData.topPerformers.societies[0] && (
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-green-500 rounded-lg">
                                  <Award className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-green-700 dark:text-green-400">Best Society</p>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">{dairyData.topPerformers.societies[0].name}</p>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Collections</p>
                                <p className="text-sm font-bold text-green-600 dark:text-green-400">{dairyData.topPerformers.societies[0].collections}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Volume</p>
                                <p className="text-sm font-bold text-green-600 dark:text-green-400">{Number(dairyData.topPerformers.societies[0].totalQuantity || 0).toLocaleString()}L</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Avg Fat</p>
                                <p className="text-sm font-bold text-green-600 dark:text-green-400">{Number(dairyData.topPerformers.societies[0].avgFat || 0).toFixed(2)}%</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Worst Society */}
                        {dairyData.topPerformers.societies.length > 1 && dairyData.topPerformers.societies[dairyData.topPerformers.societies.length - 1] && (
                          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-red-500 rounded-lg">
                                  <TrendingUp className="w-4 h-4 text-white rotate-180" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-red-700 dark:text-red-400">Needs Attention</p>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">{dairyData.topPerformers.societies[dairyData.topPerformers.societies.length - 1].name}</p>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Collections</p>
                                <p className="text-sm font-bold text-red-600 dark:text-red-400">{dairyData.topPerformers.societies[dairyData.topPerformers.societies.length - 1].collections}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Volume</p>
                                <p className="text-sm font-bold text-red-600 dark:text-red-400">{Number(dairyData.topPerformers.societies[dairyData.topPerformers.societies.length - 1].totalQuantity || 0).toLocaleString()}L</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Avg Fat</p>
                                <p className="text-sm font-bold text-red-600 dark:text-red-400">{Number(dairyData.topPerformers.societies[dairyData.topPerformers.societies.length - 1].avgFat || 0).toFixed(2)}%</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left Column - Dairy Info & Quality Metrics */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                      {/* Dairy Information Card */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <Milk className="w-5 h-5 text-green-600 dark:text-green-400" />
                          Dairy Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Basic Information */}
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <Milk className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Dairy ID</p>
                                <p className="font-medium text-sm text-gray-900 dark:text-white font-mono break-words">{dairy.dairyId}</p>
                              </div>
                            </div>

                            {dairy.capacity && (
                              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <Activity className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Capacity</p>
                                  <p className="font-medium text-sm text-gray-900 dark:text-white">{dairy.capacity.toLocaleString()} L</p>
                                </div>
                              </div>
                            )}

                            {dairy.monthlyTarget && dairy.monthlyTarget > 0 && (
                              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Monthly Target</p>
                                  <p className="font-medium text-sm text-gray-900 dark:text-white">{dairy.monthlyTarget.toLocaleString()} L</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Contact & Location */}
                          <div className="space-y-3">
                            {dairy.location && (
                              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Location</p>
                                  <p className="font-medium text-sm text-gray-900 dark:text-white break-words">{dairy.location}</p>
                                </div>
                              </div>
                            )}

                            {dairy.contactPerson && (
                              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <User className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Contact Person</p>
                                  <p className="font-medium text-sm text-gray-900 dark:text-white break-words">{dairy.contactPerson}</p>
                                </div>
                              </div>
                            )}

                            {dairy.phone && (
                              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Contact Phone</p>
                                  <p className="font-medium text-sm text-gray-900 dark:text-white break-words">{dairy.phone}</p>
                                </div>
                              </div>
                            )}

                            {dairy.email && (
                              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Email</p>
                                  <p className="font-medium text-sm text-gray-900 dark:text-white break-words">{dairy.email}</p>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {/* Fat */}
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Avg Fat %</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{Number(analytics.avgFat || 0).toFixed(2)}%</p>
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
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{Number(analytics.avgSnf || 0).toFixed(2)}%</p>
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
                              <p className="font-medium text-sm text-gray-900 dark:text-white">{new Date(dairy.createdAt).toLocaleString()}</p>
                            </div>
                          </div>

                          {dairy.lastActivity && (
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <Activity className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Last Activity</p>
                                <p className="font-medium text-sm text-gray-900 dark:text-white">{new Date(dairy.lastActivity).toLocaleString()}</p>
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
                  transition={{ duration: 0.3 }}
                >
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <div className="space-y-6">
                  {/* Header with Edit/Save buttons */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      Dairy Details
                    </h3>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              setShowPassword(false);
                              setCurrentPassword('');
                              setEditFormData({
                                name: dairyData.dairy.name,
                                location: dairyData.dairy.location || '',
                                contactPerson: dairyData.dairy.contactPerson || '',
                                phone: dairyData.dairy.phone || '',
                                email: dairyData.dairy.email || '',
                                password: '',
                                status: dairyData.dairy.status
                              });
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                setSaveLoading(true);
                                setError('');
                                const token = localStorage.getItem('authToken');
                                if (!token) {
                                  router.push('/login');
                                  return;
                                }

                                const updateData: any = {
                                  id: dairyData.dairy.id,
                                  name: editFormData.name,
                                  location: editFormData.location,
                                  contactPerson: editFormData.contactPerson,
                                  phone: editFormData.phone,
                                  email: editFormData.email,
                                  status: editFormData.status
                                };

                                // Only include password if it was changed
                                if (editFormData.password && editFormData.password !== currentPassword) {
                                  updateData.password = editFormData.password;
                                }

                                const response = await fetch('/api/user/dairy', {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify(updateData),
                                });

                                const data = await response.json();

                                if (response.ok) {
                                  setSuccess('Dairy details updated successfully!');
                                  setIsEditing(false);
                                  fetchDairyDetails();
                                  setTimeout(() => setSuccess(''), 3000);
                                } else {
                                  setError(data.message || 'Failed to update dairy details');
                                  setTimeout(() => setError(''), 5000);
                                }
                              } catch (err) {
                                console.error('Error updating dairy:', err);
                                setError('Failed to update dairy details. Please try again.');
                                setTimeout(() => setError(''), 5000);
                              } finally {
                                setSaveLoading(false);
                              }
                            }}
                            disabled={saveLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit3 className="w-4 h-4" />
                            {saveLoading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditFormData({
                              name: dairyData.dairy.name,
                              location: dairyData.dairy.location || '',
                              contactPerson: dairyData.dairy.contactPerson || '',
                              phone: dairyData.dairy.phone || '',
                              email: dairyData.dairy.email || '',
                              password: '',
                              status: dairyData.dairy.status
                            });
                            setShowPassword(false);
                            setCurrentPassword('');
                            setIsEditing(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit Details
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dairy Name */}
                    {isEditing ? (
                      <FormInput
                        label="Dairy Name"
                        type="text"
                        value={editFormData.name}
                        onChange={(value) => setEditFormData({ ...editFormData, name: value })}
                        placeholder="Enter dairy name"
                        required
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Dairy Name <span className="text-red-500">*</span>
                        </label>
                        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <p className="text-gray-900 dark:text-white">{dairyData.dairy.name}</p>
                        </div>
                      </div>
                    )}

                    {/* Dairy ID (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Dairy ID
                      </label>
                      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-600 dark:text-gray-400 font-mono">{dairyData.dairy.dairyId}</p>
                      </div>
                    </div>

                    {/* Contact Person */}
                    {isEditing ? (
                      <FormInput
                        label="Contact Person"
                        type="text"
                        value={editFormData.contactPerson}
                        onChange={(value) => setEditFormData({ ...editFormData, contactPerson: value })}
                        placeholder="Enter contact person"
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Contact Person
                        </label>
                        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <p className="text-gray-900 dark:text-white">{dairyData.dairy.contactPerson || 'N/A'}</p>
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {isEditing ? (
                      <FormInput
                        label="Location"
                        type="text"
                        value={editFormData.location}
                        onChange={(value) => setEditFormData({ ...editFormData, location: value })}
                        placeholder="Enter location"
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location
                        </label>
                        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <p className="text-gray-900 dark:text-white">{dairyData.dairy.location || 'N/A'}</p>
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    {isEditing ? (
                      <FormInput
                        label="Phone Number"
                        type="tel"
                        value={editFormData.phone}
                        onChange={(value) => {
                          const formatted = formatPhoneInput(value);
                          setEditFormData({ ...editFormData, phone: formatted });
                          if (validationErrors.phone) {
                            setValidationErrors({ ...validationErrors, phone: undefined });
                          }
                        }}
                        onBlur={() => {
                          if (editFormData.phone) {
                            const error = validatePhoneOnBlur(editFormData.phone);
                            setValidationErrors({ ...validationErrors, phone: error || undefined });
                          }
                        }}
                        maxLength={10}
                        placeholder="Enter 10-digit phone number"
                        error={validationErrors.phone}
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <p className="text-gray-900 dark:text-white">{dairyData.dairy.phone || 'N/A'}</p>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {isEditing ? (
                      <FormInput
                        label="Email"
                        type="email"
                        value={editFormData.email}
                        onChange={(value) => {
                          setEditFormData({ ...editFormData, email: value });
                          if (validationErrors.email) {
                            setValidationErrors({ ...validationErrors, email: undefined });
                          }
                        }}
                        onBlur={() => {
                          if (editFormData.email) {
                            const error = validateEmailQuick(editFormData.email);
                            setValidationErrors({ ...validationErrors, email: error || undefined });
                          }
                        }}
                        placeholder="Enter email"
                        error={validationErrors.email}
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <p className="text-gray-900 dark:text-white">{dairyData.dairy.email || 'N/A'}</p>
                        </div>
                      </div>
                    )}

                    {/* Password */}
                    {isEditing ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={editFormData.password || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                            placeholder="Enter new password (leave blank to keep current)"
                            className="form-input-custom w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            title={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Leave blank to keep current password
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Password
                        </label>
                        <div className="relative px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-between">
                          <p className="text-gray-900 dark:text-white font-mono">
                            {showPassword && currentPassword ? currentPassword : '••••••••'}
                          </p>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!showPassword && !currentPassword) {
                                try {
                                  const token = localStorage.getItem('authToken');
                                  const response = await fetch(`/api/user/dairy/password?id=${dairyData.dairy.id}`, {
                                    headers: {
                                      'Authorization': `Bearer ${token}`
                                    }
                                  });
                                  
                                  if (response.ok) {
                                    const result = await response.json();
                                    let fetchedPassword = '';
                                    
                                    if (typeof result.data === 'object' && result.data.password) {
                                      fetchedPassword = String(result.data.password);
                                    } else if (result.data) {
                                      fetchedPassword = String(result.data);
                                    } else if (result.password) {
                                      fetchedPassword = String(result.password);
                                    }
                                    
                                    setCurrentPassword(fetchedPassword);
                                    setShowPassword(true);
                                  }
                                } catch (error) {
                                  console.error('Error fetching password:', error);
                                }
                              } else {
                                setShowPassword(!showPassword);
                              }
                            }}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex-shrink-0 ml-2"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    {isEditing ? (
                      <FormSelect
                        label="Status"
                        value={editFormData.status}
                        onChange={(value) => setEditFormData({ ...editFormData, status: value as 'active' | 'inactive' | 'maintenance' })}
                        options={[
                          { value: 'active', label: 'Active' },
                          { value: 'inactive', label: 'Inactive' },
                          { value: 'maintenance', label: 'Maintenance' }
                        ]}
                        placeholder="Select status"
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Status
                        </label>
                        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(dairyData.dairy.status)}`}>
                            {dairyData.dairy.status}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Capacity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Capacity (Liters)
                      </label>
                      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-600 dark:text-gray-400">{dairyData.dairy.capacity?.toLocaleString() || 'N/A'} L</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Additional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{new Date(dairyData.dairy.createdAt).toLocaleDateString()}</span>
                      </div>
                      {dairyData.dairy.monthlyTarget && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Target</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{dairyData.dairy.monthlyTarget.toLocaleString()} L</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total BMCs</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{dairyData.bmcs.length}</span>
                      </div>
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
      <DeleteDairyModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        dairyName={dairyData?.dairy.name || 'this dairy'}
        bmcCount={dairyData?.analytics?.totalBmcs || 0}
        societyCount={dairyData?.analytics?.totalSocieties || 0}
        farmerCount={dairyData?.analytics?.totalFarmers || 0}
        collectionCount={dairyData?.analytics?.totalCollections || 0}
        machineCount={dairyData?.analytics?.totalMachines || 0}
      />

      {/* Transfer BMCs Modal */}
      <TransferBMCsModal
        isOpen={showTransferModal}
        onClose={() => {
          setShowTransferModal(false);
          setBmcsForTransfer([]);
        }}
        onConfirm={handleTransferAndDelete}
        bmcs={bmcsForTransfer}
        dairies={allDairies}
        dairyName={dairyData?.dairy.name || ''}
        currentDairyId={dairyData?.dairy.id || 0}
        adminEmail={user?.email || ''}
      />

      {/* BMCs Navigation Confirmation Modal */}
      <NavigationConfirmModal
        isOpen={showBmcsNavigateConfirm}
        onClose={() => setShowBmcsNavigateConfirm(false)}
        onConfirm={() => {
          setShowBmcsNavigateConfirm(false);
          if (dairyData?.dairy.id) {
            router.push(`/admin/bmc?dairyFilter=${dairyData.dairy.id}`);
          }
        }}
        title="Navigate to BMCs"
        message={`You will be redirected to view all BMCs under ${dairyData?.dairy.name || 'this dairy'}. Any unsaved changes will be lost. Continue?`}
      />

      {/* Societies Navigation Confirmation Modal */}
      <NavigationConfirmModal
        isOpen={showSocietiesNavigateConfirm}
        onClose={() => setShowSocietiesNavigateConfirm(false)}
        onConfirm={() => {
          setShowSocietiesNavigateConfirm(false);
          if (dairyData?.dairy.id) {
            router.push(`/admin/society?dairyFilter=${dairyData.dairy.id}`);
          }
        }}
        title="Navigate to Societies"
        message={`You will be redirected to view all societies under ${dairyData?.dairy.name || 'this dairy'}. Any unsaved changes will be lost. Continue?`}
      />

      {/* Machines Navigation Confirmation Modal */}
      <NavigationConfirmModal
        isOpen={showMachinesNavigateConfirm}
        onClose={() => setShowMachinesNavigateConfirm(false)}
        onConfirm={() => {
          setShowMachinesNavigateConfirm(false);
          if (dairyData?.dairy.id) {
            router.push(`/admin/machine?dairyFilter=${dairyData.dairy.id}`);
          }
        }}
        title="Navigate to Machines"
        message={`You will be redirected to view all machines under ${dairyData?.dairy.name || 'this dairy'}. Any unsaved changes will be lost. Continue?`}
      />

      {/* Farmers Navigation Confirmation Modal */}
      <NavigationConfirmModal
        isOpen={showFarmersNavigateConfirm}
        onClose={() => setShowFarmersNavigateConfirm(false)}
        onConfirm={() => {
          setShowFarmersNavigateConfirm(false);
          if (dairyData?.dairy.id) {
            router.push(`/admin/farmer?dairyFilter=${dairyData.dairy.id}`);
          }
        }}
        title="Navigate to Farmers"
        message={`You will be redirected to view all farmers under ${dairyData?.dairy.name || 'this dairy'}. Any unsaved changes will be lost. Continue?`}
      />
    </>
  );
}