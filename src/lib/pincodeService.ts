// Indian Pincode Lookup Service
// This uses a free API service to lookup city and state by pincode

export interface PincodeInfo {
  pincode: string;
  city: string;
  state: string;
  district?: string;
  country: string;
}

export interface PincodeResponse {
  success: boolean;
  data?: PincodeInfo;
  error?: string;
}

// Cache for storing pincode lookups to reduce API calls
const pincodeCache = new Map<string, PincodeInfo>();

/**
 * Lookup city and state information for an Indian pincode
 * @param pincode - 6-digit Indian pincode
 * @returns Promise with pincode information
 */
export async function lookupPincode(pincode: string): Promise<PincodeResponse> {
  // Validate pincode format (6 digits)
  const pincodeRegex = /^\d{6}$/;
  if (!pincodeRegex.test(pincode)) {
    return {
      success: false,
      error: 'Invalid pincode format. Please enter a 6-digit pincode.'
    };
  }

  // Check cache first
  if (pincodeCache.has(pincode)) {
    return {
      success: true,
      data: pincodeCache.get(pincode)!
    };
  }

  try {
    // Using India Post API (free and reliable)
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch pincode data');
    }

    const data = await response.json();
    
    // API returns an array, check if data exists and is valid
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        success: false,
        error: 'Pincode not found'
      };
    }

    const result = data[0];
    
    if (result.Status !== 'Success' || !result.PostOffice || result.PostOffice.length === 0) {
      return {
        success: false,
        error: 'Invalid pincode or no data available'
      };
    }

    // Get the first post office data (usually the main one)
    const postOffice = result.PostOffice[0];
    
    const pincodeInfo: PincodeInfo = {
      pincode: pincode,
      city: postOffice.Name || postOffice.Block || postOffice.Division || '',
      state: postOffice.State || '',
      district: postOffice.District || '',
      country: postOffice.Country || 'India'
    };

    // Cache the result for future use
    pincodeCache.set(pincode, pincodeInfo);

    return {
      success: true,
      data: pincodeInfo
    };

  } catch (error) {
    console.error('Pincode lookup error:', error);
    return {
      success: false,
      error: 'Unable to fetch pincode information. Please enter manually.'
    };
  }
}

/**
 * Alternative lookup using a different API as fallback
 */
async function lookupPincodeAlternative(pincode: string): Promise<PincodeResponse> {
  try {
    // Using Zippopotam API as backup
    const response = await fetch(`https://api.zippopotam.us/IN/${pincode}`);
    
    if (!response.ok) {
      throw new Error('Pincode not found');
    }

    const data = await response.json();
    
    if (!data.places || data.places.length === 0) {
      return {
        success: false,
        error: 'Pincode not found'
      };
    }

    const place = data.places[0];
    
    const pincodeInfo: PincodeInfo = {
      pincode: pincode,
      city: place['place name'] || '',
      state: place['state'] || '',
      district: place['state abbreviation'] || place['state'] || '',
      country: data.country || 'India'
    };

    // Cache the result
    pincodeCache.set(pincode, pincodeInfo);

    return {
      success: true,
      data: pincodeInfo
    };

  } catch {
    return {
      success: false,
      error: 'Unable to fetch pincode information'
    };
  }
}

/**
 * Enhanced pincode lookup with fallback
 */
export async function lookupPincodeWithFallback(pincode: string): Promise<PincodeResponse> {
  // Try primary API first
  const primaryResult = await lookupPincode(pincode);
  
  if (primaryResult.success) {
    return primaryResult;
  }

  // If primary fails, try alternative
  console.log('Primary pincode API failed, trying alternative...');
  return await lookupPincodeAlternative(pincode);
}

/**
 * Validate Indian pincode format
 */
export function isValidIndianPincode(pincode: string): boolean {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
}

/**
 * Format pincode with proper spacing (optional, for display purposes)
 */
export function formatPincode(pincode: string): string {
  if (isValidIndianPincode(pincode)) {
    return `${pincode.slice(0, 3)} ${pincode.slice(3)}`;
  }
  return pincode;
}

/**
 * Get common Indian states for fallback dropdown
 */
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh', 
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];