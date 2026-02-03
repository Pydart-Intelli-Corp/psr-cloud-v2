'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import FlowerSpinner from '@/components/loading/FlowerSpinner';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Home, 
  Users, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Milk,
  Building2,
  Tractor,
  BarChart3,
  FileText,
  Bell,
  Cog,
  Receipt,
  Cloud
} from 'lucide-react';
import { UserRole } from '@/types/user';

interface SidebarProps {
  userRole: UserRole;
  isCollapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: keyof typeof import('@/locales/en').en.nav;
  href: string;
  roles: UserRole[];
  badge?: string;
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
    href: '/admin/analytics',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DAIRY, UserRole.BMC]
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
    href: '/admin/society',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DAIRY, UserRole.BMC, UserRole.SOCIETY]
  },
  {
    icon: Cog,
    labelKey: 'machineManagement',
    href: '/admin/machine',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SOCIETY]
  },
  {
    icon: Receipt,
    labelKey: 'ratechartManagement',
    href: '/admin/ratechart',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SOCIETY]
  },
  {
    icon: Tractor,
    labelKey: 'farmerManagement',
    href: '/admin/farmer',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SOCIETY]
  },
  {
    icon: Cloud,
    labelKey: 'apiManagement',
    href: '/superadmin/api-management',
    roles: [UserRole.SUPER_ADMIN]
  },
  // {
  //   icon: Receipt,
  //   labelKey: 'paymentTransactions',
  //   href: '/admin/payment-transactions',
  //   roles: [UserRole.ADMIN]
  // },
  // {
  //   icon: Bell,
  //   labelKey: 'notifications',
  //   href: '/notifications',
  //   roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DAIRY, UserRole.BMC, UserRole.SOCIETY, UserRole.FARMER]
  // }
];

const roleColors: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'from-green-600 to-emerald-600',    // Primary green gradient
  [UserRole.ADMIN]: 'from-green-500 to-emerald-500',         // Slightly lighter green
  [UserRole.DAIRY]: 'from-teal-600 to-cyan-600',            // Teal for dairy operations
  [UserRole.BMC]: 'from-emerald-600 to-green-600',          // Emerald for BMC
  [UserRole.SOCIETY]: 'from-green-700 to-teal-700',         // Deeper green for society
  [UserRole.FARMER]: 'from-emerald-500 to-green-500'        // Natural green for farmers
};

export default function Sidebar({ userRole, isCollapsed, onToggle, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const { t } = useLanguage();

  // Mouse handlers - only for visual hover state
  const handleMouseEnter = () => {
    // No auto-expansion on hover - sidebar now expands only on button click
  };

  // Handle mouse leave - no action needed
  const handleMouseLeave = () => {
  };

  // Simplified toggle - just toggle the state
  const handleToggleClick = () => {
    onToggle();
  };

  // Detect route changes for loading state - moved to useEffect to prevent infinite loop
  useEffect(() => {
    if (pathname !== prevPathname) {
      setPrevPathname(pathname);
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [pathname, prevPathname]);

  // Get the correct dashboard href based on user role
  const getDashboardHref = (role: UserRole): string => {
    if (role === UserRole.SUPER_ADMIN) {
      return '/superadmin/dashboard';
    }
    if (role === UserRole.ADMIN) {
      return '/admin/dashboard';
    }
    if (role === UserRole.SOCIETY) {
      return '/society/dashboard';
    }
    // For other roles, default to admin dashboard
    return '/admin/dashboard';
  };

  // Get the correct route prefix based on user role
  const getRoutePrefix = (role: UserRole): string => {
    if (role === UserRole.SOCIETY) {
      return '/society';
    }
    return '/admin';
  };

  // Update navigation items with dynamic dashboard href and role-based routes
  const updatedNavItems = navigationItems.map(item => {
    if (item.labelKey === 'dashboard') {
      return { ...item, href: getDashboardHref(userRole) };
    }
    // For society users, redirect admin routes to society routes
    if (userRole === UserRole.SOCIETY) {
      if (item.href === '/admin/reports') {
        return { ...item, href: '/society/reports' };
      }
      if (item.href === '/admin/farmer') {
        return { ...item, href: '/society/farmer' };
      }
      if (item.href === '/admin/machine') {
        return { ...item, href: '/society/machine' };
      }
      if (item.href === '/admin/ratechart') {
        return { ...item, href: '/society/ratechart' };
      }
    }
    return item;
  });

  const filteredNavItems = updatedNavItems.filter(item => 
    item.roles.includes(userRole)
  );

  // Mobile nav items: top 4 + settings
  const mobileNavItems = filteredNavItems.slice(0, 4);
  const settingsItem = filteredNavItems.find(item => item.labelKey === 'settings');
  if (settingsItem && mobileNavItems.length < 5) {
    mobileNavItems.push(settingsItem);
  }

  return (
    <>
      {/* Mobile Bottom Navigation - Hidden for admin and super admin */}
      {userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN && (
        <nav className="
          fixed bottom-0 left-0 right-0 z-50
          bg-white dark:bg-gray-900
          border-t border-gray-200 dark:border-gray-700
          safe-area-pb
          lg:hidden
        ">
        <div className="flex justify-around items-center px-2 py-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1"
              >
                <div className={`
                  flex flex-col items-center justify-center
                  py-2 px-1
                  rounded-lg
                  transition-all duration-200
                  min-h-[60px]
                  ${isActive 
                    ? `bg-gradient-to-br ${roleColors[userRole]} text-white shadow-lg` 
                    : 'text-gray-600 dark:text-gray-400'
                  }
                `}>
                  <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-white' : ''}`} />
                  <span className={`
                    text-[10px] font-medium text-center leading-tight truncate max-w-[60px]
                    ${isActive ? 'text-white' : ''}
                  `}>
                    {t.nav[item.labelKey]}
                  </span>
                  {item.badge && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
      )}

      {/* Desktop Sidebar - Always rendered, CSS controls visibility */}
      <motion.aside
        initial={{ width: isCollapsed ? 80 : 280 }}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hidden lg:flex h-screen bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700 flex-col relative z-20"
      >
        {/* Header */}
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center">
          {/* Flower Spinner */}
          <div className="flex items-center justify-center mb-[-8px]">
            <FlowerSpinner size={isCollapsed ? 32 : 40} className="text-green-600 dark:text-green-400" isLoading={isLoading} />
          </div>
          
          {/* Logo and Toggle Button */}
          <div className="flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-3 flex-1"
              >
                <div className="w-full h-10 flex items-center justify-center ml-8">
                  <Image 
                    src="/flogo.png" 
                    alt="Poornasree Equipments Logo" 
                    width={157} 
                    height={45} 
                    className="object-contain"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Toggle button - click to expand/collapse */}
          <button
            onClick={handleToggleClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isCollapsed ? 'Click to expand' : 'Click to collapse'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block"
              title={isCollapsed ? t.nav[item.labelKey] : undefined}
            >
              <motion.div
                whileHover={{ x: 4 }}
                className={`
                  flex items-center space-x-3 p-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? `bg-gradient-to-r ${roleColors[userRole]} text-white shadow-lg` 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="body-medium font-medium"
                    >
                      {t.nav[item.labelKey]}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {item.badge && !isCollapsed && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer - (Logout removed from sidebar per request) */}
    </motion.aside>
    </>
  );
}