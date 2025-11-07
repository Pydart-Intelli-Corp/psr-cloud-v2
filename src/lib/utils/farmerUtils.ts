/**
 * Farmer Management Utility Functions
 * Extracted from farmer page for reusability
 */

import type { Farmer } from '@/types';

/**
 * Download data as CSV file
 */
export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Convert farmers array to CSV format
 */
export const convertToCSV = (farmers: Farmer[]): string => {
  if (farmers.length === 0) return '';

  const headers = [
    'ID',
    'Farmer ID',
    'Full Name',
    'Email',
    'Phone Number',
    'BMC Name',
    'Society Name',
    'Machine ID',
    'Status',
    'Created At',
    'Updated At'
  ];

  const csvRows = [
    headers.join(','),
    ...farmers.map(farmer =>
      [
        farmer.id,
        `"${farmer.farmerId || ''}"`,
        `"${farmer.farmerName || farmer.fullName || ''}"`,
        `"${farmer.email || ''}"`,
        `"${farmer.contactNumber || farmer.phoneNumber || ''}"`,
        `"${farmer.bmcName || ''}"`,
        `"${farmer.societyName || ''}"`,
        `"${farmer.machineId || ''}"`,
        farmer.status,
        farmer.createdAt ? new Date(farmer.createdAt).toLocaleDateString() : '',
        farmer.updatedAt ? new Date(farmer.updatedAt).toLocaleDateString() : ''
      ].join(',')
    )
  ];

  return csvRows.join('\n');
};

/**
 * Filter farmers based on search query and filters
 */
export const filterFarmers = (
  farmers: Farmer[],
  searchQuery: string,
  statusFilter: string,
  bmcFilter: number | null,
  societyFilter: number | null
): Farmer[] => {
  return farmers.filter(farmer => {
    // Search query filter
    const machineIdStr = farmer.machineId ? String(farmer.machineId) : '';
    const matchesSearch =
      searchQuery === '' ||
      farmer.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.farmerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.phoneNumber?.includes(searchQuery) ||
      farmer.contactNumber?.includes(searchQuery) ||
      machineIdStr.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === 'all' || farmer.status === statusFilter;

    // BMC filter
    const matchesBMC = bmcFilter === null || farmer.bmcId === bmcFilter;

    // Society filter
    const matchesSociety =
      societyFilter === null || farmer.societyId === societyFilter;

    return matchesSearch && matchesStatus && matchesBMC && matchesSociety;
  });
};

/**
 * Sort farmers by specified field
 */
export const sortFarmers = (
  farmers: Farmer[],
  sortField: keyof Farmer,
  sortOrder: 'asc' | 'desc'
): Farmer[] => {
  return [...farmers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

/**
 * Get statistics for a group of farmers
 */
export const getFarmerStats = (farmers: Farmer[]) => {
  const activeCount = farmers.filter(f => f.status === 'active').length;
  const inactiveCount = farmers.filter(f => f.status === 'inactive').length;
  const maintenanceCount = farmers.filter(f => f.status === 'maintenance').length;
  
  return {
    total: farmers.length,
    active: activeCount,
    inactive: inactiveCount,
    maintenance: maintenanceCount
  };
};

/**
 * Group farmers by a specified field
 */
export const groupFarmersBy = <K extends keyof Farmer>(
  farmers: Farmer[],
  field: K
): Record<string, Farmer[]> => {
  return farmers.reduce((acc, farmer) => {
    const key = String(farmer[field] || 'unknown');
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(farmer);
    return acc;
  }, {} as Record<string, Farmer[]>);
};

/**
 * Validate farmer data for creation/update
 */
export const validateFarmerData = (data: Partial<Farmer>): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  // Required fields
  const name = data.farmerName || data.fullName;
  if (!name?.trim()) {
    errors.fullName = 'Farmer name is required';
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  const phone = data.contactNumber || data.phoneNumber;
  if (phone && !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
    errors.phoneNumber = 'Phone number must be 10 digits';
  }

  if (!data.societyId) {
    errors.societyId = 'Society is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Parse CSV file and validate data
 */
export const parseCSVFile = (file: File): Promise<{
  data: Partial<Farmer>[];
  errors: string[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          resolve({
            data: [],
            errors: ['CSV file is empty or has no data rows']
          });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const data: Partial<Farmer>[] = [];
        const errors: string[] = [];

        // Validate required headers
        const requiredHeaders = ['fullname', 'email', 'phonenumber', 'bmcid', 'societyid'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
        }

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const row: Partial<Farmer> = {};

          headers.forEach((header, index) => {
            const value = values[index];
            switch (header) {
              case 'fullname':
                row.fullName = value;
                break;
              case 'email':
                row.email = value;
                break;
              case 'phonenumber':
                row.phoneNumber = value;
                break;
              case 'bmcid':
                row.bmcId = parseInt(value) || undefined;
                break;
              case 'societyid':
                row.societyId = parseInt(value) || undefined;
                break;
              case 'machineid':
                row.machineId = value;
                break;
              case 'status':
                row.status = value as 'active' | 'inactive' | 'maintenance';
                break;
            }
          });

          // Validate row
          const validation = validateFarmerData(row);
          if (!validation.isValid) {
            errors.push(`Row ${i}: ${Object.values(validation.errors).join(', ')}`);
          } else {
            data.push(row);
          }
        }

        resolve({ data, errors });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Get status badge color
 */
export const getStatusColor = (status: string): {
  bg: string;
  text: string;
  border: string;
} => {
  switch (status) {
    case 'active':
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800'
      };
    case 'inactive':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800'
      };
    case 'maintenance':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800'
      };
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        text: 'text-gray-700 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-800'
      };
  }
};

/**
 * Calculate bulk operation progress
 */
export const calculateProgress = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

/**
 * Batch items for processing (useful for bulk operations)
 */
export const batchItems = <T>(items: T[], batchSize: number): T[][] => {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
};

/**
 * Generate unique filename with timestamp
 */
export const generateFilename = (prefix: string, extension: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}_${timestamp}.${extension}`;
};
