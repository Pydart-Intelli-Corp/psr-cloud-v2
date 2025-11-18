/**
 * Mobile Number Validation Utilities
 * 
 * Validates and formats Indian mobile numbers
 * Indian mobile numbers: 10 digits starting with 6-9
 */

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Validates Indian mobile number
 * @param phone - Phone number to validate
 * @returns Validation result with error message if invalid
 */
export function validateIndianPhone(phone: string): PhoneValidationResult {
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      error: 'Phone number is required'
    };
  }

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Check length
  if (cleaned.length !== 10) {
    return {
      isValid: false,
      error: 'Phone number must be exactly 10 digits'
    };
  }

  // Check if starts with valid digit (6-9)
  if (!/^[6-9]/.test(cleaned)) {
    return {
      isValid: false,
      error: 'Phone number must start with 6, 7, 8, or 9'
    };
  }

  return {
    isValid: true,
    formatted: cleaned
  };
}

/**
 * Formats phone number input - allows only digits and limits to 10
 * @param value - Input value
 * @returns Formatted phone number (digits only, max 10)
 */
export function formatPhoneInput(value: string): string {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  return cleaned.slice(0, 10);
}

/**
 * Checks if phone number is complete (10 digits)
 * @param phone - Phone number to check
 * @returns True if phone has 10 digits
 */
export function isPhoneComplete(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
}

/**
 * Display formatted phone number with spacing
 * @param phone - Phone number to format
 * @returns Formatted as: XXXXX XXXXX
 */
export function displayPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length <= 5) {
    return cleaned;
  }
  
  return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
}

/**
 * Validates phone on blur - provides detailed error
 * @param phone - Phone number to validate
 * @returns Error message or empty string if valid
 */
export function validatePhoneOnBlur(phone: string): string {
  if (!phone || phone.trim() === '') {
    return ''; // Don't show error for empty field (let required handle it)
  }

  const result = validateIndianPhone(phone);
  return result.error || '';
}
