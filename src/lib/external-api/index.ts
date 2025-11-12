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

// ESP32-specific response utilities
export { ESP32ResponseHelper } from './ESP32ResponseHelper';

// Re-import for interface extension
import type { BaseInputParts } from './BaseExternalAPI';

// Common interfaces for external APIs
export interface FarmerInfoInput extends BaseInputParts {
  pageNumber?: string; // Optional 5th part for pagination
}

export interface MachinePasswordInput extends BaseInputParts {
  passwordType: string; // Required 5th part for password type
}

export interface MachineUpdateInput extends BaseInputParts {
  datetime?: string; // Optional datetime parameter
}

export interface MachineCorrectionInput extends BaseInputParts {
  // Standard 4 parts only (societyId, machineType, version, machineId)
  _marker?: never; // Type marker to prevent linting error
}

export interface FarmerResult {
  id: number;
  farmer_id: string;
  rf_id: string;
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

export interface MachineCorrectionResult {
  id: number;
  machine_id: number;
  channel1_fat: number;
  channel1_snf: number;
  channel1_clr: number;
  channel1_temp: number;
  channel1_water: number;
  channel1_protein: number;
  channel2_fat: number;
  channel2_snf: number;
  channel2_clr: number;
  channel2_temp: number;
  channel2_water: number;
  channel2_protein: number;
  channel3_fat: number;
  channel3_snf: number;
  channel3_clr: number;
  channel3_temp: number;
  channel3_water: number;
  channel3_protein: number;
  status: number;
  created_at: Date;
  updated_at: Date;
}