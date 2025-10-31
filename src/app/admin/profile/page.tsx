'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { FlowerSpinner } from '@/components';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar,
  Key,
  Shield,
  Save,
  Edit3,
  ArrowLeft
} from 'lucide-react';

interface AdminUser {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  companyName?: string;
  phone?: string;
  address?: string;
  dbKey?: string;
  joinedDate: string;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
}

export default function AdminProfile() {
  const { user } = useUser();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    companyName: '',
    companyAddress: '',
    companyPhone: ''
  });

  // Fetch current user profile
  const fetchUserProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('No auth token found, redirecting to login');
      window.location.href = '/login';
      return;
    }

    try {
      console.log('🔄 Fetching user profile...');
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.log('Authentication failed, redirecting to login');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          window.location.href = '/login';
          return;
        }
        throw new Error(`Profile API failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ User profile fetched:', result);
      
      if (result.success && result.data) {
        const userData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
        
        if (userData.role === 'admin') {
          // Transform the user data
          const adminUser: AdminUser = {
            id: userData.id,
            fullName: userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            firstName: userData.firstName || userData.fullName?.split(' ')[0] || '',
            lastName: userData.lastName || userData.fullName?.split(' ').slice(1).join(' ') || '',
            email: userData.email,
            role: userData.role,
            status: userData.status,
            companyName: userData.companyName,
            phone: userData.companyPhone || userData.phone,
            address: userData.companyAddress || userData.address,
            dbKey: userData.dbKey,
            joinedDate: userData.created_at || userData.createdAt || new Date().toISOString()
          };
          
          setCurrentUser(adminUser);
          
          // Set form data
          setFormData({
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            companyName: adminUser.companyName || '',
            companyAddress: adminUser.address || '',
            companyPhone: adminUser.phone || ''
          });
          
          console.log('Admin profile loaded:', adminUser.fullName);
        } else {
          console.log('User is not admin, redirecting to login');
          window.location.href = '/login';
        }
      } else {
        console.log('Invalid response format, redirecting to login');
        window.location.href = '/login';
      }

    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const handleSaveProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      setSaving(true);
      console.log('💾 Updating profile...', formData);

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Profile updated:', result);

      if (result.success) {
        // Refresh profile data
        await fetchUserProfile();
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        throw new Error('Update failed');
      }

    } catch (error) {
      console.error('❌ Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Load profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Handle input changes
  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <FlowerSpinner />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FlowerSpinner size={32} />
        <span className="ml-4 text-gray-600 dark:text-gray-400">Loading profile...</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Unable to load profile</p>
          <button
            onClick={() => window.location.href = '/admin/dashboard'}
            className="mt-4 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
              <p className="text-gray-600 mt-1">Manage your account information</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditing(false);
                    // Reset form data
                    setFormData({
                      firstName: currentUser.firstName,
                      lastName: currentUser.lastName,
                      companyName: currentUser.companyName || '',
                      companyAddress: currentUser.address || '',
                      companyPhone: currentUser.phone || ''
                    });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <FlowerSpinner size={16} className="mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {currentUser.firstName.charAt(0).toUpperCase()}
                    {currentUser.lastName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{currentUser.fullName}</h3>
                <p className="text-gray-600 mt-1">{currentUser.email}</p>
                <div className="flex items-center justify-center mt-2">
                  <Shield className="w-4 h-4 text-purple-600 mr-1" />
                  <span className="text-purple-600 font-medium capitalize">{currentUser.role}</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {new Date(currentUser.joinedDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Key className="w-4 h-4 mr-2" />
                  DB Key: {currentUser.dbKey || 'Not assigned'}
                </div>
                <div className="flex items-center text-sm">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    currentUser.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className={`capitalize font-medium ${
                    currentUser.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {currentUser.status}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h4>
              
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h5 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Personal Information
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="psr-input"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{currentUser.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="psr-input"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{currentUser.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{currentUser.email}</p>
                      <span className="ml-2 text-xs text-gray-500">(Cannot be changed)</span>
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div>
                  <h5 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Company Information
                  </h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          className="psr-input"
                          placeholder="Enter your company name"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{currentUser.companyName || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {editing ? (
                        <input
                          type="tel"
                          value={formData.companyPhone}
                          onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                          className="psr-input"
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <p className="text-gray-900">{currentUser.phone || 'Not provided'}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      {editing ? (
                        <textarea
                          value={formData.companyAddress}
                          onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                          rows={3}
                          className="psr-textarea"
                          placeholder="Enter company address"
                        />
                      ) : (
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                          <p className="text-gray-900">{currentUser.address || 'Not provided'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
  );
}