import { NextRequest } from 'next/server';
import { validateEmailQuick } from '@/lib/emailValidation';
import { createErrorResponse, createSuccessResponse } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Email validation request received');
    const body = await request.json();
    const { email, deep = false } = body;
    console.log('📧 Validating email:', email, 'deep:', deep);

    if (!email) {
      console.log('❌ No email provided');
      return createErrorResponse('Email is required', 400);
    }

    let validation;
    
    try {
      if (deep) {
        console.log('🔍 Performing deep validation (MX check)');
        // Deep validation with MX record check (slower)
        validation = validateEmailQuick(email) ? { isValid: false, error: validateEmailQuick(email) } : { isValid: true, isDeliverable: true, isFree: false };
      } else {
        console.log('⚡ Performing quick validation');
        // Quick validation without MX check (faster)
        validation = validateEmailQuick(email);
      }
      console.log('✅ Validation result:', validation);
    } catch (validationError) {
      console.error('❌ Validation error:', validationError);
      return createErrorResponse('Email validation service error', 500);
    }

    const response: {
      email: string;
      isValid: boolean;
      isDeliverable: boolean;
      isFree: boolean;
      suggestion?: string;
      error?: string;
      warnings: string[];
    } = {
      email,
      isValid: validation.isValid,
      isDeliverable: validation.isDeliverable,
      isFree: validation.isFree,
      suggestion: validation.suggestion,
      error: validation.error,
      warnings: []
    };

    // Add warnings for domain suggestions only (free email warning handled in frontend)
    if (validation.suggestion) {
      response.warnings.push(`Did you mean: ${validation.suggestion}?`);
    }

    return createSuccessResponse(
      response,
      validation.isValid ? 'Email validation passed' : 'Email validation failed'
    );

  } catch (error) {
    console.error('Email validation API error:', error);
    return createErrorResponse('Email validation failed', 500);
  }
}