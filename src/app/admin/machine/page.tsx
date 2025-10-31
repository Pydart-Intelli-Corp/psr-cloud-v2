'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Settings, 
  MapPin,
  Phone,
  User,
  Calendar,
  Building2,
  RefreshCw,
  Wrench
} from 'lucide-react';
import { 
  FlowerSpinner,
  FormModal, 
  FormInput, 
  FormSelect, 
  FormTextarea, 
  FormActions, 
  FormGrid, 
  FormError,
  PageHeader,
  StatusMessage,
  StatsCard,
  FilterControls,
  ItemCard,
  EmptyState,
  ConfirmDeleteModal
} from '@/components';

interface Machine {
  id: number;
  machineId: string;
  machineType: string;
  societyId: number;
  societyName?: string;
  societyIdentifier?: string;
  location?: string;
  installationDate?: string;
  lastMaintenanceDate?: string;
  maintenanceSchedule?: string;
  operatorName?: string;
  contactPhone?: string;
  status: 'active' | 'inactive' | 'maintenance';
  notes?: string;
  createdAt: string;
}

interface MachineFormData {
  machineId: string;
  machineType: string;
  societyId: string;
  location: string;
  installationDate: string;
  operatorName: string;
  contactPhone: string;
  status: 'active' | 'inactive' | 'maintenance';
  notes: string;
}

interface Society {
  id: number;
  name: string;
  society_id: string;
}

interface MachineType {
  id: number;
  machineType: string;
}

const initialFormData: MachineFormData = {
  machineId: '',
  machineType: '',
  societyId: '',
  location: '',
  installationDate: '',
  operatorName: '',
  contactPhone: '',
  status: 'active',
  notes: ''
};

export default function MachineManagement() {
  const router = useRouter();
  const { user } = useUser();
  const { } = useLanguage();
  
  // State management
  const [machines, setMachines] = useState<Machine[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [societiesLoading, setSocietiesLoading] = useState(false);
  const [machineTypesLoading, setMachineTypesLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [formData, setFormData] = useState<MachineFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    machineId?: string;
    machineType?: string;
    societyId?: string;
  }>({});

  // Fetch machines
  const fetchMachines = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/machine', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        router.push('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setMachines(data.data || []);
      } else {
        setError(typeof data.error === 'string' ? data.error : data.error?.message || 'Failed to fetch machines');
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
      setError('Failed to fetch machines');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Fetch societies for dropdown
  const fetchSocieties = useCallback(async () => {
    try {
      setSocietiesLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/society', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSocieties(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching societies:', error);
    } finally {
      setSocietiesLoading(false);
    }
  }, []);

  // Fetch machine types from superadmin
  const fetchMachineTypes = useCallback(async () => {
    try {
      setMachineTypesLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/superadmin/machines', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMachineTypes(data.data.machines || []);
      }
    } catch (error) {
      console.error('Error fetching machine types:', error);
    } finally {
      setMachineTypesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMachines();
      fetchSocieties();
      fetchMachineTypes();
    }
  }, [user, fetchMachines, fetchSocieties, fetchMachineTypes]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Handle add form submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});

    try {
      setFormLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch('/api/user/machine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Machine created successfully!');
        await fetchMachines();
        setShowAddForm(false);
        setFormData(initialFormData);
        setFieldErrors({});
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        } else {
          setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to create machine');
        }
      }
    } catch (error) {
      console.error('Error creating machine:', error);
      setError('Network error. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;
    
    setError('');
    setSuccess('');
    setFieldErrors({});

    try {
      setFormLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch('/api/user/machine', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: selectedMachine.id, ...formData })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Machine updated successfully!');
        await fetchMachines();
        setShowEditForm(false);
        setSelectedMachine(null);
        setFormData(initialFormData);
        setFieldErrors({});
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        } else {
          setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to update machine');
        }
      }
    } catch (error) {
      console.error('Error updating machine:', error);
      setError('Network error. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedMachine) return;

    try {
      setFormLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api/user/machine?id=${selectedMachine.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Machine deleted successfully!');
        await fetchMachines();
        setShowDeleteModal(false);
        setSelectedMachine(null);
      } else {
        setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to delete machine');
      }
    } catch (error) {
      console.error('Error deleting machine:', error);
      setError('Failed to delete machine');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (machine: Machine, newStatus: 'active' | 'inactive' | 'maintenance') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/machine', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: machine.id,
          machineId: machine.machineId,
          machineType: machine.machineType,
          societyId: machine.societyId,
          location: machine.location,
          installationDate: machine.installationDate,
          operatorName: machine.operatorName,
          contactPhone: machine.contactPhone,
          status: newStatus,
          notes: machine.notes
        })
      });

      if (response.ok) {
        setSuccess(`Status updated to ${newStatus}!`);
        await fetchMachines();
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

  // Modal management
  const openAddModal = () => {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    setFormData({
      ...initialFormData,
      installationDate: currentDate
    });
    setShowAddForm(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const handleEditClick = (machine: Machine) => {
    setSelectedMachine(machine);
    setFormData({
      machineId: machine.machineId,
      machineType: machine.machineType,
      societyId: machine.societyId.toString(),
      location: machine.location || '',
      installationDate: machine.installationDate || '',
      operatorName: machine.operatorName || '',
      contactPhone: machine.contactPhone || '',
      status: machine.status,
      notes: machine.notes || ''
    });
    setFieldErrors({}); // Clear field errors
    setError(''); // Clear general errors
    setShowEditForm(true);
  };

  const handleDeleteClick = (machine: Machine) => {
    setSelectedMachine(machine);
    setShowDeleteModal(true);
  };

  const closeAddModal = () => {
    setShowAddForm(false);
    setFormData(initialFormData);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const closeEditModal = () => {
    setShowEditForm(false);
    setSelectedMachine(null);
    setFormData(initialFormData);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedMachine(null);
  };

  // Filter machines
  const filteredMachines = machines.filter(machine => {
    const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      machine.machineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.machineType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (machine.societyName && machine.societyName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  return (
    <>
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:pb-8">
      {/* Page Header */}
      <PageHeader
        title="Machine Management"
        subtitle="Manage dairy equipment and machinery across societies"
        icon={<Settings className="w-5 h-5 sm:w-6 sm:h-6" />}
        onAdd={openAddModal}
        addButtonText="Add Machine"
      />

        {/* Success/Error Messages */}
        <StatusMessage 
          success={success} 
          error={error}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatsCard
            title="Total Machines"
            value={machines.length}
            icon={<Settings className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="green"
          />
          
          <StatsCard
            title="Active"
            value={machines.filter(m => m.status === 'active').length}
            icon={<Wrench className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="green"
          />

          <StatsCard
            title="Inactive"
            value={machines.filter(m => m.status === 'inactive').length}
            icon={<Settings className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="red"
          />

          <StatsCard
            title="Maintenance"
            value={machines.filter(m => m.status === 'maintenance').length}
            icon={<RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="yellow"
          />
        </div>

        {/* Filter Controls */}
        <FilterControls
          icon={<Settings className="w-4 h-4" />}
          showingText={`Showing ${filteredMachines.length} of ${machines.length} machines`}
          filterValue={statusFilter}
          filterOptions={statusOptions}
          onFilterChange={(value) => setStatusFilter(value as typeof statusFilter)}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <FlowerSpinner size={40} />
          </div>
        ) : filteredMachines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredMachines.map((machine) => (
              <ItemCard
                key={machine.id}
                id={machine.id}
                name={machine.machineId}
                identifier={machine.machineType}
                status={machine.status}
                icon={<Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />}
                onStatusChange={(status) => handleStatusChange(machine, status as 'active' | 'inactive' | 'maintenance')}
                details={[
                  ...(machine.societyName ? [{ 
                    icon: <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, 
                    text: machine.societyIdentifier 
                      ? `${machine.societyName} (${machine.societyIdentifier})` 
                      : machine.societyName,
                    highlight: true // Highlight society name and ID in green
                  }] : []),
                  ...(machine.location ? [{ icon: <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.location }] : []),
                  ...(machine.operatorName ? [{ icon: <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.operatorName }] : []),
                  ...(machine.contactPhone ? [{ icon: <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: machine.contactPhone }] : []),
                  ...(machine.installationDate ? [{ icon: <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: `Installed: ${new Date(machine.installationDate).toLocaleDateString()}` }] : [])
                ]}
                onEdit={() => handleEditClick(machine)}
                onDelete={() => handleDeleteClick(machine)}
                onView={() => router.push(`/admin/machine/${machine.id}`)}
                viewText="View"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Settings className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />}
            title="No machines found"
            message={statusFilter === 'all' 
              ? "You haven't added any machines yet. Click 'Add Machine' to get started."
              : `No machines found with status: ${statusFilter}`
            }
            actionText={statusFilter === 'all' ? 'Add Your First Machine' : undefined}
            onAction={statusFilter === 'all' ? openAddModal : undefined}
            showAction={statusFilter === 'all'}
          />
        )}
      </div>

      {/* Add Machine Modal - Positioned outside main container */}
      <FormModal
        isOpen={showAddForm}
        onClose={closeAddModal}
        title="Add New Machine"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 sm:space-y-6">
          <FormGrid>
            <FormInput
              label="Machine ID"
              value={formData.machineId}
              onChange={(value) => setFormData({ ...formData, machineId: value })}
              placeholder="e.g., MCH001, BMU-2024-001"
              required
              error={fieldErrors.machineId}
              colSpan={2}
            />

            <FormSelect
              label="Machine Type"
              value={formData.machineType}
              onChange={(value) => setFormData({ ...formData, machineType: value })}
              options={machineTypes.map(type => ({ 
                value: type.machineType, 
                label: type.machineType 
              }))}
              placeholder="Select Machine Type"
              required
              disabled={machineTypesLoading}
              error={fieldErrors.machineType}
            />

            <FormSelect
              label="Society"
              value={formData.societyId}
              onChange={(value) => setFormData({ ...formData, societyId: value })}
              options={societies.map(society => ({ 
                value: society.id, 
                label: `${society.name} (${society.society_id})` 
              }))}
              placeholder="Select Society"
              required
              disabled={societiesLoading}
              error={fieldErrors.societyId}
            />

            <FormInput
              label="Location"
              value={formData.location}
              onChange={(value) => setFormData({ ...formData, location: value })}
              placeholder="Installation location"
            />

            <FormInput
              label="Installation Date"
              type="date"
              value={formData.installationDate}
              onChange={(value) => setFormData({ ...formData, installationDate: value })}
            />

            <FormInput
              label="Operator Name"
              value={formData.operatorName}
              onChange={(value) => setFormData({ ...formData, operatorName: value })}
              placeholder="Machine operator name"
            />

            <FormInput
              label="Contact Phone"
              type="tel"
              value={formData.contactPhone}
              onChange={(value) => setFormData({ ...formData, contactPhone: value })}
              placeholder="Operator contact number"
            />

            <FormSelect
              label="Status"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' | 'maintenance' })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'maintenance', label: 'Under Maintenance' }
              ]}
            />

            <FormTextarea
              label="Notes"
              value={formData.notes}
              onChange={(value) => setFormData({ ...formData, notes: value })}
              placeholder="Additional notes or comments..."
              rows={3}
              colSpan={2}
            />
          </FormGrid>

          <FormError error={error} />

          <FormActions
            onCancel={closeAddModal}
            submitText="Add Machine"
            isLoading={formLoading}
          />
        </form>
      </FormModal>

      {/* Edit Machine Modal */}
      <FormModal
        isOpen={showEditForm && !!selectedMachine}
        onClose={closeEditModal}
        title="Edit Machine"
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 sm:space-y-6">
          <FormGrid>
            <FormInput
              label="Machine ID"
              value={formData.machineId}
              onChange={(value) => setFormData({ ...formData, machineId: value })}
              placeholder="e.g., MCH001, BMU-2024-001"
              required
              error={fieldErrors.machineId}
              colSpan={2}
            />

            <FormSelect
              label="Machine Type"
              value={formData.machineType}
              onChange={(value) => setFormData({ ...formData, machineType: value })}
              options={machineTypes.map(type => ({ 
                value: type.machineType, 
                label: type.machineType 
              }))}
              placeholder="Select Machine Type"
              required
              disabled={machineTypesLoading}
              error={fieldErrors.machineType}
            />

            <FormSelect
              label="Society"
              value={formData.societyId}
              onChange={(value) => setFormData({ ...formData, societyId: value })}
              options={societies.map(society => ({ 
                value: society.id, 
                label: `${society.name} (${society.society_id})` 
              }))}
              placeholder="Select Society"
              required
              disabled={societiesLoading}
              error={fieldErrors.societyId}
            />

            <FormInput
              label="Location"
              value={formData.location}
              onChange={(value) => setFormData({ ...formData, location: value })}
              placeholder="Installation location"
            />

            <FormInput
              label="Installation Date"
              type="date"
              value={formData.installationDate}
              onChange={(value) => setFormData({ ...formData, installationDate: value })}
            />

            <FormInput
              label="Operator Name"
              value={formData.operatorName}
              onChange={(value) => setFormData({ ...formData, operatorName: value })}
              placeholder="Machine operator name"
            />

            <FormInput
              label="Contact Phone"
              type="tel"
              value={formData.contactPhone}
              onChange={(value) => setFormData({ ...formData, contactPhone: value })}
              placeholder="Operator contact number"
            />

            <FormSelect
              label="Status"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' | 'maintenance' })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'maintenance', label: 'Under Maintenance' }
              ]}
            />

            <FormTextarea
              label="Notes"
              value={formData.notes}
              onChange={(value) => setFormData({ ...formData, notes: value })}
              placeholder="Additional notes or comments..."
              rows={3}
              colSpan={2}
            />
          </FormGrid>

          <FormError error={error} />

          <FormActions
            onCancel={closeEditModal}
            submitText="Update Machine"
            isLoading={formLoading}
          />
        </form>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal && !!selectedMachine}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Machine"
        itemName={selectedMachine?.machineId || ''}
        message="Are you sure you want to delete this machine? This action cannot be undone."
      />
    </>
  );
}
