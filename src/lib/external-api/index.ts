// External API pattern base classes and utilities
export { BaseExternalAPI } from './BaseExternalAPI';
export type { 
  BaseInputParts, 
  ValidationResult, 
  ExternalAPIConfig 
} from './BaseExternalAPI';

// Input validation utilities
export { InputValidator } from './InputValidator';

// Database query building utilities
export { QueryBuilder } from './QueryBuilder';

// Response formatting utilities  
export { ResponseFormatter } from './ResponseFormatter';

// Re-import for interface extension
import type { BaseInputParts } from './BaseExternalAPI';

// Common interfaces for external APIs
export interface FarmerInfoInput extends BaseInputParts {
  pageNumber?: string; // Optional 5th part for pagination
}

export interface MachinePasswordInput extends BaseInputParts {
  passwordType: string; // Required 5th part for password type
}

export interface FarmerResult {
  id: number;
  farmer_id: string;
  name: string;
  phone: string | null;
  sms_enabled: 'ON' | 'OFF' | null;
  bonus: number | null;
}

export interface MachinePasswordResult {
  id: number;
  machine_id: string;
  user_password: string | null;
  supervisor_password: string | null;
  statusU: number;
  statusS: number;
  society_string_id?: string;
}