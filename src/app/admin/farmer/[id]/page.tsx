'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { formatPhoneInput, validatePhoneOnBlur } from '@/lib/validation/phoneValidation';
import { validateEmailOnBlur, formatEmailInput } from '@/lib/validation/emailValidation';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  User, 
  Phone, 
  Mail,
  MapPin, 
  Building2, 
  CreditCard, 
  Users,
  Hash,
  MessageSquare,
  Coins,
  Info,
  FileText,
  TrendingUp,
  BarChart3,
  Calendar
} from 'lucide-react';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';

import FormGrid from '@/components/forms/FormGrid';
import { LoadingOverlay, PageLoader } from '@/components';
import StatusDropdown from '@/components/management/StatusDropdown';
import StatusMessage from '@/components/management/StatusMessage';
import { ConfirmDeleteModal } from '@/components/management';
import { useLanguage } from '@/contexts/LanguageContext';

interface Society {
  id: number;
  name: string;
}

interface Farmer {
  id: number;
  farmerId: string;
  farmeruid?: string;
  rfId?: string;
  farmerName: string;
  password?: string;
  contactNumber?: string;
  email?: string;
  smsEnabled: string;
  emailNotificationsEnabled?: string;
  bonus: number;
  address?: string;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  societyId?: number;
  societyName?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

interface CollectionStats {
  totalCollections: number;
  totalMilk: number;
  avgFat: number;
  avgSnf: number;
  avgRate: number;
  totalAmount: number;
  last30Days: number;
}

const FarmerDetails = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const farmerId = params?.id as string;
  const isEditMode = searchParams?.get('edit') === 'true';

  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [collectionStats, setCollectionStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    farmerId: '',
    farmeruid: '',
    rfId: '',
    farmerName: '',
    contactNumber: '',
    email: '',
    smsEnabled: 'OFF',
    emailNotificationsEnabled: 'ON',
    bonus: 0,
    address: '',
    bankName: '',
    bankAccountNumber: '',
    ifscCode: '',
    societyId: '',
    status: 'active',
    notes: ''
  });

  // Fetch farmer details
  const fetchFarmerDetailsCallback = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/farmer?id=${farmerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFarmer(data.data?.[0] || null);
      }
    } catch (error) {
      console.error('Error fetching farmer details:', error);
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  // Fetch collection statistics
  const fetchCollectionStats = useCallback(async () => {
    if (!farmer) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/reports/collections', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const allCollections = await response.json();
        
        // Filter collections for this specific farmer using farmer_id string
        const farmerCollections = allCollections.filter(
          (c: any) => c.farmer_id === farmer.farmerId
        );

        if (farmerCollections.length > 0) {
          const totalCollections = farmerCollections.length;
          const totalMilk = farmerCollections.reduce(
            (sum: number, c: any) => sum + parseFloat(c.quantity || 0), 
            0
          );
          const totalFat = farmerCollections.reduce(
            (sum: number, c: any) => sum + parseFloat(c.fat_percentage || 0), 
            0
          );
          const totalSnf = farmerCollections.reduce(
            (sum: number, c: any) => sum + parseFloat(c.snf_percentage || 0), 
            0
          );
          const totalRate = farmerCollections.reduce(
            (sum: number, c: any) => sum + parseFloat(c.rate_per_liter || 0), 
            0
          );
          const totalAmount = farmerCollections.reduce(
            (sum: number, c: any) => sum + parseFloat(c.total_amount || 0), 
            0
          );

          // Calculate last 30 days collections
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const last30Days = farmerCollections.filter((c: any) => {
            const collectionDate = new Date(c.collection_date);
            return collectionDate >= thirtyDaysAgo;
          }).length;

          setCollectionStats({
            totalCollections,
            totalMilk,
            avgFat: totalCollections > 0 ? totalFat / totalCollections : 0,
            avgSnf: totalCollections > 0 ? totalSnf / totalCollections : 0,
            avgRate: totalCollections > 0 ? totalRate / totalCollections : 0,
            totalAmount,
            last30Days
          });
        } else {
          // Set zero stats if no collections found for this farmer
          setCollectionStats({
            totalCollections: 0,
            totalMilk: 0,
            avgFat: 0,
            avgSnf: 0,
            avgRate: 0,
            totalAmount: 0,
            last30Days: 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching collection stats:', error);
      // Set zero stats on error
      setCollectionStats({
        totalCollections: 0,
        totalMilk: 0,
        avgFat: 0,
        avgSnf: 0,
        avgRate: 0,
        totalAmount: 0,
        last30Days: 0
      });
    }
  }, [farmer]);

  useEffect(() => {
    if (farmerId) {
      fetchFarmerDetailsCallback();
      fetchSocieties();
    }
  }, [farmerId, fetchFarmerDetailsCallback]);

  // Fetch collection stats after farmer data is loaded
  useEffect(() => {
    if (farmer) {
      fetchCollectionStats();
    }
  }, [farmer, fetchCollectionStats]);

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-dismiss error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Update form data when farmer changes
  useEffect(() => {
    if (farmer) {
      setFormData({
        farmerId: farmer.farmerId,
        farmeruid: farmer.farmeruid || '',
        rfId: farmer.rfId || '',
        farmerName: farmer.farmerName,
        contactNumber: farmer.contactNumber || '',
        email: farmer.email || '',
        smsEnabled: farmer.smsEnabled,
        emailNotificationsEnabled: farmer.emailNotificationsEnabled || 'ON',
        bonus: farmer.bonus,
        address: farmer.address || '',
        bankName: farmer.bankName || '',
        bankAccountNumber: farmer.bankAccountNumber || '',
        ifscCode: farmer.ifscCode || '',
        societyId: farmer.societyId?.toString() || '',
        status: farmer.status,
        notes: farmer.notes || ''
      });
    }
  }, [farmer]);



  const fetchSocieties = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/society', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSocieties(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching societies:', error);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (!farmer) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/farmer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: farmer.id,
          farmerId: farmer.farmerId,
          rfId: farmer.rfId,
          farmerName: farmer.farmerName,
          contactNumber: farmer.contactNumber,
          email: farmer.email,
          smsEnabled: farmer.smsEnabled,
          bonus: farmer.bonus,
          address: farmer.address,
          bankName: farmer.bankName,
          bankAccountNumber: farmer.bankAccountNumber,
          ifscCode: farmer.ifscCode,
          societyId: farmer.societyId,
          status: newStatus,
          notes: farmer.notes
        })
      });

      if (response.ok) {
        setFarmer(prev => prev ? { ...prev, status: newStatus } : null);
        setSuccess('Status updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to update status:', errorData);
        setError(errorData.message || errorData.error || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      setError(error?.message || 'Error updating status');
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!farmer) return;

    // Clear previous errors
    setError('');
    setFieldErrors({});

    // Validate phone number if provided
    if (formData.contactNumber && formData.contactNumber.trim() !== '') {
      const phoneError = validatePhoneOnBlur(formData.contactNumber);
      if (phoneError) {
        setFieldErrors({ contactNumber: phoneError });
        setError('Please correct the validation errors before saving');
        return;
      }
    }

    // Validate email if provided
    if (formData.email && formData.email.trim() !== '') {
      const emailError = validateEmailOnBlur(formData.email);
      if (emailError) {
        setFieldErrors({ email: emailError });
        setError('Please correct the validation errors before saving');
        return;
      }
    }

    // Validate required fields
    if (!formData.farmerName || formData.farmerName.trim() === '') {
      setFieldErrors({ farmerName: 'Farmer name is required' });
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/farmer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: farmer.id,
          farmerId: formData.farmerId,
          farmeruid: formData.farmeruid || null,
          rfId: formData.rfId || null,
          farmerName: formData.farmerName,
          contactNumber: formData.contactNumber || null,
          email: formData.email || null,
          smsEnabled: formData.smsEnabled,
          bonus: Number(formData.bonus),
          address: formData.address || null,
          bankName: formData.bankName || null,
          bankAccountNumber: formData.bankAccountNumber || null,
          ifscCode: formData.ifscCode || null,
          societyId: formData.societyId ? parseInt(formData.societyId) : null,
          status: formData.status,
          notes: formData.notes || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Farmer updated successfully:', data);
        setSuccess('Farmer details updated successfully!');
        setIsEditing(false);
        await fetchFarmerDetailsCallback();
        router.replace(`/admin/farmer/${farmerId}`);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || errorData.message || 'Failed to save farmer details';
        
        // Clear previous errors
        setFieldErrors({});
        setError('');
        
        // Check for specific field errors
        if (errorMessage.toLowerCase().includes('farmer id') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ farmerId: 'This Farmer ID already exists' });
        } else if (errorMessage.toLowerCase().includes('farmer name') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ farmerName: 'This Farmer Name already exists' });
        } else if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ email: 'This email address already exists' });
        } else {
          setError(errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Error saving farmer:', error);
      setError(error?.message || 'An error occurred while saving farmer details');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!farmer) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/farmer?id=${farmer.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Farmer deleted successfully!');
        // Wait a moment for user to see the message
        setTimeout(() => {
          router.push('/admin/farmer');
        }, 1000);
      } else {
        const errorData = await response.json();
        console.error('Failed to delete farmer:', errorData);
        setError(errorData.message || errorData.error || 'Failed to delete farmer');
      }
    } catch (error: any) {
      console.error('Error deleting farmer:', error);
      setError(error?.message || 'An error occurred while deleting farmer');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'details', label: 'Details', icon: FileText }
  ];

  if (loading) {
    return <PageLoader />;
  }

  if (!farmer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Farmer Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The requested farmer could not be found.
          </p>
          <button
            onClick={() => router.push('/admin/farmer')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Farmers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Status Messages */}
      <StatusMessage
        success={success}
        error={error}
        onClose={() => {
          setSuccess('');
          setError('');
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/farmer')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {farmer.farmerName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              ID: {farmer.farmerId}
            </p>
          </div>
        </div>

        {activeTab === 'details' && (
          <div className="flex items-center gap-3">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    router.replace(`/admin/farmer/${farmerId}`);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
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

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Collection Statistics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Collection Statistics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Collections</span>
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {collectionStats?.totalCollections || 0}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Total Milk (L)</span>
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {collectionStats?.totalMilk?.toFixed(2) || '0.00'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Amount (₹)</span>
                    <Coins className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    ₹{collectionStats?.totalAmount?.toFixed(2) || '0.00'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Avg Fat %</span>
                    <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {collectionStats?.avgFat?.toFixed(2) || '0.00'}%
                  </p>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Avg SNF %</span>
                    <BarChart3 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                    {collectionStats?.avgSnf?.toFixed(2) || '0.00'}%
                  </p>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg p-4 border border-pink-200 dark:border-pink-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-pink-700 dark:text-pink-300">Avg Rate (₹/L)</span>
                    <TrendingUp className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">
                    ₹{collectionStats?.avgRate?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            {/* Farmer Information Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Farmer Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Hash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Farmer ID</p>
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{farmer.farmerId}</p>
                    </div>
                  </div>
                </div>

                {farmer.rfId && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Hash className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">RF-ID</p>
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{farmer.rfId}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Farmer Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{farmer.farmerName}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Contact Number</p>
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{farmer.contactNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Society</p>
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{farmer.societyName || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Bonus</p>
                      <p className="font-semibold text-gray-900 dark:text-white truncate">₹{farmer.bonus}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Account Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Created At</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(farmer.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {farmer.updatedAt && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Last Updated</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {new Date(farmer.updatedAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">SMS Enabled</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{farmer.smsEnabled}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Basic Details Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Basic Details
              </h3>
              {isEditing ? (
                <FormGrid>
                  <FormInput
                    label="Farmer ID"
                    type="text"
                    value={formData.farmerId}
                    onChange={(value) => setFormData({ ...formData, farmerId: value })}
                    required
                    readOnly
                  />
                  <FormInput
                    label="Farmer UID"
                    type="text"
                    value={formData.farmeruid}
                    onChange={(value) => {
                      let alphanumeric = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                      alphanumeric = alphanumeric.slice(0, 8);
                      let formatted = '';
                      if (alphanumeric.length > 0) {
                        formatted = alphanumeric.slice(0, 4);
                        if (alphanumeric.length > 4) {
                          formatted += '-' + alphanumeric.slice(4, 8);
                        }
                      }
                      setFormData({ ...formData, farmeruid: formatted });
                    }}
                    placeholder="e.g., VLDD-1234"
                    maxLength={9}
                  />
                  <FormInput
                    label="RF-ID"
                    type="text"
                    value={formData.rfId}
                    onChange={(value) => setFormData({ ...formData, rfId: value })}
                  />
                  <FormInput
                    label="Farmer Name"
                    type="text"
                    value={formData.farmerName}
                    onChange={(value) => {
                      setFormData({ ...formData, farmerName: value });
                      if (fieldErrors.farmerName) {
                        setFieldErrors({ ...fieldErrors, farmerName: '' });
                      }
                    }}
                    required
                    error={fieldErrors.farmerName}
                  />
                  <FormSelect
                    label="Status"
                    value={formData.status}
                    onChange={(value) => setFormData({ ...formData, status: value })}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                      { value: 'suspended', label: 'Suspended' },
                      { value: 'maintenance', label: 'Maintenance' }
                    ]}
                  />
                </FormGrid>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Hash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Farmer ID</p>
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{farmer.farmerId}</p>
                      </div>
                    </div>
                  </div>
                  
                  {farmer.farmeruid && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Hash className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Farmer UID</p>
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{farmer.farmeruid}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {farmer.rfId && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <Hash className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">RF-ID</p>
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{farmer.rfId}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Farmer Name</p>
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{farmer.farmerName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Bonus</p>
                        <p className="font-semibold text-gray-900 dark:text-white truncate">₹{farmer.bonus}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact & Society Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Contact & Society Information
              </h3>
            
            {isEditing ? (
              <div className="space-y-4">
                <FormGrid>
                  <FormInput
                    label="Contact Number"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(value) => {
                      const formatted = formatPhoneInput(value);
                      setFormData({ ...formData, contactNumber: formatted });
                      // Clear error when user types
                      if (fieldErrors.contactNumber) {
                        setFieldErrors({ ...fieldErrors, contactNumber: '' });
                      }
                    }}
                    onBlur={() => {
                      const validationError = validatePhoneOnBlur(formData.contactNumber);
                      if (validationError) {
                        setFieldErrors({ ...fieldErrors, contactNumber: validationError });
                      } else {
                        setFieldErrors({ ...fieldErrors, contactNumber: '' });
                      }
                    }}
                    error={fieldErrors.contactNumber}
                  />
                  <FormInput
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(value) => {
                      setFormData({ ...formData, email: value });
                      // Clear error when user types
                      if (fieldErrors.email) {
                        setFieldErrors({ ...fieldErrors, email: '' });
                      }
                    }}
                    onBlur={() => {
                      const validationError = validateEmailOnBlur(formData.email);
                      if (validationError) {
                        setFieldErrors({ ...fieldErrors, email: validationError });
                      } else {
                        setFieldErrors({ ...fieldErrors, email: '' });
                      }
                    }}
                    error={fieldErrors.email}
                  />
                  <FormSelect
                    label="SMS Enabled"
                    value={formData.smsEnabled}
                    onChange={(value) => setFormData({ ...formData, smsEnabled: value })}
                    options={[
                      { value: 'OFF', label: 'OFF' },
                      { value: 'ON', label: 'ON' }
                    ]}
                  />
                  <FormSelect
                    label="Email Notifications"
                    value={formData.emailNotificationsEnabled}
                    onChange={(value) => setFormData({ ...formData, emailNotificationsEnabled: value })}
                    options={[
                      { value: 'OFF', label: 'OFF' },
                      { value: 'ON', label: 'ON' }
                    ]}
                  />
                  <FormSelect
                    label="Society"
                    value={formData.societyId}
                    onChange={(value) => setFormData({ ...formData, societyId: value })}
                    options={[
                      { value: '', label: 'Select Society' },
                      ...societies.map(society => ({
                        value: society.id.toString(),
                        label: society.name
                      }))
                    ]}
                  />
                </FormGrid>
                <FormTextarea
                  label="Address"
                  value={formData.address}
                  onChange={(value) => setFormData({ ...formData, address: value })}
                  rows={3}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Contact Number</p>
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {farmer.contactNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {farmer.email && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                          <Mail className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Email</p>
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {farmer.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">SMS Enabled</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{farmer.smsEnabled}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Society</p>
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {farmer.societyName || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {farmer.address && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                        <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Address</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white whitespace-pre-line">
                          {farmer.address}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>

            {/* Banking Details Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Banking Details
              </h3>
            
            {isEditing ? (
              <FormGrid>
                <FormInput
                  label="Bank Name"
                  type="text"
                  value={formData.bankName}
                  onChange={(value) => setFormData({ ...formData, bankName: value })}
                />
                <FormInput
                  label="Account Number"
                  type="number"
                  value={formData.bankAccountNumber}
                  onChange={(value) => {
                    // Only allow numbers
                    const numericValue = value.replace(/\D/g, '');
                    setFormData({ ...formData, bankAccountNumber: numericValue });
                  }}
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
                <FormInput
                  label="IFSC Code"
                  type="text"
                  value={formData.ifscCode}
                  onChange={(value) => setFormData({ ...formData, ifscCode: value })}
                />
                <FormInput
                  label="Bonus"
                  type="number"
                  value={formData.bonus}
                  onChange={(value) => setFormData({ ...formData, bonus: Number(value) })}
                />
              </FormGrid>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Bank Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {farmer.bankName || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Account Number</p>
                      <p className="font-semibold text-gray-900 dark:text-white font-mono truncate">
                        {farmer.bankAccountNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Hash className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">IFSC Code</p>
                      <p className="font-semibold text-gray-900 dark:text-white font-mono truncate">
                        {farmer.ifscCode || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Bonus Amount</p>
                      <p className="font-semibold text-gray-900 dark:text-white">₹{farmer.bonus}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* Additional Information Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Additional Information
              </h3>
            
            {isEditing ? (
              <FormTextarea
                label={t.farmerManagement.notes}
                value={formData.notes}
                onChange={(value) => setFormData({ ...formData, notes: value })}
                rows={4}
                placeholder={t.farmerManagement.addAdditionalNotes}
              />
            ) : (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t.farmerManagement.notes}</p>
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-line">
                        {farmer.notes || t.farmerManagement.noNotesAvailable}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Created At</p>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {new Date(farmer.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {farmer.updatedAt && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Last Updated</p>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {new Date(farmer.updatedAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </div>

      {saving && <LoadingOverlay isLoading={true} />}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Farmer"
        message={
          farmer 
            ? `Are you sure you want to delete farmer "${farmer.farmerName}" (${farmer.farmerId})? This action cannot be undone.`
            : 'Are you sure you want to delete this farmer? This action cannot be undone.'
        }
        itemName={farmer?.farmerName || 'this farmer'}
      />
    </div>
  );
};

export default FarmerDetails;