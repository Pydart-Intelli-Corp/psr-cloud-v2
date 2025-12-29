'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { UserRole } from '@/types/user';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    id: number;
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    dbKey?: string;
  };
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        // Clear any client-side storage
        localStorage.removeItem('authToken');
        sessionStorage.clear();
        
        // Redirect to login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect anyway
      window.location.href = '/login';
    }
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    
    // Emit global search event for pages to listen to
    const event = new CustomEvent('globalSearch', {
      detail: { query }
    });
    window.dispatchEvent(event);
  };

  // Memoize sidebar overlay to prevent unnecessary re-renders
  const sidebarOverlay = useMemo(() => {
    if (!isMobile || !sidebarOpen) return null;
    
    return (
      <div
        onClick={() => setSidebarOpen(false)}
        className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300"
      />
    );
  }, [isMobile, sidebarOpen]);

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOverlay}

      {/* Sidebar - Always render, CSS controls visibility */}
      <Sidebar
        userRole={user.role}
        isCollapsed={!isMobile && sidebarCollapsed}
        onToggle={handleSidebarToggle}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          user={user}
          onLogout={handleLogout}
          onSearch={handleSearch}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}