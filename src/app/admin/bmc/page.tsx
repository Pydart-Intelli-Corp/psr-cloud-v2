'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPhoneInput, validatePhoneOnBlur } from '@/lib/validation/phoneValidation';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { 
  Factory, 
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Activity,
  Building2,
  Milk,
  Save,
  Edit3,
  Trash2,
  Users,
  TrendingUp,
  Award,
  Droplets,
  Eye,
  EyeOff,
  Plus,
  BarChart3,
  X,
  ExternalLink
} from 'lucide-react';
import { 
  PageLoader,
  FlowerSpinner, 
  LoadingSpinner,
  FormModal, 
  FormInput, 
  FormSelect, 
  FormActions, 
  FormGrid,
  PageHeader,
  StatusMessage,
  StatsCard,
  FilterControls,
  EmptyState,
  StatusDropdown
} from '@/components';
import FloatingActionButton from '@/components/management/FloatingActionButton';
import NavigationConfirmModal from '@/components/NavigationConfirmModal';
import TransferSocietiesModal from '@/components/modals/TransferSocietiesModal';
import DeleteBMCModal from '@/components/modals/DeleteBMCModal';

interface BMC {
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
  monthlyTarget?: number;
  createdAt: string;
  lastActivity?: string;
  societyCount?: number;
  totalCollections30d?: number;
  totalQuantity30d?: number;
  totalAmount30d?: number;
  weightedFat30d?: number;
  weightedSnf30d?: number;
  weightedClr30d?: number;
  weightedWater30d?: number;
}

interface BMCFormData {
  name: string;
  bmcId: string;
  password: string;
  dairyFarmId: string;
  location: string;
  contactPerson: string;
  phone: string;
  email: string;
  capacity: string;
  status: 'active' | 'inactive' | 'maintenance';
  monthlyTarget: string;
}

const initialFormData: BMCFormData = {
  name: '',
  bmcId: '',
  password: '',
  dairyFarmId: '',
  location: '',
  contactPerson: '',
  phone: '',
  email: '',
  capacity: '',
  status: 'active',
  monthlyTarget: ''
};

interface Dairy {
  id: number;
  name: string;
  dairyId: string;
}

// Helper function to highlight matching text in search results
const highlightText = (text: string | number | null | undefined, searchQuery: string) => {
  if (!text && text !== 0) return text || '';
  if (!searchQuery) return text;
  
  const textStr = text.toString();
  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = textStr.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <span key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
        {part}
      </span>
    ) : (
      part
    )
  );
};

export default function BMCManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { t } = useLanguage();
  
  // State management
  const [bmcs, setBMCs] = useState<BMC[]>([]);
  const [dairies, setDairies] = useState<Dairy[]>([]);
  const [loading, setLoading] = useState(true);
  const [dairiesLoading, setDairiesLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [societies, setSocieties] = useState<any[]>([]);
  const [availableBMCs, setAvailableBMCs] = useState<BMC[]>([]);
  const [selectedBMC, setSelectedBMC] = useState<BMC | null>(null);
  const [formData, setFormData] = useState<BMCFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [dairyFilter, setDairyFilter] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ 
    bmcId?: string; 
    name?: string;
    phone?: string;
  }>({});
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [graphMetric, setGraphMetric] = useState<'quantity' | 'revenue' | 'fat' | 'snf' | 'collections' | 'water'>('quantity');
  const [showSocietiesAlert, setShowSocietiesAlert] = useState(false);
  const [bmcForNavigation, setBmcForNavigation] = useState<BMC | null>(null);

  // Fetch dairies for dropdown
  const fetchDairies = useCallback(async () => {
    try {
      setDairiesLoading(true);
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
        setDairies(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching dairies:', error);
    } finally {
      setDairiesLoading(false);
    }
  }, []);

  // Fetch BMCs
  const fetchBMCs = useCallback(async () => {
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
        throw new Error('Failed to fetch BMCs');
      }

      const result = await response.json();
      setBMCs(result.data || []);
    } catch (error) {
      console.error('Error fetching BMCs:', error);
      setError('Failed to load BMC data');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Handle Add BMC button click with validation
  const handleAddBMCClick = () => {
    if (dairies.length === 0) {
      setError('Please add a dairy farm first before adding BMC');
      setTimeout(() => setError(''), 5000);
      return;
    }
    setError('');
    setShowAddForm(true);
  };

  // Add new BMC
  const handleAddBMC = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    // Validate required fields
    if (!formData.dairyFarmId) {
      setError('Please select a dairy farm');
      setFormLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/bmc', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          dairyFarmId: parseInt(formData.dairyFarmId),
          capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
          monthlyTarget: formData.monthlyTarget ? parseInt(formData.monthlyTarget) : undefined
        })
      });

      if (response.ok) {
        setSuccess('BMC added successfully!');
        setShowAddForm(false);
        setFormData(initialFormData);
        await fetchBMCs();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || 'Failed to add BMC';
        
        // Clear previous field errors
        setFieldErrors({});
        
        // Check for specific field errors
        if (errorMessage.toLowerCase().includes('bmc id') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ bmcId: 'This BMC ID already exists' });
        } else if (errorMessage.toLowerCase().includes('bmc name') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ name: 'This BMC name already exists' });
        } else {
          setError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error adding BMC:', error);
      setError('Failed to add BMC');
    } finally {
      setFormLoading(false);
    }
  };

  // Open edit modal
  const handleEditClick = async (bmc: BMC) => {
    setSelectedBMC(bmc);
    setShowPassword(false);
    setCurrentPassword('');
    
    // Fetch current password
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/bmc/password?id=${bmc.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const fetchedPassword = result.data?.password || result.password || '';
        setCurrentPassword(fetchedPassword);
        
        setFormData({
          name: bmc.name,
          bmcId: bmc.bmcId,
          password: fetchedPassword,
          dairyFarmId: bmc.dairyFarmId?.toString() || '',
          location: bmc.location || '',
          contactPerson: bmc.contactPerson || '',
          phone: bmc.phone || '',
          email: bmc.email || '',
          capacity: bmc.capacity?.toString() || '',
          status: bmc.status || 'active',
          monthlyTarget: bmc.monthlyTarget?.toString() || ''
        });
      } else {
        setFormData({
          name: bmc.name,
          bmcId: bmc.bmcId,
          password: '',
          dairyFarmId: bmc.dairyFarmId?.toString() || '',
          location: bmc.location || '',
          contactPerson: bmc.contactPerson || '',
          phone: bmc.phone || '',
          email: bmc.email || '',
          capacity: bmc.capacity?.toString() || '',
          status: bmc.status || 'active',
          monthlyTarget: bmc.monthlyTarget?.toString() || ''
        });
      }
    } catch (error) {
      console.error('Error fetching password:', error);
      setFormData({
        name: bmc.name,
        bmcId: bmc.bmcId,
        password: '',
        dairyFarmId: bmc.dairyFarmId?.toString() || '',
        location: bmc.location || '',
        contactPerson: bmc.contactPerson || '',
        phone: bmc.phone || '',
        email: bmc.email || '',
        capacity: bmc.capacity?.toString() || '',
        status: bmc.status || 'active',
        monthlyTarget: bmc.monthlyTarget?.toString() || ''
      });
    }
    
    setShowEditForm(true);
  };

  // Update BMC
  const handleUpdateBMC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBMC) return;

    setFormLoading(true);
    setError('');

    // Validate required fields
    if (!formData.dairyFarmId) {
      setError('Please select a dairy farm');
      setFormLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const updateData: Record<string, string | number | undefined> = {
        id: selectedBMC.id,
        name: formData.name,
        dairyFarmId: parseInt(formData.dairyFarmId),
        location: formData.location,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        status: formData.status,
        monthlyTarget: formData.monthlyTarget ? parseInt(formData.monthlyTarget) : undefined
      };

      // Only include password if it was changed from the original
      if (formData.password && formData.password !== currentPassword) {
        updateData.password = formData.password;
      }

      const response = await fetch('/api/user/bmc', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setSuccess('BMC updated successfully!');
        setShowEditForm(false);
        setSelectedBMC(null);
        setFormData(initialFormData);
        await fetchBMCs();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || 'Failed to update BMC';
        
        // Clear previous field errors
        setFieldErrors({});
        
        // Check for specific field errors
        if (errorMessage.toLowerCase().includes('bmc name') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ name: 'This BMC name already exists' });
        } else {
          setError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error updating BMC:', error);
      setError('Failed to update BMC');
    } finally {
      setFormLoading(false);
    }
  };

  // Update BMC status
  const handleStatusChange = async (bmc: BMC, newStatus: 'active' | 'inactive' | 'maintenance') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/bmc', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: bmc.id,
          status: newStatus
        })
      });

      if (response.ok) {
        setSuccess(`Status updated to ${newStatus}!`);
        await fetchBMCs();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    }
  };

  // Open delete confirmation modal
  const handleDeleteClick = async (bmc: BMC) => {
    setSelectedBMC(bmc);
    
    // Fetch societies for this BMC
    const bmcSocieties = await fetchSocietiesForBMC(bmc.id);
    
    if (bmcSocieties.length > 0) {
      // Has societies - show transfer modal
      setSocieties(bmcSocieties);
      const otherBMCs = bmcs.filter(b => b.id !== bmc.id);
      setAvailableBMCs(otherBMCs);
      setShowTransferModal(true);
    } else {
      // No societies - store BMC ID for OTP modal and show delete modal
      (window as any).selectedBmcIdForDelete = bmc.id;
      setShowDeleteModal(true);
    }
  };

  // Fetch societies under a specific BMC
  const fetchSocietiesForBMC = async (bmcId: number) => {
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
        const bmcSocieties = result.data?.filter((s: any) => s.bmc_id === bmcId) || [];
        return bmcSocieties;
      }
    } catch (error) {
      console.error('Error fetching societies:', error);
    }
    return [];
  };

  // Delete BMC (no societies) with OTP verification
  const handleConfirmDelete = async (otp: string) => {
    if (!selectedBMC) return;

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
          id: selectedBMC.id,
          otp
        })
      });

      if (response.ok) {
        setSuccess('BMC deleted successfully!');
        setShowDeleteModal(false);
        setSelectedBMC(null);
        await fetchBMCs();
        setTimeout(() => setSuccess(''), 3000);
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

  // Handle transfer and delete
  const handleTransferAndDelete = async (newBmcId: number | null, deleteAll: boolean, otp?: string) => {
    if (!selectedBMC) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/bmc', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: selectedBMC.id,
          newBmcId,
          deleteAll,
          otp
        })
      });

      const result = await response.json();

      if (response.ok) {
        setShowTransferModal(false);
        setSelectedBMC(null);
        if (deleteAll) {
          setSuccess('All data deleted successfully!');
        } else {
          setSuccess(`Transferred ${result.data?.transferredSocieties || 0} societies and deleted BMC successfully!`);
        }
        await fetchBMCs();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to delete BMC');
      }
    } catch (error) {
      console.error('Error deleting BMC:', error);
      setError('Failed to delete BMC');
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof BMCFormData, value: string) => {
    if (field === 'bmcId' && !showEditForm) {
      const cleanValue = value.replace(/^B-/i, '');
      value = `B-${cleanValue}`;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Filter BMCs
  const filteredBMCs = bmcs.filter(bmc => {
    const matchesSearch = searchQuery === '' ||
                         bmc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bmc.bmcId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bmc.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bmc.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bmc.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bmc.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bmc.dairyFarmName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || bmc.status === statusFilter;
    
    const matchesDairy = dairyFilter.length === 0 || dairyFilter.includes(bmc.dairyFarmId?.toString() || '');
    
    return matchesSearch && matchesStatus && matchesDairy;
  });

  useEffect(() => {
    fetchBMCs();
    fetchDairies();
  }, [fetchBMCs, fetchDairies]);

  // Listen for global search events from header
  useEffect(() => {
    const handleGlobalSearch = (event: Event) => {
      const customEvent = event as CustomEvent;
      const query = customEvent.detail?.query || '';
      setSearchQuery(query);
    };
    window.addEventListener('globalSearch', handleGlobalSearch);
    return () => window.removeEventListener('globalSearch', handleGlobalSearch);
  }, []);

  // Handle URL parameters for dairy filter
  useEffect(() => {
    const dairyFilterParam = searchParams.get('dairyFilter');
    if (dairyFilterParam && dairies.length > 0) {
      setDairyFilter([dairyFilterParam]);
    }
  }, [searchParams, dairies]);

  if (!user) {
    return <PageLoader />;
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:pb-8">
        {/* Page Header */}
        <PageHeader
          title="BMC Management"
          subtitle="Manage your Bulk Milk Cooling Centers"
          icon={<Factory className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
          onRefresh={fetchBMCs}
        />

        {/* Success/Error Messages */}
        <StatusMessage 
          success={success} 
          error={error && !error.includes('dairy farm first') ? error : undefined}
        />
        
        {/* Custom Error Message for Dairy Dependency */}
        {error && error.includes('dairy farm first') && (
          <StatusMessage 
            error={error}
          />
        )}

        {/* Top Performers Section */}
        {bmcs.length > 0 && (() => {
          const bmcsWithStats = bmcs.filter(b => b.totalQuantity30d && Number(b.totalQuantity30d) > 0);
          
          if (bmcsWithStats.length === 0) return null;

          const topCollection = [...bmcsWithStats].sort((a, b) => 
            Number(b.totalQuantity30d || 0) - Number(a.totalQuantity30d || 0)
          )[0];
          
          const topRevenue = [...bmcsWithStats].sort((a, b) => 
            Number(b.totalAmount30d || 0) - Number(a.totalAmount30d || 0)
          )[0];
          
          const topFat = [...bmcsWithStats].sort((a, b) => 
            Number(b.weightedFat30d || 0) - Number(a.weightedFat30d || 0)
          )[0];
          
          const topSnf = [...bmcsWithStats].sort((a, b) => 
            Number(b.weightedSnf30d || 0) - Number(a.weightedSnf30d || 0)
          )[0];
          
          const mostCollections = [...bmcsWithStats].sort((a, b) => 
            Number(b.totalCollections30d || 0) - Number(a.totalCollections30d || 0)
          )[0];
          
          const leastWater = [...bmcsWithStats].sort((a, b) => 
            Number(a.weightedWater30d || 100) - Number(b.weightedWater30d || 100)
          )[0];

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
              {topCollection && (
                <div 
                  className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setGraphMetric('quantity');
                    setShowGraphModal(true);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">Top Collection (30d)</h3>
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-lg font-bold text-green-800 dark:text-green-200">{topCollection.name}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">{Number(topCollection.totalQuantity30d || 0).toFixed(2)} L</p>
                </div>
              )}
              
              {topRevenue && (
                <div 
                  className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setGraphMetric('revenue');
                    setShowGraphModal(true);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Top Revenue (30d)</h3>
                    <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-lg font-bold text-blue-800 dark:text-blue-200">{topRevenue.name}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">₹{Number(topRevenue.totalAmount30d || 0).toFixed(2)}</p>
                </div>
              )}
              
              {topFat && (
                <div 
                  className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setGraphMetric('fat');
                    setShowGraphModal(true);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">Best Quality (30d)</h3>
                    <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-lg font-bold text-purple-800 dark:text-purple-200">{topFat.name}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">{Number(topFat.weightedFat30d || 0).toFixed(2)}% Fat</p>
                </div>
              )}
              
              {topSnf && (
                <div 
                  className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setGraphMetric('snf');
                    setShowGraphModal(true);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-100">Best SNF (30d)</h3>
                    <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-lg font-bold text-orange-800 dark:text-orange-200">{topSnf.name}</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">{Number(topSnf.weightedSnf30d || 0).toFixed(2)}% SNF</p>
                </div>
              )}
              
              {mostCollections && (
                <div 
                  className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-4 rounded-lg border border-pink-200 dark:border-pink-700 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setGraphMetric('collections');
                    setShowGraphModal(true);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-pink-900 dark:text-pink-100">Most Active (30d)</h3>
                    <Award className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <p className="text-lg font-bold text-pink-800 dark:text-pink-200">{mostCollections.name}</p>
                  <p className="text-sm text-pink-600 dark:text-pink-400">{Number(mostCollections.totalCollections30d || 0)} Collections</p>
                </div>
              )}
              
              {leastWater && (
                <div 
                  className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg border border-red-200 dark:border-red-700 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setGraphMetric('water');
                    setShowGraphModal(true);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">Most Water (30d)</h3>
                    <Droplets className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-lg font-bold text-red-800 dark:text-red-200">{leastWater.name}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{Number(leastWater.weightedWater30d || 0).toFixed(2)}% Water</p>
                </div>
              )}
            </div>
          );
        })()}

        {/* Stats Cards removed per request */}

        {/* Filter Controls */}
        <FilterControls
          icon={<Building2 className="w-4 h-4 flex-shrink-0" />}
          showingText={`Showing ${filteredBMCs.length} of ${bmcs.length} BMCs`}
          filterLabel="Filter:"
          filterValue={statusFilter}
          filterOptions={[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'maintenance', label: 'Maintenance' }
          ]}
          onFilterChange={(value) => setStatusFilter(value as typeof statusFilter)}
        />

        {/* Main Content */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredBMCs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredBMCs.map((bmc) => (
              <div key={bmc.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-visible border border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700 relative z-10 hover:z-20">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex-shrink-0">
                        <Factory className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{highlightText(bmc.name, searchQuery)}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{highlightText(bmc.bmcId, searchQuery)}</p>
                      </div>
                    </div>
                    <StatusDropdown
                      currentStatus={bmc.status}
                      onStatusChange={(status) => handleStatusChange(bmc, status as 'active' | 'inactive' | 'maintenance')}
                      options={[
                        {
                          status: 'active',
                          label: 'Active',
                          color: 'bg-green-500',
                          bgColor: 'hover:bg-green-50 dark:hover:bg-green-900/30'
                        },
                        {
                          status: 'inactive',
                          label: 'Inactive',
                          color: 'bg-red-500',
                          bgColor: 'hover:bg-red-50 dark:hover:bg-red-900/30'
                        },
                        {
                          status: 'maintenance',
                          label: 'Maintenance',
                          color: 'bg-yellow-500',
                          bgColor: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
                        }
                      ]}
                      compact={true}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Basic Info - Two Columns */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{highlightText(bmc.contactPerson || 'No Contact', searchQuery)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{highlightText(bmc.phone || 'No Phone', searchQuery)}</span>
                    </div>
                  </div>

                  {/* Location & Dairy - Two Columns */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{highlightText(bmc.location || 'No Location', searchQuery)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Milk className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate">{highlightText(bmc.dairyFarmName || 'No Dairy', searchQuery)}</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>

                  {/* 30-Day Statistics Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Last 30 Days</span>
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>

                  {/* Collections & Quantity */}
                  <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Collections</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{Number(bmc.totalCollections30d || 0)}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{Number(bmc.totalQuantity30d || 0).toFixed(2)} Liters</div>
                    </div>
                  </div>

                  {/* Quality Metrics - Three Columns */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Fat</div>
                      <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{Number(bmc.weightedFat30d || 0).toFixed(2)}%</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">SNF</div>
                      <div className="text-sm font-bold text-purple-600 dark:text-purple-400">{Number(bmc.weightedSnf30d || 0).toFixed(2)}%</div>
                    </div>
                    <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">CLR</div>
                      <div className="text-sm font-bold text-pink-600 dark:text-pink-400">{Number(bmc.weightedClr30d || 0).toFixed(1)}</div>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Revenue</span>
                    </div>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{Number(bmc.totalAmount30d || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 rounded-b-lg">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(bmc)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(bmc)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Right side actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setBmcForNavigation(bmc);
                        setShowSocietiesAlert(true);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                      title={`View ${bmc.societyCount || 0} societies under ${bmc.name}`}
                    >
                      <Building2 className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium transition-colors">
                        {bmc.societyCount || 0} Societies
                      </span>
                    </button>
                    
                    <button
                      onClick={() => router.push(`/admin/bmc/${bmc.id}`)}
                      className="flex items-center px-3 py-1.5 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Factory className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />}
            title="No BMCs found"
            message={statusFilter === 'all' ? 'Get started by adding your first BMC' : 'Try changing the filter to see more results'}
            actionText={statusFilter === 'all' ? 'Add Your First BMC' : undefined}
            onAction={statusFilter === 'all' ? handleAddBMCClick : undefined}
            showAction={statusFilter === 'all'}
          />
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={[
          {
            icon: <Plus className="w-6 h-6 text-white" />,
            label: 'Add BMC',
            onClick: () => {
              setFieldErrors({});
              setError('');
              setShowAddForm(true);
              fetchDairies();
            },
            color: 'bg-gradient-to-br from-green-500 to-green-600'
          }
        ]}
        directClick={true}
      />

      {/* Add BMC Modal - Positioned outside main container */}
      <FormModal
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setFormData(initialFormData);
        }}
        title={t.bmcManagement.addBMC}
        maxWidth="lg"
      >
        <form onSubmit={handleAddBMC} className="space-y-4 sm:space-y-6">
          <FormGrid>
            {/* Mandatory Fields First */}
            <FormInput
              label="BMC Name"
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              placeholder="Enter BMC name"
              required
              error={fieldErrors.name}
              colSpan={1}
            />

            <FormInput
              label="BMC ID"
              value={formData.bmcId}
              onChange={(value) => handleInputChange('bmcId', value)}
              placeholder="B-001"
              required
              disabled={showEditForm}
              error={fieldErrors.bmcId}
              colSpan={1}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showAddPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter password"
                  required={!showEditForm}
                  className="form-input-custom w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowAddPassword(!showAddPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  title={showAddPassword ? 'Hide password' : 'Show password'}
                >
                  {showAddPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <FormSelect
              label="Dairy Farm"
              value={formData.dairyFarmId}
              onChange={(value) => handleInputChange('dairyFarmId', value)}
              options={dairies.map(dairy => ({ 
                value: dairy.id, 
                label: `${dairy.name} (${dairy.dairyId})` 
              }))}
              placeholder="Select dairy farm"
              required
              disabled={dairiesLoading}
              colSpan={1}
            />

            {/* Optional Fields */}
            <FormInput
              label="Capacity (Liters)"
              type="number"
              value={formData.capacity}
              onChange={(value) => handleInputChange('capacity', value)}
              placeholder="2000"
              colSpan={1}
            />

            <FormInput
              label="Monthly Target (Liters)"
              type="number"
              value={formData.monthlyTarget}
              onChange={(value) => handleInputChange('monthlyTarget', value)}
              placeholder="2000"
              colSpan={1}
            />

            <FormInput
              label="Contact Person"
              value={formData.contactPerson}
              onChange={(value) => handleInputChange('contactPerson', value)}
              placeholder="Enter contact person"
              colSpan={1}
            />

            <FormInput
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(value) => {
                const formatted = formatPhoneInput(value);
                handleInputChange('phone', formatted);
              }}
              onBlur={() => {
                const error = validatePhoneOnBlur(formData.phone);
                if (error) {
                  setFieldErrors(prev => ({ ...prev, phone: error }));
                } else {
                  setFieldErrors(prev => ({ ...prev, phone: undefined }));
                }
              }}
              placeholder="Enter 10-digit phone number"
              error={fieldErrors.phone}
              colSpan={1}
            />

            <FormInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              placeholder="bmc@example.com"
              colSpan={1}
            />

            <FormSelect
              label="Status"
              value={formData.status}
              onChange={(value) => handleInputChange('status', value)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'maintenance', label: 'Maintenance' }
              ]}
              colSpan={1}
            />

            <FormInput
              label="Location"
              value={formData.location}
              onChange={(value) => handleInputChange('location', value)}
              placeholder="Enter location"
              colSpan={2}
            />
          </FormGrid>

          <FormActions
            onCancel={() => {
              setShowAddForm(false);
              setFormData(initialFormData);
            }}
            submitText={t.bmcManagement.addBMC}
            isLoading={formLoading}
            cancelText={t.common.cancel}
          />
        </form>
      </FormModal>

      {/* Edit BMC Modal */}
      <FormModal
        isOpen={showEditForm && !!selectedBMC}
        onClose={() => {
          setShowEditForm(false);
          setSelectedBMC(null);
          setFormData(initialFormData);
        }}
        title={selectedBMC ? `${t.common.edit} ${selectedBMC.name}` : t.common.edit}
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateBMC} className="space-y-4 sm:space-y-6">
          <FormGrid>
            {/* Mandatory Fields First */}
            <FormInput
              label={`${t.bmcManagement.bmcName}`}
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              placeholder={t.bmcManagement.enterBMCName}
              required
              error={fieldErrors.name}
              colSpan={1}
            />

            <FormInput
              label={`${t.bmcManagement.bmcId} (Read-only)`}
              value={formData.bmcId}
              onChange={() => {}} 
              readOnly
              disabled
              colSpan={1}
            />

            <FormSelect
              label={`${t.bmcManagement.dairyFarm}`}
              value={formData.dairyFarmId}
              onChange={(value) => handleInputChange('dairyFarmId', value)}
              options={dairies.map(dairy => ({ 
                value: dairy.id, 
                label: `${dairy.name} (${dairy.dairyId})` 
              }))}
              placeholder="Select dairy farm"
              required
              disabled={dairiesLoading}
              colSpan={2}
            />

            {/* Optional Fields */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
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

            <FormInput
              label={t.bmcManagement.capacity}
              type="number"
              value={formData.capacity}
              onChange={(value) => handleInputChange('capacity', value)}
              placeholder={t.bmcManagement.enterCapacity}
              colSpan={1}
            />

            <FormInput
              label={t.bmcManagement.monthlyTarget}
              type="number"
              value={formData.monthlyTarget}
              onChange={(value) => handleInputChange('monthlyTarget', value)}
              placeholder={t.bmcManagement.enterMonthlyTarget}
              colSpan={1}
            />

            <FormInput
              label={t.bmcManagement.contactPerson}
              value={formData.contactPerson}
              onChange={(value) => handleInputChange('contactPerson', value)}
              placeholder={t.bmcManagement.enterContactPerson}
              colSpan={1}
            />

            <FormInput
              label={t.bmcManagement.phone}
              type="tel"
              value={formData.phone}
              onChange={(value) => {
                const formatted = formatPhoneInput(value);
                handleInputChange('phone', formatted);
              }}
              onBlur={() => {
                const error = validatePhoneOnBlur(formData.phone);
                if (error) {
                  setFieldErrors(prev => ({ ...prev, phone: error }));
                } else {
                  setFieldErrors(prev => ({ ...prev, phone: undefined }));
                }
              }}
              placeholder={t.bmcManagement.enterPhoneNumber}
              error={fieldErrors.phone}
              colSpan={1}
            />

            <FormInput
              label={t.bmcManagement.email}
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              placeholder={t.bmcManagement.enterEmail}
              colSpan={1}
            />

            <FormSelect
              label={t.bmcManagement.status}
              value={formData.status}
              onChange={(value) => handleInputChange('status', value)}
              options={[
                { value: 'active', label: t.bmcManagement.active },
                { value: 'inactive', label: t.bmcManagement.inactive },
                { value: 'maintenance', label: t.bmcManagement.maintenance }
              ]}
              colSpan={1}
            />

            <FormInput
              label={t.bmcManagement.location}
              value={formData.location}
              onChange={(value) => handleInputChange('location', value)}
              placeholder={t.bmcManagement.enterLocation}
              colSpan={2}
            />
          </FormGrid>

          <FormActions
            onCancel={() => {
              setShowEditForm(false);
              setSelectedBMC(null);
              setFormData(initialFormData);
            }}
            submitText={t.bmcManagement.updateBMC}
            isLoading={formLoading}
            cancelText={t.common.cancel}
            loadingText={t.bmcManagement.updatingBMC}
            submitIcon={<Save className="w-4 h-4" />}
          />
        </form>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <DeleteBMCModal
        isOpen={showDeleteModal && !!selectedBMC}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBMC(null);
        }}
        onConfirm={handleConfirmDelete}
        bmcName={selectedBMC?.name || ''}
        loading={isDeleting}
        societyCount={selectedBMC?.societyCount || 0}
      />

      {/* Transfer Societies Modal */}
      <TransferSocietiesModal
        isOpen={showTransferModal}
        onClose={() => {
          setShowTransferModal(false);
          setSelectedBMC(null);
        }}
        onConfirm={handleTransferAndDelete}
        bmcName={selectedBMC?.name || ''}
        bmcId={selectedBMC?.id || 0}
        societies={societies}
        availableBMCs={availableBMCs}
      />

      {/* Societies Navigation Alert Modal */}
      <NavigationConfirmModal
        isOpen={showSocietiesAlert && !!bmcForNavigation}
        onClose={() => {
          setShowSocietiesAlert(false);
          setBmcForNavigation(null);
        }}
        onConfirm={() => {
          setShowSocietiesAlert(false);
          router.push(`/admin/society?bmcFilter=${bmcForNavigation?.id}`);
          setBmcForNavigation(null);
        }}
        title="Navigate to Society Management"
        message={`View all societies from ${bmcForNavigation?.name} in the Society Management page with filters applied.`}
        confirmText="Go to Society Management"
        cancelText="Cancel"
      />

      {/* Graph Modal */}
      {showGraphModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {graphMetric === 'quantity' && 'Collection Volume - Last 30 Days'}
                  {graphMetric === 'revenue' && 'Revenue - Last 30 Days'}
                  {graphMetric === 'fat' && 'Average Fat % - Last 30 Days'}
                  {graphMetric === 'snf' && 'Average SNF % - Last 30 Days'}
                  {graphMetric === 'collections' && 'Number of Collections - Last 30 Days'}
                  {graphMetric === 'water' && 'Average Water % - Last 30 Days'}
                </h2>
              </div>
              <button
                onClick={() => setShowGraphModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Graph Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {(() => {
                const bmcsWithStats = bmcs.filter(b => b.totalQuantity30d && b.totalQuantity30d > 0);
                
                // Prepare data for line chart (all BMCs)
                const chartData = bmcsWithStats.map(bmc => ({
                  name: bmc.name,
                  bmcId: bmc.bmcId,
                  value: graphMetric === 'quantity' ? (bmc.totalQuantity30d || 0) :
                         graphMetric === 'revenue' ? (bmc.totalAmount30d || 0) :
                         graphMetric === 'fat' ? (bmc.weightedFat30d || 0) :
                         graphMetric === 'snf' ? (bmc.weightedSnf30d || 0) :
                         graphMetric === 'collections' ? (bmc.totalCollections30d || 0) :
                         (bmc.weightedWater30d || 0)
                })).sort((a, b) => b.value - a.value);

                // Get color and settings
                const getLineColor = () => {
                  switch(graphMetric) {
                    case 'quantity': return '#10b981';
                    case 'revenue': return '#3b82f6';
                    case 'fat': return '#8b5cf6';
                    case 'snf': return '#f97316';
                    case 'collections': return '#ec4899';
                    case 'water': return '#ef4444';
                    default: return '#6b7280';
                  }
                };

                return chartData.length > 0 ? (
                  <div className="w-full h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          interval={0}
                          tick={{ fontSize: 11 }}
                          stroke="#6b7280"
                          label={{ 
                            value: 'BMC Name', 
                            position: 'insideBottom', 
                            offset: -5,
                            style: { fontSize: 13, fontWeight: 500, fill: '#9ca3af' }
                          }}
                        />
                        <YAxis 
                          label={{ 
                            value: graphMetric === 'revenue' ? 'Revenue (₹)' : 
                                   graphMetric === 'fat' || graphMetric === 'snf' || graphMetric === 'water' ? 'Percentage (%)' : 
                                   graphMetric === 'quantity' ? 'Volume (L)' : 'Count', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { fontSize: 13, fontWeight: 500, fill: '#9ca3af' }
                          }}
                          stroke="#6b7280"
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: 'none',
                            borderRadius: '0.5rem',
                            color: '#fff',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: any) => {
                            if (graphMetric === 'revenue') {
                              return ['₹' + Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })];
                            }
                            if (graphMetric === 'fat' || graphMetric === 'snf' || graphMetric === 'water') {
                              return [Number(value).toFixed(2) + '%'];
                            }
                            if (graphMetric === 'quantity') {
                              return [Number(value).toFixed(2) + ' L'];
                            }
                            return [Number(value)];
                          }}
                          labelFormatter={(label: string) => `BMC: ${label}`}
                          cursor={{ stroke: '#9ca3af', strokeWidth: 1 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={getLineColor()} 
                          strokeWidth={2}
                          dot={{ fill: getLineColor(), r: 4 }}
                          activeDot={{ r: 6 }}
                          isAnimationActive={true}
                          name="Value"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[500px]">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 text-lg">No data available for this metric</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing performance metrics for all BMCs over the last 30 days. Click the X to close this view.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
