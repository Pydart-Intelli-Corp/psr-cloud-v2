'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  Save
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
  ItemCard,
  EmptyState,
  ConfirmDeleteModal
} from '@/components';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ bmcId?: string; name?: string }>({});

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
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchBMCs();
    fetchDairies();
  }, [fetchBMCs, fetchDairies]);

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
          refreshText="Refresh"
          addButtonText="Add BMC"
          onRefresh={fetchBMCs}
          onAdd={handleAddBMCClick}
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
              <ItemCard
                key={bmc.id}
                id={bmc.id}
                name={bmc.name}
                identifier={`ID: ${bmc.bmcId}`}
                status={bmc.status}
                icon={<Factory className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />}
                onStatusChange={(status) => handleStatusChange(bmc, status as 'active' | 'inactive' | 'maintenance')}
                details={[
                  ...(bmc.dairyFarmName ? [{ icon: <Milk className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: bmc.dairyFarmName }] : []),
                  ...(bmc.location ? [{ icon: <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: bmc.location }] : []),
                  ...(bmc.contactPerson ? [{ icon: <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: bmc.contactPerson }] : []),
                  ...(bmc.phone ? [{ icon: <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: bmc.phone }] : []),
                  ...(bmc.email ? [{ icon: <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: bmc.email }] : []),
                  ...(bmc.capacity ? [{ icon: <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: `Capacity: ${bmc.capacity} L` }] : []),
                  ...(bmc.createdAt ? [{ icon: <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: `Added: ${new Date(bmc.createdAt).toLocaleDateString()}` }] : [])
                ]}
                onEdit={() => handleEditClick(bmc)}
                onDelete={() => handleDeleteClick(bmc)}
                onView={() => router.push(`/admin/bmc/${bmc.id}`)}
                viewText={t.bmcManagement.viewDetails}
              />
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

      {/* Add BMC Modal */}
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
              onChange={(value) => handleInputChange('phone', value)}
              placeholder="+91 1234567890"
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
              onChange={(value) => handleInputChange('phone', value)}
              placeholder={t.bmcManagement.enterPhoneNumber}
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
