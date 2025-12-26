(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/clientAuth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/types/user.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_d86b4b05._.js.map