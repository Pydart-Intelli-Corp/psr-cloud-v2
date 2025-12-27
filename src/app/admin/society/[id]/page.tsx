'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Users, MapPin, Phone, User, Building2,
  Info, Truck, ShoppingCart, Settings, BarChart3,
  Droplet, DollarSign, AlertCircle, Zap, Award, ExternalLink,
  Edit, Save, X, RefreshCw, Trash2, Eye, EyeOff
} from 'lucide-react';
import { validateIndianPhone, formatPhoneInput, validatePhoneOnBlur } from '@/lib/validation';
import { validateEmailOnBlur, formatEmailInput } from '@/lib/validation/emailValidation';
import { validateEmailQuick } from '@/lib/emailValidation';
import { 
  LoadingSpinner, 
  PageLoader,
  EmptyState,
  StatusMessage,
  FormInput,
  FormSelect
} from '@/components';
import DeleteSocietyModal from '@/components/modals/DeleteSocietyModal';
import NavigationConfirmModal from '@/components/NavigationConfirmModal';

interface Society {
  id: number;
  societyId: string;
  name: string;
  password?: string;
  location?: string;
  presidentName?: string;
  contactPhone?: string;
  email: string;
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
  totalFarmers: number;
  presentFarmers: number;
  absentFarmers: number;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'sections'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNavigateConfirm, setShowNavigateConfirm] = useState(false);
  const [showMachineNavigateConfirm, setShowMachineNavigateConfirm] = useState(false);
  const [showCollectionNavigateConfirm, setShowCollectionNavigateConfirm] = useState(false);
  const [showDairyNavigateConfirm, setShowDairyNavigateConfirm] = useState(false);
  const [showBmcNavigateConfirm, setShowBmcNavigateConfirm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    password: '',
    location: '',
    presidentName: '',
    contactPhone: '',
    email: '',
    status: 'active' as 'active' | 'inactive' | 'maintenance'
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    contactPhone: '',
    email: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');

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

  useEffect(() => {
    if (data?.society) {
      setEditFormData({
        name: data.society.name || '',
        password: '',
        location: data.society.location || '',
        presidentName: data.society.presidentName || '',
        contactPhone: data.society.contactPhone || '',
        email: data.society.email || '',
        status: data.society.status || 'active'
      });
    }
  }, [data]);

  // Fetch password when entering edit mode
  useEffect(() => {
    const fetchPassword = async () => {
      if (isEditing && params.id) {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`/api/user/society/password?id=${params.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            const fetchedPassword = result.data?.password || result.password || '';
            setCurrentPassword(fetchedPassword);
            setEditFormData(prev => ({ ...prev, password: fetchedPassword }));
          }
        } catch (error) {
          console.error('Error fetching password:', error);
        }
      } else {
        setShowPassword(false);
        setCurrentPassword('');
      }
    };
    
    fetchPassword();
  }, [isEditing, params.id]);

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

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form data and clear errors
      if (data?.society) {
        setEditFormData({
          name: data.society.name || '',
          password: '',
          location: data.society.location || '',
          presidentName: data.society.presidentName || '',
          contactPhone: data.society.contactPhone || '',
          email: data.society.email || '',
          status: data.society.status || 'active'
        });
      }
      setValidationErrors({ contactPhone: '', email: '' });
    }
    setIsEditing(!isEditing);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneInput(value);
    setEditFormData({ ...editFormData, contactPhone: formatted });
    // Clear error when user starts typing
    if (validationErrors.contactPhone) {
      setValidationErrors({ ...validationErrors, contactPhone: '' });
    }
  };

  const handlePhoneBlur = () => {
    if (editFormData.contactPhone) {
      const error = validatePhoneOnBlur(editFormData.contactPhone);
      setValidationErrors({ ...validationErrors, contactPhone: error });
    }
  };

  const handleSaveDetails = async () => {
    try {
      setSaveLoading(true);
      setError('');

      // Validate phone number before saving
      if (editFormData.contactPhone) {
        const phoneValidation = validateIndianPhone(editFormData.contactPhone);
        if (!phoneValidation.isValid) {
          setValidationErrors({ ...validationErrors, contactPhone: phoneValidation.error || 'Invalid phone number' });
          setError('Please fix validation errors before saving');
          setSaveLoading(false);
          return;
        }
      }

      // Validate email before saving
      if (!editFormData.email || !editFormData.email.trim()) {
        setValidationErrors({ ...validationErrors, email: 'Email is required' });
        setError('Please fix validation errors before saving');
        setSaveLoading(false);
        return;
      }

      const emailValidationError = validateEmailOnBlur(editFormData.email);
      if (emailValidationError) {
        setValidationErrors({ ...validationErrors, email: emailValidationError });
        setError('Please fix validation errors before saving');
        setSaveLoading(false);
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const updateData: {
        id: number;
        name: string;
        location: string;
        presidentName: string;
        contactPhone: string;
        email: string;
        status: 'active' | 'inactive' | 'maintenance';
        password?: string;
      } = {
        id: Number(params.id),
        name: editFormData.name,
        location: editFormData.location,
        presidentName: editFormData.presidentName,
        contactPhone: editFormData.contactPhone,
        email: editFormData.email,
        status: editFormData.status
      };

      // Only include password if it was changed
      if (editFormData.password && editFormData.password !== currentPassword) {
        updateData.password = editFormData.password;
      }

      const response = await fetch(`/api/user/society`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
          router.push('/login');
          return;
        }
        // Try to get error message from response
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to update society details (${response.status})`;
        setError(errorMessage);
        console.error('Update failed:', errorMessage, errorData);
        return;
      }

      const result = await response.json();
      if (result.success) {
        // Refresh the data
        await fetchSocietyDetails();
        setIsEditing(false);
      } else {
        setError(result.message || 'Failed to update society details');
      }
    } catch (error) {
      console.error('Error updating society:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update society details';
      setError(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteClick = () => {
    // Store society ID for OTP modal
    (window as { selectedSocietyId?: number }).selectedSocietyId = Number(params.id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (otp: string) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/user/society?id=${params.id}&otp=${otp}`, {
        method: 'DELETE',
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete society');
      }

      const result = await response.json();
      if (result.success) {
        setShowDeleteModal(false);
        router.push('/admin/society');
      } else {
        throw new Error(result.message || 'Failed to delete society');
      }
    } catch (error) {
      console.error('Error deleting society:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete society');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <PageLoader />;
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

  const { society, analytics, topPerformers, channelBreakdown, sections } = data;

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Info },
    { id: 'sections' as const, label: `Sections (${sections?.length || 0})`, icon: BarChart3 },
    { id: 'details' as const, label: 'Details', icon: Settings }
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

            {/* Bottom Row: Status + Actions */}
            <div className="flex items-center justify-between gap-3">
              <span className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getStatusColor(society.status)}`}>
                {society.status}
              </span>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  onClick={fetchSocietyDetails}
                  className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-blue-600 dark:text-blue-500 border border-blue-600 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors min-h-[44px]"
                >
                  <RefreshCw className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button 
                  onClick={handleDeleteClick}
                  className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-red-600 dark:text-red-500 border border-red-600 dark:border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
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
              className="space-y-4 sm:space-y-6"
            >
              {/* Comprehensive Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Farmers */}
                <div 
                  onClick={() => analytics.totalFarmers > 0 && setShowNavigateConfirm(true)}
                  className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all ${
                    analytics.totalFarmers > 0 ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-white/80" />
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{analytics.totalFarmers}</span>
                    </div>
                  </div>
                  <p className="text-white/90 font-medium text-sm">Total Farmers</p>
                  <p className="text-white/70 text-xs mt-1">{analytics.activeFarmers} active • Click to view</p>
                </div>

                {/* Total Machines */}
                <div 
                  onClick={() => analytics.totalMachines > 0 && setShowMachineNavigateConfirm(true)}
                  className={`bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all ${
                    analytics.totalMachines > 0 ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Settings className="w-8 h-8 text-white/80" />
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{analytics.totalMachines}</span>
                    </div>
                  </div>
                  <p className="text-white/90 font-medium text-sm">Total Machines</p>
                  <p className="text-white/70 text-xs mt-1">{analytics.activeMachines} active • Click to view</p>
                </div>

                {/* Total Collections */}
                <div 
                  onClick={() => analytics.totalCollections > 0 && setShowCollectionNavigateConfirm(true)}
                  className={`bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all ${
                    analytics.totalCollections > 0 ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Droplet className="w-8 h-8 text-white/80" />
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{formatNumber(analytics.totalCollections)}</span>
                    </div>
                  </div>
                  <p className="text-white/90 font-medium text-sm">Collections</p>
                  <p className="text-white/70 text-xs mt-1">Last 30 days • Click to view</p>
                </div>

                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-8 h-8 text-white/80" />
                    <div className="flex-1 text-right">
                      <span className="text-xl sm:text-2xl font-bold text-white block">{formatCurrency(analytics.totalRevenue)}</span>
                    </div>
                  </div>
                  <p className="text-white/90 font-medium text-sm">Total Revenue</p>
                  <p className="text-white/70 text-xs mt-1">Last 30 days</p>
                </div>
              </div>

              {/* Volume & Activity Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Quantity Collected */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Collected</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(analytics.totalQuantityCollected)} L</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Last 30 days</p>
                    </div>
                  </div>
                </div>

                {/* Total Quantity Dispatched */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Dispatched</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(analytics.totalQuantityDispatched)} L</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Last 30 days</p>
                    </div>
                  </div>
                </div>

                {/* Total Dispatches */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Dispatch Count</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(analytics.totalDispatches)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Last 30 days</p>
                    </div>
                  </div>
                </div>

                {/* Total Sales */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <ShoppingCart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Sales</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(analytics.totalSales)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Last 30 days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left Column - Society Info & Quality Metrics */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  {/* Society Information Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Society Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Hierarchy Information */}
                      <div className="space-y-3">
                        {society.dairyName && (
                          <div 
                            onClick={() => society.dairyId && setShowDairyNavigateConfirm(true)}
                            className={`flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 transition-all ${
                              society.dairyId ? 'cursor-pointer hover:shadow-md hover:scale-105 active:scale-95' : 'cursor-default'
                            }`}
                          >
                            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Dairy Farm {society.dairyId && '• Click to view'}</p>
                              <p className="font-semibold text-sm text-gray-900 dark:text-white break-words">{society.dairyName}</p>
                              {society.dairyIdentifier && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{society.dairyIdentifier}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {society.bmcName && (
                          <div 
                            onClick={() => society.bmcId && setShowBmcNavigateConfirm(true)}
                            className={`flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 transition-all ${
                              society.bmcId ? 'cursor-pointer hover:shadow-md hover:scale-105 active:scale-95' : 'cursor-default'
                            }`}
                          >
                            <Building2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-green-600 dark:text-green-400 font-medium">BMC (Bulk Milk Cooler) {society.bmcId && '• Click to view'}</p>
                              <p className="font-semibold text-sm text-gray-900 dark:text-white break-words">{society.bmcName}</p>
                              {society.bmcIdentifier && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{society.bmcIdentifier}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Contact & Location */}
                      <div className="space-y-3">
                        {society.location && (
                          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 dark:text-gray-400">Location</p>
                              <p className="font-medium text-sm text-gray-900 dark:text-white break-words">{society.location}</p>
                            </div>
                          </div>
                        )}

                        {society.presidentName && (
                          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <User className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 dark:text-gray-400">President</p>
                              <p className="font-medium text-sm text-gray-900 dark:text-white break-words">{society.presidentName}</p>
                            </div>
                          </div>
                        )}

                        {society.contactPhone && (
                          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 dark:text-gray-400">Contact Phone</p>
                              <p className="font-medium text-sm text-gray-900 dark:text-white break-words">{society.contactPhone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quality Metrics - 30 Days */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      Quality Metrics (Last 30 Days)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                            <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">FAT %</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatNumber(analytics.avgFat)}%</p>
                          </div>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Average Fat Content</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                            <Droplet className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">SNF %</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{formatNumber(analytics.avgSnf)}%</p>
                          </div>
                        </div>
                        <p className="text-xs text-green-700 dark:text-green-300">Solid-Not-Fat Content</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Rate</p>
                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{formatCurrency(analytics.avgRate)}/L</p>
                          </div>
                        </div>
                        <p className="text-xs text-purple-700 dark:text-purple-300">Average Price per Liter</p>
                      </div>
                    </div>
                  </div>

                  {/* Top Performing Farmers */}
                  {topPerformers.farmers.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        Top Performing Farmers
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rank</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Farmer</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Collections</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantity (L)</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {topPerformers.farmers.map((farmer, index) => (
                              <tr key={farmer.farmerId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-4 py-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                    index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    index === 1 ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                    index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                    'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                  }`}>
                                    {index + 1}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div>
                                    <p className="font-medium text-sm text-gray-900 dark:text-white">{farmer.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{farmer.farmerId}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">{formatNumber(farmer.collections)}</td>
                                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">{formatNumber(farmer.totalQuantity)}</td>
                                <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(farmer.totalRevenue)}</td>
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
                    <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Society Details
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
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save className="w-4 h-4" />
                          {saveLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEditToggle}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Details
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Society Name */}
                  {isEditing ? (
                    <FormInput
                      label="Society Name"
                      value={editFormData.name}
                      onChange={(value) => setEditFormData({ ...editFormData, name: value })}
                      placeholder="Enter society name"
                      required
                    />
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Society Name
                      </label>
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-900 dark:text-white">{society.name}</p>
                      </div>
                    </div>
                  )}

                  {/* Society ID (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Society ID
                    </label>
                    <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-gray-600 dark:text-gray-400 font-mono">{society.societyId}</p>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    {isEditing ? (
                      <div>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={editFormData.password}
                            onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                            placeholder="Enter password"
                            className="form-input-custom w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none"
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
                          Current password is pre-filled. Click eye icon to view or edit to change.
                        </p>
                      </div>
                    ) : (
                      <div className="relative px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-between">
                        <p className="text-gray-900 dark:text-white font-mono">
                          {showPassword && currentPassword ? currentPassword : '••••••••'}
                        </p>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!showPassword && !currentPassword) {
                              // Fetch password if not already loaded
                              try {
                                const token = localStorage.getItem('authToken');
                                const response = await fetch(`/api/user/society/password?id=${params.id}`, {
                                  headers: {
                                    'Authorization': `Bearer ${token}`
                                  }
                                });
                                
                                if (response.ok) {
                                  const result = await response.json();
                                  const fetchedPassword = result.data?.password || result.password || '';
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
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* President Name */}
                  {isEditing ? (
                    <FormInput
                      label="President Name"
                      value={editFormData.presidentName}
                      onChange={(value) => setEditFormData({ ...editFormData, presidentName: value })}
                      placeholder="Enter president name"
                    />
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        President Name
                      </label>
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-900 dark:text-white">{society.presidentName || 'N/A'}</p>
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
                        <p className="text-gray-900 dark:text-white">{society.location || 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  {/* Contact Phone */}
                  {isEditing ? (
                    <FormInput
                      label="Contact Phone"
                      type="tel"
                      value={editFormData.contactPhone}
                      onChange={handlePhoneChange}
                      onBlur={handlePhoneBlur}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      error={validationErrors.contactPhone}
                    />
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact Phone
                      </label>
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-900 dark:text-white">{society.contactPhone || 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {isEditing ? (
                    <FormInput
                      label="Email Address"
                      type="email"
                      value={editFormData.email}
                      onChange={(value) => {
                        const formatted = formatEmailInput(value);
                        setEditFormData({ ...editFormData, email: formatted });
                        // Clear error when user starts typing
                        if (validationErrors.email) {
                          setValidationErrors({ ...validationErrors, email: '' });
                        }
                      }}
                      onBlur={() => {
                        const error = validateEmailOnBlur(editFormData.email);
                        setValidationErrors({ ...validationErrors, email: error });
                      }}
                      placeholder={society.email ? `Current: ${society.email}` : "Enter email address"}
                      error={validationErrors.email}
                      required
                      helperText="Current email address is pre-filled. Edit to change."
                    />
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-900 dark:text-white">{society.email || 'N/A'}</p>
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
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(society.status)}`}>
                          {society.status}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* BMC (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Associated BMC
                    </label>
                    <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-gray-900 dark:text-white">{society.bmcName || 'N/A'}</p>
                      {society.bmcIdentifier && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">{society.bmcIdentifier}</p>
                      )}
                    </div>
                  </div>

                  {/* Dairy (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Associated Dairy
                    </label>
                    <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-gray-900 dark:text-white">{society.dairyName || 'N/A'}</p>
                      {society.dairyIdentifier && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">{society.dairyIdentifier}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timestamps Section */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">System Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Created At</span>
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
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Farmers</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Present</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Absent</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attendance %</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inactive Days</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Checked</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {sections.map((section) => {
                          const attendancePercent = section.totalFarmers > 0 
                            ? ((section.presentFarmers / section.totalFarmers) * 100).toFixed(1)
                            : '0.0';
                          
                          return (
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
                              <td className="px-4 py-3 text-center whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                                {formatNumber(section.totalFarmers)}
                              </td>
                              <td className="px-4 py-3 text-center whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                                {formatNumber(section.presentFarmers)}
                              </td>
                              <td className="px-4 py-3 text-center whitespace-nowrap text-sm font-medium text-red-600 dark:text-red-400">
                                {formatNumber(section.absentFarmers)}
                              </td>
                              <td className="px-4 py-3 text-center whitespace-nowrap text-sm">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold
                                  ${parseFloat(attendancePercent) >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                                  ${parseFloat(attendancePercent) >= 50 && parseFloat(attendancePercent) < 80 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                                  ${parseFloat(attendancePercent) < 50 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                                `}>
                                  {attendancePercent}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {section.inactiveDays}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-500">
                                {section.lastChecked || '-'}
                              </td>
                            </tr>
                          );
                        })}
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
        </AnimatePresence>
      </div>

      {/* Navigation Confirmation Modal */}
      <NavigationConfirmModal
        isOpen={showNavigateConfirm}
        onClose={() => setShowNavigateConfirm(false)}
        onConfirm={() => {
          setShowNavigateConfirm(false);
          if (data?.society) {
            router.push(`/admin/farmer?societyId=${data.society.id}&societyName=${encodeURIComponent(data.society.name)}`);
          }
        }}
        title="Navigate to Farmer Management"
        message={`View all farmers from ${data?.society.name} in the Farmer Management page with filters applied.`}
        confirmText="Go to Farmer Management"
        cancelText="Cancel"
      />

      {/* Machine Navigation Confirmation Modal */}
      <NavigationConfirmModal
        isOpen={showMachineNavigateConfirm}
        onClose={() => setShowMachineNavigateConfirm(false)}
        onConfirm={() => {
          setShowMachineNavigateConfirm(false);
          if (data?.society) {
            router.push(`/admin/machine?societyId=${data.society.id}&societyName=${encodeURIComponent(data.society.name)}`);
          }
        }}
        title="Navigate to Machine Management"
        message={`View all machines from ${data?.society.name} in the Machine Management page with filters applied.`}
        confirmText="Go to Machine Management"
        cancelText="Cancel"
      />

      {/* Collection Navigation Confirmation Modal */}
      <NavigationConfirmModal
        isOpen={showCollectionNavigateConfirm}
        onClose={() => setShowCollectionNavigateConfirm(false)}
        onConfirm={() => {
          setShowCollectionNavigateConfirm(false);
          if (data?.society) {
            // Calculate date range: last 30 days
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            
            const formatDate = (date: Date) => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            };
            
            const fromDate = formatDate(thirtyDaysAgo);
            const toDate = formatDate(today);
            
            router.push(`/admin/reports?societyId=${data.society.societyId}&societyName=${encodeURIComponent(data.society.name)}&fromDate=${fromDate}&toDate=${toDate}`);
          }
        }}
        title="Navigate to Reports Management"
        message={`View all collection reports from ${data?.society.name} for the last 30 days in the Reports Management page with filters applied.`}
        confirmText="Go to Reports Management"
        cancelText="Cancel"
      />

      {/* Dairy Navigation Confirmation Modal */}
      <NavigationConfirmModal
        isOpen={showDairyNavigateConfirm}
        onClose={() => setShowDairyNavigateConfirm(false)}
        onConfirm={() => {
          setShowDairyNavigateConfirm(false);
          if (data?.society.dairyId) {
            router.push(`/admin/dairy/${data.society.dairyId}`);
          }
        }}
        title="Navigate to Dairy Details"
        message={`View complete details of ${data?.society.dairyName} in the Dairy Management page.`}
        confirmText="Go to Dairy Details"
        cancelText="Cancel"
      />

      {/* BMC Navigation Confirmation Modal */}
      <NavigationConfirmModal
        isOpen={showBmcNavigateConfirm}
        onClose={() => setShowBmcNavigateConfirm(false)}
        onConfirm={() => {
          setShowBmcNavigateConfirm(false);
          if (data?.society.bmcId) {
            router.push(`/admin/bmc/${data.society.bmcId}`);
          }
        }}
        title="Navigate to BMC Details"
        message={`View complete details of ${data?.society.bmcName} in the BMC Management page.`}
        confirmText="Go to BMC Details"
        cancelText="Cancel"
      />

      {/* Delete Confirmation Modal with OTP */}
      <DeleteSocietyModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        societyName={data?.society.name || ''}
        loading={isDeleting}
      />
    </div>
  );
}
