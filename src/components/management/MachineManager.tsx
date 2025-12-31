'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Upload,
  Search,
  Edit,
  Trash2,
  Settings,
  FileText,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { FlowerSpinner } from '@/components';

interface Machine {
  id: number;
  machineType: string;
  description?: string;
  isActive: boolean;
  status?: 'active' | 'inactive' | 'maintenance' | 'suspended';
  imageUrl?: string;
}

interface MachineManagerProps {
  onClose?: () => void;
}

const MachineManager: React.FC<MachineManagerProps> = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [selectedMachineForImage, setSelectedMachineForImage] = useState<Machine | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    machineType: '',
    description: '',
    isActive: true,
    status: 'active' as 'active' | 'inactive' | 'maintenance' | 'suspended'
  });

  useEffect(() => {
    fetchMachines();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openStatusDropdown !== null) {
        const target = event.target as Element;
        if (!target.closest('.status-dropdown')) {
          setOpenStatusDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openStatusDropdown]);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/superadmin/machines');
      const result = await response.json();
      
      if (result.success) {
        setMachines(result.data.machines || []);
      } else {
        alert('Failed to fetch machines: ' + result.error);
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
      alert('Error fetching machines. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.machineType.trim()) {
      alert('Machine type is required');
      return;
    }

    setFormLoading(true);
    
    try {
      const url = editingMachine ? '/api/superadmin/machines' : '/api/superadmin/machines';
      const method = editingMachine ? 'PUT' : 'POST';
      
      const payload = editingMachine 
        ? { id: editingMachine.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        await fetchMachines();
        setShowAddForm(false);
        setEditingMachine(null);
        setFormData({ machineType: '', description: '', isActive: true, status: 'active' as 'active' | 'inactive' | 'maintenance' | 'suspended' });
        alert(editingMachine ? 'Machine updated successfully!' : 'Machine created successfully!');
      } else {
        alert(`Failed to ${editingMachine ? 'update' : 'create'} machine: ` + result.error);
      }
    } catch (error) {
      console.error('Error saving machine:', error);
      alert('Error saving machine. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this machine? This action cannot be undone and will remove all associated data.')) {
      return;
    }

    try {
      const response = await fetch(`/api/superadmin/machines?id=${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        await fetchMachines();
        alert('Machine deleted successfully!');
      } else {
        alert('Failed to delete machine: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting machine:', error);
      alert('Error deleting machine. Please try again.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/superadmin/machines/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        await fetchMachines();
        setShowUploadModal(false);
        alert(`Upload completed: ${result.data.success} created, ${result.data.duplicates} duplicates, ${result.data.failed} failed`);
        
        if (result.data.errors.length > 0) {
          console.log('Upload errors:', result.data.errors);
        }
      } else {
        alert('Failed to upload CSV: ' + result.error);
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      alert('Error uploading CSV. Please try again.');
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (type: 'template' | 'export') => {
    try {
      const response = await fetch(`/api/superadmin/machines/download?type=${type}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = type === 'template' ? 'machine_types_template.csv' : 'machine_types_export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  const startEdit = (machine: Machine) => {
    setEditingMachine(machine);
    setFormData({
      machineType: machine.machineType,
      description: machine.description || '',
      isActive: machine.isActive,
      status: machine.status || (machine.isActive ? 'active' : 'inactive')
    });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingMachine(null);
    setShowAddForm(false);
    setFormData({ machineType: '', description: '', isActive: true, status: 'active' as 'active' | 'inactive' | 'maintenance' | 'suspended' });
  };

  const handleImageUpload = async () => {
    if (!imageFile || !selectedMachineForImage) {
      alert('Please select an image');
      return;
    }

    setImageUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('machineId', selectedMachineForImage.id.toString());

      const response = await fetch('/api/superadmin/machines/upload-image', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        alert('Image uploaded successfully!');
        await fetchMachines();
        setShowImageUploadModal(false);
        setSelectedMachineForImage(null);
        setImageFile(null);
        setImagePreview(null);
      } else {
        alert('Failed to upload image: ' + result.error);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openImageUpload = (machine: Machine) => {
    setSelectedMachineForImage(machine);
    setShowImageUploadModal(true);
    setImageFile(null);
    setImagePreview(null);
  };

  const getStatusInfo = (machine: Machine) => {
    const status = machine.status || (machine.isActive ? 'active' : 'inactive');
    switch (status) {
      case 'active':
        return { label: 'Active', bgColor: 'bg-green-100', textColor: 'text-green-800' };
      case 'inactive':
        return { label: 'Inactive', bgColor: 'bg-red-100', textColor: 'text-red-800' };
      case 'maintenance':
        return { label: 'Maintenance', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
      case 'suspended':
        return { label: 'Suspended', bgColor: 'bg-orange-100', textColor: 'text-orange-800' };
      default:
        return { label: 'Unknown', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };

  const handleStatusChange = async (machineId: number, newStatus: 'active' | 'inactive' | 'maintenance' | 'suspended') => {
    try {
      const isActive = newStatus === 'active';
      const response = await fetch('/api/superadmin/machines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: machineId,
          isActive,
          status: newStatus
        })
      });

      if (response.ok) {
        setMachines(machines.map(machine =>
          machine.id === machineId
            ? { ...machine, isActive, status: newStatus }
            : machine
        ));
        setOpenStatusDropdown(null);
      } else {
        alert('Failed to update machine status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating machine status. Please try again.');
    }
  };

  const filteredMachines = machines.filter(machine =>
    machine.machineType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (machine.description && machine.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <FlowerSpinner size={48} />
          <p className="mt-4 text-gray-600">Loading machines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Machine Types</h3>
          <p className="text-gray-600">Manage dairy equipment machine types and models</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Machine</span>
          </button>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Bulk Upload</span>
          </button>
          
          <button
            onClick={() => handleDownload('export')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search machine types..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Machine List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Machine Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMachines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No machines found</p>
                  </td>
                </tr>
              ) : (
                filteredMachines.map((machine) => (
                  <motion.tr
                    key={machine.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {machine.imageUrl ? (
                          <img 
                            src={machine.imageUrl} 
                            alt={machine.machineType}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <button
                          onClick={() => openImageUpload(machine)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          title="Upload image"
                        >
                          {machine.imageUrl ? 'Change' : 'Upload'}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{machine.machineType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{machine.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative status-dropdown">
                        {(() => {
                          const statusInfo = getStatusInfo(machine);
                          return (
                            <button
                              onClick={() => setOpenStatusDropdown(
                                openStatusDropdown === machine.id ? null : machine.id
                              )}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${statusInfo.bgColor} ${statusInfo.textColor}`}
                            >
                              {statusInfo.label}
                              <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          );
                        })()}
                        
                        {openStatusDropdown === machine.id && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            {['active', 'inactive', 'maintenance', 'suspended'].map((status) => {
                              const statusInfo = getStatusInfo({ ...machine, status: status as 'active' | 'inactive' | 'maintenance' | 'suspended' });
                              return (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(machine.id, status as 'active' | 'inactive' | 'maintenance' | 'suspended')}
                                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${statusInfo.textColor}`}
                                >
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                                    {statusInfo.label}
                                  </span>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => startEdit(machine)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(machine.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 50 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingMachine ? 'Edit Machine' : 'Add New Machine'}
                </h2>
                <button
                  onClick={cancelEdit}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Machine Type
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.machineType}
                    onChange={(e) => setFormData({ ...formData, machineType: e.target.value })}
                    placeholder="e.g., ECOD, LSE-V3"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => {
                      const status = e.target.value as 'active' | 'inactive' | 'maintenance' | 'suspended';
                      setFormData({ 
                        ...formData, 
                        status,
                        isActive: status === 'active' 
                      });
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {formLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {formLoading ? 'Saving...' : (editingMachine ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 50 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Bulk Upload Machines</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload a CSV file with machine types
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Format: One machine type per line or comma-separated
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={uploadLoading}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadLoading}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {uploadLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                        Uploading...
                      </>
                    ) : (
                      'Choose CSV File'
                    )}
                  </button>
                </div>
                
                <div className="flex items-start space-x-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">CSV Format:</p>
                    <p className="text-xs mt-1">
                      First column should contain machine types. Header row is optional.
                      Duplicate entries will be skipped.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDownload('template')}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    Download Template
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Upload Modal */}
      <AnimatePresence>
        {showImageUploadModal && selectedMachineForImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 50 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Upload Machine Image</h2>
                <button
                  onClick={() => {
                    setShowImageUploadModal(false);
                    setSelectedMachineForImage(null);
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Machine Type:</strong> {selectedMachineForImage.machineType}
                </p>
              </div>
              
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        if (imageInputRef.current) {
                          imageInputRef.current.value = '';
                        }
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload machine image
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      PNG, JPG or WEBP (max 5MB)
                    </p>
                    
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Select Image
                    </button>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowImageUploadModal(false);
                      setSelectedMachineForImage(null);
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    disabled={imageUploadLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImageUpload}
                    disabled={imageUploadLoading || !imageFile}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {imageUploadLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MachineManager;