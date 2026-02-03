'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useLanguage, languages, type Language } from '@/contexts/LanguageContext';
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  ChevronDown,
  Check,
  Globe,
  Home,
  Users,
  Milk,
  Building2,
  Tractor,
  BarChart3,
  FileText,
  AlertCircle
} from 'lucide-react';
import { UserRole } from '@/types/user';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    dbKey?: string;
  };
  onLogout: () => void;
  onSearch?: (query: string) => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  societyId?: number;
}

interface PausedSectionNotification {
  sectionPulseId: number;
  societyId: number;
  societyName: string;
  societyCode: string;
  bmcId: number;
  bmcName: string;
  dairyFarmId: number;
  dairyName: string;
  pulseDate: string;
  pausedSince: string;
  lastChecked: string;
  inactiveDays: number;
  totalCollections: number;
}

const roleColors: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'from-green-600 to-emerald-600',    // Primary green gradient
  [UserRole.ADMIN]: 'from-green-500 to-emerald-500',         // Slightly lighter green
  [UserRole.DAIRY]: 'from-teal-600 to-cyan-600',            // Teal for dairy operations
  [UserRole.BMC]: 'from-emerald-600 to-green-600',          // Emerald for BMC
  [UserRole.SOCIETY]: 'from-green-700 to-teal-700',         // Deeper green for society
  [UserRole.FARMER]: 'from-emerald-500 to-green-500'        // Natural green for farmers
};

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: keyof typeof import('@/locales/en').en.nav;
  href: string;
  roles: UserRole[];
}

const navigationItems: NavItem[] = [
  {
    icon: Home,
    labelKey: 'dashboard',
    href: '/dashboard',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DAIRY, UserRole.BMC, UserRole.SOCIETY, UserRole.FARMER]
  },
  {
    icon: FileText,
    labelKey: 'reports',
    href: '/admin/reports',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DAIRY, UserRole.BMC, UserRole.SOCIETY]
  },
  {
    icon: BarChart3,
    labelKey: 'analytics',
    href: '/analytics',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DAIRY, UserRole.BMC]
  },
  {
    icon: Users,
    labelKey: 'userManagement',
    href: '/users',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DAIRY]
  },
  {
    icon: Milk,
    labelKey: 'dairyManagement',
    href: '/admin/dairy',
    roles: [UserRole.ADMIN]
  },
  {
    icon: Building2,
    labelKey: 'bmcManagement',
    href: '/admin/bmc',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DAIRY, UserRole.BMC]
  },
  {
    icon: Users,
    labelKey: 'societyManagement',
    href: '/society',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DAIRY, UserRole.BMC, UserRole.SOCIETY]
  },
  {
    icon: Tractor,
    labelKey: 'farmerPortal',
    href: '/farmer',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DAIRY, UserRole.BMC, UserRole.SOCIETY, UserRole.FARMER]
  },
  {
    icon: Bell,
    labelKey: 'notifications',
    href: '/notifications',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DAIRY, UserRole.BMC, UserRole.SOCIETY, UserRole.FARMER]
  },
  {
    icon: Settings,
    labelKey: 'settings',
    href: '/settings',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DAIRY, UserRole.BMC, UserRole.SOCIETY, UserRole.FARMER]
  }
];

export default function Header({ user, onLogout, onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showMobileLanguage, setShowMobileLanguage] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pausedSections, setPausedSections] = useState<PausedSectionNotification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

  // Fetch paused sections notifications
  useEffect(() => {
    const fetchPausedSections = async () => {
      try {
        setIsLoadingNotifications(true);
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.warn('No auth token found for notifications');
          return;
        }
        
        const response = await fetch('/api/admin/notifications/paused-sections', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setPausedSections(result.data);
            
            // Convert paused sections to notifications
            const pausedNotifications: Notification[] = result.data.map((section: PausedSectionNotification) => ({
              id: `paused-${section.sectionPulseId}`,
              title: 'Section Paused',
              message: `${section.dairyName} > ${section.bmcName} > ${section.societyName} (${section.societyCode})`,
              time: getRelativeTime(section.lastChecked),
              type: 'warning' as const,
              read: false,
              societyId: section.societyId
            }));
            
            setNotifications(pausedNotifications);
          }
        } else if (response.status === 401) {
          console.warn('Unauthorized: Token may be expired');
        }
      } catch (error) {
        console.error('Error fetching paused sections:', error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    // Fetch immediately
    fetchPausedSections();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchPausedSections, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Get relative time from timestamp
  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Listen for global search clear events
  useEffect(() => {
    const handleGlobalSearchClear = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.query === '') {
        setSearchQuery('');
      }
    };

    window.addEventListener('globalSearch', handleGlobalSearchClear);
    return () => {
      window.removeEventListener('globalSearch', handleGlobalSearchClear);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setShowLanguage(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  // Live search on every keystroke
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate to society details if societyId is present
    if (notification.societyId) {
      window.location.href = `/admin/society/${notification.societyId}`;
    }
    
    setShowNotifications(false);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getRoleDisplayName = (role: UserRole): string => {
    const roleNames: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: t.roles.superAdmin,
      [UserRole.ADMIN]: t.roles.admin, 
      [UserRole.DAIRY]: t.roles.dairy,
      [UserRole.BMC]: t.roles.bmc,
      [UserRole.SOCIETY]: t.roles.society,
      [UserRole.FARMER]: t.roles.farmer
    };
    return roleNames[role];
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      success: '✅', 
      error: '❌'
    };
    return icons[type];
  };

  // Get the correct dashboard href based on user role
  const getDashboardHref = (role: UserRole): string => {
    if (role === UserRole.SUPER_ADMIN) {
      return '/superadmin/dashboard';
    }
    if (role === UserRole.ADMIN) {
      return '/admin/dashboard';
    }
    // For other roles, default to admin dashboard
    return '/admin/dashboard';
  };

  // Update navigation items with dynamic dashboard href for admin/super admin
  const getUpdatedNavItems = () => {
    return navigationItems.map(item => {
      if (item.labelKey === 'dashboard') {
        return { ...item, href: getDashboardHref(user.role) };
      }
      return item;
    }).filter(item => item.roles.includes(user.role));
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 flex items-center justify-between shadow-sm">
      {/* Search Bar - Hidden on mobile, dashboard, analytics, settings, and profile pages */}
      {!pathname?.includes('/analytics') && !pathname?.includes('/dashboard') && !pathname?.includes('/settings') && !pathname?.includes('/profile') ? (
        <div className="hidden lg:flex items-center space-x-4 flex-1 max-w-2xl">
          <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t.common.search}
              className="w-full pl-10 pr-4 py-2 !bg-white dark:!bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl placeholder:text-gray-400 dark:placeholder:text-gray-500 !text-gray-900 dark:!text-gray-100 focus:!bg-white dark:focus:!bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all duration-200"
            />
          </form>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1"></div>
      )}

      {/* Mobile: Logo */}
      <div className="lg:hidden flex items-center">
        <Image
          src="/fulllogo.png"
          alt="Poornasree Equipments"
          width={140}
          height={40}
          className="h-8 sm:h-10 w-auto"
          priority
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* DB Key Badge - Admin only */}
        {user.role === UserRole.ADMIN && user.dbKey && (
          <div className="hidden lg:flex items-center px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-md">
                <span className="text-white text-xs font-bold">DB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">Database Key</span>
                <span className="text-sm font-bold text-green-700 dark:text-green-400 leading-tight tracking-wide">{user.dbKey}</span>
              </div>
            </div>
          </div>
        )}

        {/* Theme Toggle - Desktop only */}
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>

        {/* Language Toggle - Desktop only */}
        <div className="hidden lg:block relative" ref={languageRef}>
          <button
            onClick={() => setShowLanguage(!showLanguage)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Change Language"
          >
            <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {languages[language].nativeName}
            </span>
          </button>

          <AnimatePresence>
            {showLanguage && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50"
              >
                <div className="p-2">
                  {(Object.keys(languages) as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setShowLanguage(false);
                      }}
                      className={`w-full flex items-center justify-between space-x-3 p-3 rounded-lg transition-colors ${
                        language === lang
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{languages[lang].flag}</span>
                        <div className="text-left">
                          <p className="text-sm font-medium">{languages[lang].nativeName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{languages[lang].name}</p>
                        </div>
                      </div>
                      {language === lang && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleColors[user.role]} flex items-center justify-center`}>
              <span className="text-sm font-semibold text-white">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
            <div className="text-left hidden lg:block">
              <p className="body-medium font-medium text-gray-900 dark:text-gray-100">
                {user.firstName} {user.lastName}
              </p>
              <p className="body-small text-gray-600 dark:text-gray-400">{getRoleDisplayName(user.role)}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <>
                {/* Mobile overlay */}
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                  onClick={() => setShowProfile(false)}
                />
                
                <motion.div
                  initial={{ 
                    opacity: 0, 
                    x: 300,
                    scale: 0.95 
                  }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: 1 
                  }}
                  exit={{ 
                    opacity: 0, 
                    x: 300,
                    scale: 0.95 
                  }}
                  transition={{ 
                    duration: 0.3,
                    type: "spring",
                    damping: 25,
                    stiffness: 300
                  }}
                  className="
                    fixed lg:absolute 
                    top-0 lg:top-full lg:mt-2
                    right-0 lg:right-0
                    h-full lg:h-auto
                    w-80 lg:w-72
                    max-h-screen lg:max-h-96
                    bg-white dark:bg-gray-800 
                    rounded-l-2xl lg:rounded-xl
                    shadow-2xl 
                    border-l lg:border
                    border-gray-200 dark:border-gray-700 
                    z-50
                    overflow-hidden
                  "
                >
                  {/* Header - Mobile drawer header */}
                  <div className="lg:hidden flex justify-between items-center mb-3 px-4 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Menu</h3>
                    <button
                      onClick={() => setShowProfile(false)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400 rotate-90" />
                    </button>
                  </div>

                  {/* Profile header - consistent for all users on desktop */}
                  <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${roleColors[user.role]} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-base sm:text-lg font-semibold text-white">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-block px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-white rounded-full bg-gradient-to-r ${roleColors[user.role]}`}>
                            {getRoleDisplayName(user.role)}
                          </span>
                          {user.role === UserRole.ADMIN && user.dbKey && (
                            <span className="inline-flex items-center px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-full">
                              DB: {user.dbKey}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 overflow-y-auto lg:overflow-visible" style={{ 
                    maxHeight: 'calc(90vh - 150px)' 
                  }}>
                    {/* Navigation items for Admin and Super Admin - only on mobile */}
                    {(user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) ? (
                      <>
                        {/* Main Navigation Section - Mobile only */}
                        <div className="mb-4 lg:hidden">
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                            Navigation
                          </h4>
                          <div className="space-y-1">
                            {getUpdatedNavItems().slice(0, -1).map((item) => { // Exclude settings from main nav
                              const Icon = item.icon;
                              const isActive = pathname === item.href;
                              
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setShowProfile(false)}
                                  className={`w-full flex items-center space-x-3 p-2.5 sm:p-3 rounded-lg transition-all duration-200 ${
                                    isActive 
                                      ? `bg-gradient-to-r ${roleColors[user.role]} text-white shadow-md` 
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600'
                                  }`}
                                >
                                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                                  <span className={`text-sm sm:text-base font-medium ${isActive ? 'text-white' : ''}`}>
                                    {t.nav[item.labelKey]}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>

                        {/* Profile & Settings Section */}
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2 lg:hidden">
                            Account
                          </h4>
                          <div className="space-y-1">
                            <button 
                              onClick={() => {
                                // Navigate to profile page based on user role
                                if (user.role === UserRole.ADMIN) {
                                  window.location.href = '/admin/profile';
                                } else if (user.role === UserRole.SUPER_ADMIN) {
                                  window.location.href = '/superadmin/profile';
                                }
                                setShowProfile(false);
                              }}
                              className={`w-full flex items-center space-x-3 p-2.5 sm:p-3 rounded-lg transition-colors ${
                                pathname === '/admin/profile' || pathname === '/superadmin/profile'
                                  ? `bg-gradient-to-r ${roleColors[user.role]} text-white shadow-md`
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600'
                              }`}
                            >
                              <User className={`w-4 h-4 flex-shrink-0 ${pathname === '/admin/profile' || pathname === '/superadmin/profile' ? 'text-white' : ''}`} />
                              <span className={`text-sm sm:text-base font-medium ${pathname === '/admin/profile' || pathname === '/superadmin/profile' ? 'text-white' : ''}`}>{t.nav.profile}</span>
                            </button>
                            <Link
                              href="/admin/settings"
                              onClick={() => setShowProfile(false)}
                              className={`w-full flex items-center space-x-3 p-2.5 sm:p-3 rounded-lg transition-colors ${
                                pathname === '/admin/settings'
                                  ? `bg-gradient-to-r ${roleColors[user.role]} text-white shadow-md`
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600'
                              }`}
                            >
                              <Settings className={`w-4 h-4 flex-shrink-0 ${pathname === '/admin/settings' ? 'text-white' : ''}`} />
                              <span className={`text-sm sm:text-base font-medium ${pathname === '/admin/settings' ? 'text-white' : ''}`}>
                                {t.nav.settings}
                              </span>
                            </Link>
                          </div>
                        </div>

                        {/* Language & Theme Section for Admin/Super Admin */}
                        <div className="lg:hidden mb-4">
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                            Preferences
                          </h4>
                          <div className="space-y-1">
                            <button
                              onClick={() => setShowMobileLanguage(!showMobileLanguage)}
                              className="w-full flex items-center justify-between p-2.5 sm:p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 rounded-lg transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <Globe className="w-4 h-4 flex-shrink-0" />
                                <div className="text-left">
                                  <span className="text-sm sm:text-base block font-medium">Language</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {languages[language].flag} {languages[language].nativeName}
                                  </span>
                                </div>
                              </div>
                              <ChevronDown className={`w-4 h-4 transition-transform ${showMobileLanguage ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                              {showMobileLanguage && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-2 py-2 space-y-1">
                                    {(Object.keys(languages) as Language[]).map((lang) => (
                                      <button
                                        key={lang}
                                        onClick={() => {
                                          setLanguage(lang);
                                          setShowMobileLanguage(false);
                                        }}
                                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                                          language === lang
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                      >
                                        <div className="flex items-center space-x-2">
                                          <span className="text-base sm:text-lg">{languages[lang].flag}</span>
                                          <span className="text-xs sm:text-sm">{languages[lang].nativeName}</span>
                                        </div>
                                        {language === lang && (
                                          <Check className="w-3 h-3 flex-shrink-0" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="px-2 sm:px-3 py-2">
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">Theme</p>
                              <ThemeToggle />
                            </div>
                          </div>
                        </div>

                        {/* Logout Section for Admin/Super Admin */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                          <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-full flex items-center space-x-3 p-2.5 sm:p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm sm:text-base font-medium">{t.nav.logout}</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      // Regular profile dropdown content for other users
                      <>
                        <button 
                          onClick={() => {
                            window.location.href = '/profile';
                            setShowProfile(false);
                          }}
                          className="w-full flex items-center space-x-3 p-2.5 sm:p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm sm:text-base">{t.nav.profile}</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 p-2.5 sm:p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 rounded-lg transition-colors">
                          <Settings className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm sm:text-base">{t.nav.settings}</span>
                        </button>
                      </>
                    )}

                    {/* Show language/theme section only for non-admin users */}
                    {!(user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) && (
                      <>
                        <hr className="my-2 border-gray-200 dark:border-gray-700" />

                        {/* Language Selector in Dropdown - Mobile only */}
                        <div className="lg:hidden">
                          <button
                            onClick={() => setShowMobileLanguage(!showMobileLanguage)}
                            className="w-full flex items-center justify-between p-2.5 sm:p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 rounded-lg transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Globe className="w-4 h-4 flex-shrink-0" />
                              <div className="text-left">
                                <span className="text-sm sm:text-base block">Language</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {languages[language].flag} {languages[language].nativeName}
                                </span>
                              </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showMobileLanguage ? 'rotate-180' : ''}`} />
                          </button>

                      <AnimatePresence>
                        {showMobileLanguage && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-2 py-2 space-y-1">
                              {(Object.keys(languages) as Language[]).map((lang) => (
                                <button
                                  key={lang}
                                  onClick={() => {
                                    setLanguage(lang);
                                    setShowMobileLanguage(false);
                                  }}
                                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                                    language === lang
                                      ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className="text-base sm:text-lg">{languages[lang].flag}</span>
                                    <span className="text-xs sm:text-sm">{languages[lang].nativeName}</span>
                                  </div>
                                  {language === lang && (
                                    <Check className="w-3 h-3 flex-shrink-0" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                          </AnimatePresence>

                          <hr className="my-2 border-gray-200 dark:border-gray-700 lg:hidden" />

                          {/* Theme Toggle in Dropdown - Mobile only */}
                          <div className="lg:hidden px-2 sm:px-3 py-2">
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">Theme</p>
                            <ThemeToggle />
                          </div>

                          <hr className="my-2 border-gray-200 dark:border-gray-700" />
                          
                          <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-full flex items-center space-x-3 p-2.5 sm:p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm sm:text-base">{t.nav.logout}</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Logout Confirmation Dialog */}
        <AnimatePresence>
          {showLogoutConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[9999] p-4"
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowLogoutConfirm(false);
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-gray-100 mb-2">
                    Confirm Logout
                  </h3>
                  
                  <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to logout? This action cannot be undone.
                  </p>

                  <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(false)}
                      className="w-full px-4 py-2.5 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowLogoutConfirm(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-center px-4 py-2.5 bg-amber-600 dark:bg-amber-700 text-white rounded-lg hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}