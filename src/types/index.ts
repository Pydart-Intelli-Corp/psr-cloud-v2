// Shared types for the application

// Export farmer types
export * from './farmer';

export interface Society {
  id: number;
  name: string;
  society_id: string;
  bmc_id?: number;
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