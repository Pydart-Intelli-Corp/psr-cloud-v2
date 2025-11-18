'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Milk, 
  Users, 
  X, 
  Eye, 
  EyeOff,
  Plus
} from 'lucide-react';
import { FlowerSpinner } from '@/components';

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'dairy' | 'bmc' | 'society';
  onSuccess: () => void;
}

interface EntityFormData {
  name: string;
  password: string;
  entityId: string;
  location?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  presidentName?: string;
  contactPhone?: string;
  dairyFarmId?: number;
  bmcId?: number;
}

interface DairyFarm {
  id: number;
  name: string;
}

interface BMC {
  id: number;
  name: string;
}

export default function AddEntityModal({ isOpen, onClose, type, onSuccess }: AddEntityModalProps) {
  const [formData, setFormData] = useState<EntityFormData>({
    name: '',
    password: '',
    entityId: '',
    location: '',
    contactPerson: '',
    phone: '',
    email: '',
    capacity: undefined,
    presidentName: '',
    contactPhone: '',
    dairyFarmId: undefined,
    bmcId: undefined
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dairyFarms, setDairyFarms] = useState<DairyFarm[]>([]);
  const [bmcs, setBMCs] = useState<BMC[]>([]);

  // Load dependent data when modal opens
  const loadDependentData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      if (type === 'bmc') {
        // Load dairy farms for BMC
        const response = await fetch('/api/user/dairy', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const result = await response.json();
          setDairyFarms(result.data || []);
        }
      } else if (type === 'society') {
        // Load BMCs for society
        const response = await fetch('/api/user/bmc', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const result = await response.json();
          setBMCs(result.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading dependent data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      let endpoint = '';
      let payload: any = {
        name: formData.name,
        password: formData.password
      };

      switch (type) {
        case 'dairy':
          endpoint = '/api/user/dairy';
          payload = {
            ...payload,
            dairyId: formData.entityId,
            location: formData.location,
            contactPerson: formData.contactPerson,
            phone: formData.phone,
            email: formData.email
          };
          break;
        case 'bmc':
          endpoint = '/api/user/bmc';
          payload = {
            ...payload,
            bmcId: formData.entityId,
            location: formData.location,
            capacity: formData.capacity,
            dairyFarmId: formData.dairyFarmId
          };
          break;
        case 'society':
          endpoint = '/api/user/society';
          payload = {
            ...payload,
            societyId: formData.entityId,
            location: formData.location,
            presidentName: formData.presidentName,
            contactPhone: formData.contactPhone,
            bmcId: formData.bmcId
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          name: '',
          password: '',
          entityId: '',
          location: '',
          contactPerson: '',
          phone: '',
          email: '',
          capacity: undefined,
          presidentName: '',
          contactPhone: '',
          dairyFarmId: undefined,
          bmcId: undefined
        });
      } else {
        setError(result.message || `Failed to add ${type}`);
      }
    } catch (error) {
      setError(`Error adding ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'dairy': return 'Add Dairy Farm';
      case 'bmc': return 'Add BMC';
      case 'society': return 'Add Society';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'dairy': return Building2;
      case 'bmc': return Milk;
      case 'society': return Users;
    }
  };

  const getIdLabel = () => {
    switch (type) {
      case 'dairy': return 'Dairy ID';
      case 'bmc': return 'BMC ID';
      case 'society': return 'Society ID';
    }
  };

  if (!isOpen) return null;

  // Load dependent data when modal opens
  if (isOpen && (type === 'bmc' || type === 'society')) {
    loadDependentData();
  }

  const Icon = getIcon();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Icon className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder={`Enter ${type} name`}
                required
              />
            </div>

            {/* Entity ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getIdLabel()} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.entityId}
                onChange={(e) => setFormData({ ...formData, entityId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder={`Enter unique ${getIdLabel().toLowerCase()}`}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter secure password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter location"
            />
          </div>

          {/* Type-specific fields */}
          {type === 'dairy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Phone number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Email address"
                />
              </div>
            </div>
          )}

          {type === 'bmc' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity (Liters)
                </label>
                <input
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || undefined })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Storage capacity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dairy Farm
                </label>
                <select
                  value={formData.dairyFarmId || ''}
                  onChange={(e) => setFormData({ ...formData, dairyFarmId: parseInt(e.target.value) || undefined })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select dairy farm</option>
                  {dairyFarms.map((dairy) => (
                    <option key={dairy.id} value={dairy.id}>
                      {dairy.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {type === 'society' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  President Name
                </label>
                <input
                  type="text"
                  value={formData.presidentName}
                  onChange={(e) => setFormData({ ...formData, presidentName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Society president name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Contact phone number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BMC
                </label>
                <select
                  value={formData.bmcId || ''}
                  onChange={(e) => setFormData({ ...formData, bmcId: parseInt(e.target.value) || undefined })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select BMC</option>
                  {bmcs.map((bmc) => (
                    <option key={bmc.id} value={bmc.id}>
                      {bmc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FlowerSpinner size={16} />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add {type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}