'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPhoneInput, validatePhoneOnBlur } from '@/lib/validation/phoneValidation';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
  Eye,
  Plus
} from 'lucide-react';
import { 
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
  ConfirmDeleteModal,
  StatusDropdown
} from '@/components';
import FloatingActionButton from '@/components/management/FloatingActionButton';

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
  const [selectedBMC, setSelectedBMC] = useState<BMC | null>(null);
  const [formData, setFormData] = useState<BMCFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [dairyFilter, setDairyFilter] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ 
    bmcId?: string; 
    name?: string;
    phone?: string;
  }>({});

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
  const handleEditClick = (bmc: BMC) => {
    setSelectedBMC(bmc);
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

      if (formData.password) {
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
  const handleDeleteClick = (bmc: BMC) => {
    setSelectedBMC(bmc);
    setShowDeleteModal(true);
  };

  // Delete BMC
  const handleConfirmDelete = async () => {
    if (!selectedBMC) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/bmc`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: selectedBMC.id })
      });

      if (response.ok) {
        setSuccess('BMC deleted successfully!');
        setShowDeleteModal(false);
        setSelectedBMC(null);
        await fetchBMCs();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to delete BMC');
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
    const matchesSearch = bmc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bmc.bmcId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bmc.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bmc.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || bmc.status === statusFilter;
    
    const matchesDairy = dairyFilter.length === 0 || dairyFilter.includes(bmc.dairyFarmId?.toString() || '');
    
    return matchesSearch && matchesStatus && matchesDairy;
  });

  useEffect(() => {
    fetchBMCs();
    fetchDairies();
  }, [fetchBMCs, fetchDairies]);

  // Handle URL parameters for dairy filter
  useEffect(() => {
    const dairyFilterParam = searchParams.get('dairyFilter');
    if (dairyFilterParam && dairies.length > 0) {
      setDairyFilter([dairyFilterParam]);
    }
  }, [searchParams, dairies]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <FlowerSpinner />
      </div>
    );
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
                  className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700 hover:shadow-lg transition-shadow"
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
                  className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-shadow"
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
                  className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-shadow"
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
                  className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-shadow"
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
                  className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-4 rounded-lg border border-pink-200 dark:border-pink-700 hover:shadow-lg transition-shadow"
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
                  className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Best Purity (30d)</h3>
                    <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{leastWater.name}</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">{Number(leastWater.weightedWater30d || 0).toFixed(2)}% Water</p>
                </div>
              )}
            </div>
          );
        })()}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatsCard
            title="Total BMCs"
            value={bmcs.length}
            icon={<Building2 className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="gray"
          />
          
          <StatsCard
            title="Active"
            value={bmcs.filter(b => b.status === 'active').length}
            icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="green"
          />

          <StatsCard
            title="Inactive"
            value={bmcs.filter(b => b.status === 'inactive').length}
            icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="red"
          />

          <StatsCard
            title="Maintenance"
            value={bmcs.filter(b => b.status === 'maintenance').length}
            icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="yellow"
          />
        </div>

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
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{bmc.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{bmc.bmcId}</p>
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
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{bmc.contactPerson || 'No Contact'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{bmc.phone || 'No Phone'}</span>
                    </div>
                  </div>

                  {/* Location & Dairy - Two Columns */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{bmc.location || 'No Location'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Milk className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate">{bmc.dairyFarmName || 'No Dairy'}</span>
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
                  
                  {/* Societies Count - Clickable */}
                  <button
                    onClick={() => router.push(`/admin/society?bmcFilter=${bmc.id}`)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                    title={`View ${bmc.societyCount || 0} societies under ${bmc.name}`}
                  >
                    <Building2 className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium transition-colors">
                      {bmc.societyCount || 0} Societies
                    </span>
                  </button>
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

            <FormInput
              label="Password"
              type="password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              placeholder="Enter password"
              required={!showEditForm}
              colSpan={1}
            />

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
            <FormInput
              label={`${t.bmcManagement.password} (Leave blank to keep current)`}
              type="password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              placeholder="Enter new password (optional)"
              colSpan={2}
            />

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
      <ConfirmDeleteModal
        isOpen={showDeleteModal && !!selectedBMC}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBMC(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete BMC"
        itemName={selectedBMC?.name || ''}
        message="Are you sure you want to delete this BMC? This action cannot be undone."
      />
    </>
  );
}
