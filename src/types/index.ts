// Shared types for the application
export interface Society {
  id: number;
  name: string;
  society_id: string;
}

export interface Farmer {
  id: number;
  farmer_id: string;
  full_name: string;
  mobile_number: string;
  society_id: string;
  society?: Society;
  email?: string;
  address?: string;
  sms_enabled: boolean;
  bonus?: number;
  bank_name?: string;
  bank_account_number?: string;
  ifsc_code?: string;
  status: 'active' | 'inactive';
  notes?: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CSVUploadResult {
  success: boolean;
  message: string;
  totalRows?: number;
  successfulRows?: number;
  failedRows?: number;
  errors?: Array<{
    row: number;
    error: string;
    data?: CSVFarmerRow;
  }>;
}

export interface CSVFarmerRow {
  farmer_id: string;
  full_name: string;
  mobile_number: string;
  email?: string;
  address?: string;
  bank_name?: string;
  bank_account_number?: string;
  ifsc_code?: string;
  notes?: string;
}