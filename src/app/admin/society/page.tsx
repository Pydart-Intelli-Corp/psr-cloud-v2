'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPhoneInput, validatePhoneOnBlur } from '@/lib/validation/phoneValidation';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Users, 
  Edit3, 
  MapPin,
  Phone,
  User,
  Calendar,
  Building2,
  RefreshCw
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

interface Society {
  id: number;
  name: string;
  societyId: string;
  location?: string;
  presidentName?: string;
  contactPhone?: string;
  bmcId: number;
  bmcName?: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  lastActivity?: string;
  memberCount?: number;
}

interface SocietyFormData {
  name: string;
  societyId: string;
  password: string;
  location: string;
  presidentName: string;
  contactPhone: string;
  bmcId: string;
  status: 'active' | 'inactive' | 'maintenance';
}

interface BMC {
  id: number;
  name: string;
  bmcId: string;
}

const initialFormData: SocietyFormData = {
  name: '',
  societyId: '',
  password: '',
  location: '',
  presidentName: '',
  contactPhone: '',
  bmcId: '',
  status: 'active'
};

export default function SocietyManagement() {
  const router = useRouter();
  const { user } = useUser();
  const { t } = useLanguage();
  
  // State management
  const [societies, setSocieties] = useState<Society[]>([]);
  const [bmcs, setBmcs] = useState<BMC[]>([]);
  const [loading, setLoading] = useState(true);
  const [bmcsLoading, setBmcsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [formData, setFormData] = useState<SocietyFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    societyId?: string;
    name?: string;
    bmcId?: string;
    contactPhone?: string;
  }>({});

  // Fetch societies
  const fetchSocieties = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/society', {
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
        throw new Error('Failed to fetch societies');
      }

      const result = await response.json();
      // Transform snake_case to camelCase for consistent frontend usage
      const transformedSocieties = (result.data || []).map((society: {
        id: number;
        name: string;
        society_id: string;
        location?: string;
        president_name?: string;
        contact_phone?: string;
        bmc_id: number;
        bmc_name?: string;
        status: string;
        created_at: string;
        updated_at: string;
      }) => ({
        id: society.id,
        name: society.name,
        societyId: society.society_id,
        location: society.location,
        presidentName: society.president_name,
        contactPhone: society.contact_phone,
        bmcId: society.bmc_id,
        bmcName: society.bmc_name,
        status: society.status as 'active' | 'inactive' | 'maintenance',
        createdAt: society.created_at,
        updatedAt: society.updated_at
      }));
      setSocieties(transformedSocieties);
    } catch (error) {
      console.error('Error fetching societies:', error);
      setError('Failed to load society data');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Fetch BMCs for the dropdown
  const fetchBmcs = useCallback(async () => {
    try {
      setBmcsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/bmc', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setBmcs(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching BMCs:', error);
    } finally {
      setBmcsLoading(false);
    }
  }, []);

  // Add new society
  const handleAddSociety = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    // Validate required fields
    if (!formData.bmcId) {
      setError('Please select a BMC');
      setFormLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/society', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          bmcId: parseInt(formData.bmcId)
        })
      });

      if (response.ok) {
        setSuccess('Society added successfully!');
        setShowAddForm(false);
        setFormData(initialFormData);
        await fetchSocieties();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || 'Failed to add society';
        
        // Clear previous field errors
        setFieldErrors({});
        
        // Check for specific field errors
        if (errorMessage.toLowerCase().includes('society id') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ societyId: 'This Society ID already exists' });
        } else if (errorMessage.toLowerCase().includes('society name') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ name: 'This Society name already exists' });
        } else {
          setError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error adding society:', error);
      setError('Failed to add society');
    } finally {
      setFormLoading(false);
    }
  };

  // Edit society
  const handleEditSociety = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSociety) return;

    setFormLoading(true);
    setError('');

    // Validate required fields
    if (!formData.bmcId) {
      setError('Please select a BMC');
      setFormLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const updateData: {
        id: number;
        name: string;
        location: string;
        presidentName: string;
        contactPhone: string;
        bmcId?: number;
        status?: 'active' | 'inactive' | 'maintenance';
        password?: string;
      } = {
        id: selectedSociety.id,
        name: formData.name,
        location: formData.location,
        presidentName: formData.presidentName,
        contactPhone: formData.contactPhone,
        bmcId: parseInt(formData.bmcId),
        status: formData.status
      };

      // Only include password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch('/api/user/society', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setSuccess('Society updated successfully!');
        setShowEditForm(false);
        setSelectedSociety(null);
        setFormData(initialFormData);
        await fetchSocieties();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || 'Failed to update society';
        
        // Clear previous field errors
        setFieldErrors({});
        
        // Check for specific field errors
        if (errorMessage.toLowerCase().includes('society id') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ societyId: 'This Society ID already exists' });
        } else if (errorMessage.toLowerCase().includes('society name') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ name: 'This Society name already exists' });
        } else {
          setError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error updating society:', error);
      setError('Failed to update society');
    } finally {
      setFormLoading(false);
    }
  };



  // Delete society
  const handleConfirmDelete = async () => {
    if (!selectedSociety) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/society`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: selectedSociety.id })
      });

      if (response.ok) {
        setSuccess('Society deleted successfully!');
        setShowDeleteModal(false);
        setSelectedSociety(null);
        await fetchSocieties();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to delete society');
      }
    } catch (error) {
      console.error('Error deleting society:', error);
      setError('Failed to delete society');
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof SocietyFormData, value: string) => {
    // Auto-prefix society ID with "S-" only for new societies (add form)
    if (field === 'societyId' && showAddForm && !value.startsWith('S-') && value.length > 0) {
      value = `S-${value.replace(/^S-/, '')}`;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors when user types
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Open edit modal
  const handleEditClick = (society: Society) => {
    setSelectedSociety(society);
    setFormData({
      name: society.name,
      societyId: society.societyId,
      password: '', // Don't pre-fill password for security
      location: society.location || '',
      presidentName: society.presidentName || '',
      contactPhone: society.contactPhone || '',
      bmcId: society.bmcId?.toString() || '',
      status: society.status
    });
    setFieldErrors({}); // Clear field errors
    setError(''); // Clear general errors
    setShowEditForm(true);
  };

  // Open delete modal
  const handleDeleteClick = (society: Society) => {
    setSelectedSociety(society);
    setShowDeleteModal(true);
  };

  // Handle status change
  const handleStatusChange = async (society: Society, newStatus: 'active' | 'inactive' | 'maintenance') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/society', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: society.id,
          name: society.name,
          location: society.location,
          presidentName: society.presidentName,
          contactPhone: society.contactPhone,
          bmcId: society.bmcId,
          status: newStatus
        })
      });

      if (response.ok) {
        setSuccess(`Status updated to ${newStatus}!`);
        await fetchSocieties();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || 'Failed to update status';
        setError(errorMessage);
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Filter societies based on search term and status
  const filteredSocieties = societies.filter(society => {
    const matchesSearch = society.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         society.societyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         society.presidentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         society.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || society.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchSocieties();
  }, [fetchSocieties]);

  // Don't render until user is loaded from context
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <FlowerSpinner size={48} />
      </div>
    );
  }

  return (
    <>
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:pb-8">
      {/* Page Header */}
      <PageHeader
        title="Society Management"
        subtitle="Manage societies and their operations"
        icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
        onRefresh={fetchSocieties}
        onAdd={() => {
          setFieldErrors({}); // Clear field errors
          setError(''); // Clear general errors
          setShowAddForm(true);
          fetchBmcs(); // Load BMCs when opening add form
        }}
        addButtonText="Add Society"
      />

      {/* Success/Error Messages */}
      <StatusMessage 
        success={success} 
        error={error}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatsCard
          title="Registered Societies"
          value={societies.length}
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="green"
        />
        
        <StatsCard
          title="Active"
          value={societies.filter(s => s.status === 'active').length}
          icon={<Calendar className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="green"
        />

        <StatsCard
          title="Inactive"
          value={societies.filter(s => s.status === 'inactive').length}
          icon={<Calendar className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="red"
        />

        <StatsCard
          title="Maintenance"
          value={societies.filter(s => s.status === 'maintenance').length}
          icon={<RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="yellow"
        />
      </div>

      {/* Filter Controls */}
      <FilterControls
        icon={<Users className="w-4 h-4" />}
        showingText={`Showing ${filteredSocieties.length} of ${societies.length} societies`}
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
      ) : filteredSocieties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredSocieties.map((society) => (
            <ItemCard
              key={society.id}
              id={society.id}
              name={society.name}
              identifier={`ID: ${society.societyId}`}
              status={society.status}
              icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />}
              onStatusChange={(status) => handleStatusChange(society, status as 'active' | 'inactive' | 'maintenance')}
              details={[
                ...(society.presidentName ? [{ icon: <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />, text: `President: ${society.presidentName}` }] : []),
                ...(society.bmcName ? [{ icon: <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />, text: `BMC: ${society.bmcName}` }] : []),
                ...(society.contactPhone ? [{ icon: <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />, text: society.contactPhone }] : []),
                ...(society.location ? [{ icon: <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />, text: society.location }] : []),
                { 
                  icon: <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, 
                  text: `Established: ${
                    society.createdAt 
                      ? new Date(society.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'Unknown'
                  }`
                }
              ]}
              onEdit={() => handleEditClick(society)}
              onDelete={() => handleDeleteClick(society)}
              onView={() => router.push(`/admin/society/${society.id}`)}
              viewText="View Details"
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />}
          title={societies.length === 0 ? 'No societies found' : 'No matching societies'}
          message={societies.length === 0 
            ? 'Get started by adding your first society to the system.'
            : 'Try changing your search or filter criteria.'
          }
          actionText={societies.length === 0 ? 'Add First Society' : undefined}
          onAction={societies.length === 0 ? () => {
            setFieldErrors({}); // Clear field errors
            setError(''); // Clear general errors
            setShowAddForm(true);
            fetchBmcs();
          } : undefined}
          showAction={societies.length === 0}
        />
      )}
      </div>

      {/* Add Society Modal - Positioned outside main container */}
      <FormModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Add New Society"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSociety} className="space-y-4 sm:space-y-6">
          <FormGrid>
            {/* Mandatory Fields First */}
            <FormInput
              label="Society Name"
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              placeholder="Enter society name"
              required
              error={fieldErrors.name}
              colSpan={1}
            />

            <FormInput
              label="Society ID"
              value={formData.societyId}
              onChange={(value) => handleInputChange('societyId', value)}
              placeholder="S-001"
              required
              error={fieldErrors.societyId}
              colSpan={1}
            />

            <FormInput
              label="Password"
              type="password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              placeholder="Enter password"
              required
              colSpan={1}
            />

            <FormSelect
              label="Associated BMC"
              value={formData.bmcId}
              onChange={(value) => handleInputChange('bmcId', value)}
              options={bmcs.map(bmc => ({ 
                value: bmc.id, 
                label: `${bmc.name} (${bmc.bmcId})` 
              }))}
              placeholder="Select BMC"
              required
              disabled={bmcsLoading}
              colSpan={1}
            />

            {/* Optional Fields */}
            <FormInput
              label="President Name"
              value={formData.presidentName}
              onChange={(value) => handleInputChange('presidentName', value)}
              placeholder="Enter president name"
              colSpan={1}
            />

            <FormInput
              label="Location"
              value={formData.location}
              onChange={(value) => handleInputChange('location', value)}
              placeholder="Enter location"
              colSpan={1}
            />

            <FormInput
              label="Contact Phone"
              type="tel"
              value={formData.contactPhone}
              onChange={(value) => {
                const formatted = formatPhoneInput(value);
                handleInputChange('contactPhone', formatted);
              }}
              onBlur={() => {
                const error = validatePhoneOnBlur(formData.contactPhone);
                if (error) {
                  setFieldErrors(prev => ({ ...prev, contactPhone: error }));
                } else {
                  setFieldErrors(prev => ({ ...prev, contactPhone: undefined }));
                }
              }}
              placeholder="Enter phone number"
              error={fieldErrors.contactPhone}
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
          </FormGrid>

          <FormActions
            onCancel={() => setShowAddForm(false)}
            submitText="Add Society"
            isLoading={formLoading}
          />
        </form>
      </FormModal>

      {/* Edit Society Modal */}
      <FormModal
        isOpen={showEditForm && !!selectedSociety}
        onClose={() => {
          setShowEditForm(false);
          setSelectedSociety(null);
          setFormData(initialFormData);
        }}
        title={selectedSociety ? `${t.common?.edit || 'Edit'} ${selectedSociety.name}` : (t.common?.edit || 'Edit')}
        maxWidth="lg"
      >
        <form onSubmit={handleEditSociety} className="space-y-4 sm:space-y-6">
          <FormGrid>
            {/* Mandatory Fields First */}
            <FormInput
              label="Society Name"
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              placeholder="Enter society name"
              required
              error={fieldErrors.name}
              colSpan={1}
            />

            <FormInput
              label="Society ID"
              value={formData.societyId}
              onChange={() => {}}
              readOnly
              disabled
              colSpan={1}
            />

            <FormSelect
              label="Associated BMC"
              value={formData.bmcId}
              onChange={(value) => handleInputChange('bmcId', value)}
              options={bmcs.map(bmc => ({ 
                value: bmc.id, 
                label: `${bmc.name} (${bmc.bmcId})` 
              }))}
              placeholder="Select BMC"
              required
              disabled={bmcsLoading}
              colSpan={2}
            />

            {/* Optional Fields */}
            <FormInput
              label="New Password (Optional)"
              type="password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              placeholder="Leave blank to keep current"
              colSpan={2}
            />

            <FormInput
              label="President Name"
              value={formData.presidentName}
              onChange={(value) => handleInputChange('presidentName', value)}
              placeholder="Enter president name"
              colSpan={1}
            />

            <FormInput
              label="Location"
              value={formData.location}
              onChange={(value) => handleInputChange('location', value)}
              placeholder="Enter location"
              colSpan={1}
            />

            <FormInput
              label="Contact Phone"
              type="tel"
              value={formData.contactPhone}
              onChange={(value) => {
                const formatted = formatPhoneInput(value);
                handleInputChange('contactPhone', formatted);
              }}
              onBlur={() => {
                const error = validatePhoneOnBlur(formData.contactPhone);
                if (error) {
                  setFieldErrors(prev => ({ ...prev, contactPhone: error }));
                } else {
                  setFieldErrors(prev => ({ ...prev, contactPhone: undefined }));
                }
              }}
              placeholder="Enter contact phone"
              error={fieldErrors.contactPhone}
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
          </FormGrid>

          <FormActions
            onCancel={() => {
              setShowEditForm(false);
              setSelectedSociety(null);
              setFormData(initialFormData);
            }}
            submitText="Update Society"
            isLoading={formLoading}
            cancelText="Cancel"
            loadingText="Updating..."
            submitIcon={<Edit3 className="w-4 h-4" />}
          />
        </form>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal && !!selectedSociety}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedSociety(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Society"
        itemName={selectedSociety?.name || ''}
        message="Are you sure you want to delete this society? This action cannot be undone."
      />
    </>
  );
}