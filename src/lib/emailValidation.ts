import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

export interface EmailValidationResult {
  isValid: boolean;
  isDeliverable: boolean;
  isFree: boolean;
  suggestion?: string;
  error?: string;
}

// List of common free email providers
const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
  'aol.com', 'icloud.com', 'mail.com', 'zoho.com', 'protonmail.com',
  'yandex.com', 'gmx.com', 'rediffmail.com', 'yahoo.co.in', 'gmail.co.in'
];

// Common email domain typos and their corrections
const DOMAIN_SUGGESTIONS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com'
};

/**
 * Basic email format validation
 */
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if email domain has MX records (can receive emails)
 */
export async function checkMxRecord(domain: string): Promise<boolean> {
  try {
    const mxRecords = await resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch {
    return false;
  }
}

/**
 * Check if email domain is a free email provider
 */
export function isFreeEmailDomain(domain: string): boolean {
  return FREE_EMAIL_DOMAINS.includes(domain.toLowerCase());
}

/**
 * Suggest correct domain if there's a typo
 */
export function suggestDomainCorrection(domain: string): string | undefined {
  return DOMAIN_SUGGESTIONS[domain.toLowerCase()];
}

/**
 * Comprehensive email validation
 */
export async function validateEmailAlive(email: string): Promise<EmailValidationResult> {
  console.log('🔍 validateEmailAlive called for:', email);
  
  const result: EmailValidationResult = {
    isValid: false,
    isDeliverable: false,
    isFree: false
  };

  try {
    // Basic format validation
    if (!validateEmailFormat(email)) {
      console.log('❌ Email format invalid');
      result.error = 'Invalid email format';
      return result;
    }

    console.log('✅ Email format valid');
    result.isValid = true;

    const [localPart, domain] = email.toLowerCase().split('@');
    console.log('📧 Domain extracted:', domain);
    
    // Check for domain typos
    const suggestion = suggestDomainCorrection(domain);
    if (suggestion) {
      console.log('💡 Domain suggestion:', suggestion);
      result.suggestion = `${localPart}@${suggestion}`;
    }

    // Check if it's a free email domain
    result.isFree = isFreeEmailDomain(domain);
    console.log('📦 Is free domain:', result.isFree);

    // Check MX records to see if domain can receive emails
    console.log('🔍 Checking MX records for domain:', domain);
    try {
      result.isDeliverable = await checkMxRecord(domain);
      console.log('📬 MX check result:', result.isDeliverable);
    } catch (mxError) {
      console.error('❌ MX check failed:', mxError);
      // For development, assume deliverable if MX check fails
      result.isDeliverable = true;
      console.log('⚠️ MX check failed, assuming deliverable for development');
    }

    if (!result.isDeliverable && !suggestion) {
      result.error = 'Email domain cannot receive emails';
    }

  } catch (error) {
    console.error('❌ Email validation error:', error);
    result.error = 'Email validation failed';
  }

  console.log('📊 Final validation result:', result);
  return result;
}

/**
 * Validate email for business use (stricter validation)
 */
export async function validateBusinessEmail(email: string): Promise<EmailValidationResult> {
  const result = await validateEmailAlive(email);
  
  // For business emails, we might want to discourage free email domains
  if (result.isValid && result.isFree) {
    result.error = 'Please use a business email address instead of a free email provider';
  }

  return result;
}

/**
 * Quick email validation without MX check (for faster responses)
 */
export function validateEmailQuick(email: string): EmailValidationResult {
  console.log('⚡ validateEmailQuick called for:', email);
  
  const result: EmailValidationResult = {
    isValid: false,
    isDeliverable: true, // Assume deliverable for quick check
    isFree: false
  };

  try {
    if (!validateEmailFormat(email)) {
      console.log('❌ Quick validation: Invalid email format');
      result.error = 'Invalid email format';
      return result;
    }

    console.log('✅ Quick validation: Email format valid');
    result.isValid = true;

    const [localPart, domain] = email.toLowerCase().split('@');
    console.log('📧 Quick validation: Domain extracted:', domain);
    
    // Check for domain typos
    const suggestion = suggestDomainCorrection(domain);
    if (suggestion) {
      console.log('💡 Quick validation: Domain suggestion:', suggestion);
      result.suggestion = `${localPart}@${suggestion}`;
    }

    // Check if it's a free email domain
    result.isFree = isFreeEmailDomain(domain);
    console.log('📦 Quick validation: Is free domain:', result.isFree);

    console.log('📊 Quick validation result:', result);
    return result;
  } catch (error) {
    console.error('❌ Quick validation error:', error);
    result.error = 'Email validation failed';
    return result;
  }
}