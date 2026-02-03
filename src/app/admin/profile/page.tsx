'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { PageLoader, FlowerSpinner, StatusMessage } from '@/components';
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
  companyCity?: string;
  companyState?: string;
  companyPincode?: string;
  dbKey?: string;
  joinedDate: string;
  lastLogin?: string;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
  companyCity: string;
  companyState: string;
  companyPincode: string;
}

export default function AdminProfile() {
  const { user } = useUser();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    companyCity: '',
    companyState: '',
    companyPincode: ''
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
            phone: userData.phone,
            companyCity: userData.companyCity,
            companyState: userData.companyState,
            companyPincode: userData.companyPincode,
            dbKey: userData.dbKey,
            joinedDate: userData.created_at || userData.createdAt || new Date().toISOString(),
            lastLogin: userData.lastLogin
          };
          
          setCurrentUser(adminUser);
          
          // Set form data
          setFormData({
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            phone: adminUser.phone || '',
            companyName: adminUser.companyName || '',
            companyCity: adminUser.companyCity || '',
            companyState: adminUser.companyState || '',
            companyPincode: adminUser.companyPincode || ''
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
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Update failed');
      }

    } catch (error) {
      console.error('❌ Error updating profile:', error);
      setErrorMessage('Failed to update profile. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
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
    return <PageLoader />;
  }

  if (loading) {
    return <PageLoader />;
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
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Profile</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account information</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center px-4 py-2 text-green-600 dark:text-green-400 border border-green-600 dark:border-green-500 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
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
                      phone: currentUser.phone || '',
                      companyName: currentUser.companyName || '',
                      companyCity: currentUser.companyCity || '',
                      companyState: currentUser.companyState || '',
                      companyPincode: currentUser.companyPincode || ''
                    });
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors"
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {currentUser.firstName.charAt(0).toUpperCase()}
                    {currentUser.lastName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{currentUser.fullName}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{currentUser.email}</p>
                <div className="flex items-center justify-center mt-3 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-full inline-flex">
                  <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-1.5" />
                  <span className="text-purple-600 dark:text-purple-400 font-semibold capitalize text-sm">{currentUser.role}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      currentUser.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <span className={`capitalize font-semibold ${
                      currentUser.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {currentUser.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(currentUser.joinedDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                
                {currentUser.lastLogin && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Last Login</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(currentUser.lastLogin).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
                
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-start text-xs">
                    <Key className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-500 dark:text-gray-400 mb-1">Database Key</p>
                      <p className="font-mono font-semibold text-gray-900 dark:text-gray-100 break-all">
                        {currentUser.dbKey || 'Not assigned'}
                      </p>
                    </div>
                  </div>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h4>
              
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h5 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Personal Information
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                        <p className="text-gray-900 dark:text-gray-100 py-2">{currentUser.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                        <p className="text-gray-900 dark:text-gray-100 py-2">{currentUser.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center flex-wrap gap-2">
                      <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <p className="text-gray-900 dark:text-gray-100">{currentUser.email}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 italic">(Cannot be changed)</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h5 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Information
                  </h5>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="psr-input"
                        placeholder="Enter phone number"
                        maxLength={15}
                      />
                    ) : (
                      <div className="flex items-center py-2">
                        <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                        <p className="text-gray-900 dark:text-gray-100">{currentUser.phone || 'Not provided'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Information */}
                <div>
                  <h5 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Company Information
                  </h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                        <p className="text-gray-900 dark:text-gray-100 py-2">{currentUser.companyName || 'Not provided'}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          City
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.companyCity}
                            onChange={(e) => handleInputChange('companyCity', e.target.value)}
                            className="psr-input"
                            placeholder="Enter city"
                          />
                        ) : (
                          <div className="flex items-center py-2">
                            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                            <p className="text-gray-900 dark:text-gray-100">{currentUser.companyCity || 'Not provided'}</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          State
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.companyState}
                            onChange={(e) => handleInputChange('companyState', e.target.value)}
                            className="psr-input"
                            placeholder="Enter state"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-gray-100 py-2">{currentUser.companyState || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Pincode
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.companyPincode}
                            onChange={(e) => handleInputChange('companyPincode', e.target.value)}
                            className="psr-input"
                            placeholder="Enter pincode"
                            maxLength={6}
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-gray-100 py-2">{currentUser.companyPincode || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                    
                    {!editing && (currentUser.companyCity || currentUser.companyState || currentUser.companyPincode) && (
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start">
                          <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Complete Address</p>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {[currentUser.companyCity, currentUser.companyState, currentUser.companyPincode]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Status Messages */}
      <StatusMessage 
        success={successMessage}
        error={errorMessage}
        onClose={() => {
          setSuccessMessage('');
          setErrorMessage('');
        }}
      />
    </>
  );
}