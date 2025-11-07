/**
 * Farmer Type Definitions
 */

export interface Farmer {
  id: number;
  farmerId: string;
  rfId?: string;
  farmerName: string;
  fullName?: string; // Alias for farmerName
  password?: string;
  contactNumber?: string;
  phoneNumber?: string; // Alias for contactNumber
  email?: string;
  smsEnabled: string;
  bonus: number;
  address?: string;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  bmcId?: number;
  bmcName?: string;
  bmcIdentifier?: string;
  societyId?: number;
  societyName?: string;
  societyIdentifier?: string;
  machineId?: number | string;
  machineName?: string;
  machineType?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'suspended';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FarmerFormData {
  farmerId: string;
  rfId?: string;
  farmerName: string;
  password?: string;
  contactNumber?: string;
  email?: string;
  smsEnabled: string;
  bonus: number;
  address?: string;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  bmcId?: number;
  societyId?: number;
  machineId?: number | string;
  status: 'active' | 'inactive' | 'maintenance' | 'suspended';
  notes?: string;
}

export interface FarmerFilters {
  status: 'all' | 'active' | 'inactive' | 'maintenance' | 'suspended';
  bmcId: number | null;
  societyId: number | null;
  machineId: number | null;
  searchQuery: string;
}

export interface FarmerStats {
  total: number;
  active: number;
  inactive: number;
  maintenance: number;
  suspended?: number;
}
