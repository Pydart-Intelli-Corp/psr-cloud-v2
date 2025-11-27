'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Eye, MapPin, User, Phone, Mail, Calendar, Milk, Building2, Users, Factory, TrendingUp, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import StatusDropdown from '@/components/management/StatusDropdown';

// Helper function to highlight matching text
const highlightText = (text: string, searchQuery: string) => {
  if (!searchQuery) return text;
  
  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
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

interface DetailItem {
  icon: React.ReactNode;
  text: string | React.ReactNode;
  className?: string;
}

interface DairyMinimalCardProps {
  id: number;
  name: string;
  dairyId: string;
  location?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  monthlyTarget?: number;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  bmcCount?: number;
  societyCount?: number;
  farmerCount?: number;
  totalCollections?: number;
  totalRevenue?: number;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onStatusChange: (newStatus: 'active' | 'inactive' | 'maintenance') => void;
  searchQuery?: string;
}

export default function DairyMinimalCard({
  id,
  name,
  dairyId,
  location,
  contactPerson,
  phone,
  email,
  capacity,
  monthlyTarget,
  status,
  createdAt,
  bmcCount = 0,
  societyCount = 0,
  farmerCount = 0,
  totalCollections = 0,
  totalRevenue = 0,
  isSelected = false,
  onToggleSelection,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  searchQuery = '',
}: DairyMinimalCardProps) {
  const { t } = useLanguage();

  // Build details array
  const details: DetailItem[] = [];

  // Performance metrics section
  if (bmcCount > 0 || societyCount > 0 || farmerCount > 0 || totalCollections > 0 || totalRevenue > 0) {
    const metrics = [];
    
    if (bmcCount > 0) metrics.push({ label: 'BMCs', value: bmcCount, icon: Factory, bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-700 dark:text-blue-300', iconColor: 'text-blue-600 dark:text-blue-400' });
    if (societyCount > 0) metrics.push({ label: 'Societies', value: societyCount, icon: Building2, bgColor: 'bg-green-50 dark:bg-green-900/20', textColor: 'text-green-700 dark:text-green-300', iconColor: 'text-green-600 dark:text-green-400' });
    if (farmerCount > 0) metrics.push({ label: 'Farmers', value: farmerCount.toLocaleString(), icon: Users, bgColor: 'bg-purple-50 dark:bg-purple-900/20', textColor: 'text-purple-700 dark:text-purple-300', iconColor: 'text-purple-600 dark:text-purple-400' });
    if (totalCollections > 0) metrics.push({ label: 'Collections', value: `${totalCollections.toLocaleString()} L`, icon: TrendingUp, bgColor: 'bg-amber-50 dark:bg-amber-900/20', textColor: 'text-amber-700 dark:text-amber-300', iconColor: 'text-amber-600 dark:text-amber-400' });
    if (totalRevenue > 0) metrics.push({ label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-700 dark:text-emerald-300', iconColor: 'text-emerald-600 dark:text-emerald-400' });
    
    details.push({
      icon: null,
      text: (
        <div className="flex flex-wrap gap-1.5">
          {metrics.map((metric, idx) => (
            <div key={idx} className={`inline-flex items-center gap-1.5 ${metric.bgColor} rounded-md px-2 py-1`}>
              <metric.icon className={`w-3 h-3 ${metric.iconColor} flex-shrink-0`} />
              <span className={`text-xs font-semibold ${metric.textColor} whitespace-nowrap`}>
                {metric.value}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      )
    });
  }

  // Contact details
  if (location) details.push({ icon: <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: location });
  if (contactPerson) details.push({ icon: <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: contactPerson });
  if (phone) details.push({ icon: <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: phone });
  if (email) details.push({ icon: <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: email });
  if (capacity && capacity > 0) details.push({ icon: <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: `Capacity: ${capacity.toLocaleString()} L` });
  if (monthlyTarget && monthlyTarget > 0) details.push({ icon: <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: `Target: ${monthlyTarget.toLocaleString()} L/month` });
  details.push({ icon: <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, text: `Created: ${new Date(createdAt).toLocaleDateString()}` });

  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-green-200 dark:hover:border-green-700 flex flex-col ${isSelected ? 'ring-2 ring-green-500 border-green-500' : ''}`}
    >
      <div className="p-4 sm:p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            {onToggleSelection && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelection}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            )}
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex-shrink-0">
              <div className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400">
                <Milk className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {highlightText(name, searchQuery)}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {highlightText(dairyId, searchQuery)}
              </p>
            </div>
          </div>
          <StatusDropdown
            currentStatus={status}
            onStatusChange={(newStatus) => onStatusChange(newStatus as 'active' | 'inactive' | 'maintenance')}
          />
        </div>

        {/* Details */}
        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 flex-1">
          {details.map((detail, index) => (
            <div key={index} className={`flex items-center text-xs sm:text-sm ${detail.className || 'text-gray-600 dark:text-gray-400'}`}>
              {detail.icon && (
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 flex-shrink-0">
                  {detail.icon}
                </div>
              )}
              <span className={typeof detail.text === 'string' && (detail.text.includes('@') || detail.text.length > 30) ? 'truncate' : ''}>
                {typeof detail.text === 'string' ? highlightText(detail.text, searchQuery) : detail.text}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
          <div className="flex space-x-1 sm:space-x-2">
            <button
              onClick={onEdit}
              className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 touch-target sm:min-h-0 sm:min-w-0 flex items-center justify-center"
              title={t.common?.edit || 'Edit'}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 touch-target sm:min-h-0 sm:min-w-0 flex items-center justify-center"
              title={t.common?.delete || 'Delete'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={onView}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors flex items-center gap-1.5 sm:gap-2 min-h-[44px] sm:min-h-0"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t.common?.view || 'View Details'}</span>
            <span className="sm:hidden">{t.common?.view || 'View'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
