// Client-safe email validation (no Node.js dependencies)

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
 * Quick email validation without MX check (client-safe)
 * Returns error string or undefined if valid
 */
export function validateEmailQuick(email: string): string | undefined {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }

  if (!validateEmailFormat(email)) {
    return 'Invalid email format';
  }

  const domain = email.toLowerCase().split('@')[1];
  
  // Check for domain typos
  const suggestion = suggestDomainCorrection(domain);
  if (suggestion) {
    return `Did you mean ${email.split('@')[0]}@${suggestion}?`;
  }

  return undefined;
}

/**
 * Quick email validation returning full result object
 */
export function validateEmailQuickResult(email: string): EmailValidationResult {
  const result: EmailValidationResult = {
    isValid: false,
    isDeliverable: true, // Assume deliverable for quick check
    isFree: false
  };

  try {
    if (!validateEmailFormat(email)) {
      result.error = 'Invalid email format';
      return result;
    }

    result.isValid = true;

    const [localPart, domain] = email.toLowerCase().split('@');
    
    // Check for domain typos
    const suggestion = suggestDomainCorrection(domain);
    if (suggestion) {
      result.suggestion = `${localPart}@${suggestion}`;
    }

    // Check if it's a free email domain
    result.isFree = isFreeEmailDomain(domain);

    return result;
  } catch (error) {
    console.error('❌ Quick validation error:', error);
    result.error = 'Email validation failed';
    return result;
  }
}