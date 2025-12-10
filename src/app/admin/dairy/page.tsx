'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
  Eye
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

export default function DairyManagement() {
  const router = useRouter();
  const { user } = useUser();
  const { t } = useLanguage();
  
  // State management
  const [dairies, setDairies] = useState<Dairy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDairy, setSelectedDairy] = useState<Dairy | null>(null);
  const [formData, setFormData] = useState<DairyFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    dairyId?: string;
    name?: string;
  }>({});


  // Fetch dairies
  const fetchDairies = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/dairy', {
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
        throw new Error('Failed to fetch dairies');
      }

      const result = await response.json();
      setDairies(result.data || []);
    } catch (error) {
      console.error('Error fetching dairies:', error);
      setError('Failed to load dairy data');
    } finally {
      setLoading(false);
    }
  }, [router]);

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
  const handleEditClick = (dairy: Dairy) => {
    setSelectedDairy(dairy);
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

  // Open delete confirmation modal
  const handleDeleteClick = (dairy: Dairy) => {
    setSelectedDairy(dairy);
    setShowDeleteModal(true);
  };

  // Delete dairy
  const handleConfirmDelete = async () => {
    if (!selectedDairy) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/dairy`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: selectedDairy.id })
      });

      if (response.ok) {
        setSuccess('Dairy deleted successfully!');
        setShowDeleteModal(false);
        setSelectedDairy(null);
        await fetchDairies();
        setTimeout(() => setSuccess(''), 3000);
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
    return matchesStatus;
  });



  useEffect(() => {
    fetchDairies();
  }, [fetchDairies]);

  // Don't render until user is loaded from context
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
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">Top Collection (30d)</h3>
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-lg font-bold text-green-800 dark:text-green-200">{topCollection.name}</p>
                <p className="text-sm text-green-600 dark:text-green-400">{Number(topCollection.totalQuantity30d || 0).toFixed(2)} L</p>
              </div>
            )}
            
            {topRevenue && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Top Revenue (30d)</h3>
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-lg font-bold text-blue-800 dark:text-blue-200">{topRevenue.name}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">₹{Number(topRevenue.totalAmount30d || 0).toFixed(2)}</p>
              </div>
            )}
            
            {topFat && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">Best Quality (30d)</h3>
                  <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-lg font-bold text-purple-800 dark:text-purple-200">{topFat.name}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">{Number(topFat.weightedFat30d || 0).toFixed(2)}% Fat</p>
              </div>
            )}
            
            {topSnf && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-100">Best SNF (30d)</h3>
                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-lg font-bold text-orange-800 dark:text-orange-200">{topSnf.name}</p>
                <p className="text-sm text-orange-600 dark:text-orange-400">{Number(topSnf.weightedSnf30d || 0).toFixed(2)}% SNF</p>
              </div>
            )}
            
            {mostCollections && (
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-4 rounded-lg border border-pink-200 dark:border-pink-700 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-pink-900 dark:text-pink-100">Most Active (30d)</h3>
                  <Award className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <p className="text-lg font-bold text-pink-800 dark:text-pink-200">{mostCollections.name}</p>
                <p className="text-sm text-pink-600 dark:text-pink-400">{Number(mostCollections.totalCollections30d || 0)} Collections</p>
              </div>
            )}
            
            {leastWater && (
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700 hover:shadow-lg transition-shadow">
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
          title={t.dairyManagement.registeredDairies}
          value={dairies.length}
          icon={<Building2 className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="gray"
          clickable={true}
          isActive={statusFilter === 'all'}
          onClick={() => setStatusFilter('all')}
        />
        
        <StatsCard
          title={t.dashboard.active}
          value={dairies.filter(d => d.status === 'active').length}
          icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="green"
          clickable={true}
          isActive={statusFilter === 'active'}
          onClick={() => setStatusFilter('active')}
        />

        <StatsCard
          title={t.dashboard.inactive}
          value={dairies.filter(d => d.status === 'inactive').length}
          icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="red"
          clickable={true}
          isActive={statusFilter === 'inactive'}
          onClick={() => setStatusFilter('inactive')}
        />

        <StatsCard
          title={t.dairyManagement.maintenance}
          value={dairies.filter(d => d.status === 'maintenance').length}
          icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="yellow"
          clickable={true}
          isActive={statusFilter === 'maintenance'}
          onClick={() => setStatusFilter('maintenance')}
        />
      </div>

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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{dairy.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{dairy.dairyId}</p>
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
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{dairy.contactPerson || 'No Contact'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{dairy.phone || 'No Phone'}</span>
                  </div>
                </div>

                {/* Location & Email */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{dairy.location || 'No Location'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{dairy.email || 'No Email'}</span>
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
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
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
                
                {/* BMCs and Societies Count - Clickable */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/admin/bmc?dairyFilter=${dairy.id}`)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
                    title={`View ${dairy.bmcCount || 0} BMCs under ${dairy.name}`}
                  >
                    <Factory className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-500 transition-colors" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 font-medium">{dairy.bmcCount || 0}</span>
                  </button>
                  <button
                    onClick={() => router.push(`/admin/society?dairyFilter=${dairy.id}`)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                    title={`View ${dairy.societyCount || 0} societies under ${dairy.name}`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium">{dairy.societyCount || 0}</span>
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
              label={`${t.dairyManagement.dairyName} ${t.dairyManagement.requiredField}`}
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              placeholder={t.dairyManagement.enterDairyName}
              required
              error={fieldErrors.name}
            />

            <FormInput
              label={`${t.dairyManagement.dairyId} ${t.dairyManagement.requiredField}`}
              value={formData.dairyId}
              onChange={(value) => handleInputChange('dairyId', value)}
              placeholder="D-001"
              required
              error={fieldErrors.dairyId}
            />

            <FormInput
              label={`${t.dairyManagement.password} ${t.dairyManagement.requiredField}`}
              type="password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              placeholder={t.dairyManagement.enterSecurePassword}
              required
            />

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
              onChange={(value) => handleInputChange('phone', value)}
              placeholder={t.dairyManagement.enterPhoneNumber}
            />

            <FormInput
              label={t.dairyManagement.email}
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              placeholder={t.dairyManagement.enterEmail}
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
              label={`${t.dairyManagement.dairyName} ${t.dairyManagement.requiredField}`}
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

            <FormInput
              label={`${t.dairyManagement.password} (Leave blank to keep current)`}
              type="password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              placeholder="Enter new password (optional)"
            />

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
              onChange={(value) => handleInputChange('phone', value)}
              placeholder={t.dairyManagement.enterPhoneNumber}
            />

            <FormInput
              label={t.dairyManagement.email}
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              placeholder={t.dairyManagement.enterEmail}
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
      <ConfirmDeleteModal
        isOpen={showDeleteModal && !!selectedDairy}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedDairy(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={selectedDairy?.name || ''}
        itemType="dairy"
      />
    </>
  );
}