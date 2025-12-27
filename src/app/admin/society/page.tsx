'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPhoneInput, validatePhoneOnBlur } from '@/lib/validation/phoneValidation';
import { validateEmailOnBlur, formatEmailInput } from '@/lib/validation/emailValidation';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
  Users, 
  Edit3, 
  MapPin,
  Phone,
  User,
  Calendar,
  Building2,
  Eye,
  EyeOff,
  Trash2,
  TrendingUp,
  Award,
  Droplets,
  Plus,
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
  FilterControls,
  FilterDropdown,
  EmptyState,
  StatusDropdown,
  LoadingSnackbar
} from '@/components';
import { PulseStatus } from '@/components/SectionPulseIndicator';
import BulkActionsToolbar from '@/components/management/BulkActionsToolbar';
import FloatingActionButton from '@/components/management/FloatingActionButton';
import PasswordConfirmDialog from '@/components/dialogs/PasswordConfirmDialog';
import DeleteSocietyModal from '@/components/modals/DeleteSocietyModal';

interface Society {
  id: number;
  name: string;
  societyId: string;
  location?: string;
  presidentName?: string;
  contactPhone?: string;
  email: string;
  bmcId: number;
  bmcName?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'suspended';
  createdAt: string;
  lastActivity?: string;
  memberCount?: number;
  totalCollections30d?: number;
  totalQuantity30d?: number;
  totalAmount30d?: number;
  weightedFat30d?: number;
  weightedSnf30d?: number;
  weightedClr30d?: number;
  weightedWater30d?: number;
}

interface SocietyFormData {
  name: string;
  societyId: string;
  password: string;
  location: string;
  presidentName: string;
  contactPhone: string;
  email: string;
  bmcId: string;
  status: 'active' | 'inactive' | 'maintenance' | 'suspended';
}

const initialFormData: SocietyFormData = {
  name: '',
  societyId: '',
  password: '',
  location: '',
  presidentName: '',
  contactPhone: '',
  email: '',
  bmcId: '',
  status: 'active'
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

export default function SocietyManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { t } = useLanguage();
  
  // State management
  const [societies, setSocieties] = useState<Society[]>([]);
  const [bmcs, setBmcs] = useState<Array<{ id: number; name: string; bmcId: string; dairyFarmId?: number }>>([]);
  const [dairies, setDairies] = useState<Array<{ id: number; name: string; dairyId: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [bmcsLoading, setBmcsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<SocietyFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance' | 'suspended'>('all');
  const [dairyFilter, setDairyFilter] = useState<string[]>([]);
  const [bmcFilter, setBmcFilter] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    societyId?: string;
    name?: string;
    bmcId?: string;
    contactPhone?: string;
    email?: string;
  }>({});
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [selectedSocieties, setSelectedSocieties] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<'active' | 'inactive' | 'maintenance' | 'suspended'>('active');
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [graphMetric, setGraphMetric] = useState<'quantity' | 'revenue' | 'fat' | 'snf' | 'collections' | 'water'>('quantity');
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showAddPassword, setShowAddPassword] = useState(false);
  
  // Pulse tracking state
  const [pulseData, setPulseData] = useState<{
    totalSocieties: number;
    active: number;
    ended: number;
    notStarted: number;
    inactive: number;
    pulses: (PulseStatus & { societyName?: string })[];
  } | null>(null);

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
        email?: string;
        bmc_id: number;
        bmc_name?: string;
        status: string;
        created_at: string;
        updated_at: string;
        total_collections_30d?: number;
        total_quantity_30d?: number;
        total_amount_30d?: number;
        weighted_fat_30d?: number;
        weighted_snf_30d?: number;
        weighted_clr_30d?: number;
        weighted_water_30d?: number;
      }) => ({
        id: society.id,
        name: society.name,
        societyId: society.society_id,
        location: society.location,
        presidentName: society.president_name,
        contactPhone: society.contact_phone,
        email: society.email || '',
        bmcId: society.bmc_id,
        bmcName: society.bmc_name,
        status: society.status as 'active' | 'inactive' | 'maintenance',
        createdAt: society.created_at,
        updatedAt: society.updated_at,
        totalCollections30d: Number(society.total_collections_30d) || 0,
        totalQuantity30d: Number(society.total_quantity_30d) || 0,
        totalAmount30d: Number(society.total_amount_30d) || 0,
        weightedFat30d: Number(society.weighted_fat_30d) || 0,
        weightedSnf30d: Number(society.weighted_snf_30d) || 0,
        weightedClr30d: Number(society.weighted_clr_30d) || 0,
        weightedWater30d: Number(society.weighted_water_30d) || 0
      }));
      setSocieties(transformedSocieties);
    } catch (error) {
      console.error('Error fetching societies:', error);
      setError('Failed to load society data');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Fetch dairies for filtering
  const fetchDairies = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/dairy', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDairies(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching dairies:', error);
    }
  }, []);

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

  // Fetch pulse data for ECG indicators
  const fetchPulseData = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return;
      }

      const response = await fetch('/api/user/pulse', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-user-id': user?.id?.toString() || ''
        }
      });

      if (response.ok) {
        const result = await response.json();
        setPulseData(result.data || null);
      }
    } catch (error) {
      console.error('Error fetching pulse data:', error);
    }
  }, [user?.id]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.relative')) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  // Handle society selection
  const handleSelectSociety = (societyId: number) => {
    setSelectedSocieties(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(societyId)) {
        newSelected.delete(societyId);
      } else {
        newSelected.add(societyId);
      }
      return newSelected;
    });
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus?: string) => {
    if (selectedSocieties.size === 0) return;

    const statusToUpdate = newStatus || bulkStatus;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const societyIds = Array.from(selectedSocieties);

      console.log(`🔄 Bulk updating ${societyIds.length} societies to status: ${statusToUpdate}`);

      const updatePromises = societyIds.map(id => {
        const society = societies.find(s => s.id === id);
        if (!society) return Promise.resolve();

        return fetch('/api/user/society', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: society.id,
            name: society.name,
            societyId: society.societyId,
            location: society.location || '',
            presidentName: society.presidentName || '',
            contactPhone: society.contactPhone || '',
            bmcId: society.bmcId,
            status: statusToUpdate
          })
        });
      });

      await Promise.all(updatePromises);
      
      console.log(`✅ Successfully updated ${societyIds.length} societies to ${statusToUpdate}`);
      
      setSuccess(`Updated ${societyIds.length} ${societyIds.length === 1 ? 'society' : 'societies'} to ${statusToUpdate}!`);
      await fetchSocieties();
      setSelectedSocieties(new Set());
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Bulk update error:', error);
      setError('Failed to update societies');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk delete - show confirmation dialog
  const handleBulkDeleteClick = () => {
    if (selectedSocieties.size === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  // Handle select all societies
  const handleSelectAll = () => {
    const allSocietyIds = new Set(filteredSocieties.map(society => society.id));
    setSelectedSocieties(allSocietyIds);
  };

  // Handle bulk delete with password confirmation
  const handleBulkDeleteConfirm = async (password: string) => {
    setShowBulkDeleteConfirm(false);
    setIsDeletingBulk(true);

    try {
      const token = localStorage.getItem('authToken');
      const societyIds = Array.from(selectedSocieties);

      console.log(`🗑️ Bulk deleting ${societyIds.length} societies with password verification:`, societyIds);

      // Delete societies in parallel with password verification
      const deletePromises = societyIds.map(id => 
        fetch('/api/user/society/delete', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id, password })
        }).then(async (res) => {
          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Delete failed');
          }
          return res.json();
        })
      );

      const results = await Promise.allSettled(deletePromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (successful > 0) {
        console.log(`✅ Successfully deleted ${successful} societies`);
        setSuccess(`Successfully deleted ${successful} ${successful === 1 ? 'society' : 'societies'}${failed > 0 ? `. ${failed} failed.` : ''}`);
        await fetchSocieties();
        setSelectedSocieties(new Set());
        setTimeout(() => setSuccess(''), 5000);
      } else {
        console.error(`❌ Failed to delete all ${societyIds.length} societies`);
        setError('Failed to delete societies. Please check your password and try again.');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete societies');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsDeletingBulk(false);
    }
  };

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
        email: string;
        bmcId?: number;
        status?: 'active' | 'inactive' | 'maintenance' | 'suspended';
        password?: string;
      } = {
        id: selectedSociety.id,
        name: formData.name,
        location: formData.location,
        presidentName: formData.presidentName,
        contactPhone: formData.contactPhone,
        email: formData.email,
        bmcId: parseInt(formData.bmcId),
        status: formData.status
      };

      // Only include password if it was changed from the original
      if (formData.password && formData.password !== currentPassword) {
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



  // Delete society with OTP confirmation
  const handleConfirmDelete = async (otp: string) => {
    if (!selectedSociety) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/society/delete?id=${selectedSociety.id}&otp=${otp}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete society');
      }

      setSuccess('Society and all related data deleted successfully!');
      setShowDeleteModal(false);
      setSelectedSociety(null);
      await fetchSocieties();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting society:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete society');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsDeleting(false);
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
  const handleEditClick = async (society: Society) => {
    setSelectedSociety(society);
    setFieldErrors({}); // Clear field errors
    setError(''); // Clear general errors
    setShowPassword(false); // Reset password visibility
    fetchBmcs(); // Load BMCs when opening edit form
    
    // Fetch current password from database
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/society/password?id=${society.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Password fetch response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Password fetch result:', result);
        // Handle both wrapped (result.data.password) and direct (result.password) responses
        const fetchedPassword = result.data?.password || result.password || '';
        console.log('Fetched password:', fetchedPassword);
        setCurrentPassword(fetchedPassword);
        
        // Set form data with fetched password
        setFormData({
          name: society.name,
          societyId: society.societyId,
          password: fetchedPassword,
          location: society.location || '',
          presidentName: society.presidentName || '',
          contactPhone: society.contactPhone || '',
          email: society.email || '',
          bmcId: society.bmcId?.toString() || '',
          status: society.status
        });
      } else {
        const errorData = await response.json();
        console.error('Password fetch failed:', errorData);
        // Fallback if password fetch fails
        setCurrentPassword('');
        setFormData({
          name: society.name,
          societyId: society.societyId,
          password: '',
          location: society.location || '',
          presidentName: society.presidentName || '',
          contactPhone: society.contactPhone || '',
          email: society.email || '',
          bmcId: society.bmcId?.toString() || '',
          status: society.status
        });
      }
    } catch (error) {
      console.error('Error fetching password:', error);
      setCurrentPassword('');
      setFormData({
        name: society.name,
        societyId: society.societyId,
        password: '',
        location: society.location || '',
        presidentName: society.presidentName || '',
        contactPhone: society.contactPhone || '',
        email: society.email || '',
        bmcId: society.bmcId?.toString() || '',
        status: society.status
      });
    }
    
    setShowEditForm(true);
  };

  // Open delete modal
  const handleDeleteClick = (society: Society) => {
    setSelectedSociety(society);
    // Store society ID for OTP modal
    (window as { selectedSocietyId?: number }).selectedSocietyId = society.id;
    setShowDeleteModal(true);
  };

  // Handle status change
  const handleStatusChange = async (society: Society, newStatus: 'active' | 'inactive' | 'maintenance' | 'suspended') => {
    console.log('Status change triggered:', { societyId: society.id, currentStatus: society.status, newStatus });
    
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const payload = {
        id: society.id,
        name: society.name,
        societyId: society.societyId,
        location: society.location || '',
        presidentName: society.presidentName || '',
        contactPhone: society.contactPhone || '',
        bmcId: society.bmcId,
        status: newStatus
      };
      
      console.log('Sending update request:', payload);
      
      const response = await fetch('/api/user/society', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('API response:', { status: response.status, data: result });

      if (response.ok) {
        setSuccess(`Status updated to ${newStatus}!`);
        await fetchSocieties();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorMessage = result.error || 'Failed to update status';
        console.error('Update failed:', errorMessage);
        setError(errorMessage);
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Filter societies based on search term and status
  const filteredSocieties = societies.filter(society => {
    const matchesSearch = searchQuery === '' ||
                         society.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         society.societyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         society.presidentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         society.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         society.contactPhone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         society.bmcName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || society.status === statusFilter;
    
    // Find the BMC for this society
    const societyBmc = bmcs.find(b => b.id === society.bmcId);
    
    // Filter by BMC if bmcFilter is set
    const matchesBmc = bmcFilter.length === 0 || bmcFilter.includes(societyBmc?.id.toString() || '');
    
    // Filter by Dairy - if dairy is selected, check if the society's BMC belongs to that dairy
    const matchesDairy = dairyFilter.length === 0 || 
                        (societyBmc?.dairyFarmId ? dairyFilter.includes(societyBmc.dairyFarmId.toString()) : false);
    
    return matchesSearch && matchesStatus && matchesBmc && matchesDairy;
  });

  useEffect(() => {
    fetchSocieties();
    fetchDairies();
    fetchBmcs();
    fetchPulseData();
    
    // Apply BMC filter from URL if present
    const bmcFilterParam = searchParams.get('bmcFilter');
    if (bmcFilterParam) {
      setBmcFilter([bmcFilterParam]);
    }
    
    // Apply Dairy filter from URL if present
    const dairyFilterParam = searchParams.get('dairyFilter');
    if (dairyFilterParam) {
      setDairyFilter([dairyFilterParam]);
    }
    
    // Poll pulse data every 30 seconds for live updates
    const pulseInterval = setInterval(() => {
      fetchPulseData();
    }, 30000); // 30 seconds
    
    return () => clearInterval(pulseInterval);
  }, [fetchSocieties, fetchDairies, fetchBmcs, fetchPulseData, searchParams]);

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
        title="Society Management"
        subtitle="Manage societies and their operations"
        icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
        onRefresh={fetchSocieties}
      />

      {/* Success/Error Messages */}
      <StatusMessage 
        success={success} 
        error={error}
      />

      {/* Top Performers Section */}
      {societies.length > 0 && (() => {
        const societiesWithStats = societies.filter(s => s.totalQuantity30d && s.totalQuantity30d > 0);
        
        const topCollection = [...societiesWithStats].sort((a, b) => 
          (b.totalQuantity30d || 0) - (a.totalQuantity30d || 0)
        )[0];
        
        const topRevenue = [...societiesWithStats].sort((a, b) => 
          (b.totalAmount30d || 0) - (a.totalAmount30d || 0)
        )[0];
        
        const topFat = [...societiesWithStats].sort((a, b) => 
          (b.weightedFat30d || 0) - (a.weightedFat30d || 0)
        )[0];
        
        const topSnf = [...societiesWithStats].sort((a, b) => 
          (b.weightedSnf30d || 0) - (a.weightedSnf30d || 0)
        )[0];
        
        const mostCollections = [...societiesWithStats].sort((a, b) => 
          (b.totalCollections30d || 0) - (a.totalCollections30d || 0)
        )[0];
        
        const mostWater = [...societiesWithStats].sort((a, b) => 
          (b.weightedWater30d || 0) - (a.weightedWater30d || 0)
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
                <p className="text-sm text-green-600 dark:text-green-400">{topCollection.totalQuantity30d?.toFixed(2)} L</p>
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
                <p className="text-sm text-blue-600 dark:text-blue-400">₹{topRevenue.totalAmount30d?.toFixed(2)}</p>
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
                <p className="text-sm text-purple-600 dark:text-purple-400">{topFat.weightedFat30d?.toFixed(2)}% Fat</p>
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
                <p className="text-sm text-orange-600 dark:text-orange-400">{topSnf.weightedSnf30d?.toFixed(2)}% SNF</p>
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
                <p className="text-sm text-pink-600 dark:text-pink-400">{mostCollections.totalCollections30d} Collections</p>
              </div>
            )}
            
            {mostWater && (
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
                <p className="text-lg font-bold text-red-800 dark:text-red-200">{mostWater.name}</p>
                <p className="text-sm text-red-600 dark:text-red-400">{mostWater.weightedWater30d?.toFixed(2)}% Water</p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Filter Controls */}
      {/* FilterDropdown for Dairy and BMC */}
      <FilterDropdown
        statusFilter={statusFilter}
        onStatusChange={(value) => setStatusFilter(value as typeof statusFilter)}
        dairyFilter={dairyFilter}
        onDairyChange={(value) => setDairyFilter(Array.isArray(value) ? value : [value])}
        bmcFilter={bmcFilter}
        onBmcChange={(value) => setBmcFilter(Array.isArray(value) ? value : [value])}
        societyFilter={[]}
        onSocietyChange={() => {}}
        machineFilter={[]}
        onMachineChange={() => {}}
        dairies={dairies}
        bmcs={bmcs}
        societies={societies.map(s => ({ ...s, bmc_id: s.bmcId, society_id: s.societyId }))}
        machines={[]}
        filteredCount={filteredSocieties.length}
        totalCount={societies.length}
        searchQuery={searchQuery}
        hideMainFilterButton={true}
        hideSocietyFilter={true}
      />

      <FilterControls
        icon={<Users className="w-4 h-4" />}
        showingText={`Showing ${filteredSocieties.length} of ${societies.length} societies`}
        filterValue={statusFilter}
        filterOptions={[
          { value: 'all', label: 'All Status' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'maintenance', label: 'Maintenance' },
          { value: 'suspended', label: 'Suspended' }
        ]}
        onFilterChange={(value) => setStatusFilter(value as typeof statusFilter)}
      />

      {/* Main Content */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredSocieties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredSocieties.map((society) => (
            <div key={society.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-visible border border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700 relative z-10 hover:z-20">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedSocieties.has(society.id)}
                      onChange={() => handleSelectSociety(society.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 flex-shrink-0"
                    />
                    <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex-shrink-0">
                      <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{highlightText(society.name, searchQuery)}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{highlightText(society.societyId, searchQuery)}</p>
                    </div>
                  </div>
                  <StatusDropdown
                    currentStatus={society.status}
                    onStatusChange={(status) => handleStatusChange(society, status as 'active' | 'inactive' | 'maintenance' | 'suspended')}
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
                      },
                      {
                        status: 'suspended',
                        label: 'Suspended',
                        color: 'bg-orange-500',
                        bgColor: 'hover:bg-orange-50 dark:hover:bg-orange-900/30'
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
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{highlightText(society.presidentName || 'No President', searchQuery)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{highlightText(society.contactPhone || 'No Phone', searchQuery)}</span>
                  </div>
                </div>

                {/* Location & BMC - Two Columns */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{highlightText(society.location || 'No Location', searchQuery)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate">{highlightText(society.bmcName || 'No BMC', searchQuery)}</span>
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
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{society.totalCollections30d || 0}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{(society.totalQuantity30d || 0).toFixed(2)} Liters</div>
                  </div>
                </div>

                {/* Quality Metrics - Three Columns */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Fat</div>
                    <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{(society.weightedFat30d || 0).toFixed(2)}%</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">SNF</div>
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400">{(society.weightedSnf30d || 0).toFixed(2)}%</div>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">CLR</div>
                    <div className="text-sm font-bold text-pink-600 dark:text-pink-400">{(society.weightedClr30d || 0).toFixed(1)}</div>
                  </div>
                </div>

                {/* Revenue */}
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Revenue</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{(society.totalAmount30d || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 rounded-b-lg">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(society)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(society)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  {/* Pulse Indicator - ECG Style */}
                  {(() => {
                    const societyPulse = pulseData?.pulses?.find(p => p.societyId === society.id);
                    const hasActivePulse = societyPulse?.pulseStatus === 'active';
                    const hasPausedPulse = societyPulse?.pulseStatus === 'paused';
                    const hasEndedPulse = societyPulse?.pulseStatus === 'ended';
                    const isInactive = societyPulse?.pulseStatus === 'inactive';
                    
                    // Determine color based on status
                    const getColor = () => {
                      if (hasActivePulse) return 'text-green-500';
                      if (hasPausedPulse) return 'text-orange-500';
                      if (hasEndedPulse) return 'text-red-500';
                      if (isInactive) return 'text-gray-400';
                      return 'text-gray-300';
                    };
                    
                    // Determine status text
                    const getStatusText = () => {
                      if (hasActivePulse) return 'Active';
                      if (hasPausedPulse) return 'Paused';
                      if (hasEndedPulse) return 'Ended';
                      if (isInactive) return `${societyPulse.inactiveDays}d`;
                      return 'No Pulse';
                    };
                    
                    // Generate tooltip with section start time from database
                    const getTooltip = () => {
                      if (!societyPulse) return 'No Pulse';
                      
                      const formatDateTime = (dateTime: Date | string | null | undefined, addOffset = false) => {
                        if (!dateTime) return 'N/A';
                        const str = dateTime.toString();
                        const dateMatch = str.match(/(\d{4})-(\d{2})-(\d{2})/);
                        const timeMatch = str.match(/(\d{2}):(\d{2}):(\d{2})/);
                        if (dateMatch && timeMatch) {
                          let hours = parseInt(timeMatch[1]);
                          let minutes = parseInt(timeMatch[2]);
                          const seconds = timeMatch[3];

                          if (addOffset) {
                            // Add 5 hours 30 minutes
                            minutes += 30;
                            hours += 5;
                            if (minutes >= 60) {
                              hours += 1;
                              minutes -= 60;
                            }
                            if (hours >= 24) {
                              hours -= 24;
                            }
                          }

                          const formattedHours = hours.toString().padStart(2, '0');
                          const formattedMinutes = minutes.toString().padStart(2, '0');
                          return `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]} ${formattedHours}:${formattedMinutes}:${seconds}`;
                        }
                        return 'N/A';
                      };

                      const startTime = formatDateTime(societyPulse.createdAt);
                      const lastCollection = formatDateTime(societyPulse.lastCollectionTime, true); // Add +5:30 for pause time
                      const endTime = formatDateTime(societyPulse.sectionEndTime);

                      // Active: Show only start time
                      if (societyPulse.pulseStatus === 'active') {
                        return `Section Start: ${startTime}`;
                      }

                      // Paused: Show start time and paused time (last collection time + 5:30)
                      if (societyPulse.pulseStatus === 'paused') {
                        return `Start: ${startTime}\nPaused: ${lastCollection}`;
                      }

                      // Ended: Show start time and end time
                      if (societyPulse.pulseStatus === 'ended') {
                        return `Start: ${startTime}\nEnd: ${endTime}`;
                      }

                      // Inactive or other statuses
                      if (societyPulse.createdAt) {
                        return `Section Start: ${startTime}`;
                      }
                      
                      return societyPulse.statusMessage || getStatusText();
                    };
                    
                    return (
                      <div 
                        className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700" 
                        title={getTooltip()}
                      >
                        {/* ECG Wave or Flatline */}
                        <svg 
                          className={`w-6 h-4 ${getColor()}`} 
                          viewBox="0 0 24 16" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {hasActivePulse ? (
                            // ECG waveform for active pulse
                            <path
                              d="M0 8 L5 8 L6 3 L7 13 L8 8 L10 8 L11 5 L12 11 L13 8 L24 8"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="animate-pulse"
                            />
                          ) : (
                            // Flatline for no pulse/ended/inactive
                            <path
                              d="M0 8 L24 8"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          )}
                        </svg>
                        <span className={`text-xs ${getColor()}`}>
                          {getStatusText()}
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <button
                  onClick={() => router.push(`/admin/society/${society.id}`)}
                  className="flex items-center px-3 py-1.5 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  <span>View</span>
                </button>
              </div>
            </div>
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

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedSocieties.size}
        totalCount={filteredSocieties.length}
        onBulkDelete={handleBulkDeleteClick}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onSelectAll={handleSelectAll}
        onClearSelection={() => {
          setSelectedSocieties(new Set());
        }}
        itemType="society"
        showStatusUpdate={true}
        currentBulkStatus={bulkStatus}
        onBulkStatusChange={(status) => setBulkStatus(status as typeof bulkStatus)}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={[
          {
            icon: <Plus className="w-6 h-6 text-white" />,
            label: 'Add Society',
            onClick: () => {
              setFieldErrors({});
              setError('');
              setShowAddForm(true);
              fetchBmcs();
            },
            color: 'bg-gradient-to-br from-blue-500 to-blue-600'
          }
        ]}
        directClick={true}
      />

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
                  required
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

            <FormInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(value) => {
                const formatted = formatEmailInput(value);
                handleInputChange('email', formatted);
              }}
              onBlur={() => {
                const error = validateEmailOnBlur(formData.email);
                if (error) {
                  setFieldErrors(prev => ({ ...prev, email: error }));
                } else {
                  setFieldErrors(prev => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="Enter email address"
              error={fieldErrors.email}
              required
              colSpan={1}
            />

            <FormSelect
              label="Status"
              value={formData.status}
              onChange={(value) => handleInputChange('status', value)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'suspended', label: 'Suspended' }
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
              disabled={true}
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

            <FormInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(value) => {
                const formatted = formatEmailInput(value);
                handleInputChange('email', formatted);
              }}
              onBlur={() => {
                const error = validateEmailOnBlur(formData.email);
                if (error) {
                  setFieldErrors(prev => ({ ...prev, email: error }));
                } else {
                  setFieldErrors(prev => ({ ...prev, email: undefined }));
                }
              }}
              placeholder={selectedSociety?.email ? `Current: ${selectedSociety.email}` : "Enter email address"}
              error={fieldErrors.email}
              required
              colSpan={1}
              helperText="Current email address is pre-filled. Edit to change."
            />

            <FormSelect
              label="Status"
              value={formData.status}
              onChange={(value) => handleInputChange('status', value)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'suspended', label: 'Suspended' }
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

      {/* Delete Confirmation Modal - Individual Delete with OTP */}
      <DeleteSocietyModal
        isOpen={showDeleteModal && !!selectedSociety}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedSociety(null);
        }}
        onConfirm={handleConfirmDelete}
        societyName={selectedSociety?.name || ''}
        loading={isDeleting}
      />

      {/* Bulk Delete Password Confirmation Dialog */}
      <PasswordConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDeleteConfirm}
        title={`Delete ${selectedSocieties.size} ${selectedSocieties.size === 1 ? 'Society' : 'Societies'}`}
        message={`Enter your admin password to confirm deletion of ${selectedSocieties.size} selected ${selectedSocieties.size === 1 ? 'society' : 'societies'}. This action cannot be undone and will be logged for security purposes.`}
      />

      {/* Loading Snackbar */}
      <LoadingSnackbar
        isVisible={loading || isDeletingBulk || isDeleting}
        message={
          isDeletingBulk 
            ? `Deleting ${selectedSocieties.size} ${selectedSocieties.size === 1 ? 'Society' : 'Societies'}` 
            : isDeleting 
            ? "Deleting Society" 
            : "Processing"
        }
        submessage={
          isDeletingBulk || isDeleting 
            ? "Verifying credentials and removing data..." 
            : "Please wait..."
        }
        showProgress={false}
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
                const societiesWithStats = societies.filter(s => s.totalQuantity30d && s.totalQuantity30d > 0);
                
                // Prepare data for line chart (all societies)
                const chartData = societiesWithStats.map(society => ({
                  name: society.name,
                  societyId: society.societyId,
                  value: graphMetric === 'quantity' ? (society.totalQuantity30d || 0) :
                         graphMetric === 'revenue' ? (society.totalAmount30d || 0) :
                         graphMetric === 'fat' ? (society.weightedFat30d || 0) :
                         graphMetric === 'snf' ? (society.weightedSnf30d || 0) :
                         graphMetric === 'collections' ? (society.totalCollections30d || 0) :
                         (society.weightedWater30d || 0)
                })).sort((a, b) => b.value - a.value);

                // Get color and settings
                const getLineColor = () => {
                  switch (graphMetric) {
                    case 'quantity': return '#10b981';
                    case 'revenue': return '#3b82f6';
                    case 'fat': return '#8b5cf6';
                    case 'snf': return '#f59e0b';
                    case 'collections': return '#ec4899';
                    case 'water': return '#ef4444';
                    default: return '#6b7280';
                  }
                };

                const getYAxisLabel = () => {
                  switch (graphMetric) {
                    case 'quantity': return 'Quantity (L)';
                    case 'revenue': return 'Revenue (₹)';
                    case 'fat': return 'Fat %';
                    case 'snf': return 'SNF %';
                    case 'collections': return 'Collections';
                    case 'water': return 'Water %';
                    default: return 'Value';
                  }
                };

                const CustomTooltip = ({ active, payload }: {
                  active?: boolean;
                  payload?: Array<{
                    payload: { name: string; societyId: string; value: number };
                  }>;
                }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                        <p className="font-bold text-gray-900 dark:text-white mb-1">{data.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">({data.societyId})</p>
                        <p className="font-semibold" style={{ color: getLineColor() }}>
                          {graphMetric === 'revenue' && '₹'}
                          {data.value.toFixed(2)}
                          {graphMetric === 'fat' || graphMetric === 'snf' || graphMetric === 'water' ? '%' : ''}
                          {graphMetric === 'quantity' ? ' L' : ''}
                        </p>
                      </div>
                    );
                  }
                  return null;
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
                            value: 'Society Name', 
                            position: 'insideBottom', 
                            offset: -5,
                            style: { fontSize: 13, fontWeight: 500, fill: '#9ca3af' }
                          }}
                        />
                        <YAxis 
                          label={{ 
                            value: getYAxisLabel(), 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { fontSize: 14, fontWeight: 600 }
                          }}
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={getLineColor()} 
                          strokeWidth={3}
                          dot={{ fill: getLineColor(), r: 5 }}
                          activeDot={{ r: 7 }}
                          name={getYAxisLabel()}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No data available for the last 30 days</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}