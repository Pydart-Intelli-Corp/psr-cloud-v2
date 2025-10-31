'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  CreditCard, 
  Users,
  Hash,
  MessageSquare,
  Coins
} from 'lucide-react';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';

import FormGrid from '@/components/forms/FormGrid';
import { LoadingOverlay } from '@/components';
import StatusDropdown from '@/components/management/StatusDropdown';

interface Society {
  id: number;
  name: string;
}

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
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

const FarmerDetails = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const farmerId = params?.id as string;
  const isEditMode = searchParams?.get('edit') === 'true';

  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [activeTab, setActiveTab] = useState('details');

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
    status: 'active',
    notes: ''
  });

  // Fetch farmer details
  const fetchFarmerDetailsCallback = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/user/farmer?id=${farmerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFarmer(data.data?.[0] || null);
      }
    } catch (error) {
      console.error('Error fetching farmer details:', error);
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  useEffect(() => {
    if (farmerId) {
      fetchFarmerDetailsCallback();
      fetchSocieties();
    }
  }, [farmerId, fetchFarmerDetailsCallback]);

  // Update form data when farmer changes
  useEffect(() => {
    if (farmer) {
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
        societyId: farmer.societyId?.toString() || '',
        status: farmer.status,
        notes: farmer.notes || ''
      });
    }
  }, [farmer]);



  const fetchSocieties = async () => {
    try {
      const token = localStorage.getItem('token');
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

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (!farmer) return;

    try {
      const token = localStorage.getItem('token');
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
          status: newStatus,
          notes: farmer.notes
        })
      });

      if (response.ok) {
        setFarmer(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!farmer) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/farmer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: farmer.id,
          ...formData,
          societyId: formData.societyId ? parseInt(formData.societyId) : null,
          bonus: Number(formData.bonus)
        })
      });

      if (response.ok) {
        setIsEditing(false);
        fetchFarmerDetailsCallback();
        router.replace(`/admin/farmer/${farmerId}`);
      }
    } catch (error) {
      console.error('Error saving farmer:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!farmer || !confirm('Are you sure you want to delete this farmer?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user/farmer?id=${farmer.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        router.push('/admin/farmer');
      }
    } catch (error) {
      console.error('Error deleting farmer:', error);
    }
  };

  const tabs = [
    { id: 'details', label: 'Basic Details', icon: User },
    { id: 'contact', label: 'Contact & Society', icon: Phone },
    { id: 'banking', label: 'Banking Details', icon: CreditCard },
    { id: 'additional', label: 'Additional Info', icon: MessageSquare }
  ];

  if (loading) {
    return <LoadingOverlay isLoading={true} />;
  }

  if (!farmer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Farmer Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The requested farmer could not be found.
          </p>
          <button
            onClick={() => router.push('/admin/farmer')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Farmers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/farmer')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {farmer.farmerName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              ID: {farmer.farmerId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusDropdown
            currentStatus={farmer.status}
            onStatusChange={handleStatusChange}
            options={[
              { status: 'active', label: 'Active', color: 'bg-green-500', bgColor: 'hover:bg-green-50 dark:hover:bg-green-900/30' },
              { status: 'inactive', label: 'Inactive', color: 'bg-red-500', bgColor: 'hover:bg-red-50 dark:hover:bg-red-900/30' },
              { status: 'suspended', label: 'Suspended', color: 'bg-yellow-500', bgColor: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/30' },
              { status: 'maintenance', label: 'Maintenance', color: 'bg-blue-500', bgColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/30' }
            ]}
          />

          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  router.replace(`/admin/farmer/${farmerId}`);
                }}
                className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Details
            </h3>
            
            {isEditing ? (
              <FormGrid>
                <FormInput
                  label="Farmer ID"
                  type="text"
                  value={formData.farmerId}
                  onChange={(value) => setFormData({ ...formData, farmerId: value })}
                  required
                />
                <FormInput
                  label="RF-ID"
                  type="text"
                  value={formData.rfId}
                  onChange={(value) => setFormData({ ...formData, rfId: value })}
                />
                <FormInput
                  label="Farmer Name"
                  type="text"
                  value={formData.farmerName}
                  onChange={(value) => setFormData({ ...formData, farmerName: value })}
                  required
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
                />
              </FormGrid>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Farmer ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{farmer.farmerId}</p>
                  </div>
                </div>
                
                {farmer.rfId && (
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">RF-ID</p>
                      <p className="font-medium text-gray-900 dark:text-white">{farmer.rfId}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Farmer Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{farmer.farmerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Coins className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bonus</p>
                    <p className="font-medium text-gray-900 dark:text-white">{farmer.bonus}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact & Society Information
            </h3>
            
            {isEditing ? (
              <FormGrid>
                <FormInput
                  label="Contact Number"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(value) => setFormData({ ...formData, contactNumber: value })}
                />
                <FormSelect
                  label="SMS Enabled"
                  value={formData.smsEnabled}
                  onChange={(value) => setFormData({ ...formData, smsEnabled: value })}
                  options={[
                    { value: 'OFF', label: 'OFF' },
                    { value: 'ON', label: 'ON' }
                  ]}
                />
                <FormSelect
                  label="Society"
                  value={formData.societyId}
                  onChange={(value) => setFormData({ ...formData, societyId: value })}
                  options={[
                    { value: '', label: 'Select Society' },
                    ...societies.map(society => ({
                      value: society.id.toString(),
                      label: society.name
                    }))
                  ]}
                />
              </FormGrid>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Contact Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {farmer.contactNumber || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">SMS Enabled</p>
                    <p className="font-medium text-gray-900 dark:text-white">{farmer.smsEnabled}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Society</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {farmer.societyName || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(isEditing || farmer.address) && (
              <div className="mt-6">
                {isEditing ? (
                  <FormTextarea
                    label="Address"
                    value={formData.address}
                    onChange={(value) => setFormData({ ...formData, address: value })}
                    rows={3}
                  />
                ) : (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                      <p className="font-medium text-gray-900 dark:text-white whitespace-pre-line">
                        {farmer.address || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'banking' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Banking Details
            </h3>
            
            {isEditing ? (
              <FormGrid>
                <FormInput
                  label="Bank Name"
                  type="text"
                  value={formData.bankName}
                  onChange={(value) => setFormData({ ...formData, bankName: value })}
                />
                <FormInput
                  label="Account Number"
                  type="text"
                  value={formData.bankAccountNumber}
                  onChange={(value) => setFormData({ ...formData, bankAccountNumber: value })}
                />
                <FormInput
                  label="IFSC Code"
                  type="text"
                  value={formData.ifscCode}
                  onChange={(value) => setFormData({ ...formData, ifscCode: value })}
                />
                <FormInput
                  label="Bonus"
                  type="number"
                  value={formData.bonus}
                  onChange={(value) => setFormData({ ...formData, bonus: Number(value) })}
                />
              </FormGrid>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bank Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {farmer.bankName || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                    <p className="font-medium text-gray-900 dark:text-white font-mono">
                      {farmer.bankAccountNumber || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">IFSC Code</p>
                    <p className="font-medium text-gray-900 dark:text-white font-mono">
                      {farmer.ifscCode || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Coins className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bonus Amount</p>
                    <p className="font-medium text-gray-900 dark:text-white">{farmer.bonus}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'additional' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Additional Information
            </h3>
            
            {isEditing ? (
              <FormTextarea
                label="Notes"
                value={formData.notes}
                onChange={(value) => setFormData({ ...formData, notes: value })}
                rows={4}
                placeholder="Add any additional notes about this farmer..."
              />
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Notes</p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-white whitespace-pre-line">
                      {farmer.notes || 'No additional notes available.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Created At</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(farmer.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  {farmer.updatedAt && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(farmer.updatedAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {saving && <LoadingOverlay isLoading={true} />}
    </div>
  );
};

export default FarmerDetails;