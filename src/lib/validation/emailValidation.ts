/**
 * Email validation utilities for farmer email fields
 */

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Validates an email address format
 * Returns validation result with isValid flag and optional error message
 */
export function validateEmail(email: string): EmailValidationResult {
  // Empty email is valid (optional field)
  if (!email || email.trim() === '') {
    return { isValid: true, formatted: '' };
  }

  const trimmedEmail = email.trim();

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g., farmer@example.com)'
    };
  }

  // Check email length
  if (trimmedEmail.length > 255) {
    return {
      isValid: false,
      error: 'Email address is too long (max 255 characters)'
    };
  }

  // Valid email
  return {
    isValid: true,
    formatted: trimmedEmail
  };
}

/**
 * Validates email on blur event for form fields
 * Returns error message string (empty if valid)
 */
export function validateEmailOnBlur(email: string): string {
  const result = validateEmail(email);
  return result.error || '';
}

/**
 * Formats email input by trimming whitespace
 * Use this on input change to clean the value
 */
export function formatEmailInput(value: string): string {
  // Remove leading/trailing spaces and convert to lowercase for consistency
  return value.trim().toLowerCase();
}

/**
 * Checks if email is required and validates accordingly
 * Use this when email is a required field
 */
export function validateRequiredEmail(email: string): EmailValidationResult {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'Email address is required'
    };
  }

  return validateEmail(email);
}
