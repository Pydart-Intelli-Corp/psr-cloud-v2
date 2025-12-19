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
  EyeOff,
  Settings,
  Edit,
  Save,
  X,
  Users
} from 'lucide-react';
import { 
  LoadingSpinner, 
  EmptyState, 
  StatusMessage,
  FormInput,
  FormSelect
} from '@/components';
import NavigationConfirmModal from '@/components/NavigationConfirmModal';
import TransferSocietiesModal from '@/components/modals/TransferSocietiesModal';
import DeleteBMCModal from '@/components/modals/DeleteBMCModal';
import { validateIndianPhone, formatPhoneInput, validatePhoneOnBlur } from '@/lib/validation/phoneValidation';
import { validateEmailQuick } from '@/lib/emailValidation';

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
  password?: string;
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
  totalDispatches30d?: number;
  dispatchedQuantity30d?: number;
  totalSales30d?: number;
  salesAmount30d?: number;
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [societies, setSocieties] = useState<any[]>([]);
  const [availableBMCs, setAvailableBMCs] = useState<any[]>([]);
  const [showSocietiesNavigateConfirm, setShowSocietiesNavigateConfirm] = useState(false);
  const [showDairyNavigateConfirm, setShowDairyNavigateConfirm] = useState(false);
  const [showCollectionsNavigateConfirm, setShowCollectionsNavigateConfirm] = useState(false);
  const [showFarmersNavigateConfirm, setShowFarmersNavigateConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [passwordFetched, setPasswordFetched] = useState(false);
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
    status: 'active' as 'active' | 'inactive' | 'maintenance',
    capacity: '',
    monthlyTarget: '',
    password: ''
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
        status: bmcData.status || 'active',
        capacity: bmcData.capacity?.toString() || '',
        monthlyTarget: bmcData.monthlyTarget?.toString() || '',
        password: '' // Never populate password for security
      });
    } catch (error) {
      console.error('Error fetching BMC details:', error);
      setError('Failed to load BMC details');
    } finally {
      setLoading(false);
    }
  }, [bmcIdParam, router]);

  useEffect(() => {
    fetchBMCDetails();
  }, [fetchBMCDetails]);

  // Reset password state when exiting edit mode
  useEffect(() => {
    if (!isEditing) {
      setShowPassword(false);
      setCurrentPassword('');
    }
  }, [isEditing]);

  // Fetch societies under this BMC
  const fetchSocieties = async () => {
    if (!bmc) return [];

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/society', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const bmcSocieties = result.data?.filter((s: any) => s.bmc_id === bmc.id) || [];
        setSocieties(bmcSocieties);
        return bmcSocieties;
      }
    } catch (error) {
      console.error('Error fetching societies:', error);
    }
    return [];
  };

  // Fetch available BMCs for transfer
  const fetchAvailableBMCs = async () => {
    if (!bmc) return;

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
        const otherBMCs = result.data?.filter((b: any) => b.id !== bmc.id) || [];
        setAvailableBMCs(otherBMCs);
      }
    } catch (error) {
      console.error('Error fetching BMCs:', error);
    }
  };

  // Open delete confirmation modal - check for societies first
  const handleDeleteBMC = async () => {
    if (!bmc) return;

    // Fetch societies for this BMC
    const bmcSocieties = await fetchSocieties();
    
    if (bmcSocieties.length > 0) {
      // Has societies - show transfer modal
      await fetchAvailableBMCs();
      setShowTransferModal(true);
    } else {
      // No societies - store BMC ID for OTP modal and show delete modal
      (window as any).selectedBmcIdForDelete = bmc.id;
      setShowDeleteModal(true);
    }
  };

  // Delete BMC (no societies) with OTP verification
  const handleConfirmDelete = async (otp: string) => {
    if (!bmc) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/bmc', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: bmc.id,
          otp
        })
      });

      if (response.ok) {
        setSuccess('BMC deleted successfully! Redirecting...');
        setShowDeleteModal(false);
        setTimeout(() => router.push('/admin/bmc'), 2000);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete BMC');
      }
    } catch (error: any) {
      console.error('Error deleting BMC:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle transfer and delete with OTP
  const handleTransferAndDelete = async (newBmcId: number | null, deleteAll: boolean, otp?: string) => {
    if (!bmc) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/bmc', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: bmc.id,
          newBmcId,
          deleteAll,
          otp
        })
      });

      const result = await response.json();

      if (response.ok) {
        setShowTransferModal(false);
        if (deleteAll) {
          setSuccess('All data deleted successfully! Redirecting...');
        } else {
          setSuccess(`Transferred ${result.data?.transferredSocieties || 0} societies and deleted BMC successfully! Redirecting...`);
        }
        setTimeout(() => router.push('/admin/bmc'), 2000);
      } else {
        setError(result.error || 'Failed to delete BMC');
      }
    } catch (error) {
      console.error('Error deleting BMC:', error);
      setError('Failed to delete BMC');
    }
  };

  useEffect(() => {
    fetchBMCDetails();
  }, [fetchBMCDetails]);

  // Fetch password when entering edit mode
  useEffect(() => {
    const fetchPassword = async () => {
      if (isEditing && bmc?.id) {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`/api/user/bmc/password?id=${bmc.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            const password = result.data || '';
            setCurrentPassword(password);
            setEditFormData(prev => ({ ...prev, password }));
          }
        } catch (error) {
          console.error('Error fetching password:', error);
        }
      } else if (!isEditing) {
        setShowPassword(false);
        setCurrentPassword('');
      }
    };

    fetchPassword();
  }, [isEditing, bmc?.id]);

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

  // Phone validation handlers
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setEditFormData({ ...editFormData, phone: formatted });
    // Clear error when user starts typing
    if (validationErrors.phone) {
      setValidationErrors({ ...validationErrors, phone: undefined });
    }
  };

  const handlePhoneBlur = () => {
    const error = validatePhoneOnBlur(editFormData.phone);
    setValidationErrors({ ...validationErrors, phone: error });
  };

  // Email validation handler
  const handleEmailBlur = () => {
    const error = validateEmailQuick(editFormData.email);
    setValidationErrors({ ...validationErrors, email: error });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form data and clear validation errors
      if (bmc) {
        setEditFormData({
          name: bmc.name || '',
          location: bmc.location || '',
          contactPerson: bmc.contactPerson || '',
          phone: bmc.phone || '',
          email: bmc.email || '',
          status: bmc.status || 'active',
          capacity: bmc.capacity?.toString() || '',
          monthlyTarget: bmc.monthlyTarget?.toString() || '',
          password: ''
        });
      }
      setValidationErrors({});
      setCurrentPassword('');
      setShowPassword(false);
      setPasswordFetched(false);
    } else {
      // Entering edit mode - reset password states
      setCurrentPassword('');
      setShowPassword(false);
      setPasswordFetched(false);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveDetails = async () => {
    try {
      // Validate before saving
      const phoneError = validatePhoneOnBlur(editFormData.phone);
      const emailError = editFormData.email ? validateEmailQuick(editFormData.email) : '';

      if (phoneError || emailError) {
        setValidationErrors({
          phone: phoneError,
          email: emailError
        });
        setError('Please fix validation errors before saving');
        return;
      }

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
          name: editFormData.name,
          location: editFormData.location,
          contactPerson: editFormData.contactPerson,
          phone: editFormData.phone,
          email: editFormData.email,
          status: editFormData.status,
          capacity: editFormData.capacity ? parseInt(editFormData.capacity) : undefined,
          monthlyTarget: editFormData.monthlyTarget ? parseInt(editFormData.monthlyTarget) : undefined,
          password: passwordFetched && currentPassword ? currentPassword : undefined
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
                    onClick={handleDeleteBMC}
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
                    <div 
                      onClick={() => (bmc.totalCollections30d || 0) > 0 && setShowCollectionsNavigateConfirm(true)}
                      className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all ${
                        (bmc.totalCollections30d || 0) > 0 ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Droplet className="w-8 h-8 text-white/80" />
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{bmc.totalCollections30d || 0}</span>
                        </div>
                      </div>
                      <p className="text-white/90 font-medium text-sm">Collections</p>
                      <p className="text-white/70 text-xs mt-1">{(bmc.totalCollections30d || 0) > 0 ? 'Click to view • Last 30 days' : 'Last 30 days'}</p>
                    </div>

                    {/* Total Quantity */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <Milk className="w-8 h-8 text-white/80" />
                        <div className="flex-1 text-right">
                          <span className="text-xl sm:text-2xl font-bold text-white block">{Number(bmc.totalQuantity30d || 0).toFixed(0)} L</span>
                        </div>
                      </div>
                      <p className="text-white/90 font-medium text-sm">Collected</p>
                      <p className="text-white/70 text-xs mt-1">Last 30 days</p>
                    </div>

                    {/* Total Revenue */}
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-white/80" />
                        <div className="flex-1 text-right">
                          <span className="text-lg sm:text-xl font-bold text-white block">₹{Number(bmc.totalAmount30d || 0).toLocaleString()}</span>
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

                    {/* Farmers Count */}
                    <div 
                      onClick={() => (bmc.farmerCount || 0) > 0 && setShowFarmersNavigateConfirm(true)}
                      className={`bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all ${
                        (bmc.farmerCount || 0) > 0 ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8 text-white/80" />
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{bmc.farmerCount || 0}</span>
                        </div>
                      </div>
                      <p className="text-white/90 font-medium text-sm">Farmers</p>
                      <p className="text-white/70 text-xs mt-1">{(bmc.farmerCount || 0) > 0 ? 'Click to view' : 'Total registered'}</p>
                    </div>

                    {/* Avg Fat */}
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <Eye className="w-8 h-8 text-white/80" />
                        <div className="flex-1 text-right">
                          <span className="text-xl sm:text-2xl font-bold text-white block">{Number(bmc.weightedFat30d || 0).toFixed(2)}%</span>
                        </div>
                      </div>
                      <p className="text-white/90 font-medium text-sm">Avg Fat</p>
                      <p className="text-white/70 text-xs mt-1">Last 30 days</p>
                    </div>

                    {/* Avg SNF */}
                    <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <Award className="w-8 h-8 text-white/80" />
                        <div className="flex-1 text-right">
                          <span className="text-xl sm:text-2xl font-bold text-white block">{Number(bmc.weightedSnf30d || 0).toFixed(2)}%</span>
                        </div>
                      </div>
                      <p className="text-white/90 font-medium text-sm">Avg SNF</p>
                      <p className="text-white/70 text-xs mt-1">Last 30 days</p>
                    </div>

                    {/* Avg CLR */}
                    <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <Activity className="w-8 h-8 text-white/80" />
                        <div className="flex-1 text-right">
                          <span className="text-xl sm:text-2xl font-bold text-white block">{Number(bmc.weightedClr30d || 0).toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-white/90 font-medium text-sm">Avg CLR</p>
                      <p className="text-white/70 text-xs mt-1">Last 30 days</p>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left Column - BMC Info & Quality Metrics */}
                    <div className="lg:col-span-2 space-y-4 sm:gap-6">
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

                      {/* Volume Details - 30 Days */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                          Collected, Dispatch and Sales Details (Last 30 Days)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                          {/* Collected */}
                          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-green-500 rounded-lg">
                                <Milk className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-green-700 dark:text-green-300 font-medium">Collected</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-green-600 dark:text-green-400">Volume:</span>
                                <span className="text-sm font-bold text-green-900 dark:text-green-100">{Number(bmc.totalQuantity30d || 0).toLocaleString()} L</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-green-600 dark:text-green-400">Count:</span>
                                <span className="text-sm font-bold text-green-900 dark:text-green-100">{Number(bmc.totalCollections30d || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Dispatched */}
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-blue-500 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Dispatched</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-blue-600 dark:text-blue-400">Volume:</span>
                                <span className="text-sm font-bold text-blue-900 dark:text-blue-100">{Number(bmc.dispatchedQuantity30d || 0).toLocaleString()} L</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-blue-600 dark:text-blue-400">Count:</span>
                                <span className="text-sm font-bold text-blue-900 dark:text-blue-100">{Number(bmc.totalDispatches30d || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Sales */}
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-orange-500 rounded-lg">
                                <Award className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">Sales</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-orange-600 dark:text-orange-400">Amount:</span>
                                <span className="text-sm font-bold text-orange-900 dark:text-orange-100">₹{Number(bmc.salesAmount30d || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-orange-600 dark:text-orange-400">Count:</span>
                                <span className="text-sm font-bold text-orange-900 dark:text-orange-100">{Number(bmc.totalSales30d || 0).toLocaleString()}</span>
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
                      {isEditing ? (
                        <FormInput
                          label="BMC Name"
                          value={editFormData.name}
                          onChange={(value) => setEditFormData({ ...editFormData, name: value })}
                          placeholder="Enter BMC name"
                          required
                        />
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            BMC Name
                          </label>
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-gray-900 dark:text-white">{bmc.name}</p>
                          </div>
                        </div>
                      )}

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
                      {isEditing ? (
                        <FormInput
                          label="Contact Person"
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
                            <p className="text-gray-900 dark:text-white">{bmc.contactPerson || 'N/A'}</p>
                          </div>
                        </div>
                      )}

                      {/* Location */}
                      {isEditing ? (
                        <FormInput
                          label="Location"
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
                            <p className="text-gray-900 dark:text-white">{bmc.location || 'N/A'}</p>
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
                            <p className="text-gray-900 dark:text-white">{bmc.phone || 'N/A'}</p>
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
                          onBlur={handleEmailBlur}
                          placeholder="Enter email address"
                          error={validationErrors.email}
                        />
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email
                          </label>
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-gray-900 dark:text-white">{bmc.email || 'N/A'}</p>
                          </div>
                        </div>
                      )}

                      {/* Capacity */}
                      {isEditing ? (
                        <FormInput
                          label="Capacity (Liters)"
                          type="number"
                          value={editFormData.capacity}
                          onChange={(value) => setEditFormData({ ...editFormData, capacity: value })}
                          placeholder="Enter capacity in liters"
                        />
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Capacity (Liters)
                          </label>
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-gray-900 dark:text-white">{bmc.capacity ? `${bmc.capacity.toLocaleString()} L` : 'N/A'}</p>
                          </div>
                        </div>
                      )}

                      {/* Monthly Target */}
                      {isEditing ? (
                        <FormInput
                          label="Monthly Target (Liters)"
                          type="number"
                          value={editFormData.monthlyTarget}
                          onChange={(value) => setEditFormData({ ...editFormData, monthlyTarget: value })}
                          placeholder="Enter monthly target in liters"
                        />
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Monthly Target (Liters)
                          </label>
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-gray-900 dark:text-white">{bmc.monthlyTarget ? `${bmc.monthlyTarget.toLocaleString()} L` : 'N/A'}</p>
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
                              value={passwordFetched ? currentPassword : '••••••••'}
                              onChange={(e) => {
                                setCurrentPassword(e.target.value);
                                setEditFormData({ ...editFormData, password: e.target.value });
                                setPasswordFetched(true);
                              }}
                              placeholder="Enter new password"
                              className="form-input-custom w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={async () => {
                                if (!passwordFetched) {
                                  // Fetch password from API
                                  try {
                                    const token = localStorage.getItem('authToken');
                                    const response = await fetch(`/api/user/bmc/password?id=${bmc.id}`, {
                                      headers: {
                                        'Authorization': `Bearer ${token}`
                                      }
                                    });
                                    
                                    if (response.ok) {
                                      const result = await response.json();
                                      console.log('Password API response:', result);
                                      let fetchedPassword = '';
                                      
                                      if (typeof result.data === 'object' && result.data !== null && result.data.password) {
                                        fetchedPassword = String(result.data.password);
                                      } else if (typeof result.data === 'string') {
                                        fetchedPassword = result.data;
                                      } else if (result.password) {
                                        fetchedPassword = String(result.password);
                                      }
                                      
                                      console.log('Fetched password:', fetchedPassword);
                                      setCurrentPassword(fetchedPassword);
                                      setPasswordFetched(true);
                                      setShowPassword(true);
                                    }
                                  } catch (error) {
                                    console.error('Error fetching password:', error);
                                  }
                                } else {
                                  // Just toggle visibility
                                  setShowPassword(!showPassword);
                                }
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                              title={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Click eye icon to view current password. Edit to change it.
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
                                    const response = await fetch(`/api/user/bmc/password?id=${bmc.id}`, {
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
                        />
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Status
                          </label>
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(bmc.status)}`}>
                              {bmc.status}
                            </span>
                          </div>
                        </div>
                      )}

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
      <DeleteBMCModal
        isOpen={showDeleteModal && !!bmc}
        onClose={() => {
          setShowDeleteModal(false);
        }}
        onConfirm={handleConfirmDelete}
        bmcName={bmc?.name || ''}
        loading={isDeleting}
        societyCount={bmc?.societyCount || 0}
      />

      {/* Transfer Societies Modal */}
      <TransferSocietiesModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onConfirm={handleTransferAndDelete}
        bmcName={bmc?.name || ''}
        bmcId={bmc?.id || 0}
        societies={societies}
        availableBMCs={availableBMCs}
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

      {/* Collections Navigation Confirmation Modal */}
      <NavigationConfirmModal
        isOpen={showCollectionsNavigateConfirm}
        onClose={() => setShowCollectionsNavigateConfirm(false)}
        onConfirm={() => {
          setShowCollectionsNavigateConfirm(false);
          if (bmc) {
            const today = new Date();
            const last30Days = new Date(today);
            last30Days.setDate(today.getDate() - 30);
            const fromDate = last30Days.toISOString().split('T')[0];
            const toDate = today.toISOString().split('T')[0];
            router.push(`/admin/reports?fromDate=${fromDate}&toDate=${toDate}&bmcFilter=${bmc.id}`);
          }
        }}
        title="Navigate to Collection Reports"
        message={`View last 30 days collection reports for ${bmc?.name} with filters applied.`}
        confirmText="Go to Reports"
        cancelText="Cancel"
      />

      {/* Farmers Navigation Confirmation Modal */}
      <NavigationConfirmModal
        isOpen={showFarmersNavigateConfirm}
        onClose={() => setShowFarmersNavigateConfirm(false)}
        onConfirm={() => {
          setShowFarmersNavigateConfirm(false);
          if (bmc) {
            router.push(`/admin/farmer?bmcFilter=${bmc.id}`);
          }
        }}
        title="Navigate to Farmer Management"
        message={`View all farmers under ${bmc?.name} in the Farmer Management page with filters applied.`}
        confirmText="Go to Farmer Management"
        cancelText="Cancel"
      />
    </>
  );
}
