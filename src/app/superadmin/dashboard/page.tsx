'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  Database,
  TrendingUp,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Milk,
  Shield,
  Building,
  Factory,
  Home,
  Eye,
  Plus,
  Radio,
  Cloud
} from 'lucide-react';
import { PageLoader, FlowerSpinner, MachineManager } from '@/components';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface PendingAdmin {
  id: number;
  uid: string;
  email: string;
  fullName: string;
  companyName: string;
  companyPincode: string;
  companyCity: string;
  companyState: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  users: {
    total: number;
    superAdmins: number;
    admins: number;
    dairy: number;
    bmc: number;
    society: number;
    farmers: number;
  };
  system: {
    databases: number;
    activeConnections: number;
    lastBackup: string;
  };
}

const SuperAdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState<PendingAdmin[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeDashboard = async () => {
      // Check authentication
      const token = localStorage.getItem('adminToken');
      const userRole = localStorage.getItem('userRole');
      const adminUser = localStorage.getItem('adminUser');

      if (!token || userRole !== 'super_admin' || !adminUser) {
        router.push('/superadmin');
        return;
      }

      try {
        const parsedUser = JSON.parse(adminUser);
        
        // Load dashboard stats (mock data for now)
        const dashboardStats = {
          users: {
            total: 1247,
            superAdmins: 1,
            admins: 5,
            dairy: 15,
            bmc: 45,
            society: 150,
            farmers: 1031
          },
          system: {
            databases: 3,
            activeConnections: 12,
            lastBackup: new Date().toISOString().split('T')[0]
          }
        };

        // Update state in batch
        setUser(parsedUser);
        setStats(dashboardStats);
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/superadmin');
        return;
      }
    };

    initializeDashboard();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminUser');
    router.push('/superadmin');
  };

  const fetchPendingApprovals = async () => {
    setApprovalsLoading(true);
    try {
      const response = await fetch('/api/superadmin/approvals');
      const result = await response.json();
      
      if (result.success) {
        const approvals = result.data;
        setPendingApprovals(approvals);
      } else {
        console.error('Failed to fetch pending approvals:', result.error);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setApprovalsLoading(false);
    }
  };

  const handleApproval = async (adminId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/superadmin/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId,
          action
        })
      });

      const result = await response.json();

      if (result.success) {
        // Remove the admin from pending approvals
        setPendingApprovals(prev => prev.filter(admin => admin.id !== adminId));
        alert(`Admin ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      } else {
        alert(`Failed to ${action} admin: ${result.error}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing admin:`, error);
      alert(`Error ${action}ing admin. Please try again.`);
    }
  };

  // Fetch pending approvals when approvals tab is active
  useEffect(() => {
    if (activeTab === 'approvals') {
      fetchPendingApprovals();
    }
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <FlowerSpinner size={64} />
          </div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'monitoring', label: 'Live Monitor', icon: Radio },
    { id: 'approvals', label: 'Approvals', icon: Shield },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'machines', label: 'Machines', icon: Building },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'api-management', label: 'API Management', icon: Cloud },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-green-800 to-emerald-900 text-white transform transition-transform duration-300 ease-in-out z-50 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <Milk className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Poornasree</h1>
                <p className="text-xs text-green-200">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-white hover:text-green-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'api-management') {
                      router.push('/superadmin/api-management');
                    } else {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === item.id
                      ? 'bg-green-600 text-white'
                      : 'text-green-100 hover:bg-green-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-green-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-white">{user?.username}</p>
              <p className="text-xs text-green-200">Super Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-green-200 hover:text-white hover:bg-green-700 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeTab}</h2>
                <p className="text-gray-600">Poornasree Equipments Cloud Administration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Live Monitoring Button */}
              <button
                onClick={() => router.push('/superadmin/monitoring')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                title="Open Live Monitor"
              >
                <Radio className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Live Monitor</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </button>
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">Super Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="p-6">
          {activeTab === 'monitoring' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Redirecting to Live Monitor...</p>
                <button
                  onClick={() => router.push('/superadmin/monitoring')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Radio className="w-5 h-5" />
                  Open Live Monitor
                </button>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-6 shadow-sm border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.users.total.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+12.5%</span>
                    <span className="text-sm text-gray-500 ml-2">vs last month</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Farmers</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.users.farmers.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Home className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+8.2%</span>
                    <span className="text-sm text-gray-500 ml-2">vs last month</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl p-6 shadow-sm border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Societies</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.users.society}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Building className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+15.3%</span>
                    <span className="text-sm text-gray-500 ml-2">vs last month</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl p-6 shadow-sm border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">BMC Units</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.users.bmc}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Factory className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+5.7%</span>
                    <span className="text-sm text-gray-500 ml-2">vs last month</span>
                  </div>
                </motion.div>
              </div>

              {/* User Hierarchy Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl p-6 shadow-sm border"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Hierarchy</h3>
                  <div className="space-y-4">
                    {[
                      { role: 'Super Admin', count: stats?.users.superAdmins || 0, color: 'bg-red-500' },
                      { role: 'Admin', count: stats?.users.admins || 0, color: 'bg-orange-500' },
                      { role: 'Dairy', count: stats?.users.dairy || 0, color: 'bg-blue-500' },
                      { role: 'BMC', count: stats?.users.bmc || 0, color: 'bg-purple-500' },
                      { role: 'Society', count: stats?.users.society || 0, color: 'bg-green-500' },
                      { role: 'Farmer', count: stats?.users.farmers || 0, color: 'bg-emerald-500' },
                    ].map((item) => (
                      <div key={item.role} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm font-medium text-gray-700">{item.role}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{item.count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-xl p-6 shadow-sm border"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-gray-700">Database Status</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">Online</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium text-gray-700">Active Connections</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{stats?.system.activeConnections}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-sm font-medium text-gray-700">Last Backup</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{stats?.system.lastBackup}</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl p-6 shadow-sm border"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                    <Plus className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-700">Create New Admin</span>
                  </button>
                  <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
                    <Eye className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700">View All Users</span>
                  </button>
                  <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
                    <Database className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-700">Database Backup</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Pending Approvals Tab */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Admin Approvals</h3>
                  <button
                    onClick={fetchPendingApprovals}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>

                {approvalsLoading ? (
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-4">
                      <FlowerSpinner size={32} />
                    </div>
                    <p className="text-gray-600">Loading pending approvals...</p>
                  </div>
                ) : pendingApprovals.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h4>
                    <p className="text-gray-600">All admin registrations have been processed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingApprovals.map((admin) => (
                      <motion.div
                        key={admin.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{admin.fullName}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600"><strong>Email:</strong> {admin.email}</p>
                                <p className="text-gray-600"><strong>UID:</strong> {admin.uid}</p>
                                <p className="text-gray-600"><strong>Company:</strong> {admin.companyName}</p>
                              </div>
                              <div>
                                <p className="text-gray-600"><strong>Address:</strong> {admin.companyCity}, {admin.companyState}</p>
                                <p className="text-gray-600"><strong>Pincode:</strong> {admin.companyPincode}</p>
                                <p className="text-gray-600"><strong>Registered:</strong> {new Date(admin.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-3 ml-6">
                            <button
                              onClick={() => handleApproval(admin.id, 'approve')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                            >
                              <Shield className="h-4 w-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleApproval(admin.id, 'reject')}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                            >
                              <X className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Machines Tab */}
          {activeTab === 'machines' && (
            <div className="space-y-6">
              <MachineManager />
            </div>
          )}

          {/* Other tabs content */}
          {!['overview', 'approvals', 'machines'].includes(activeTab) && (
            <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Feature Coming Soon</h3>
              <p className="text-gray-600">
                The {activeTab} section is currently under development and will be available soon.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;