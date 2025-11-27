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
  Building2
} from 'lucide-react';
import { 
  FlowerSpinner, 
  FormModal, 
  FormInput, 
  FormSelect, 
  FormActions, 
  FormGrid,
  PageHeader,
  StatusMessage,
  StatsCard,
  SearchAndFilter,
  EmptyState,
  ConfirmDeleteModal
} from '@/components';
import DairyMinimalCard from '@/components/dairy/DairyMinimalCard';

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
  farmerCount?: number;
  totalCollections?: number;
  collectionCount?: number;
  totalRevenue?: number;
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
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filter dairies based on search and status
  const filteredDairies = dairies.filter(dairy => {
    const matchesSearch = dairy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dairy.dairyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dairy.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dairy.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || dairy.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
        refreshText={t.dairyManagement.refresh}
        addButtonText={t.dairyManagement.addDairy}
        onRefresh={fetchDairies}
        onAdd={() => setShowAddForm(true)}
      />

      {/* Success/Error Messages */}
      <StatusMessage success={success} error={error} />

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
      <SearchAndFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search dairies by name, ID, location, or contact..."
        statusValue={statusFilter}
        onStatusChange={(value) => setStatusFilter(value as typeof statusFilter)}
        statusOptions={[
          { value: 'all', label: `${t.dashboard.all} ${t.dairyManagement.status}` },
          { value: 'active', label: t.dashboard.active },
          { value: 'inactive', label: t.dashboard.inactive },
          { value: 'maintenance', label: t.dairyManagement.maintenance }
        ]}
      />

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12 sm:py-20">
          <FlowerSpinner size={40} />
        </div>
      ) : filteredDairies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredDairies.map((dairy) => (
            <DairyMinimalCard
              key={dairy.id}
              id={dairy.id}
              name={dairy.name}
              dairyId={dairy.dairyId}
              location={dairy.location}
              contactPerson={dairy.contactPerson}
              phone={dairy.phone}
              email={dairy.email}
              capacity={dairy.capacity}
              monthlyTarget={dairy.monthlyTarget}
              status={dairy.status}
              createdAt={dairy.createdAt}
              bmcCount={dairy.bmcCount}
              societyCount={dairy.societyCount}
              farmerCount={dairy.farmerCount}
              totalCollections={dairy.totalCollections}
              totalRevenue={dairy.totalRevenue}
              onEdit={() => handleEditClick(dairy)}
              onDelete={() => handleDeleteClick(dairy)}
              onView={() => router.push(`/admin/dairy/${dairy.id}`)}
              onStatusChange={(status) => handleStatusChange(dairy, status)}
              searchQuery={searchTerm}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Milk className="w-10 h-10" />}
          title={dairies.length === 0 ? t.dairyManagement.noDairiesFound : t.dairyManagement.noMatchingDairies}
          message={dairies.length === 0 ? t.dairyManagement.getStartedMessage : t.dairyManagement.tryChangingFilters}
          actionText={t.dairyManagement.addYourFirstDairy}
          onAction={dairies.length === 0 ? () => setShowAddForm(true) : undefined}
          showAction={dairies.length === 0}
        />
      )}
      </div>

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