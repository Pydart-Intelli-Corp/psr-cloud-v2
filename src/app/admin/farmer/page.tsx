'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { useUser } from '@/contexts/UserContext';
// import { useLanguage } from '@/contexts/LanguageContext';
import { Users, UserCheck, UserX, AlertTriangle, Phone, Building2, Upload, Trash2, Download } from 'lucide-react';
import { 
  FlowerSpinner,
  FormModal, 
  FormInput, 
  FormSelect, 
  FormActions, 
  FormGrid,
  StatusMessage,
  StatsCard,
  ItemCard,
  EmptyState,
  ColumnSelectionModal
} from '@/components';
import StatusDropdown from '@/components/management/StatusDropdown';
import CSVUploadModal from '@/components/forms/CSVUploadModal';
import { downloadFarmersAsCSV, downloadFarmersAsPDF, getFarmerColumns } from '@/lib/utils/downloadUtils';

import { Society } from '@/types';



interface Farmer {
  id: number;
  farmerId: string;
  rfId?: string;
  farmerName: string;
  password?: string;
  contactNumber?: string;
  smsEnabled: string;
  bonus: number;
  address?: string;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  societyId?: number;
  societyName?: string;
  societyIdentifier?: string;
  machineId?: number;
  machineName?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

const FarmerManagement = () => {
  // const { t } = useLanguage(); // Will be used when translations are implemented
  const router = useRouter();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [machines, setMachines] = useState<Array<{id: number, machineId: string, machineType: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended' | 'maintenance'>('all');
  const [societyFilter, setSocietyFilter] = useState<string>('all');
  const [machineFilter, setMachineFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bulkSocietyId, setBulkSocietyId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  
  // Selective deletion state
  const [selectedFarmers, setSelectedFarmers] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [showColumnSelection, setShowColumnSelection] = useState(false);
  
  // Bulk status update state
  const [bulkStatus, setBulkStatus] = useState<'active' | 'inactive' | 'suspended' | 'maintenance'>('active');

  // Form state
  const [formData, setFormData] = useState({
    farmerId: '',
    rfId: '',
    farmerName: '',
    contactNumber: '',
    smsEnabled: 'OFF',
    bonus: 0,
    address: '',
    bankName: '',
    bankAccountNumber: '',
    ifscCode: '',
    societyId: '',
    machineId: '',
    status: 'active',
    notes: ''
  });



  // Fetch farmers, societies, and machines
  useEffect(() => {
    fetchFarmers();
    fetchSocieties();
    fetchAllMachines();
  }, []);

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

  // Listen for global search events from header
  useEffect(() => {
    const handleGlobalSearch = (event: Event) => {
      const customEvent = event as CustomEvent;
      const query = customEvent.detail?.query || '';
      setSearchQuery(query);
    };

    window.addEventListener('globalSearch', handleGlobalSearch);
    return () => {
      window.removeEventListener('globalSearch', handleGlobalSearch);
    };
  }, []);

  const fetchFarmers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/farmer', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFarmers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Fetch all machines
  const fetchAllMachines = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/machine', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMachines(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
      setMachines([]);
    }
  };

  // Fetch machines by society ID
  const fetchMachinesBySociety = async (societyId: string) => {
    if (!societyId) {
      setMachines([]);
      return;
    }

    try {
      setMachinesLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/machine/by-society?societyId=${societyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMachines(data.data || []);
      } else {
        setMachines([]);
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
      setMachines([]);
    } finally {
      setMachinesLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const farmer = farmers.find(f => f.id === id);
      if (!farmer) return;

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
          smsEnabled: farmer.smsEnabled,
          bonus: farmer.bonus,
          address: farmer.address,
          bankName: farmer.bankName,
          bankAccountNumber: farmer.bankAccountNumber,
          ifscCode: farmer.ifscCode,
          societyId: farmer.societyId,
          machineId: farmer.machineId,
          status: newStatus,
          notes: farmer.notes
        })
      });

      if (response.ok) {
        setFarmers(prev =>
          prev.map(f => (f.id === id ? { ...f, status: newStatus } : f))
        );
        setSuccess('Farmer status updated successfully');
        setError('');
      } else {
        setError('Failed to update farmer status');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Error updating farmer status');
      setSuccess('');
    }
  };

  // Handle farmer deletion
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this farmer? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/farmer?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFarmers(prev => prev.filter(f => f.id !== id));
        setSuccess('Farmer deleted successfully');
        setError('');
      } else {
        setError('Failed to delete farmer. Please try again.');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error deleting farmer:', error);
      setError('Error deleting farmer. Please try again.');
      setSuccess('');
    }
  };

  // Selection handlers
  const handleSelectFarmer = (farmerId: number) => {
    setSelectedFarmers(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(farmerId)) {
        newSelected.delete(farmerId);
      } else {
        newSelected.add(farmerId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFarmers(new Set());
      setSelectAll(false);
    } else {
      // Select only the currently filtered farmers
      setSelectedFarmers(new Set(filteredFarmers.map(f => f.id)));
      setSelectAll(true);
    }
  };

  // Clear selections when filters or search change or keep only visible farmers
  useEffect(() => {
    if (selectedFarmers.size > 0) {
      // Calculate filtered farmers inline to avoid dependency issues
      const currentlyFilteredFarmers = farmers.filter(farmer => {
        const statusMatch = statusFilter === 'all' || farmer.status === statusFilter;
        const societyMatch = societyFilter === 'all' || farmer.societyId?.toString() === societyFilter;
        const machineMatch = machineFilter === 'all' || 
          (machineFilter === 'unassigned' && !farmer.machineId) ||
          farmer.machineId?.toString() === machineFilter;
        const searchMatch = searchQuery === '' || 
          farmer.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.farmerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.contactNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.rfId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.societyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.societyIdentifier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.bankName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.bankAccountNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.ifscCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farmer.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        return statusMatch && societyMatch && machineMatch && searchMatch;
      });
      
      // Keep only farmers that are still visible after filtering/searching
      const visibleFarmerIds = new Set(currentlyFilteredFarmers.map(f => f.id));
      const updatedSelection = new Set(
        Array.from(selectedFarmers).filter(id => visibleFarmerIds.has(id))
      );
      
      if (updatedSelection.size !== selectedFarmers.size) {
        setSelectedFarmers(updatedSelection);
        setSelectAll(false);
      }
    } else {
      setSelectAll(false);
    }
  }, [statusFilter, societyFilter, machineFilter, searchQuery, farmers, selectedFarmers]);

  const handleBulkDelete = async () => {
    if (selectedFarmers.size === 0) return;

    setIsDeletingBulk(true);
    try {
      const token = localStorage.getItem('authToken');
      const ids = Array.from(selectedFarmers);
      
      const response = await fetch(`/api/user/farmer?ids=${encodeURIComponent(JSON.stringify(ids))}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchFarmers(); // Refresh the list
        setSelectedFarmers(new Set());
        setSelectAll(false);
        setShowDeleteConfirm(false);
        setSuccess(`Successfully deleted ${ids.length} farmer(s)${(statusFilter !== 'all' || societyFilter !== 'all' || machineFilter !== 'all') ? ' from filtered results' : ''}`);
        setError('');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete selected farmers');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error deleting farmers:', error);
      setError('Error deleting selected farmers');
      setSuccess('');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus?: string) => {
    if (selectedFarmers.size === 0) return;

    const statusToUpdate = newStatus || bulkStatus;

    try {
      const token = localStorage.getItem('authToken');
      
      // Get the selected farmers for the update
      const selectedFarmersList = farmers.filter(farmer => selectedFarmers.has(farmer.id));
      
      // Create update promises for all selected farmers
      const updatePromises = selectedFarmersList.map(farmer => 
        fetch('/api/user/farmer', {
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
            smsEnabled: farmer.smsEnabled,
            bonus: farmer.bonus,
            address: farmer.address,
            bankName: farmer.bankName,
            bankAccountNumber: farmer.bankAccountNumber,
            ifscCode: farmer.ifscCode,
            societyId: farmer.societyId,
            machineId: farmer.machineId,
            status: statusToUpdate,
            notes: farmer.notes
          })
        })
      );

      const results = await Promise.allSettled(updatePromises);
      
      // Check results
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.length - successful;

      if (failed === 0) {
        await fetchFarmers(); // Refresh the list
        setSelectedFarmers(new Set());
        setSelectAll(false);
        setSuccess(`Successfully updated status to "${statusToUpdate}" for ${successful} farmer(s)${(statusFilter !== 'all' || societyFilter !== 'all') ? ' from filtered results' : ''}`);
        setError('');
      } else if (successful > 0) {
        await fetchFarmers(); // Refresh the list
        setSelectedFarmers(new Set());
        setSelectAll(false);
        setSuccess(`Updated ${successful} farmer(s) successfully. ${failed} failed.`);
        setError('Some farmers could not be updated. Please try again.');
      } else {
        setError('Failed to update farmer status. Please try again.');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error updating farmer status:', error);
      setError('Error updating farmer status');
      setSuccess('');
    }
  };

  // Handle opening column selection modal
  const handleOpenColumnSelection = () => {
    setShowColumnSelection(true);
  };

  // Handle download with selected columns
  const handleDownloadWithColumns = async (selectedColumns: string[], format: 'csv' | 'pdf') => {
    setIsDownloading(true);
    try {
      // If farmers are selected, download only selected farmers (that are also filtered)
      // If no farmers are selected, download all filtered farmers
      const farmersForDownload = selectedFarmers.size > 0 
        ? filteredFarmers.filter(farmer => selectedFarmers.has(farmer.id))
        : filteredFarmers;

      const farmersToDownload = farmersForDownload.map(farmer => ({
        farmerId: farmer.farmerId,
        rfId: farmer.rfId,
        farmerName: farmer.farmerName,
        contactNumber: farmer.contactNumber,
        email: farmer.contactNumber, // Using contactNumber as email since no separate email field
        societyId: farmer.societyId,
        address: farmer.address,
        notes: farmer.notes,
        status: farmer.status,
        smsEnabled: farmer.smsEnabled === 'ON',
        bonus: farmer.bonus,
        bankName: farmer.bankName,
        bankAccountNumber: farmer.bankAccountNumber,
        ifscCode: farmer.ifscCode
      }));

      const societiesData = societies.map(society => ({
        id: society.id,
        name: society.name,
        society_id: society.society_id
      }));

      const filters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        society: societyFilter !== 'all' ? societyFilter : undefined,
        selection: selectedFarmers.size > 0 ? `${selectedFarmers.size}-selected` : undefined
      };

      const downloadMessage = selectedFarmers.size > 0 
        ? `${selectedFarmers.size} selected farmer(s) downloaded successfully`
        : `${farmersToDownload.length} farmer(s) downloaded successfully`;

      if (format === 'csv') {
        downloadFarmersAsCSV(farmersToDownload, societiesData, filters, selectedColumns);
        setSuccess(`${downloadMessage} as CSV`);
      } else {
        await downloadFarmersAsPDF(farmersToDownload, societiesData, filters, selectedColumns);
        setSuccess(`${downloadMessage} as PDF`);
      }
    } catch (error) {
      console.error(`Error downloading ${format.toUpperCase()}:`, error);
      setError(`Failed to download ${format.toUpperCase()} file`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle add form submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.farmerId || !formData.farmerId.trim()) {
      setError('Please enter a farmer ID.');
      setSuccess('');
      return;
    }

    if (!formData.farmerName || !formData.farmerName.trim()) {
      setError('Please enter the farmer name.');
      setSuccess('');
      return;
    }

    if (!formData.societyId) {
      setError('Please select a society for the farmer.');
      setSuccess('');
      return;
    }

    if (!formData.machineId) {
      setError('Please select a machine for the farmer.');
      setSuccess('');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/farmer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          societyId: formData.societyId ? parseInt(formData.societyId) : null,
          bonus: Number(formData.bonus)
        })
      });

      if (response.ok) {
        setShowAddForm(false);
        setFormData({
          farmerId: '',
          rfId: '',
          farmerName: '',
          contactNumber: '',
          smsEnabled: 'OFF',
          bonus: 0,
          address: '',
          bankName: '',
          bankAccountNumber: '',
          ifscCode: '',
          societyId: '',
          machineId: '',
          status: 'active',
          notes: ''
        });
        setSuccess('Farmer created successfully');
        setError('');
        fetchFarmers();
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || 'Failed to create farmer';
        
        // Clear previous field errors
        setFieldErrors({});
        
        // Check for specific field errors
        if (errorMessage.toLowerCase().includes('farmer id') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ farmerId: 'This Farmer ID already exists' });
        } else if (errorMessage.toLowerCase().includes('farmer name') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ farmerName: 'This Farmer name already exists' });
        } else {
          setError(errorMessage);
        }
        setSuccess('');
      }
    } catch (error) {
      console.error('Error creating farmer:', error);
      setError('Error creating farmer. Please try again.');
      setSuccess('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmer) return;

    // Validate required fields
    if (!formData.farmerId || !formData.farmerId.trim()) {
      setError('Please enter a farmer ID.');
      setSuccess('');
      return;
    }

    if (!formData.farmerName || !formData.farmerName.trim()) {
      setError('Please enter the farmer name.');
      setSuccess('');
      return;
    }

    if (!formData.societyId) {
      setError('Please select a society for the farmer.');
      setSuccess('');
      return;
    }

    if (!formData.machineId) {
      setError('Please select a machine for the farmer.');
      setSuccess('');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/farmer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: selectedFarmer.id,
          ...formData,
          societyId: formData.societyId ? parseInt(formData.societyId) : null,
          bonus: Number(formData.bonus)
        })
      });

      if (response.ok) {
        setShowEditForm(false);
        setSelectedFarmer(null);
        setFormData({
          farmerId: '',
          rfId: '',
          farmerName: '',
          contactNumber: '',
          smsEnabled: 'OFF',
          bonus: 0,
          address: '',
          bankName: '',
          bankAccountNumber: '',
          ifscCode: '',
          societyId: '',
          machineId: '',
          status: 'active',
          notes: ''
        });
        setSuccess('Farmer updated successfully');
        setError('');
        fetchFarmers();
      } else {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || 'Failed to update farmer';
        
        // Clear previous field errors
        setFieldErrors({});
        
        // Check for specific field errors
        if (errorMessage.toLowerCase().includes('farmer id') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ farmerId: 'This Farmer ID already exists' });
        } else if (errorMessage.toLowerCase().includes('farmer name') && errorMessage.toLowerCase().includes('already exists')) {
          setFieldErrors({ farmerName: 'This Farmer name already exists' });
        } else {
          setError(errorMessage);
        }
        setSuccess('');
      }
    } catch (error) {
      console.error('Error updating farmer:', error);
      setError('Error updating farmer. Please try again.');
      setSuccess('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    // Validate required fields
    if (!bulkSocietyId) {
      setError('Please select a default society for bulk upload.');
      setSuccess('');
      return;
    }

    setIsSubmitting(true);

    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const farmers = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const farmer: Record<string, string | number> = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          
          // Map CSV headers to our farmer fields
          switch (header.toLowerCase()) {
            case 'id':
            case 'farmer_id':
            case 'farmerid':
              farmer.farmerId = value;
              break;
            case 'rf-id':
            case 'rfid':
            case 'rf_id':
              farmer.rfId = value;
              break;
            case 'name':
            case 'farmer_name':
            case 'farmername':
              farmer.farmerName = value;
              break;
            case 'mobile':
            case 'phone':
            case 'contact':
            case 'contact_number':
              farmer.contactNumber = value;
              break;
            case 'sms':
            case 'sms_enabled':
              farmer.smsEnabled = value.toUpperCase() === 'ON' ? 'ON' : 'OFF';
              break;
            case 'bonus':
              farmer.bonus = parseFloat(value) || 0;
              break;
            case 'address':
              farmer.address = value;
              break;
            case 'bank_name':
            case 'bankname':
              farmer.bankName = value;
              break;
            case 'bank_account_number':
            case 'account_number':
            case 'accountnumber':
              farmer.bankAccountNumber = value;
              break;
            case 'ifsc_code':
            case 'ifsc':
              farmer.ifscCode = value;
              break;
            case 'society_id':
            case 'societyid':
            case 'society':
              const societyId = parseInt(value);
              if (societyId && !isNaN(societyId)) {
                farmer.societyId = societyId;
              }
              break;
            case 'machine-id':
            case 'machine_id':
            case 'machineid':
              const machineId = parseInt(value);
              if (machineId && !isNaN(machineId)) {
                farmer.machineId = machineId;
              }
              break;
          }
        });

        // Ensure every farmer has a society ID - use CSV value if available, otherwise use default
        if (!farmer.societyId) {
          farmer.societyId = parseInt(bulkSocietyId);
        }

        return farmer;
      }).filter(farmer => farmer.farmerId && farmer.farmerName);

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/farmer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ farmers })
      });

      if (response.ok) {
        setShowBulkModal(false);
        setSelectedFile(null);
        setBulkSocietyId('');
        setSuccess('Farmers uploaded successfully');
        setError('');
        fetchFarmers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to upload farmers');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error uploading farmers:', error);
      setError('Error uploading farmers. Please try again.');
      setSuccess('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal control functions
  const openAddModal = () => {
    setFormData({
      farmerId: '',
      rfId: '',
      farmerName: '',
      contactNumber: '',
      smsEnabled: 'OFF',
      bonus: 0,
      address: '',
      bankName: '',
      bankAccountNumber: '',
      ifscCode: '',
      societyId: '',
      machineId: '',
      status: 'active',
      notes: ''
    });
    setShowAddForm(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const handleEditClick = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    const societyId = farmer.societyId?.toString() || '';
    setFormData({
      farmerId: farmer.farmerId,
      rfId: farmer.rfId || '',
      farmerName: farmer.farmerName,
      contactNumber: farmer.contactNumber || '',
      smsEnabled: farmer.smsEnabled,
      bonus: farmer.bonus,
      address: farmer.address || '',
      bankName: farmer.bankName || '',
      bankAccountNumber: farmer.bankAccountNumber || '',
      ifscCode: farmer.ifscCode || '',
      societyId: societyId,
      machineId: farmer.machineId?.toString() || '',
      status: farmer.status,
      notes: farmer.notes || ''
    });
    
    // Load machines for the farmer's society
    if (societyId) {
      fetchMachinesBySociety(societyId);
    }
    
    setShowEditForm(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const closeAddModal = () => {
    setShowAddForm(false);
    setFormData({
      farmerId: '',
      rfId: '',
      farmerName: '',
      contactNumber: '',
      smsEnabled: 'OFF',
      bonus: 0,
      address: '',
      bankName: '',
      bankAccountNumber: '',
      ifscCode: '',
      societyId: '',
      machineId: '',
      status: 'active',
      notes: ''
    });
    setError('');
    setSuccess('');
  };

  const closeEditModal = () => {
    setShowEditForm(false);
    setSelectedFarmer(null);
    setFormData({
      farmerId: '',
      rfId: '',
      farmerName: '',
      contactNumber: '',
      smsEnabled: 'OFF',
      bonus: 0,
      address: '',
      bankName: '',
      bankAccountNumber: '',
      ifscCode: '',
      societyId: '',
      machineId: '',
      status: 'active',
      notes: ''
    });
    setError('');
    setSuccess('');
  };

  // Filter farmers based on status, society, machine, and search query
  const filteredFarmers = farmers.filter(farmer => {
    const statusMatch = statusFilter === 'all' || farmer.status === statusFilter;
    const societyMatch = societyFilter === 'all' || farmer.societyId?.toString() === societyFilter;
    const machineMatch = machineFilter === 'all' || 
      (machineFilter === 'unassigned' && !farmer.machineId) ||
      farmer.machineId?.toString() === machineFilter;
    
    // Search match - search across multiple fields
    const searchMatch = searchQuery === '' || 
      farmer.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.farmerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.contactNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.rfId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.societyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.societyIdentifier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.machineName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.bankName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.bankAccountNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.ifscCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && societyMatch && machineMatch && searchMatch;
  });

  return (
    <>
    <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-3 xs:space-y-4 sm:space-y-6 lg:pb-8">
      {/* Page Header */}
      <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 xs:items-center xs:justify-between">
        <div className="flex items-center space-x-2 xs:space-x-3">
          <div className="p-2 xs:p-2.5 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
            <Users className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Farmer Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Manage farmers across societies
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowCSVUpload(true)}
            className="flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 rounded-md sm:rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Upload CSV</span>
            <span className="sm:hidden ml-1">CSV</span>
          </button>
          <button
            onClick={handleOpenColumnSelection}
            disabled={filteredFarmers.length === 0 || isDownloading}
            className="flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600 rounded-md sm:rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <FlowerSpinner size={12} className="sm:w-4 sm:h-4 sm:mr-2" />
            ) : (
              <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            )}
            <span className="hidden sm:inline">Download</span>
            <span className="sm:hidden ml-1">Export</span>
          </button>
          <button
            onClick={openAddModal}
            className="col-span-2 sm:col-span-1 flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-white bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 rounded-md sm:rounded-lg transition-colors"
          >
            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Add Farmer
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      <StatusMessage 
        success={success} 
        error={error}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 xs:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        <StatsCard
          title="Total"
          value={statusFilter !== 'all' || societyFilter !== 'all' || machineFilter !== 'all' ? `${filteredFarmers.length}/${farmers.length}` : farmers.length}
          icon={<Users className="w-3 h-3 sm:w-4 sm:h-4" />}
          color="green"
          className="p-2 sm:p-3"
        />
        
        <StatsCard
          title="Active"
          value={statusFilter !== 'all' || societyFilter !== 'all' || machineFilter !== 'all' ? 
            `${filteredFarmers.filter(f => f.status === 'active').length}/${farmers.filter(f => f.status === 'active').length}` :
            farmers.filter(f => f.status === 'active').length
          }
          icon={<UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />}
          color="green"
          className="p-2 sm:p-3"
        />

        <StatsCard
          title="Inactive"
          value={statusFilter !== 'all' || societyFilter !== 'all' || machineFilter !== 'all' ? 
            `${filteredFarmers.filter(f => f.status === 'inactive').length}/${farmers.filter(f => f.status === 'inactive').length}` :
            farmers.filter(f => f.status === 'inactive').length
          }
          icon={<UserX className="w-3 h-3 sm:w-4 sm:h-4" />}
          color="red"
          className="p-2 sm:p-3"
        />

        <StatsCard
          title="Suspended"
          value={statusFilter !== 'all' || societyFilter !== 'all' || machineFilter !== 'all' ? 
            `${filteredFarmers.filter(f => f.status === 'suspended').length}/${farmers.filter(f => f.status === 'suspended').length}` :
            farmers.filter(f => f.status === 'suspended').length
          }
          icon={<AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />}
          color="yellow"
          className="p-2 sm:p-3"
        />

        <StatsCard
          title="Maintenance"
          value={statusFilter !== 'all' || societyFilter !== 'all' || machineFilter !== 'all' ? 
            `${filteredFarmers.filter(f => f.status === 'maintenance').length}/${farmers.filter(f => f.status === 'maintenance').length}` :
            farmers.filter(f => f.status === 'maintenance').length
          }
          icon={<AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />}
          color="blue"
          className="p-2 sm:p-3"
        />
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
        {/* Header Info */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="font-medium text-xs sm:text-sm">{`${filteredFarmers.length}/${farmers.length} farmers`}</span>
          </div>
          {searchQuery && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-300 text-xs font-medium">
              <span>&ldquo;{searchQuery}&rdquo;</span>
            </div>
          )}
        </div>
        
        {/* Filters Grid - Mobile First */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {/* Society Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
              Society
            </label>
            <select
              value={societyFilter}
              onChange={(e) => setSocietyFilter(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="all">All Societies</option>
              {societies.map(society => (
                <option key={society.id} value={society.id.toString()}>
                  {society.name} ({society.society_id})
                </option>
              ))}
            </select>
          </div>

          {/* Machine Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
              Machine
            </label>
            <select
              value={machineFilter}
              onChange={(e) => setMachineFilter(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="all">All Machines</option>
              <option value="unassigned">Unassigned</option>
              {machines.map(machine => (
                <option key={machine.id} value={machine.id.toString()}>
                  {machine.machineId} - {machine.machineType}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            {(statusFilter !== 'all' || societyFilter !== 'all' || machineFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setSocietyFilter('all');
                  setMachineFilter('all');
                  setSearchQuery('');
                }}
                className="w-full xs:w-auto px-3 py-1.5 sm:py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Selection Controls */}
      {filteredFarmers.length > 0 && (
        <div className={`rounded-lg border p-3 sm:p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between ${(statusFilter !== 'all' || societyFilter !== 'all' || machineFilter !== 'all') ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
          {/* Top Row - Selection Controls */}
          <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3">
            {(statusFilter !== 'all' || societyFilter !== 'all' || machineFilter !== 'all') && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                <span>Filtered View</span>
              </div>
            )}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                Select All ({filteredFarmers.length})
              </span>
            </label>
            {selectedFarmers.size > 0 && (
              <div className="flex items-center space-x-1 xs:space-x-2">
                <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                  {selectedFarmers.size} selected
                </span>
                <span className="hidden xs:inline text-xs text-gray-500 dark:text-gray-400">
                  • Ready for bulk operations
                </span>
              </div>
            )}
          </div>
          
          {/* Bulk Actions */}
          {selectedFarmers.size > 0 && (
            <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-600 sm:pl-4">
              <div className="flex-1 xs:flex-initial">
                <StatusDropdown
                  currentStatus={bulkStatus}
                  onStatusChange={(status) => {
                    setBulkStatus(status as typeof bulkStatus);
                    handleBulkStatusUpdate(status);
                  }}
                />
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center justify-center space-x-2 px-3 py-2 text-xs sm:text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Delete Selected</span>
                <span className="xs:hidden">Delete ({selectedFarmers.size})</span>
                <span className="hidden xs:inline">({selectedFarmers.size})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Farmers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12 sm:py-20">
          <FlowerSpinner size={40} />
        </div>
      ) : filteredFarmers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarmers.map(farmer => (
          <ItemCard
            key={farmer.id}
            id={farmer.id}
            name={farmer.farmerName}
            identifier={`ID: ${farmer.farmerId}`}
            status={farmer.status}
            icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />}
            details={[
              ...(farmer.contactNumber ? [{ icon: <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: farmer.contactNumber }] : []),
              ...(farmer.societyName ? [{ 
                icon: <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, 
                text: farmer.societyIdentifier 
                  ? `${farmer.societyName} (${farmer.societyIdentifier})` 
                  : farmer.societyName,
                highlight: true // Highlight society name and ID in green
              }] : []),
              { icon: <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: `Bonus: ${farmer.bonus}` }
            ]}
            onStatusChange={(newStatus) => handleStatusChange(farmer.id, newStatus)}
            onView={() => router.push(`/admin/farmer/${farmer.id}`)}
            onEdit={() => handleEditClick(farmer)}
            onDelete={() => handleDelete(farmer.id)}
            viewText="View Details"
            selectable={true}
            selected={selectedFarmers.has(farmer.id)}
            onSelect={() => handleSelectFarmer(farmer.id)}
            searchQuery={searchQuery}
          />
        ))}
      </div>
      ) : (
        <EmptyState
          icon={<Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />}
          title={farmers.length === 0 ? 'No farmers found' : 'No matching farmers'}
          message={farmers.length === 0 
            ? 'Get started by adding your first farmer to the system.'
            : searchQuery 
              ? `No farmers match your search for "${searchQuery}". Try adjusting your search terms or clearing filters.`
              : 'No farmers match the current filters. Try adjusting your filter criteria.'
          }
          actionText={farmers.length === 0 ? 'Add First Farmer' : undefined}
          onAction={farmers.length === 0 ? openAddModal : undefined}
          showAction={farmers.length === 0}
        />
      )}
      </div>

      {/* Add Farmer Modal */}
      <FormModal
        isOpen={showAddForm}
        onClose={closeAddModal}
        title="Add New Farmer"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 sm:space-y-6">
          <FormGrid>
          {/* Mandatory Fields First */}
          <FormInput
            label="Farmer ID"
            type="text"
            value={formData.farmerId}
            onChange={(value) => setFormData({ ...formData, farmerId: value })}
            placeholder="Enter unique farmer ID (e.g., F001, FA-2024-001)"
            required
            error={fieldErrors.farmerId}
          />
          <FormInput
            label="Farmer Name"
            type="text"
            value={formData.farmerName}
            onChange={(value) => setFormData({ ...formData, farmerName: value })}
            placeholder="Enter farmer's full name"
            required
            error={fieldErrors.farmerName}
          />
          <FormSelect
            label="Society"
            value={formData.societyId}
            onChange={(value) => {
              setFormData({ ...formData, societyId: value, machineId: '' });
              fetchMachinesBySociety(value);
            }}
            options={societies.map(society => ({
              value: society.id.toString(),
              label: `${society.name} (${society.society_id})`
            }))}
            placeholder="Select Society"
            required
            colSpan={1}
          />
          
          {/* Machine Selection - Same row as society */}
          <FormSelect
            label="Machine"
            value={formData.machineId}
            onChange={(value) => setFormData({ ...formData, machineId: value })}
            options={machines.map(machine => ({
              value: machine.id.toString(),
              label: `${machine.machineId} - ${machine.machineType}`
            }))}
            placeholder={machinesLoading ? "Loading..." : machines.length > 0 ? "Select Machine" : "No machines available"}
            disabled={machinesLoading}
            required
            colSpan={1}
            className="sm:max-w-[320px]"
          />
          
          {/* Show message if society selected but no machines */}
          {formData.societyId && !machinesLoading && machines.length === 0 && (
            <div className="col-span-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                No machines found for this society. You can <strong>add machines first</strong> from the Machine Management section, or proceed without assigning a machine.
              </p>
            </div>
          )}
          
          {/* Contact Information */}
          <FormInput
            label="Contact Number"
            type="tel"
            value={formData.contactNumber}
            onChange={(value) => setFormData({ ...formData, contactNumber: value })}
            placeholder="Enter 10-digit mobile number"
          />
          <FormSelect
            label="SMS Enabled"
            value={formData.smsEnabled}
            onChange={(value) => setFormData({ ...formData, smsEnabled: value })}
            options={[
              { value: 'OFF', label: 'OFF' },
              { value: 'ON', label: 'ON' }
            ]}
            placeholder="Select SMS preference"
          />
          
          {/* Optional Fields */}
          <FormInput
            label="RF-ID"
            type="text"
            value={formData.rfId}
            onChange={(value) => setFormData({ ...formData, rfId: value })}
            placeholder="Enter RF card ID (optional)"
          />
          <FormInput
            label="Bonus"
            type="number"
            value={formData.bonus}
            onChange={(value) => setFormData({ ...formData, bonus: Number(value) })}
            placeholder="Enter bonus amount"
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
            placeholder="Select farmer status"
          />
          
          {/* Banking Information */}
          <FormInput
            label="Bank Name"
            type="text"
            value={formData.bankName}
            onChange={(value) => setFormData({ ...formData, bankName: value })}
            placeholder="Enter bank name (e.g., SBI, HDFC Bank)"
          />
          <FormInput
            label="Account Number"
            type="text"
            value={formData.bankAccountNumber}
            onChange={(value) => setFormData({ ...formData, bankAccountNumber: value })}
            placeholder="Enter bank account number"
          />
          <FormInput
            label="IFSC Code"
            type="text"
            value={formData.ifscCode}
            onChange={(value) => setFormData({ ...formData, ifscCode: value })}
            placeholder="Enter IFSC code (e.g., SBIN0001234)"
          />
          
          <FormInput
            label="Address"
            type="text"
            value={formData.address}
            onChange={(value) => setFormData({ ...formData, address: value })}
            placeholder="Enter farmer's address"
          />
          
          <FormInput
            label="Notes"
            type="text"
            value={formData.notes}
            onChange={(value) => setFormData({ ...formData, notes: value })}
            placeholder="Enter additional notes (optional)"
          />
        </FormGrid>
          
          <FormActions
            onCancel={closeAddModal}
            submitText="Create Farmer"
            isLoading={isSubmitting}
            isSubmitDisabled={!formData.societyId || !formData.machineId || !formData.farmerId || !formData.farmerName}
            submitType="submit"
          />
        </form>
      </FormModal>

      {/* Edit Farmer Modal */}
      <FormModal
        isOpen={showEditForm && !!selectedFarmer}
        onClose={closeEditModal}
        title="Edit Farmer"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 sm:space-y-6">
          <FormGrid>
          {/* Mandatory Fields First */}
          <FormInput
            label="Farmer ID"
            type="text"
            value={formData.farmerId}
            onChange={(value) => setFormData({ ...formData, farmerId: value })}
            placeholder="Enter unique farmer ID (e.g., F001, FA-2024-001)"
            required
            colSpan={1}
            error={fieldErrors.farmerId}
          />
          
          <FormInput
            label="Farmer Name"
            type="text"
            value={formData.farmerName}
            onChange={(value) => setFormData({ ...formData, farmerName: value })}
            placeholder="Enter farmer's full name"
            required
            colSpan={1}
            error={fieldErrors.farmerName}
          />
          
          <FormSelect
            label="Society"
            value={formData.societyId}
            onChange={(value) => {
              setFormData({ ...formData, societyId: value, machineId: '' });
              fetchMachinesBySociety(value.toString());
            }}
            options={societies.map(society => ({ value: society.id, label: `${society.name} (${society.society_id})` }))}
            placeholder="Select Society"
            required
            colSpan={1}
          />
          
          {/* Machine Selection - Same row as society */}
          <FormSelect
            label="Machine"
            value={formData.machineId}
            onChange={(value) => setFormData({ ...formData, machineId: value })}
            options={machines.map(machine => ({
              value: machine.id.toString(),
              label: `${machine.machineId} - ${machine.machineType}`
            }))}
            placeholder={machinesLoading ? "Loading..." : machines.length > 0 ? "Select Machine" : "No machines available"}
            disabled={machinesLoading}
            required
            colSpan={1}
            className="sm:max-w-[320px]"
          />

          {/* Optional Fields */}
          <FormInput
            label="RF ID"
            type="text"
            value={formData.rfId}
            onChange={(value) => setFormData({ ...formData, rfId: value })}
            placeholder="Enter RF ID (optional)"
            colSpan={1}
          />
          
          <FormInput
            label="Contact Number"
            type="tel"
            value={formData.contactNumber}
            onChange={(value) => setFormData({ ...formData, contactNumber: value })}
            placeholder="Enter mobile number"
            colSpan={1}
          />
          
          <FormSelect
            label="SMS Enabled"
            value={formData.smsEnabled}
            onChange={(value) => setFormData({ ...formData, smsEnabled: value })}
            options={[
              { value: 'OFF', label: 'OFF' },
              { value: 'ON', label: 'ON' }
            ]}
            colSpan={1}
          />
          
          <FormInput
            label="Bonus"
            type="number"
            value={formData.bonus}
            onChange={(value) => setFormData({ ...formData, bonus: parseFloat(value) || 0 })}
            placeholder="Enter bonus amount"
            colSpan={1}
          />
          
          <FormInput
            label="Address"
            type="text"
            value={formData.address}
            onChange={(value) => setFormData({ ...formData, address: value })}
            placeholder="Enter farmer's address"
            colSpan={2}
          />
          
          <FormInput
            label="Bank Name"
            type="text"
            value={formData.bankName}
            onChange={(value) => setFormData({ ...formData, bankName: value })}
            placeholder="Enter bank name"
            colSpan={1}
          />
          
          <FormInput
            label="Bank Account Number"
            type="text"
            value={formData.bankAccountNumber}
            onChange={(value) => setFormData({ ...formData, bankAccountNumber: value })}
            placeholder="Enter account number"
            colSpan={1}
          />
          
          <FormInput
            label="IFSC Code"
            type="text"
            value={formData.ifscCode}
            onChange={(value) => setFormData({ ...formData, ifscCode: value.toUpperCase() })}
            placeholder="Enter IFSC code"
            colSpan={1}
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
            colSpan={1}
          />
          
          <FormInput
            label="Notes"
            type="text"
            value={formData.notes}
            onChange={(value) => setFormData({ ...formData, notes: value })}
            placeholder="Enter additional notes (optional)"
            colSpan={2}
          />
          </FormGrid>
          
          <FormActions
            onCancel={closeEditModal}
            submitText="Update Farmer"
            isLoading={isSubmitting}
            isSubmitDisabled={!formData.societyId || !formData.machineId || !formData.farmerId || !formData.farmerName}
            submitType="submit"
          />
        </form>
      </FormModal>

      {/* Bulk Upload Modal */}
      <FormModal
        isOpen={showBulkModal}
        onClose={() => {
          setShowBulkModal(false);
          setBulkSocietyId('');
          setSelectedFile(null);
        }}
        title="Bulk Upload Farmers"
      >
        <form onSubmit={handleBulkUpload} className="space-y-4">
          <FormSelect
            label="Default Society"
            value={bulkSocietyId}
            onChange={(value) => setBulkSocietyId(value)}
            options={[
              ...societies.map(society => ({
                value: society.id.toString(),
                label: `${society.name} (${society.society_id})`
              }))
            ]}
            placeholder="Select Society"
            required
          />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>This society will be assigned to all farmers that don&apos;t have a society_id in the CSV</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium mb-2">CSV Format Requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Headers: ID, RF-ID, NAME, MOBILE, SMS, BONUS (minimum)</li>
              <li>Optional: ADDRESS, BANK_NAME, ACCOUNT_NUMBER, IFSC_CODE, SOCIETY_ID, MACHINE-ID</li>
              <li>SMS values: ON or OFF</li>
              <li>MACHINE-ID should be a valid machine ID (optional)</li>
              <li>All farmers must have a society - either from CSV SOCIETY_ID or the default above</li>
              <li>File should be UTF-8 encoded</li>
            </ul>
          </div>
          
          <FormActions
            onCancel={() => setShowBulkModal(false)}
            submitText="Upload Farmers"
            isLoading={isSubmitting}
            isSubmitDisabled={!selectedFile || !bulkSocietyId}
            submitType="submit"
          />
        </form>
      </FormModal>

      {/* Bulk Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Delete Selected Farmers
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete {selectedFarmers.size} selected farmer(s)
                {(statusFilter !== 'all' || societyFilter !== 'all') ? ' from the filtered results' : ''}? 
                This action cannot be undone.
              </p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={isDeletingBulk}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeletingBulk}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isDeletingBulk && <FlowerSpinner size={16} />}
                  <span>{isDeletingBulk ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* CSV Upload Modal */}
      <CSVUploadModal
        isOpen={showCSVUpload}
        onClose={() => setShowCSVUpload(false)}
        societies={societies}
        onUploadComplete={() => {
          fetchFarmers(); // Refresh the farmer list
          setSuccess('CSV upload completed successfully!');
        }}
      />

      {/* Column Selection Modal */}
      <ColumnSelectionModal
        isOpen={showColumnSelection}
        onClose={() => setShowColumnSelection(false)}
        onDownload={handleDownloadWithColumns}
        availableColumns={getFarmerColumns().map(col => ({
          key: col.key,
          label: col.header,
          required: ['farmerId'].includes(col.key) // Make farmer ID required
        }))}
        defaultColumns={['farmerId', 'rfId', 'farmerName', 'contactNumber', 'smsEnabled', 'bonus']}
        title="Select Columns for Farmer Download"
        isDownloading={isDownloading}
      />
    </>
  );
};

export default FarmerManagement;