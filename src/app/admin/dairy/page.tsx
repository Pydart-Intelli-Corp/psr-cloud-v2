'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEntityData } from '@/hooks/useEntityData';
import { formatPhoneInput, validatePhoneOnBlur } from '@/lib/validation/phoneValidation';
import { validateEmailQuick } from '@/lib/emailValidation';
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
  Milk, 
  Plus,
  Edit3,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Activity,
  Building2,
  Trash2,
  Factory,
  Users,
  TrendingUp,
  Award,
  Droplets,
  Eye,
  EyeOff,
  BarChart3,
  X
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
import DeleteDairyModal from '@/components/modals/DeleteDairyModal';
import FloatingActionButton from '@/components/management/FloatingActionButton';
import NavigationConfirmModal from '@/components/NavigationConfirmModal';
import TransferBMCsModal from '@/components/modals/TransferBMCsModal';

interface Dairy {
  id: number;
  name: string;
  dairyId: string;
  location?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  status: 'active' | 'inactive' | 'maintenance';
  monthlyTarget?: number;
  createdAt: string;
  lastActivity?: string;
  bmcCount?: number;
  societyCount?: number;
  totalCollections30d?: number;
  totalQuantity30d?: number;
  totalAmount30d?: number;
  weightedFat30d?: number;
  weightedSnf30d?: number;
  weightedClr30d?: number;
  weightedWater30d?: number;
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

const initialFormData: DairyFormData = {
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
};

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

export default function DairyManagement() {
  const router = useRouter();
  const { user } = useUser();
  const { t } = useLanguage();
  
  // Use React Query for cached data fetching (lightweight for list, full for details)
  const { data: dairiesData, isLoading: isDairiesLoading, isError: isDairiesError, error: dairiesError, refetch: refetchDairies } = useEntityData<Dairy[]>('dairy', false); // Use full endpoint with stats
  
  // State management
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDairy, setSelectedDairy] = useState<Dairy | null>(null);
  const [formData, setFormData] = useState<DairyFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    dairyId?: string;
    name?: string;
    phone?: string;
    email?: string;
  }>({});
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [graphMetric, setGraphMetric] = useState<'quantity' | 'revenue' | 'fat' | 'snf' | 'collections' | 'water'>('quantity');
  const [showBmcsAlert, setShowBmcsAlert] = useState(false);
  const [showSocietiesAlert, setShowSocietiesAlert] = useState(false);
  const [dairyForNavigation, setDairyForNavigation] = useState<Dairy | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [bmcsForTransfer, setBmcsForTransfer] = useState<Array<{ id: number; name: string; bmcId: string }>>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');

  // Derive data from React Query
  const dairies = dairiesData || [];
  const loading = isDairiesLoading;
  
  // Set error from React Query
  useEffect(() => {
    if (isDairiesError && dairiesError) {
      setError(dairiesError.message || 'Failed to load dairy data');
    }
  }, [isDairiesError, dairiesError]);

  // Fetch dairies - now using React Query cache (instant from cache!)
  const fetchDairies = useCallback(async () => {
    await refetchDairies();
  }, [refetchDairies]);

  // Add new dairy
  const handleAddDairy = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/dairy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
          monthlyTarget: formData.monthlyTarget ? parseInt(formData.monthlyTarget) : undefined
        })
      });

      if (response.ok) {
        setSuccess('Dairy added successfully!');
        setShowAddForm(false);
        setFormData(initialFormData);
        await fetchDairies();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || 'Failed to add dairy';
        
        // Clear previous field errors
        setFieldErrors({});
        
        // Check for specific field errors
        if (errorMessage.toLowerCase().includes('dairy id') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ dairyId: 'This Dairy ID already exists' });
        } else if (errorMessage.toLowerCase().includes('dairy name') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ name: 'This Dairy name already exists' });
        } else if (errorMessage.toLowerCase().includes('already exists')) {
          // Generic duplicate error - could be dairy ID
          setFieldErrors({ dairyId: 'This Dairy ID already exists' });
        } else {
          setError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error adding dairy:', error);
      setError('Failed to add dairy');
    } finally {
      setFormLoading(false);
    }
  };

  // Open edit modal
  const handleEditClick = async (dairy: Dairy) => {
    setSelectedDairy(dairy);
    setShowPassword(false);
    setCurrentPassword('');
    
    // Fetch current password
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/dairy/password?id=${dairy.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        let fetchedPassword = '';
        if (result.data) {
          if (typeof result.data === 'string') {
            fetchedPassword = result.data;
          } else if (typeof result.data === 'object' && result.data.password) {
            fetchedPassword = String(result.data.password);
          }
        } else if (result.password) {
          fetchedPassword = String(result.password);
        }
        
        setCurrentPassword(fetchedPassword);
        
        setFormData({
          name: dairy.name,
          dairyId: dairy.dairyId,
          password: fetchedPassword,
          location: dairy.location || '',
          contactPerson: dairy.contactPerson || '',
          phone: dairy.phone || '',
          email: dairy.email || '',
          capacity: dairy.capacity?.toString() || '',
          status: dairy.status || 'active',
          monthlyTarget: dairy.monthlyTarget?.toString() || ''
        });
      }
    } catch (error) {
      console.error('Error fetching password:', error);
    }
    
    setShowEditForm(true);
  };

  // Update dairy
  const handleUpdateDairy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDairy) return;

    setFormLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
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
        id: selectedDairy.id,
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
      if (formData.password && formData.password !== currentPassword) {
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
        setSelectedDairy(null);
        setFormData(initialFormData);
        await fetchDairies();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || 'Failed to update dairy';
        
        // Clear previous field errors
        setFieldErrors({});
        
        // Check for specific field errors
        if (errorMessage.toLowerCase().includes('dairy name') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ name: 'This Dairy name already exists' });
        } else if (errorMessage.toLowerCase().includes('already exists')) {
          // Generic duplicate error - likely dairy name in edit mode
          setFieldErrors({ name: 'This Dairy name already exists' });
        } else {
          setError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error updating dairy:', error);
      setError('Failed to update dairy');
    } finally {
      setFormLoading(false);
    }
  };

  // Update dairy status
  const handleStatusChange = async (dairy: Dairy, newStatus: 'active' | 'inactive' | 'maintenance') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/dairy', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: dairy.id,
          status: newStatus
        })
      });

      if (response.ok) {
        setSuccess(`Status updated to ${newStatus}!`);
        await fetchDairies();
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

  // Fetch BMCs for dairy
  const fetchBMCsForDairy = async (dairyId: number) => {
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
        const filteredBmcs = allBmcs.filter((b: { dairyFarmId: number }) => b.dairyFarmId === dairyId);
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

  // Open delete confirmation modal
  const handleDeleteClick = async (dairy: Dairy) => {
    setSelectedDairy(dairy);
    
    // Fetch BMCs for this dairy
    const bmcs = await fetchBMCsForDairy(dairy.id);
    setBmcsForTransfer(bmcs);
    
    if (bmcs.length > 0) {
      // Show transfer modal if BMCs exist
      setShowTransferModal(true);
    } else {
      // Store dairy ID for OTP modal and show delete modal
      (window as any).selectedDairyIdForDelete = dairy.id;
      setShowDeleteModal(true);
    }
  };

  // Handle transfer and delete (or cascade delete)
  const handleTransferAndDelete = async (newDairyId: number | null, deleteAll: boolean, otp?: string) => {
    if (!selectedDairy) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/dairy', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: selectedDairy.id,
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
        setSelectedDairy(null);
        setBmcsForTransfer([]);
        await fetchDairies();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to delete dairy');
      }
    } catch (error) {
      console.error('Error deleting dairy:', error);
      setError('Failed to delete dairy');
    }
  };

  // Delete dairy (no BMCs) with OTP verification
  const handleConfirmDelete = async (otp: string) => {
    if (!selectedDairy) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/dairy', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: selectedDairy.id,
          otp
        })
      });

      if (response.ok) {
        setSuccess('Dairy deleted successfully!');
        setShowDeleteModal(false);
        setSelectedDairy(null);
        await fetchDairies();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete dairy');
      }
    } catch (error: any) {
      console.error('Error deleting dairy:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof DairyFormData, value: string) => {
    // Auto-prefix dairy ID with "D-" only for new dairies (add form)
    if (field === 'dairyId' && !showEditForm) {
      const cleanValue = value.replace(/^D-/i, '');
      value = `D-${cleanValue}`;
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

  // Filter dairies based on status
  const filteredDairies = dairies.filter(dairy => {
    const matchesStatus = statusFilter === 'all' || dairy.status === statusFilter;
    
    // Search across multiple fields
    const searchMatch = searchQuery === '' || 
      dairy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dairy.dairyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dairy.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dairy.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dairy.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dairy.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && searchMatch;
  });



  useEffect(() => {
    fetchDairies();
  }, [fetchDairies]);

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

  // Don't render until user is loaded from context
  if (!user) {
    return <PageLoader />;
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:pb-8">
      {/* Page Header */}
      <PageHeader
        title={t.dairyManagement.title}
        subtitle={t.dairyManagement.subtitle}
        icon={<Milk className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
        onRefresh={fetchDairies}
      />

      {/* Success/Error Messages */}
      <StatusMessage success={success} error={error} />

      {/* Top Performers Section */}
      {dairies.length > 0 && (() => {
        const dairiesWithStats = dairies.filter(d => d.totalQuantity30d && Number(d.totalQuantity30d) > 0);
        
        if (dairiesWithStats.length === 0) return null;

        const topCollection = [...dairiesWithStats].sort((a, b) => 
          Number(b.totalQuantity30d || 0) - Number(a.totalQuantity30d || 0)
        )[0];
        
        const topRevenue = [...dairiesWithStats].sort((a, b) => 
          Number(b.totalAmount30d || 0) - Number(a.totalAmount30d || 0)
        )[0];
        
        const topFat = [...dairiesWithStats].sort((a, b) => 
          Number(b.weightedFat30d || 0) - Number(a.weightedFat30d || 0)
        )[0];
        
        const topSnf = [...dairiesWithStats].sort((a, b) => 
          Number(b.weightedSnf30d || 0) - Number(a.weightedSnf30d || 0)
        )[0];
        
        const mostCollections = [...dairiesWithStats].sort((a, b) => 
          Number(b.totalCollections30d || 0) - Number(a.totalCollections30d || 0)
        )[0];
        
        const leastWater = [...dairiesWithStats].sort((a, b) => 
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
        icon={<Milk className="w-4 h-4 flex-shrink-0" />}
        showingText={`Showing ${filteredDairies.length} of ${dairies.length} Dairies`}
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
      ) : filteredDairies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredDairies.map((dairy) => (
            <div key={dairy.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-visible border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 relative z-10 hover:z-20">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex-shrink-0">
                      <Milk className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{highlightText(dairy.name, searchQuery)}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{highlightText(dairy.dairyId, searchQuery)}</p>
                    </div>
                  </div>
                  <StatusDropdown
                    currentStatus={dairy.status}
                    onStatusChange={(status) => handleStatusChange(dairy, status as 'active' | 'inactive' | 'maintenance')}
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
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{highlightText(dairy.contactPerson || 'No Contact', searchQuery)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{highlightText(dairy.phone || 'No Phone', searchQuery)}</span>
                  </div>
                </div>

                {/* Location & Email */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{highlightText(dairy.location || 'No Location', searchQuery)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{highlightText(dairy.email || 'No Email', searchQuery)}</span>
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
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{Number(dairy.totalCollections30d || 0)}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{Number(dairy.totalQuantity30d || 0).toFixed(2)} Liters</div>
                  </div>
                </div>

                {/* Quality Metrics - Three Columns */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Fat</div>
                    <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{Number(dairy.weightedFat30d || 0).toFixed(2)}%</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">SNF</div>
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400">{Number(dairy.weightedSnf30d || 0).toFixed(2)}%</div>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">CLR</div>
                    <div className="text-sm font-bold text-pink-600 dark:text-pink-400">{Number(dairy.weightedClr30d || 0).toFixed(1)}</div>
                  </div>
                </div>

                {/* Revenue */}
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Revenue</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{Number(dairy.totalAmount30d || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 rounded-b-lg">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(dairy)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(dairy)}
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
                      setDairyForNavigation(dairy);
                      setShowBmcsAlert(true);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group"
                    title={`View ${dairy.bmcCount || 0} BMCs under ${dairy.name}`}
                  >
                    <Factory className="w-3.5 h-3.5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 font-medium">{dairy.bmcCount || 0}</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setDairyForNavigation(dairy);
                      setShowSocietiesAlert(true);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                    title={`View ${dairy.societyCount || 0} societies under ${dairy.name}`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium">{dairy.societyCount || 0}</span>
                  </button>
                  
                  <button
                    onClick={() => router.push(`/admin/dairy/${dairy.id}`)}
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
          icon={<Milk className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />}
          title="No Dairies found"
          message={statusFilter === 'all' ? 'Get started by adding your first Dairy' : 'Try changing the filter to see more results'}
          actionText={statusFilter === 'all' ? 'Add Your First Dairy' : undefined}
          onAction={statusFilter === 'all' ? () => setShowAddForm(true) : undefined}
          showAction={statusFilter === 'all'}
        />
      )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={[
          {
            icon: <Plus className="w-6 h-6 text-white" />,
            label: 'Add Dairy',
            onClick: () => {
              setFieldErrors({});
              setError('');
              setShowAddForm(true);
            },
            color: 'bg-gradient-to-br from-blue-500 to-blue-600'
          }
        ]}
        directClick={true}
      />

      {/* Add Dairy Modal - Positioned outside main container */}
      <FormModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title={t.dairyManagement.addNewDairy}
        maxWidth="lg"
      >
        <form onSubmit={handleAddDairy} className="space-y-4 sm:space-y-6">
          <FormGrid>
            <FormInput
              label={t.dairyManagement.dairyName}
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              placeholder={t.dairyManagement.enterDairyName}
              required
              error={fieldErrors.name}
            />

            <FormInput
              label={t.dairyManagement.dairyId}
              value={formData.dairyId}
              onChange={(value) => handleInputChange('dairyId', value)}
              placeholder="D-001"
              required
              error={fieldErrors.dairyId}
            />

            {/* Password with Eye Button */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.dairyManagement.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={t.dairyManagement.enterSecurePassword}
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
              label={t.dairyManagement.capacity}
              type="number"
              value={formData.capacity}
              onChange={(value) => handleInputChange('capacity', value)}
              placeholder={t.dairyManagement.enterCapacity}
            />

            <FormInput
              label={t.dairyManagement.contactPerson}
              value={formData.contactPerson}
              onChange={(value) => handleInputChange('contactPerson', value)}
              placeholder={t.dairyManagement.enterContactPerson}
            />

            <FormInput
              label={t.dairyManagement.phone}
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
              placeholder={t.dairyManagement.enterPhoneNumber}
              error={fieldErrors.phone}
            />

            <FormInput
              label={t.dairyManagement.email}
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              onBlur={() => {
                const error = validateEmailQuick(formData.email);
                if (error) {
                  setFieldErrors(prev => ({ ...prev, email: error }));
                } else {
                  setFieldErrors(prev => ({ ...prev, email: undefined }));
                }
              }}
              placeholder={t.dairyManagement.enterEmail}
              error={fieldErrors.email}
            />

            <FormInput
              label={t.dairyManagement.location}
              value={formData.location}
              onChange={(value) => handleInputChange('location', value)}
              placeholder={t.dairyManagement.enterLocation}
            />

            <FormSelect
              label="Status"
              value={formData.status}
              onChange={(value) => handleInputChange('status', value as 'active' | 'inactive' | 'maintenance')}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'maintenance', label: 'Maintenance' }
              ]}
            />

            <FormInput
              label="Monthly Target (Liters)"
              type="number"
              value={formData.monthlyTarget}
              onChange={(value) => handleInputChange('monthlyTarget', value)}
              placeholder="Enter monthly target"
            />
          </FormGrid>

          <FormActions
            onCancel={() => setShowAddForm(false)}
            submitText={t.dairyManagement.addDairy}
            isLoading={formLoading}
            cancelText={t.common.cancel}
            loadingText={t.dairyManagement.addingDairy}
            submitIcon={<Plus className="w-4 h-4" />}
          />
        </form>
      </FormModal>

      {/* Edit Dairy Modal */}
      <FormModal
        isOpen={showEditForm && !!selectedDairy}
        onClose={() => {
          setShowEditForm(false);
          setSelectedDairy(null);
          setFormData(initialFormData);
        }}
        title={selectedDairy ? `${t.common.edit} ${selectedDairy.name}` : t.common.edit}
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateDairy} className="space-y-4 sm:space-y-6">
          <FormGrid>
            <FormInput
              label={t.dairyManagement.dairyName}
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              placeholder={t.dairyManagement.enterDairyName}
              required
              error={fieldErrors.name}
            />

            <FormInput
              label={`${t.dairyManagement.dairyId} (Read-only)`}
              value={formData.dairyId}
              onChange={() => {}}
              readOnly
              disabled
            />

            {/* Password with Eye Button */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.dairyManagement.password}
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
              label={t.dairyManagement.capacity}
              type="number"
              value={formData.capacity}
              onChange={(value) => handleInputChange('capacity', value)}
              placeholder={t.dairyManagement.enterCapacity}
            />

            <FormInput
              label={t.dairyManagement.contactPerson}
              value={formData.contactPerson}
              onChange={(value) => handleInputChange('contactPerson', value)}
              placeholder={t.dairyManagement.enterContactPerson}
            />

            <FormInput
              label={t.dairyManagement.phone}
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
              placeholder={t.dairyManagement.enterPhoneNumber}
              error={fieldErrors.phone}
            />

            <FormInput
              label={t.dairyManagement.email}
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              onBlur={() => {
                const error = validateEmailQuick(formData.email);
                if (error) {
                  setFieldErrors(prev => ({ ...prev, email: error }));
                } else {
                  setFieldErrors(prev => ({ ...prev, email: undefined }));
                }
              }}
              placeholder={t.dairyManagement.enterEmail}
              error={fieldErrors.email}
            />

            <FormInput
              label={t.dairyManagement.location}
              value={formData.location}
              onChange={(value) => handleInputChange('location', value)}
              placeholder={t.dairyManagement.enterLocation}
            />

            <FormSelect
              label="Status"
              value={formData.status}
              onChange={(value) => handleInputChange('status', value as 'active' | 'inactive' | 'maintenance')}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'maintenance', label: 'Maintenance' }
              ]}
            />

            <FormInput
              label="Monthly Target (Liters)"
              type="number"
              value={formData.monthlyTarget}
              onChange={(value) => handleInputChange('monthlyTarget', value)}
              placeholder="Enter monthly target"
            />
          </FormGrid>

          <FormActions
            onCancel={() => {
              setShowEditForm(false);
              setSelectedDairy(null);
              setFormData(initialFormData);
            }}
            submitText="Update Dairy"
            isLoading={formLoading}
            cancelText={t.common.cancel}
            loadingText="Updating..."
            submitIcon={<Edit3 className="w-4 h-4" />}
          />
        </form>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <DeleteDairyModal
        isOpen={showDeleteModal && !!selectedDairy}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedDairy(null);
        }}
        onConfirm={handleConfirmDelete}
        dairyName={selectedDairy?.name || ''}
        loading={isDeleting}
        bmcCount={selectedDairy?.bmcCount || 0}
        societyCount={selectedDairy?.societyCount || 0}
      />

      {/* BMCs Navigation Alert Modal */}
      <NavigationConfirmModal
        isOpen={showBmcsAlert && !!dairyForNavigation}
        onClose={() => {
          setShowBmcsAlert(false);
          setDairyForNavigation(null);
        }}
        onConfirm={() => {
          setShowBmcsAlert(false);
          router.push(`/admin/bmc?dairyFilter=${dairyForNavigation?.id}`);
          setDairyForNavigation(null);
        }}
        title="Navigate to BMC Management"
        message={`View all BMCs from ${dairyForNavigation?.name} in the BMC Management page with filters applied.`}
        confirmText="Go to BMC Management"
        cancelText="Cancel"
      />

      {/* Societies Navigation Alert Modal */}
      <NavigationConfirmModal
        isOpen={showSocietiesAlert && !!dairyForNavigation}
        onClose={() => {
          setShowSocietiesAlert(false);
          setDairyForNavigation(null);
        }}
        onConfirm={() => {
          setShowSocietiesAlert(false);
          router.push(`/admin/society?dairyFilter=${dairyForNavigation?.id}`);
          setDairyForNavigation(null);
        }}
        title="Navigate to Society Management"
        message={`View all societies from ${dairyForNavigation?.name} in the Society Management page with filters applied.`}
        confirmText="Go to Society Management"
        cancelText="Cancel"
      />

      {/* Transfer BMCs Modal */}
      <TransferBMCsModal
        isOpen={showTransferModal}
        onClose={() => {
          setShowTransferModal(false);
          setSelectedDairy(null);
          setBmcsForTransfer([]);
        }}
        onConfirm={handleTransferAndDelete}
        bmcs={bmcsForTransfer}
        dairies={dairies}
        dairyName={selectedDairy?.name || ''}
        currentDairyId={selectedDairy?.id || 0}
        adminEmail={user?.email || ''}
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
                const dairiesWithStats = dairies.filter(d => d.totalQuantity30d && Number(d.totalQuantity30d) > 0);
                
                // Prepare data for line chart (all dairies)
                const chartData = dairiesWithStats.map(dairy => ({
                  name: dairy.name,
                  dairyId: dairy.dairyId,
                  value: graphMetric === 'quantity' ? Number(dairy.totalQuantity30d || 0) :
                         graphMetric === 'revenue' ? Number(dairy.totalAmount30d || 0) :
                         graphMetric === 'fat' ? Number(dairy.weightedFat30d || 0) :
                         graphMetric === 'snf' ? Number(dairy.weightedSnf30d || 0) :
                         graphMetric === 'collections' ? Number(dairy.totalCollections30d || 0) :
                         Number(dairy.weightedWater30d || 0)
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
                            value: 'Dairy Name', 
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
                          labelFormatter={(label: string) => `Dairy: ${label}`}
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
                Showing performance metrics for all dairies over the last 30 days. Click the X to close this view.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}