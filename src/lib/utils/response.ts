import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export function createSuccessResponse<T = unknown>(
  message: string,
  data?: T,
  status: number = 200,
  headers?: Record<string, string>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status, headers }
  );
}

export function createErrorResponse<T = unknown>(
  error: string,
  status: number = 400,
  data?: T,
  headers?: Record<string, string>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: false,
      message: 'Error occurred',
      error,
      data,
    },
    { status, headers }
  );
}

export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): { success: boolean; missing?: string[] } {
  const missing = requiredFields.filter(field => !body[field]);
  return {
    success: missing.length === 0,
    missing: missing.length > 0 ? missing : undefined
  };
}