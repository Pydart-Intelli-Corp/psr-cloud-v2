module.exports = [
"[project]/src/lib/pincodeService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Indian Pincode Lookup Service
// This uses a free API service to lookup city and state by pincode
__turbopack_context__.s([
    "INDIAN_STATES",
    ()=>INDIAN_STATES,
    "formatPincode",
    ()=>formatPincode,
    "isValidIndianPincode",
    ()=>isValidIndianPincode,
    "lookupPincode",
    ()=>lookupPincode,
    "lookupPincodeWithFallback",
    ()=>lookupPincodeWithFallback
]);
// Cache for storing pincode lookups to reduce API calls
const pincodeCache = new Map();
async function lookupPincode(pincode) {
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
            data: pincodeCache.get(pincode)
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
        const pincodeInfo = {
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
 */ async function lookupPincodeAlternative(pincode) {
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
        const pincodeInfo = {
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
    } catch  {
        return {
            success: false,
            error: 'Unable to fetch pincode information'
        };
    }
}
async function lookupPincodeWithFallback(pincode) {
    // Try primary API first
    const primaryResult = await lookupPincode(pincode);
    if (primaryResult.success) {
        return primaryResult;
    }
    // If primary fails, try alternative
    console.log('Primary pincode API failed, trying alternative...');
    return await lookupPincodeAlternative(pincode);
}
function isValidIndianPincode(pincode) {
    const pincodeRegex = /^\d{6}$/;
    return pincodeRegex.test(pincode);
}
function formatPincode(pincode) {
    if (isValidIndianPincode(pincode)) {
        return `${pincode.slice(0, 3)} ${pincode.slice(3)}`;
    }
    return pincode;
}
const INDIAN_STATES = [
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
}),
"[project]/src/lib/clientAuth.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkAuthAndRedirect",
    ()=>checkAuthAndRedirect,
    "getDashboardRoute",
    ()=>getDashboardRoute,
    "verifyUserSession",
    ()=>verifyUserSession
]);
'use client';
async function verifyUserSession() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('🔍 verifyUserSession: No token found');
            return {
                isValid: false
            };
        }
        console.log('🔍 verifyUserSession: Token found, making API call');
        const response = await fetch('/api/auth/verify-session', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('🔍 verifyUserSession: API response status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('🔍 verifyUserSession: API response data:', data);
            if (data.success && data.data && data.data.user) {
                // Update localStorage with fresh user data
                localStorage.setItem('userData', JSON.stringify(data.data.user));
                console.log('✅ verifyUserSession: Session valid, user:', data.data.user);
                return {
                    isValid: true,
                    user: data.data.user
                };
            }
        }
        // If verification fails, clear stored data
        console.log('❌ verifyUserSession: Session invalid, clearing storage');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        return {
            isValid: false
        };
    } catch (error) {
        console.error('❌ verifyUserSession: Session verification failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        return {
            isValid: false
        };
    }
}
function getDashboardRoute(role) {
    switch(role){
        case 'super_admin':
            return '/superadmin/dashboard';
        case 'admin':
            return '/admin/dashboard';
        case 'dairy':
            return '/dairy/dashboard';
        case 'bmc':
            return '/bmc/dashboard';
        case 'society':
            return '/society/dashboard';
        case 'farmer':
            return '/farmer/dashboard';
        default:
            console.warn(`Unknown role: ${role}, redirecting to login`);
            return '/login';
    }
}
async function checkAuthAndRedirect(router) {
    console.log('🔍 checkAuthAndRedirect: Starting authentication check');
    const { isValid, user } = await verifyUserSession();
    console.log('🔍 checkAuthAndRedirect: Session check result:', {
        isValid,
        user
    });
    if (isValid && user) {
        const dashboardRoute = getDashboardRoute(user.role);
        console.log('✅ checkAuthAndRedirect: Redirecting to:', dashboardRoute);
        router.push(dashboardRoute);
        return true;
    }
    console.log('ℹ️ checkAuthAndRedirect: No valid session, staying on current page');
    return false;
}
}),
"[project]/src/types/user.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// User role types for client-side components
__turbopack_context__.s([
    "UserRole",
    ()=>UserRole
]);
var UserRole = /*#__PURE__*/ function(UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["DAIRY"] = "dairy";
    UserRole["BMC"] = "bmc";
    UserRole["SOCIETY"] = "society";
    UserRole["FARMER"] = "farmer";
    return UserRole;
}({});
}),
];

//# sourceMappingURL=src_958f10f7._.js.map