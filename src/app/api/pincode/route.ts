import { NextRequest, NextResponse } from 'next/server';
import { lookupPincodeWithFallback } from '@/lib/pincodeService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');

    if (!pincode) {
      return NextResponse.json(
        { success: false, error: 'Pincode parameter is required' },
        { status: 400 }
      );
    }

    // Validate pincode format
    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid pincode format. Please enter a 6-digit pincode.' },
        { status: 400 }
      );
    }

    const result = await lookupPincodeWithFallback(pincode);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 404 });
    }

  } catch (error) {
    console.error('Pincode lookup API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while looking up pincode' },
      { status: 500 }
    );
  }
}