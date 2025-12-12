import { NextRequest } from 'next/server';
import { validateEmailQuickResult } from '@/lib/emailValidation';
import { createErrorResponse, createSuccessResponse } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Email validation request received');
    const body = await request.json();
    const { email } = body;
    console.log('📧 Validating email:', email);

    if (!email) {
      console.log('❌ No email provided');
      return createErrorResponse('Email is required', 400);
    }

    console.log('⚡ Performing quick validation');
    const validation = validateEmailQuickResult(email);
    console.log('✅ Validation result:', validation);

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