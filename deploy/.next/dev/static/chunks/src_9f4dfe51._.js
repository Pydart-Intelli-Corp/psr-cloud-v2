(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/validation/phoneValidation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Mobile Number Validation Utilities
 * 
 * Validates and formats Indian mobile numbers
 * Indian mobile numbers: 10 digits starting with 6-9
 */ __turbopack_context__.s([
    "displayPhoneNumber",
    ()=>displayPhoneNumber,
    "formatPhoneInput",
    ()=>formatPhoneInput,
    "isPhoneComplete",
    ()=>isPhoneComplete,
    "validateIndianPhone",
    ()=>validateIndianPhone,
    "validatePhoneOnBlur",
    ()=>validatePhoneOnBlur
]);
function validateIndianPhone(phone) {
    if (!phone || phone.trim() === '') {
        return {
            isValid: false,
            error: 'Phone number is required'
        };
    }
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Check length
    if (cleaned.length !== 10) {
        return {
            isValid: false,
            error: 'Phone number must be exactly 10 digits'
        };
    }
    // Check if starts with valid digit (6-9)
    if (!/^[6-9]/.test(cleaned)) {
        return {
            isValid: false,
            error: 'Phone number must start with 6, 7, 8, or 9'
        };
    }
    return {
        isValid: true,
        formatted: cleaned
    };
}
function formatPhoneInput(value) {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    // Limit to 10 digits
    return cleaned.slice(0, 10);
}
function isPhoneComplete(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
}
function displayPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 5) {
        return cleaned;
    }
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
}
function validatePhoneOnBlur(phone) {
    if (!phone || phone.trim() === '') {
        return ''; // Don't show error for empty field (let required handle it)
    }
    const result = validateIndianPhone(phone);
    return result.error || '';
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/validation/emailValidation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Email validation utilities for farmer email fields
 */ __turbopack_context__.s([
    "formatEmailInput",
    ()=>formatEmailInput,
    "validateEmail",
    ()=>validateEmail,
    "validateEmailOnBlur",
    ()=>validateEmailOnBlur,
    "validateRequiredEmail",
    ()=>validateRequiredEmail
]);
function validateEmail(email) {
    // Empty email is valid (optional field)
    if (!email || email.trim() === '') {
        return {
            isValid: true,
            formatted: ''
        };
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
function validateEmailOnBlur(email) {
    const result = validateEmail(email);
    return result.error || '';
}
function formatEmailInput(value) {
    // Remove leading/trailing spaces and convert to lowercase for consistency
    return value.trim().toLowerCase();
}
function validateRequiredEmail(email) {
    if (!email || email.trim() === '') {
        return {
            isValid: false,
            error: 'Email address is required'
        };
    }
    return validateEmail(email);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/forms/FormInput.tsx [app-client] (ecmascript) <export default as FormInput>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FormInput",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/FormInput.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/forms/FormSelect.tsx [app-client] (ecmascript) <export default as FormSelect>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FormSelect",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/FormSelect.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/forms/FormActions.tsx [app-client] (ecmascript) <export default as FormActions>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FormActions",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/FormActions.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/forms/FormGrid.tsx [app-client] (ecmascript) <export default as FormGrid>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FormGrid",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/FormGrid.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/management/PageHeader.tsx [app-client] (ecmascript) <export default as PageHeader>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PageHeader",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$PageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$PageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/PageHeader.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/management/StatusMessage.tsx [app-client] (ecmascript) <export default as StatusMessage>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatusMessage",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatusMessage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatusMessage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/StatusMessage.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/management/FilterControls.tsx [app-client] (ecmascript) <export default as FilterControls>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FilterControls",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FilterControls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FilterControls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/FilterControls.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/management/FilterDropdown.tsx [app-client] (ecmascript) <export default as FilterDropdown>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FilterDropdown",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/FilterDropdown.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/management/EmptyState.tsx [app-client] (ecmascript) <export default as EmptyState>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmptyState",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$EmptyState$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$EmptyState$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/EmptyState.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/management/LoadingSnackbar.tsx [app-client] (ecmascript) <export default as LoadingSnackbar>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LoadingSnackbar",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$LoadingSnackbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$LoadingSnackbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/LoadingSnackbar.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/dialogs/PasswordConfirmDialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PasswordConfirmDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function PasswordConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirm Deletion', message = 'Enter your admin password to confirm this action. This action will be logged for security purposes.' }) {
    _s();
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!password) {
            setError('Password is required');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await onConfirm(password);
            setPassword('');
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to verify password');
        } finally{
            setLoading(false);
        }
    };
    const handleClose = ()=>{
        setPassword('');
        setError('');
        onClose();
    };
    // Render modal in a portal to escape parent overflow-hidden
    const modalContent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        children: isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: {
                opacity: 0
            },
            animate: {
                opacity: 1
            },
            exit: {
                opacity: 0
            },
            className: "fixed inset-0 bg-black/50 dark:bg-black/70 flex items-end sm:items-center justify-center z-[9999] p-0 sm:p-4",
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            },
            onClick: (e)=>{
                if (e.target === e.currentTarget) handleClose();
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    y: '100%',
                    opacity: 0
                },
                animate: {
                    y: 0,
                    opacity: 1
                },
                exit: {
                    y: '100%',
                    opacity: 0
                },
                transition: {
                    type: 'spring',
                    damping: 25,
                    stiffness: 300
                },
                className: "bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto",
                onClick: (e)=>e.stopPropagation(),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sm:hidden flex justify-center pt-3 pb-1",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"
                        }, void 0, false, {
                            fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                            lineNumber: 78,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                        lineNumber: 77,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100",
                                    children: title
                                }, void 0, false, {
                                    fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                    lineNumber: 84,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleClose,
                                    className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "w-5 h-5 text-gray-500 dark:text-gray-400"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                        lineNumber: 91,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                    lineNumber: 87,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                            lineNumber: 83,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                        lineNumber: 82,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 sm:p-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleSubmit,
                            className: "space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-start gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                className: "w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                                lineNumber: 102,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                        className: "text-sm font-medium text-amber-800 dark:text-amber-200 mb-1",
                                                        children: "Security Verification Required"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                                        lineNumber: 104,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-amber-700 dark:text-amber-300",
                                                        children: message
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                                        lineNumber: 107,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                                lineNumber: 103,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                        lineNumber: 101,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                    lineNumber: 100,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                                            children: [
                                                "Admin Password ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-red-500",
                                                    children: "*"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                                    lineNumber: 117,
                                                    columnNumber: 36
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                            lineNumber: 116,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "password",
                                            value: password,
                                            onChange: (e)=>{
                                                setPassword(e.target.value);
                                                setError('');
                                            },
                                            placeholder: "Enter your admin password",
                                            required: true,
                                            disabled: loading,
                                            className: `form-input-custom w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none ${error ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' : ''}`
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                            lineNumber: 119,
                                            columnNumber: 19
                                        }, this),
                                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-1 text-sm text-red-600 dark:text-red-400",
                                            children: error
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                            lineNumber: 132,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                    lineNumber: 115,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-3 pt-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: handleClose,
                                            className: "flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                            lineNumber: 138,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            disabled: loading || !password,
                                            className: "flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2",
                                            children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                                        lineNumber: 152,
                                                        columnNumber: 25
                                                    }, this),
                                                    "Verifying..."
                                                ]
                                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                                        lineNumber: 157,
                                                        columnNumber: 25
                                                    }, this),
                                                    "Confirm Delete"
                                                ]
                                            }, void 0, true)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                            lineNumber: 145,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                                    lineNumber: 137,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                            lineNumber: 98,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                        lineNumber: 97,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
                lineNumber: 68,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
            lineNumber: 58,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/dialogs/PasswordConfirmDialog.tsx",
        lineNumber: 56,
        columnNumber: 5
    }, this);
    // Only render portal on client side
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(modalContent, document.body);
}
_s(PasswordConfirmDialog, "6NRUuqumFTBu2i+LH6oZYf8GNOA=");
_c = PasswordConfirmDialog;
var _c;
__turbopack_context__.k.register(_c, "PasswordConfirmDialog");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/modals/DeleteSocietyModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DeleteSocietyModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.js [app-client] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function DeleteSocietyModal({ isOpen, onClose, societyName, onConfirm, loading = false }) {
    _s();
    const [otp, setOtp] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(Array(6).fill(''));
    const [otpSent, setOtpSent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [sendingOtp, setSendingOtp] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [otpError, setOtpError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    if (!isOpen) return null;
    const handleOtpChange = (index, value)=>{
        if (!/^\d*$/.test(value)) return;
        const newOtp = [
            ...otp
        ];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setOtpError('');
        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };
    const handleKeyDown = (index, e)=>{
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };
    const handlePaste = (e)=>{
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;
        const newOtp = Array(6).fill('');
        pastedData.split('').forEach((char, i)=>{
            newOtp[i] = char;
        });
        setOtp(newOtp);
    };
    const handleSendOtp = async ()=>{
        setSendingOtp(true);
        setOtpError('');
        try {
            const token = localStorage.getItem('authToken');
            const societyId = window.selectedSocietyId;
            const response = await fetch('/api/user/society/send-delete-otp', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    societyId
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }
            setOtpSent(true);
        } catch (error) {
            setOtpError(error instanceof Error ? error.message : 'Failed to send OTP');
        } finally{
            setSendingOtp(false);
        }
    };
    const handleConfirm = ()=>{
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setOtpError('Please enter complete 6-digit OTP');
            return;
        }
        onConfirm(otpString);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-2 bg-red-100 dark:bg-red-900/30 rounded-lg",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                        className: "w-6 h-6 text-red-600 dark:text-red-400"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                        lineNumber: 109,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                    lineNumber: 108,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-xl font-bold text-gray-900 dark:text-white",
                                    children: "Delete Society"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                    lineNumber: 111,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                            lineNumber: 107,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors",
                            disabled: loading,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "w-5 h-5 text-gray-500 dark:text-gray-400"
                            }, void 0, false, {
                                fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                lineNumber: 120,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                            lineNumber: 115,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                    lineNumber: 106,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-amber-800 dark:text-amber-200 font-semibold mb-2",
                                    children: "⚠️ THIS ACTION CANNOT BE UNDONE!"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                    lineNumber: 128,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-amber-700 dark:text-amber-300",
                                    children: [
                                        "Deleting ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            className: "font-bold",
                                            children: societyName
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 132,
                                            columnNumber: 24
                                        }, this),
                                        " will permanently remove:"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                    lineNumber: 131,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                            lineNumber: 127,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-6 space-y-2 text-sm text-gray-600 dark:text-gray-400",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-1.5 h-1.5 rounded-full bg-red-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 139,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "All farmers under this society"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 140,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                    lineNumber: 138,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-1.5 h-1.5 rounded-full bg-red-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 143,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "All machines linked to this society"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 144,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                    lineNumber: 142,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-1.5 h-1.5 rounded-full bg-red-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 147,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "All machine statistics"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 148,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                    lineNumber: 146,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-1.5 h-1.5 rounded-full bg-red-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 151,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "All machine corrections"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 152,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                    lineNumber: 150,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-1.5 h-1.5 rounded-full bg-red-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 155,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "All rate charts and rate chart data"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 156,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                    lineNumber: 154,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-1.5 h-1.5 rounded-full bg-red-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 159,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "All milk collections"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 160,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                    lineNumber: 158,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-1.5 h-1.5 rounded-full bg-red-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 163,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "All sales records"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 164,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                    lineNumber: 162,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-1.5 h-1.5 rounded-full bg-red-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 167,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "All dispatch records"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 168,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                    lineNumber: 166,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-1.5 h-1.5 rounded-full bg-red-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 171,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "All section pulse tracking data"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 172,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                    lineNumber: 170,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                            lineNumber: 137,
                            columnNumber: 11
                        }, this),
                        !otpSent ? // Send OTP Button
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleSendOtp,
                            disabled: sendingOtp,
                            className: "w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
                            children: sendingOtp ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                        lineNumber: 185,
                                        columnNumber: 19
                                    }, this),
                                    "Sending OTP..."
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                        className: "w-5 h-5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                        lineNumber: 190,
                                        columnNumber: 19
                                    }, this),
                                    "Send OTP to Email"
                                ]
                            }, void 0, true)
                        }, void 0, false, {
                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                            lineNumber: 178,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center",
                                            children: "Enter 6-digit OTP sent to your email"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 199,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-center gap-2 mb-2",
                                            children: otp.map((digit, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    id: `otp-${index}`,
                                                    type: "text",
                                                    inputMode: "numeric",
                                                    maxLength: 1,
                                                    value: digit,
                                                    onChange: (e)=>handleOtpChange(index, e.target.value),
                                                    onKeyDown: (e)=>handleKeyDown(index, e),
                                                    onPaste: index === 0 ? handlePaste : undefined,
                                                    className: "w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-700 active:bg-white dark:active:bg-gray-700 focus:text-gray-900 dark:focus:text-white focus:outline-none transition-colors"
                                                }, index, false, {
                                                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                                    lineNumber: 204,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 202,
                                            columnNumber: 17
                                        }, this),
                                        otpError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-red-600 dark:text-red-400 text-center",
                                            children: otpError
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                            lineNumber: 219,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                    lineNumber: 198,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleSendOtp,
                                    disabled: sendingOtp,
                                    className: "text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4 w-full text-center",
                                    children: sendingOtp ? 'Resending...' : 'Resend OTP'
                                }, void 0, false, {
                                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                    lineNumber: 224,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                    lineNumber: 125,
                    columnNumber: 9
                }, this),
                otpSent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-3 p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            disabled: loading,
                            className: "flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50",
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                            lineNumber: 238,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleConfirm,
                            disabled: loading || otp.join('').length !== 6,
                            className: "flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
                            children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                        lineNumber: 252,
                                        columnNumber: 19
                                    }, this),
                                    "Deleting..."
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                        className: "w-5 h-5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                                        lineNumber: 257,
                                        columnNumber: 19
                                    }, this),
                                    "Delete All"
                                ]
                            }, void 0, true)
                        }, void 0, false, {
                            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                            lineNumber: 245,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
                    lineNumber: 237,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
            lineNumber: 104,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/modals/DeleteSocietyModal.tsx",
        lineNumber: 103,
        columnNumber: 5
    }, this);
}
_s(DeleteSocietyModal, "oj5/eJO1qdWAHdiAFvhez6jy/pc=");
_c = DeleteSocietyModal;
var _c;
__turbopack_context__.k.register(_c, "DeleteSocietyModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/admin/society/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SocietyManagement
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$phoneValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/phoneValidation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$emailValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/emailValidation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/UserContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/LanguageContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/LineChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Line.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pen-line.js [app-client] (ecmascript) <export default as Edit3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone.js [app-client] (ecmascript) <export default as Phone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building-2.js [app-client] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-client] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/award.js [app-client] (ecmascript) <export default as Award>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/droplets.js [app-client] (ecmascript) <export default as Droplets>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$loading$2f$FlowerSpinner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlowerSpinner$3e$__ = __turbopack_context__.i("[project]/src/components/loading/FlowerSpinner.tsx [app-client] (ecmascript) <export default as FlowerSpinner>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$loading$2f$LoadingSpinner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LoadingSpinner$3e$__ = __turbopack_context__.i("[project]/src/components/loading/LoadingSpinner.tsx [app-client] (ecmascript) <export default as LoadingSpinner>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormModal$3e$__ = __turbopack_context__.i("[project]/src/components/forms/FormModal.tsx [app-client] (ecmascript) <export default as FormModal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__ = __turbopack_context__.i("[project]/src/components/forms/FormInput.tsx [app-client] (ecmascript) <export default as FormInput>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__ = __turbopack_context__.i("[project]/src/components/forms/FormSelect.tsx [app-client] (ecmascript) <export default as FormSelect>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormActions$3e$__ = __turbopack_context__.i("[project]/src/components/forms/FormActions.tsx [app-client] (ecmascript) <export default as FormActions>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormGrid$3e$__ = __turbopack_context__.i("[project]/src/components/forms/FormGrid.tsx [app-client] (ecmascript) <export default as FormGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$PageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PageHeader$3e$__ = __turbopack_context__.i("[project]/src/components/management/PageHeader.tsx [app-client] (ecmascript) <export default as PageHeader>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatusMessage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__StatusMessage$3e$__ = __turbopack_context__.i("[project]/src/components/management/StatusMessage.tsx [app-client] (ecmascript) <export default as StatusMessage>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FilterControls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FilterControls$3e$__ = __turbopack_context__.i("[project]/src/components/management/FilterControls.tsx [app-client] (ecmascript) <export default as FilterControls>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FilterDropdown$3e$__ = __turbopack_context__.i("[project]/src/components/management/FilterDropdown.tsx [app-client] (ecmascript) <export default as FilterDropdown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$EmptyState$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EmptyState$3e$__ = __turbopack_context__.i("[project]/src/components/management/EmptyState.tsx [app-client] (ecmascript) <export default as EmptyState>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatusDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__StatusDropdown$3e$__ = __turbopack_context__.i("[project]/src/components/management/StatusDropdown.tsx [app-client] (ecmascript) <export default as StatusDropdown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$LoadingSnackbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LoadingSnackbar$3e$__ = __turbopack_context__.i("[project]/src/components/management/LoadingSnackbar.tsx [app-client] (ecmascript) <export default as LoadingSnackbar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkActionsToolbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/BulkActionsToolbar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FloatingActionButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/FloatingActionButton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dialogs$2f$PasswordConfirmDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dialogs/PasswordConfirmDialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$modals$2f$DeleteSocietyModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/modals/DeleteSocietyModal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
;
const initialFormData = {
    name: '',
    societyId: '',
    password: '',
    location: '',
    presidentName: '',
    contactPhone: '',
    email: '',
    bmcId: '',
    status: 'active'
};
// Helper function to highlight matching text in search results
const highlightText = (text, searchQuery)=>{
    if (!text && text !== 0) return text || '';
    if (!searchQuery) return text;
    const textStr = text.toString();
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = textStr.split(regex);
    return parts.map((part, index)=>regex.test(part) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded",
            children: part
        }, index, false, {
            fileName: "[project]/src/app/admin/society/page.tsx",
            lineNumber: 116,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0)) : part);
};
function SocietyManagement() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"])();
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLanguage"])();
    // State management
    const [societies, setSocieties] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [bmcs, setBmcs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [dairies, setDairies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [bmcsLoading, setBmcsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showAddForm, setShowAddForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showEditForm, setShowEditForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showDeleteModal, setShowDeleteModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedSociety, setSelectedSociety] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isDeleting, setIsDeleting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialFormData);
    const [formLoading, setFormLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [dairyFilter, setDairyFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [bmcFilter, setBmcFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [fieldErrors, setFieldErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [openMenuId, setOpenMenuId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedSocieties, setSelectedSocieties] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [bulkStatus, setBulkStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('active');
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showGraphModal, setShowGraphModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [graphMetric, setGraphMetric] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('quantity');
    const [isDeletingBulk, setIsDeletingBulk] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showPassword, setShowPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentPassword, setCurrentPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [showAddPassword, setShowAddPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Pulse tracking state
    const [pulseData, setPulseData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Fetch societies
    const fetchSocieties = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SocietyManagement.useCallback[fetchSocieties]": async ()=>{
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                if (!token) {
                    router.push('/login');
                    return;
                }
                const response = await fetch('/api/user/society', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem('authToken');
                        router.push('/login');
                        return;
                    }
                    throw new Error('Failed to fetch societies');
                }
                const result = await response.json();
                // Transform snake_case to camelCase for consistent frontend usage
                const transformedSocieties = (result.data || []).map({
                    "SocietyManagement.useCallback[fetchSocieties].transformedSocieties": (society)=>({
                            id: society.id,
                            name: society.name,
                            societyId: society.society_id,
                            location: society.location,
                            presidentName: society.president_name,
                            contactPhone: society.contact_phone,
                            email: society.email || '',
                            bmcId: society.bmc_id,
                            bmcName: society.bmc_name,
                            status: society.status,
                            createdAt: society.created_at,
                            updatedAt: society.updated_at,
                            totalCollections30d: Number(society.total_collections_30d) || 0,
                            totalQuantity30d: Number(society.total_quantity_30d) || 0,
                            totalAmount30d: Number(society.total_amount_30d) || 0,
                            weightedFat30d: Number(society.weighted_fat_30d) || 0,
                            weightedSnf30d: Number(society.weighted_snf_30d) || 0,
                            weightedClr30d: Number(society.weighted_clr_30d) || 0,
                            weightedWater30d: Number(society.weighted_water_30d) || 0
                        })
                }["SocietyManagement.useCallback[fetchSocieties].transformedSocieties"]);
                setSocieties(transformedSocieties);
            } catch (error) {
                console.error('Error fetching societies:', error);
                setError('Failed to load society data');
            } finally{
                setLoading(false);
            }
        }
    }["SocietyManagement.useCallback[fetchSocieties]"], [
        router
    ]);
    // Fetch dairies for filtering
    const fetchDairies = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SocietyManagement.useCallback[fetchDairies]": async ()=>{
            try {
                const token = localStorage.getItem('authToken');
                if (!token) return;
                const response = await fetch('/api/user/dairy', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setDairies(data.data || []);
                }
            } catch (error) {
                console.error('Error fetching dairies:', error);
            }
        }
    }["SocietyManagement.useCallback[fetchDairies]"], []);
    // Fetch BMCs for the dropdown
    const fetchBmcs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SocietyManagement.useCallback[fetchBmcs]": async ()=>{
            try {
                setBmcsLoading(true);
                const token = localStorage.getItem('authToken');
                if (!token) return;
                const response = await fetch('/api/user/bmc', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const result = await response.json();
                    setBmcs(result.data || []);
                }
            } catch (error) {
                console.error('Error fetching BMCs:', error);
            } finally{
                setBmcsLoading(false);
            }
        }
    }["SocietyManagement.useCallback[fetchBmcs]"], []);
    // Fetch pulse data for ECG indicators
    const fetchPulseData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SocietyManagement.useCallback[fetchPulseData]": async ()=>{
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    return;
                }
                const response = await fetch('/api/user/pulse', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'x-user-id': user?.id?.toString() || ''
                    }
                });
                if (response.ok) {
                    const result = await response.json();
                    setPulseData(result.data || null);
                }
            } catch (error) {
                console.error('Error fetching pulse data:', error);
            }
        }
    }["SocietyManagement.useCallback[fetchPulseData]"], [
        user?.id
    ]);
    // Close menu when clicking outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SocietyManagement.useEffect": ()=>{
            const handleClickOutside = {
                "SocietyManagement.useEffect.handleClickOutside": (event)=>{
                    if (openMenuId !== null) {
                        const target = event.target;
                        if (!target.closest('.relative')) {
                            setOpenMenuId(null);
                        }
                    }
                }
            }["SocietyManagement.useEffect.handleClickOutside"];
            document.addEventListener('mousedown', handleClickOutside);
            return ({
                "SocietyManagement.useEffect": ()=>{
                    document.removeEventListener('mousedown', handleClickOutside);
                }
            })["SocietyManagement.useEffect"];
        }
    }["SocietyManagement.useEffect"], [
        openMenuId
    ]);
    // Handle society selection
    const handleSelectSociety = (societyId)=>{
        setSelectedSocieties((prev)=>{
            const newSelected = new Set(prev);
            if (newSelected.has(societyId)) {
                newSelected.delete(societyId);
            } else {
                newSelected.add(societyId);
            }
            return newSelected;
        });
    };
    // Handle bulk status update
    const handleBulkStatusUpdate = async (newStatus)=>{
        if (selectedSocieties.size === 0) return;
        const statusToUpdate = newStatus || bulkStatus;
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const societyIds = Array.from(selectedSocieties);
            console.log(`🔄 Bulk updating ${societyIds.length} societies to status: ${statusToUpdate}`);
            const updatePromises = societyIds.map((id)=>{
                const society = societies.find((s)=>s.id === id);
                if (!society) return Promise.resolve();
                return fetch('/api/user/society', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: society.id,
                        name: society.name,
                        societyId: society.societyId,
                        location: society.location || '',
                        presidentName: society.presidentName || '',
                        contactPhone: society.contactPhone || '',
                        bmcId: society.bmcId,
                        status: statusToUpdate
                    })
                });
            });
            await Promise.all(updatePromises);
            console.log(`✅ Successfully updated ${societyIds.length} societies to ${statusToUpdate}`);
            setSuccess(`Updated ${societyIds.length} ${societyIds.length === 1 ? 'society' : 'societies'} to ${statusToUpdate}!`);
            await fetchSocieties();
            setSelectedSocieties(new Set());
            setTimeout(()=>setSuccess(''), 3000);
        } catch (error) {
            console.error('Bulk update error:', error);
            setError('Failed to update societies');
            setTimeout(()=>setError(''), 5000);
        } finally{
            setLoading(false);
        }
    };
    // Handle bulk delete - show confirmation dialog
    const handleBulkDeleteClick = ()=>{
        if (selectedSocieties.size === 0) return;
        setShowBulkDeleteConfirm(true);
    };
    // Handle select all societies
    const handleSelectAll = ()=>{
        const allSocietyIds = new Set(filteredSocieties.map((society)=>society.id));
        setSelectedSocieties(allSocietyIds);
    };
    // Handle bulk delete with password confirmation
    const handleBulkDeleteConfirm = async (password)=>{
        setShowBulkDeleteConfirm(false);
        setIsDeletingBulk(true);
        try {
            const token = localStorage.getItem('authToken');
            const societyIds = Array.from(selectedSocieties);
            console.log(`🗑️ Bulk deleting ${societyIds.length} societies with password verification:`, societyIds);
            // Delete societies in parallel with password verification
            const deletePromises = societyIds.map((id)=>fetch('/api/user/society/delete', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id,
                        password
                    })
                }).then(async (res)=>{
                    if (!res.ok) {
                        const error = await res.json();
                        throw new Error(error.error || 'Delete failed');
                    }
                    return res.json();
                }));
            const results = await Promise.allSettled(deletePromises);
            const successful = results.filter((r)=>r.status === 'fulfilled').length;
            const failed = results.filter((r)=>r.status === 'rejected').length;
            if (successful > 0) {
                console.log(`✅ Successfully deleted ${successful} societies`);
                setSuccess(`Successfully deleted ${successful} ${successful === 1 ? 'society' : 'societies'}${failed > 0 ? `. ${failed} failed.` : ''}`);
                await fetchSocieties();
                setSelectedSocieties(new Set());
                setTimeout(()=>setSuccess(''), 5000);
            } else {
                console.error(`❌ Failed to delete all ${societyIds.length} societies`);
                setError('Failed to delete societies. Please check your password and try again.');
                setTimeout(()=>setError(''), 5000);
            }
        } catch (error) {
            console.error('Bulk delete error:', error);
            setError(error instanceof Error ? error.message : 'Failed to delete societies');
            setTimeout(()=>setError(''), 5000);
        } finally{
            setIsDeletingBulk(false);
        }
    };
    // Add new society
    const handleAddSociety = async (e)=>{
        e.preventDefault();
        setFormLoading(true);
        setError('');
        // Validate required fields
        if (!formData.bmcId) {
            setError('Please select a BMC');
            setFormLoading(false);
            return;
        }
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/user/society', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    bmcId: parseInt(formData.bmcId)
                })
            });
            if (response.ok) {
                setSuccess('Society added successfully!');
                setShowAddForm(false);
                setFormData(initialFormData);
                await fetchSocieties();
                setTimeout(()=>setSuccess(''), 3000);
            } else {
                const errorResponse = await response.json();
                const errorMessage = errorResponse.error || 'Failed to add society';
                // Clear previous field errors
                setFieldErrors({});
                // Check for specific field errors
                if (errorMessage.toLowerCase().includes('society id') && errorMessage.toLowerCase().includes('already exists')) {
                    setFieldErrors({
                        societyId: 'This Society ID already exists'
                    });
                } else if (errorMessage.toLowerCase().includes('society name') && errorMessage.toLowerCase().includes('already exists')) {
                    setFieldErrors({
                        name: 'This Society name already exists'
                    });
                } else {
                    setError(errorMessage);
                }
            }
        } catch (error) {
            console.error('Error adding society:', error);
            setError('Failed to add society');
        } finally{
            setFormLoading(false);
        }
    };
    // Edit society
    const handleEditSociety = async (e)=>{
        e.preventDefault();
        if (!selectedSociety) return;
        setFormLoading(true);
        setError('');
        // Validate required fields
        if (!formData.bmcId) {
            setError('Please select a BMC');
            setFormLoading(false);
            return;
        }
        try {
            const token = localStorage.getItem('authToken');
            const updateData = {
                id: selectedSociety.id,
                name: formData.name,
                location: formData.location,
                presidentName: formData.presidentName,
                contactPhone: formData.contactPhone,
                email: formData.email,
                bmcId: parseInt(formData.bmcId),
                status: formData.status
            };
            // Only include password if it was changed from the original
            if (formData.password && formData.password !== currentPassword) {
                updateData.password = formData.password;
            }
            const response = await fetch('/api/user/society', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            if (response.ok) {
                setSuccess('Society updated successfully!');
                setShowEditForm(false);
                setSelectedSociety(null);
                setFormData(initialFormData);
                await fetchSocieties();
                setTimeout(()=>setSuccess(''), 3000);
            } else {
                const errorResponse = await response.json();
                const errorMessage = errorResponse.error || 'Failed to update society';
                // Clear previous field errors
                setFieldErrors({});
                // Check for specific field errors
                if (errorMessage.toLowerCase().includes('society id') && errorMessage.toLowerCase().includes('already exists')) {
                    setFieldErrors({
                        societyId: 'This Society ID already exists'
                    });
                } else if (errorMessage.toLowerCase().includes('society name') && errorMessage.toLowerCase().includes('already exists')) {
                    setFieldErrors({
                        name: 'This Society name already exists'
                    });
                } else {
                    setError(errorMessage);
                }
            }
        } catch (error) {
            console.error('Error updating society:', error);
            setError('Failed to update society');
        } finally{
            setFormLoading(false);
        }
    };
    // Delete society with OTP confirmation
    const handleConfirmDelete = async (otp)=>{
        if (!selectedSociety) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/user/society/delete?id=${selectedSociety.id}&otp=${otp}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete society');
            }
            setSuccess('Society and all related data deleted successfully!');
            setShowDeleteModal(false);
            setSelectedSociety(null);
            await fetchSocieties();
            setTimeout(()=>setSuccess(''), 3000);
        } catch (error) {
            console.error('Error deleting society:', error);
            setError(error instanceof Error ? error.message : 'Failed to delete society');
            setTimeout(()=>setError(''), 5000);
        } finally{
            setIsDeleting(false);
        }
    };
    // Handle form input changes
    const handleInputChange = (field, value)=>{
        // Auto-prefix society ID with "S-" only for new societies (add form)
        if (field === 'societyId' && showAddForm && !value.startsWith('S-') && value.length > 0) {
            value = `S-${value.replace(/^S-/, '')}`;
        }
        setFormData((prev)=>({
                ...prev,
                [field]: value
            }));
        // Clear field-specific errors when user types
        if (fieldErrors[field]) {
            setFieldErrors((prev)=>({
                    ...prev,
                    [field]: undefined
                }));
        }
    };
    // Open edit modal
    const handleEditClick = async (society)=>{
        setSelectedSociety(society);
        setFieldErrors({}); // Clear field errors
        setError(''); // Clear general errors
        setShowPassword(false); // Reset password visibility
        fetchBmcs(); // Load BMCs when opening edit form
        // Fetch current password from database
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/user/society/password?id=${society.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Password fetch response status:', response.status);
            if (response.ok) {
                const result = await response.json();
                console.log('Password fetch result:', result);
                // Handle both wrapped (result.data.password) and direct (result.password) responses
                const fetchedPassword = result.data?.password || result.password || '';
                console.log('Fetched password:', fetchedPassword);
                setCurrentPassword(fetchedPassword);
                // Set form data with fetched password
                setFormData({
                    name: society.name,
                    societyId: society.societyId,
                    password: fetchedPassword,
                    location: society.location || '',
                    presidentName: society.presidentName || '',
                    contactPhone: society.contactPhone || '',
                    email: society.email || '',
                    bmcId: society.bmcId?.toString() || '',
                    status: society.status
                });
            } else {
                const errorData = await response.json();
                console.error('Password fetch failed:', errorData);
                // Fallback if password fetch fails
                setCurrentPassword('');
                setFormData({
                    name: society.name,
                    societyId: society.societyId,
                    password: '',
                    location: society.location || '',
                    presidentName: society.presidentName || '',
                    contactPhone: society.contactPhone || '',
                    email: society.email || '',
                    bmcId: society.bmcId?.toString() || '',
                    status: society.status
                });
            }
        } catch (error) {
            console.error('Error fetching password:', error);
            setCurrentPassword('');
            setFormData({
                name: society.name,
                societyId: society.societyId,
                password: '',
                location: society.location || '',
                presidentName: society.presidentName || '',
                contactPhone: society.contactPhone || '',
                email: society.email || '',
                bmcId: society.bmcId?.toString() || '',
                status: society.status
            });
        }
        setShowEditForm(true);
    };
    // Open delete modal
    const handleDeleteClick = (society)=>{
        setSelectedSociety(society);
        // Store society ID for OTP modal
        window.selectedSocietyId = society.id;
        setShowDeleteModal(true);
    };
    // Handle status change
    const handleStatusChange = async (society, newStatus)=>{
        console.log('Status change triggered:', {
            societyId: society.id,
            currentStatus: society.status,
            newStatus
        });
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const payload = {
                id: society.id,
                name: society.name,
                societyId: society.societyId,
                location: society.location || '',
                presidentName: society.presidentName || '',
                contactPhone: society.contactPhone || '',
                bmcId: society.bmcId,
                status: newStatus
            };
            console.log('Sending update request:', payload);
            const response = await fetch('/api/user/society', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            console.log('API response:', {
                status: response.status,
                data: result
            });
            if (response.ok) {
                setSuccess(`Status updated to ${newStatus}!`);
                await fetchSocieties();
                setTimeout(()=>setSuccess(''), 3000);
            } else {
                const errorMessage = result.error || 'Failed to update status';
                console.error('Update failed:', errorMessage);
                setError(errorMessage);
                setTimeout(()=>setError(''), 5000);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setError('Failed to update status');
            setTimeout(()=>setError(''), 5000);
        } finally{
            setLoading(false);
        }
    };
    // Filter societies based on search term and status
    const filteredSocieties = societies.filter((society)=>{
        const matchesSearch = searchQuery === '' || society.name.toLowerCase().includes(searchQuery.toLowerCase()) || society.societyId.toLowerCase().includes(searchQuery.toLowerCase()) || society.presidentName?.toLowerCase().includes(searchQuery.toLowerCase()) || society.location?.toLowerCase().includes(searchQuery.toLowerCase()) || society.contactPhone?.toLowerCase().includes(searchQuery.toLowerCase()) || society.bmcName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || society.status === statusFilter;
        // Find the BMC for this society
        const societyBmc = bmcs.find((b)=>b.id === society.bmcId);
        // Filter by BMC if bmcFilter is set
        const matchesBmc = bmcFilter.length === 0 || bmcFilter.includes(societyBmc?.id.toString() || '');
        // Filter by Dairy - if dairy is selected, check if the society's BMC belongs to that dairy
        const matchesDairy = dairyFilter.length === 0 || (societyBmc?.dairyFarmId ? dairyFilter.includes(societyBmc.dairyFarmId.toString()) : false);
        return matchesSearch && matchesStatus && matchesBmc && matchesDairy;
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SocietyManagement.useEffect": ()=>{
            fetchSocieties();
            fetchDairies();
            fetchBmcs();
            fetchPulseData();
            // Apply BMC filter from URL if present
            const bmcFilterParam = searchParams.get('bmcFilter');
            if (bmcFilterParam) {
                setBmcFilter([
                    bmcFilterParam
                ]);
            }
            // Apply Dairy filter from URL if present
            const dairyFilterParam = searchParams.get('dairyFilter');
            if (dairyFilterParam) {
                setDairyFilter([
                    dairyFilterParam
                ]);
            }
            // Poll pulse data every 30 seconds for live updates
            const pulseInterval = setInterval({
                "SocietyManagement.useEffect.pulseInterval": ()=>{
                    fetchPulseData();
                }
            }["SocietyManagement.useEffect.pulseInterval"], 30000); // 30 seconds
            return ({
                "SocietyManagement.useEffect": ()=>clearInterval(pulseInterval)
            })["SocietyManagement.useEffect"];
        }
    }["SocietyManagement.useEffect"], [
        fetchSocieties,
        fetchDairies,
        fetchBmcs,
        fetchPulseData,
        searchParams
    ]);
    // Listen for global search events from header
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SocietyManagement.useEffect": ()=>{
            const handleGlobalSearch = {
                "SocietyManagement.useEffect.handleGlobalSearch": (event)=>{
                    const customEvent = event;
                    const query = customEvent.detail?.query || '';
                    setSearchQuery(query);
                }
            }["SocietyManagement.useEffect.handleGlobalSearch"];
            window.addEventListener('globalSearch', handleGlobalSearch);
            return ({
                "SocietyManagement.useEffect": ()=>window.removeEventListener('globalSearch', handleGlobalSearch)
            })["SocietyManagement.useEffect"];
        }
    }["SocietyManagement.useEffect"], []);
    // Don't render until user is loaded from context
    if (!user) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$loading$2f$FlowerSpinner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlowerSpinner$3e$__["FlowerSpinner"], {
                size: 48
            }, void 0, false, {
                fileName: "[project]/src/app/admin/society/page.tsx",
                lineNumber: 870,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/admin/society/page.tsx",
            lineNumber: 869,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:pb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$PageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PageHeader$3e$__["PageHeader"], {
                        title: "Society Management",
                        subtitle: "Manage societies and their operations",
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                            className: "w-5 h-5 sm:w-6 sm:h-6"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/society/page.tsx",
                            lineNumber: 882,
                            columnNumber: 15
                        }, void 0),
                        onRefresh: fetchSocieties
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/society/page.tsx",
                        lineNumber: 879,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatusMessage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__StatusMessage$3e$__["StatusMessage"], {
                        success: success,
                        error: error
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/society/page.tsx",
                        lineNumber: 887,
                        columnNumber: 7
                    }, this),
                    societies.length > 0 && (()=>{
                        const societiesWithStats = societies.filter((s)=>s.totalQuantity30d && s.totalQuantity30d > 0);
                        const topCollection = [
                            ...societiesWithStats
                        ].sort((a, b)=>(b.totalQuantity30d || 0) - (a.totalQuantity30d || 0))[0];
                        const topRevenue = [
                            ...societiesWithStats
                        ].sort((a, b)=>(b.totalAmount30d || 0) - (a.totalAmount30d || 0))[0];
                        const topFat = [
                            ...societiesWithStats
                        ].sort((a, b)=>(b.weightedFat30d || 0) - (a.weightedFat30d || 0))[0];
                        const topSnf = [
                            ...societiesWithStats
                        ].sort((a, b)=>(b.weightedSnf30d || 0) - (a.weightedSnf30d || 0))[0];
                        const mostCollections = [
                            ...societiesWithStats
                        ].sort((a, b)=>(b.totalCollections30d || 0) - (a.totalCollections30d || 0))[0];
                        const mostWater = [
                            ...societiesWithStats
                        ].sort((a, b)=>(b.weightedWater30d || 0) - (a.weightedWater30d || 0))[0];
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4",
                            children: [
                                topCollection && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700 cursor-pointer hover:shadow-lg transition-shadow",
                                    onClick: ()=>{
                                        setGraphMetric('quantity');
                                        setShowGraphModal(true);
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-sm font-semibold text-green-900 dark:text-green-100",
                                                    children: "Top Collection (30d)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 931,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                    className: "w-5 h-5 text-green-600 dark:text-green-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 932,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 930,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-lg font-bold text-green-800 dark:text-green-200",
                                            children: topCollection.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 934,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-green-600 dark:text-green-400",
                                            children: [
                                                topCollection.totalQuantity30d?.toFixed(2),
                                                " L"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 935,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 923,
                                    columnNumber: 15
                                }, this),
                                topRevenue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 cursor-pointer hover:shadow-lg transition-shadow",
                                    onClick: ()=>{
                                        setGraphMetric('revenue');
                                        setShowGraphModal(true);
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-sm font-semibold text-blue-900 dark:text-blue-100",
                                                    children: "Top Revenue (30d)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 948,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                                                    className: "w-5 h-5 text-blue-600 dark:text-blue-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 949,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 947,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-lg font-bold text-blue-800 dark:text-blue-200",
                                            children: topRevenue.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 951,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-blue-600 dark:text-blue-400",
                                            children: [
                                                "₹",
                                                topRevenue.totalAmount30d?.toFixed(2)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 952,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 940,
                                    columnNumber: 15
                                }, this),
                                topFat && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700 cursor-pointer hover:shadow-lg transition-shadow",
                                    onClick: ()=>{
                                        setGraphMetric('fat');
                                        setShowGraphModal(true);
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-sm font-semibold text-purple-900 dark:text-purple-100",
                                                    children: "Best Quality (30d)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 965,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                    className: "w-5 h-5 text-purple-600 dark:text-purple-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 966,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 964,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-lg font-bold text-purple-800 dark:text-purple-200",
                                            children: topFat.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 968,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-purple-600 dark:text-purple-400",
                                            children: [
                                                topFat.weightedFat30d?.toFixed(2),
                                                "% Fat"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 969,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 957,
                                    columnNumber: 15
                                }, this),
                                topSnf && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700 cursor-pointer hover:shadow-lg transition-shadow",
                                    onClick: ()=>{
                                        setGraphMetric('snf');
                                        setShowGraphModal(true);
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-sm font-semibold text-orange-900 dark:text-orange-100",
                                                    children: "Best SNF (30d)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 982,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                    className: "w-5 h-5 text-orange-600 dark:text-orange-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 983,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 981,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-lg font-bold text-orange-800 dark:text-orange-200",
                                            children: topSnf.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 985,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-orange-600 dark:text-orange-400",
                                            children: [
                                                topSnf.weightedSnf30d?.toFixed(2),
                                                "% SNF"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 986,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 974,
                                    columnNumber: 15
                                }, this),
                                mostCollections && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-4 rounded-lg border border-pink-200 dark:border-pink-700 cursor-pointer hover:shadow-lg transition-shadow",
                                    onClick: ()=>{
                                        setGraphMetric('collections');
                                        setShowGraphModal(true);
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-sm font-semibold text-pink-900 dark:text-pink-100",
                                                    children: "Most Active (30d)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 999,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__["Award"], {
                                                    className: "w-5 h-5 text-pink-600 dark:text-pink-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1000,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 998,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-lg font-bold text-pink-800 dark:text-pink-200",
                                            children: mostCollections.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 1002,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-pink-600 dark:text-pink-400",
                                            children: [
                                                mostCollections.totalCollections30d,
                                                " Collections"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 1003,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 991,
                                    columnNumber: 15
                                }, this),
                                mostWater && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg border border-red-200 dark:border-red-700 cursor-pointer hover:shadow-lg transition-shadow",
                                    onClick: ()=>{
                                        setGraphMetric('water');
                                        setShowGraphModal(true);
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-sm font-semibold text-red-900 dark:text-red-100",
                                                    children: "Most Water (30d)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1016,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__["Droplets"], {
                                                    className: "w-5 h-5 text-red-600 dark:text-red-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1017,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 1015,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-lg font-bold text-red-800 dark:text-red-200",
                                            children: mostWater.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 1019,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-red-600 dark:text-red-400",
                                            children: [
                                                mostWater.weightedWater30d?.toFixed(2),
                                                "% Water"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 1020,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1008,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/society/page.tsx",
                            lineNumber: 921,
                            columnNumber: 11
                        }, this);
                    })(),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FilterDropdown$3e$__["FilterDropdown"], {
                        statusFilter: statusFilter,
                        onStatusChange: (value)=>setStatusFilter(value),
                        dairyFilter: dairyFilter,
                        onDairyChange: (value)=>setDairyFilter(Array.isArray(value) ? value : [
                                value
                            ]),
                        bmcFilter: bmcFilter,
                        onBmcChange: (value)=>setBmcFilter(Array.isArray(value) ? value : [
                                value
                            ]),
                        societyFilter: [],
                        onSocietyChange: ()=>{},
                        machineFilter: [],
                        onMachineChange: ()=>{},
                        dairies: dairies,
                        bmcs: bmcs,
                        societies: societies.map((s)=>({
                                ...s,
                                bmc_id: s.bmcId,
                                society_id: s.societyId
                            })),
                        machines: [],
                        filteredCount: filteredSocieties.length,
                        totalCount: societies.length,
                        searchQuery: searchQuery,
                        hideMainFilterButton: true,
                        hideSocietyFilter: true
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/society/page.tsx",
                        lineNumber: 1029,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FilterControls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FilterControls$3e$__["FilterControls"], {
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/society/page.tsx",
                            lineNumber: 1052,
                            columnNumber: 15
                        }, void 0),
                        showingText: `Showing ${filteredSocieties.length} of ${societies.length} societies`,
                        filterValue: statusFilter,
                        filterOptions: [
                            {
                                value: 'all',
                                label: 'All Status'
                            },
                            {
                                value: 'active',
                                label: 'Active'
                            },
                            {
                                value: 'inactive',
                                label: 'Inactive'
                            },
                            {
                                value: 'maintenance',
                                label: 'Maintenance'
                            },
                            {
                                value: 'suspended',
                                label: 'Suspended'
                            }
                        ],
                        onFilterChange: (value)=>setStatusFilter(value)
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/society/page.tsx",
                        lineNumber: 1051,
                        columnNumber: 7
                    }, this),
                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$loading$2f$LoadingSpinner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LoadingSpinner$3e$__["LoadingSpinner"], {}, void 0, false, {
                        fileName: "[project]/src/app/admin/society/page.tsx",
                        lineNumber: 1067,
                        columnNumber: 9
                    }, this) : filteredSocieties.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6",
                        children: filteredSocieties.map((society)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-visible border border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700 relative z-10 hover:z-20",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-lg",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start justify-between gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-3 flex-1 min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            checked: selectedSocieties.has(society.id),
                                                            onChange: ()=>handleSelectSociety(society.id),
                                                            onClick: (e)=>e.stopPropagation(),
                                                            className: "w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 flex-shrink-0"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                                            lineNumber: 1076,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "p-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex-shrink-0",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                                                                className: "w-5 h-5 text-green-600 dark:text-green-400"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1084,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                                            lineNumber: 1083,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1 min-w-0",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                    className: "text-lg font-semibold text-gray-900 dark:text-white truncate",
                                                                    children: highlightText(society.name, searchQuery)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                                    lineNumber: 1087,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-sm text-gray-600 dark:text-gray-400",
                                                                    children: highlightText(society.societyId, searchQuery)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                                    lineNumber: 1088,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                                            lineNumber: 1086,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1075,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatusDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__StatusDropdown$3e$__["StatusDropdown"], {
                                                    currentStatus: society.status,
                                                    onStatusChange: (status)=>handleStatusChange(society, status),
                                                    options: [
                                                        {
                                                            status: 'active',
                                                            label: 'Active',
                                                            color: 'bg-green-500',
                                                            bgColor: 'hover:bg-green-50 dark:hover:bg-green-900/30'
                                                        },
                                                        {
                                                            status: 'inactive',
                                                            label: 'Inactive',
                                                            color: 'bg-red-500',
                                                            bgColor: 'hover:bg-red-50 dark:hover:bg-red-900/30'
                                                        },
                                                        {
                                                            status: 'maintenance',
                                                            label: 'Maintenance',
                                                            color: 'bg-yellow-500',
                                                            bgColor: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
                                                        },
                                                        {
                                                            status: 'suspended',
                                                            label: 'Suspended',
                                                            color: 'bg-orange-500',
                                                            bgColor: 'hover:bg-orange-50 dark:hover:bg-orange-900/30'
                                                        }
                                                    ],
                                                    compact: true
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1091,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 1074,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                        lineNumber: 1073,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-4 space-y-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                                className: "w-4 h-4 text-gray-500 flex-shrink-0"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1130,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm text-gray-700 dark:text-gray-300 truncate",
                                                                children: highlightText(society.presidentName || 'No President', searchQuery)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1131,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1129,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"], {
                                                                className: "w-4 h-4 text-gray-500 flex-shrink-0"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1134,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm text-gray-700 dark:text-gray-300 truncate",
                                                                children: highlightText(society.contactPhone || 'No Phone', searchQuery)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1135,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1133,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                lineNumber: 1128,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                                className: "w-4 h-4 text-gray-500 flex-shrink-0"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1142,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm text-gray-700 dark:text-gray-300 truncate",
                                                                children: highlightText(society.location || 'No Location', searchQuery)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1143,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1141,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                                                                className: "w-4 h-4 text-blue-500 flex-shrink-0"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1146,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm text-blue-600 dark:text-blue-400 font-medium truncate",
                                                                children: highlightText(society.bmcName || 'No BMC', searchQuery)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1147,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1145,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                lineNumber: 1140,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "border-t border-gray-200 dark:border-gray-700 my-3"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                lineNumber: 1152,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide",
                                                        children: "Last 30 Days"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1156,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                        className: "w-4 h-4 text-gray-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1157,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                lineNumber: 1155,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-2 h-2 rounded-full bg-blue-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1163,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                                children: "Collections"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1164,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1162,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-right",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-lg font-bold text-blue-600 dark:text-blue-400",
                                                                children: society.totalCollections30d || 0
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1167,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs text-gray-600 dark:text-gray-400",
                                                                children: [
                                                                    (society.totalQuantity30d || 0).toFixed(2),
                                                                    " Liters"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1168,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1166,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                lineNumber: 1161,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-3 gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-2 text-center",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs text-gray-600 dark:text-gray-400 mb-1",
                                                                children: "Fat"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1175,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-sm font-bold text-indigo-600 dark:text-indigo-400",
                                                                children: [
                                                                    (society.weightedFat30d || 0).toFixed(2),
                                                                    "%"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1176,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1174,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs text-gray-600 dark:text-gray-400 mb-1",
                                                                children: "SNF"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1179,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-sm font-bold text-purple-600 dark:text-purple-400",
                                                                children: [
                                                                    (society.weightedSnf30d || 0).toFixed(2),
                                                                    "%"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1180,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1178,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "bg-pink-50 dark:bg-pink-900/20 rounded-lg p-2 text-center",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs text-gray-600 dark:text-gray-400 mb-1",
                                                                children: "CLR"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1183,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-sm font-bold text-pink-600 dark:text-pink-400",
                                                                children: (society.weightedClr30d || 0).toFixed(1)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1184,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1182,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                lineNumber: 1173,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-2 h-2 rounded-full bg-emerald-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1191,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                                children: "Total Revenue"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                                lineNumber: 1192,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1190,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-lg font-bold text-emerald-600 dark:text-emerald-400",
                                                        children: [
                                                            "₹",
                                                            (society.totalAmount30d || 0).toLocaleString('en-IN', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1194,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                lineNumber: 1189,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                        lineNumber: 1126,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 rounded-b-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handleEditClick(society),
                                                        className: "p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30",
                                                        title: "Edit",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit3$3e$__["Edit3"], {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                                            lineNumber: 1208,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1203,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handleDeleteClick(society),
                                                        className: "p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30",
                                                        title: "Delete",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                                            lineNumber: 1215,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1210,
                                                        columnNumber: 19
                                                    }, this),
                                                    (()=>{
                                                        const societyPulse = pulseData?.pulses?.find((p)=>p.societyId === society.id);
                                                        const hasActivePulse = societyPulse?.pulseStatus === 'active';
                                                        const hasPausedPulse = societyPulse?.pulseStatus === 'paused';
                                                        const hasEndedPulse = societyPulse?.pulseStatus === 'ended';
                                                        const isInactive = societyPulse?.pulseStatus === 'inactive';
                                                        // Determine color based on status
                                                        const getColor = ()=>{
                                                            if (hasActivePulse) return 'text-green-500';
                                                            if (hasPausedPulse) return 'text-orange-500';
                                                            if (hasEndedPulse) return 'text-red-500';
                                                            if (isInactive) return 'text-gray-400';
                                                            return 'text-gray-300';
                                                        };
                                                        // Determine status text
                                                        const getStatusText = ()=>{
                                                            if (hasActivePulse) return 'Active';
                                                            if (hasPausedPulse) return 'Paused';
                                                            if (hasEndedPulse) return 'Ended';
                                                            if (isInactive) return `${societyPulse.inactiveDays}d`;
                                                            return 'No Pulse';
                                                        };
                                                        // Generate tooltip with section start time from database
                                                        const getTooltip = ()=>{
                                                            if (!societyPulse) return 'No Pulse';
                                                            const formatDateTime = (dateTime, addOffset = false)=>{
                                                                if (!dateTime) return 'N/A';
                                                                const str = dateTime.toString();
                                                                const dateMatch = str.match(/(\d{4})-(\d{2})-(\d{2})/);
                                                                const timeMatch = str.match(/(\d{2}):(\d{2}):(\d{2})/);
                                                                if (dateMatch && timeMatch) {
                                                                    let hours = parseInt(timeMatch[1]);
                                                                    let minutes = parseInt(timeMatch[2]);
                                                                    const seconds = timeMatch[3];
                                                                    if (addOffset) {
                                                                        // Add 5 hours 30 minutes
                                                                        minutes += 30;
                                                                        hours += 5;
                                                                        if (minutes >= 60) {
                                                                            hours += 1;
                                                                            minutes -= 60;
                                                                        }
                                                                        if (hours >= 24) {
                                                                            hours -= 24;
                                                                        }
                                                                    }
                                                                    const formattedHours = hours.toString().padStart(2, '0');
                                                                    const formattedMinutes = minutes.toString().padStart(2, '0');
                                                                    return `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]} ${formattedHours}:${formattedMinutes}:${seconds}`;
                                                                }
                                                                return 'N/A';
                                                            };
                                                            const startTime = formatDateTime(societyPulse.createdAt);
                                                            const lastCollection = formatDateTime(societyPulse.lastCollectionTime, true); // Add +5:30 for pause time
                                                            const endTime = formatDateTime(societyPulse.sectionEndTime);
                                                            // Active: Show only start time
                                                            if (societyPulse.pulseStatus === 'active') {
                                                                return `Section Start: ${startTime}`;
                                                            }
                                                            // Paused: Show start time and paused time (last collection time + 5:30)
                                                            if (societyPulse.pulseStatus === 'paused') {
                                                                return `Start: ${startTime}\nPaused: ${lastCollection}`;
                                                            }
                                                            // Ended: Show start time and end time
                                                            if (societyPulse.pulseStatus === 'ended') {
                                                                return `Start: ${startTime}\nEnd: ${endTime}`;
                                                            }
                                                            // Inactive or other statuses
                                                            if (societyPulse.createdAt) {
                                                                return `Section Start: ${startTime}`;
                                                            }
                                                            return societyPulse.statusMessage || getStatusText();
                                                        };
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700",
                                                            title: getTooltip(),
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                    className: `w-6 h-4 ${getColor()}`,
                                                                    viewBox: "0 0 24 16",
                                                                    fill: "none",
                                                                    xmlns: "http://www.w3.org/2000/svg",
                                                                    children: hasActivePulse ? // ECG waveform for active pulse
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        d: "M0 8 L5 8 L6 3 L7 13 L8 8 L10 8 L11 5 L12 11 L13 8 L24 8",
                                                                        stroke: "currentColor",
                                                                        strokeWidth: "1.5",
                                                                        strokeLinecap: "round",
                                                                        strokeLinejoin: "round",
                                                                        className: "animate-pulse"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                                        lineNumber: 1319,
                                                                        columnNumber: 29
                                                                    }, this) : // Flatline for no pulse/ended/inactive
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        d: "M0 8 L24 8",
                                                                        stroke: "currentColor",
                                                                        strokeWidth: "1.5",
                                                                        strokeLinecap: "round"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                                        lineNumber: 1329,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                                    lineNumber: 1311,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: `text-xs ${getColor()}`,
                                                                    children: getStatusText()
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                                    lineNumber: 1337,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                                            lineNumber: 1306,
                                                            columnNumber: 23
                                                        }, this);
                                                    })()
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                lineNumber: 1202,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>router.push(`/admin/society/${society.id}`),
                                                className: "flex items-center px-3 py-1.5 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                        className: "w-4 h-4 mr-1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1348,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "View"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1349,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/society/page.tsx",
                                                lineNumber: 1344,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                        lineNumber: 1201,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, society.id, true, {
                                fileName: "[project]/src/app/admin/society/page.tsx",
                                lineNumber: 1071,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/society/page.tsx",
                        lineNumber: 1069,
                        columnNumber: 9
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$EmptyState$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EmptyState$3e$__["EmptyState"], {
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                            className: "w-12 h-12 sm:w-16 sm:h-16 text-gray-400"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/society/page.tsx",
                            lineNumber: 1357,
                            columnNumber: 17
                        }, void 0),
                        title: societies.length === 0 ? 'No societies found' : 'No matching societies',
                        message: societies.length === 0 ? 'Get started by adding your first society to the system.' : 'Try changing your search or filter criteria.',
                        actionText: societies.length === 0 ? 'Add First Society' : undefined,
                        onAction: societies.length === 0 ? ()=>{
                            setFieldErrors({}); // Clear field errors
                            setError(''); // Clear general errors
                            setShowAddForm(true);
                            fetchBmcs();
                        } : undefined,
                        showAction: societies.length === 0
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/society/page.tsx",
                        lineNumber: 1356,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/society/page.tsx",
                lineNumber: 877,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkActionsToolbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                selectedCount: selectedSocieties.size,
                totalCount: filteredSocieties.length,
                onBulkDelete: handleBulkDeleteClick,
                onBulkStatusUpdate: handleBulkStatusUpdate,
                onSelectAll: handleSelectAll,
                onClearSelection: ()=>{
                    setSelectedSocieties(new Set());
                },
                itemType: "society",
                showStatusUpdate: true,
                currentBulkStatus: bulkStatus,
                onBulkStatusChange: (status)=>setBulkStatus(status)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/society/page.tsx",
                lineNumber: 1376,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FloatingActionButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                actions: [
                    {
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                            className: "w-6 h-6 text-white"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/society/page.tsx",
                            lineNumber: 1395,
                            columnNumber: 19
                        }, void 0),
                        label: 'Add Society',
                        onClick: ()=>{
                            setFieldErrors({});
                            setError('');
                            setShowAddForm(true);
                            fetchBmcs();
                        },
                        color: 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }
                ],
                directClick: true
            }, void 0, false, {
                fileName: "[project]/src/app/admin/society/page.tsx",
                lineNumber: 1392,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormModal$3e$__["FormModal"], {
                isOpen: showAddForm,
                onClose: ()=>setShowAddForm(false),
                title: "Add New Society",
                maxWidth: "lg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleAddSociety,
                    className: "space-y-4 sm:space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormGrid$3e$__["FormGrid"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Society Name",
                                    value: formData.name,
                                    onChange: (value)=>handleInputChange('name', value),
                                    placeholder: "Enter society name",
                                    required: true,
                                    error: fieldErrors.name,
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1419,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Society ID",
                                    value: formData.societyId,
                                    onChange: (value)=>handleInputChange('societyId', value),
                                    placeholder: "S-001",
                                    required: true,
                                    error: fieldErrors.societyId,
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1429,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                                            children: [
                                                "Password ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-red-500",
                                                    children: "*"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1441,
                                                    columnNumber: 26
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 1440,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: showAddPassword ? 'text' : 'password',
                                                    value: formData.password,
                                                    onChange: (e)=>handleInputChange('password', e.target.value),
                                                    placeholder: "Enter password",
                                                    required: true,
                                                    className: "form-input-custom w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1444,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>setShowAddPassword(!showAddPassword),
                                                    className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors",
                                                    title: showAddPassword ? 'Hide password' : 'Show password',
                                                    children: showAddPassword ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                                        className: "w-5 h-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1458,
                                                        columnNumber: 38
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                        className: "w-5 h-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1458,
                                                        columnNumber: 71
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1452,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 1443,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1439,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: "Associated BMC",
                                    value: formData.bmcId,
                                    onChange: (value)=>handleInputChange('bmcId', value),
                                    options: bmcs.map((bmc)=>({
                                            value: bmc.id,
                                            label: `${bmc.name} (${bmc.bmcId})`
                                        })),
                                    placeholder: "Select BMC",
                                    required: true,
                                    disabled: bmcsLoading,
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1463,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "President Name",
                                    value: formData.presidentName,
                                    onChange: (value)=>handleInputChange('presidentName', value),
                                    placeholder: "Enter president name",
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1478,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Location",
                                    value: formData.location,
                                    onChange: (value)=>handleInputChange('location', value),
                                    placeholder: "Enter location",
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1486,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Contact Phone",
                                    type: "tel",
                                    value: formData.contactPhone,
                                    onChange: (value)=>{
                                        const formatted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$phoneValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatPhoneInput"])(value);
                                        handleInputChange('contactPhone', formatted);
                                    },
                                    onBlur: ()=>{
                                        const error = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$phoneValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validatePhoneOnBlur"])(formData.contactPhone);
                                        if (error) {
                                            setFieldErrors((prev)=>({
                                                    ...prev,
                                                    contactPhone: error
                                                }));
                                        } else {
                                            setFieldErrors((prev)=>({
                                                    ...prev,
                                                    contactPhone: undefined
                                                }));
                                        }
                                    },
                                    placeholder: "Enter phone number",
                                    error: fieldErrors.contactPhone,
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1494,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Email Address",
                                    type: "email",
                                    value: formData.email,
                                    onChange: (value)=>{
                                        const formatted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$emailValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatEmailInput"])(value);
                                        handleInputChange('email', formatted);
                                    },
                                    onBlur: ()=>{
                                        const error = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$emailValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateEmailOnBlur"])(formData.email);
                                        if (error) {
                                            setFieldErrors((prev)=>({
                                                    ...prev,
                                                    email: error
                                                }));
                                        } else {
                                            setFieldErrors((prev)=>({
                                                    ...prev,
                                                    email: undefined
                                                }));
                                        }
                                    },
                                    placeholder: "Enter email address",
                                    error: fieldErrors.email,
                                    required: true,
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1515,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: "Status",
                                    value: formData.status,
                                    onChange: (value)=>handleInputChange('status', value),
                                    options: [
                                        {
                                            value: 'active',
                                            label: 'Active'
                                        },
                                        {
                                            value: 'inactive',
                                            label: 'Inactive'
                                        },
                                        {
                                            value: 'maintenance',
                                            label: 'Maintenance'
                                        },
                                        {
                                            value: 'suspended',
                                            label: 'Suspended'
                                        }
                                    ],
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1537,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/society/page.tsx",
                            lineNumber: 1417,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormActions$3e$__["FormActions"], {
                            onCancel: ()=>setShowAddForm(false),
                            submitText: "Add Society",
                            isLoading: formLoading
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/society/page.tsx",
                            lineNumber: 1551,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/society/page.tsx",
                    lineNumber: 1416,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/society/page.tsx",
                lineNumber: 1410,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormModal$3e$__["FormModal"], {
                isOpen: showEditForm && !!selectedSociety,
                onClose: ()=>{
                    setShowEditForm(false);
                    setSelectedSociety(null);
                    setFormData(initialFormData);
                },
                title: selectedSociety ? `${t.common?.edit || 'Edit'} ${selectedSociety.name}` : t.common?.edit || 'Edit',
                maxWidth: "lg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleEditSociety,
                    className: "space-y-4 sm:space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormGrid$3e$__["FormGrid"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Society Name",
                                    value: formData.name,
                                    onChange: (value)=>handleInputChange('name', value),
                                    placeholder: "Enter society name",
                                    required: true,
                                    error: fieldErrors.name,
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1573,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Society ID",
                                    value: formData.societyId,
                                    onChange: ()=>{},
                                    readOnly: true,
                                    disabled: true,
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1583,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: "Associated BMC",
                                    value: formData.bmcId,
                                    onChange: (value)=>handleInputChange('bmcId', value),
                                    options: bmcs.map((bmc)=>({
                                            value: bmc.id,
                                            label: `${bmc.name} (${bmc.bmcId})`
                                        })),
                                    placeholder: "Select BMC",
                                    required: true,
                                    disabled: true,
                                    colSpan: 2
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1592,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "sm:col-span-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                                            children: "Password"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 1608,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: showPassword ? 'text' : 'password',
                                                    value: formData.password,
                                                    onChange: (e)=>handleInputChange('password', e.target.value),
                                                    placeholder: "Enter password",
                                                    className: "form-input-custom w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1612,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>setShowPassword(!showPassword),
                                                    className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors",
                                                    title: showPassword ? 'Hide password' : 'Show password',
                                                    children: showPassword ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                                        className: "w-5 h-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1625,
                                                        columnNumber: 35
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                        className: "w-5 h-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1625,
                                                        columnNumber: 68
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1619,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 1611,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-1 text-xs text-gray-500 dark:text-gray-400",
                                            children: "Current password is pre-filled. Click eye icon to view or edit to change."
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 1628,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1607,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "President Name",
                                    value: formData.presidentName,
                                    onChange: (value)=>handleInputChange('presidentName', value),
                                    placeholder: "Enter president name",
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1633,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Location",
                                    value: formData.location,
                                    onChange: (value)=>handleInputChange('location', value),
                                    placeholder: "Enter location",
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1641,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Contact Phone",
                                    type: "tel",
                                    value: formData.contactPhone,
                                    onChange: (value)=>{
                                        const formatted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$phoneValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatPhoneInput"])(value);
                                        handleInputChange('contactPhone', formatted);
                                    },
                                    onBlur: ()=>{
                                        const error = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$phoneValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validatePhoneOnBlur"])(formData.contactPhone);
                                        if (error) {
                                            setFieldErrors((prev)=>({
                                                    ...prev,
                                                    contactPhone: error
                                                }));
                                        } else {
                                            setFieldErrors((prev)=>({
                                                    ...prev,
                                                    contactPhone: undefined
                                                }));
                                        }
                                    },
                                    placeholder: "Enter contact phone",
                                    error: fieldErrors.contactPhone,
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1649,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Email Address",
                                    type: "email",
                                    value: formData.email,
                                    onChange: (value)=>{
                                        const formatted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$emailValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatEmailInput"])(value);
                                        handleInputChange('email', formatted);
                                    },
                                    onBlur: ()=>{
                                        const error = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$emailValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateEmailOnBlur"])(formData.email);
                                        if (error) {
                                            setFieldErrors((prev)=>({
                                                    ...prev,
                                                    email: error
                                                }));
                                        } else {
                                            setFieldErrors((prev)=>({
                                                    ...prev,
                                                    email: undefined
                                                }));
                                        }
                                    },
                                    placeholder: selectedSociety?.email ? `Current: ${selectedSociety.email}` : "Enter email address",
                                    error: fieldErrors.email,
                                    required: true,
                                    colSpan: 1,
                                    helperText: "Current email address is pre-filled. Edit to change."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1670,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: "Status",
                                    value: formData.status,
                                    onChange: (value)=>handleInputChange('status', value),
                                    options: [
                                        {
                                            value: 'active',
                                            label: 'Active'
                                        },
                                        {
                                            value: 'inactive',
                                            label: 'Inactive'
                                        },
                                        {
                                            value: 'maintenance',
                                            label: 'Maintenance'
                                        },
                                        {
                                            value: 'suspended',
                                            label: 'Suspended'
                                        }
                                    ],
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1693,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/society/page.tsx",
                            lineNumber: 1571,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormActions$3e$__["FormActions"], {
                            onCancel: ()=>{
                                setShowEditForm(false);
                                setSelectedSociety(null);
                                setFormData(initialFormData);
                            },
                            submitText: "Update Society",
                            isLoading: formLoading,
                            cancelText: "Cancel",
                            loadingText: "Updating...",
                            submitIcon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit3$3e$__["Edit3"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/society/page.tsx",
                                lineNumber: 1717,
                                columnNumber: 25
                            }, void 0)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/society/page.tsx",
                            lineNumber: 1707,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/society/page.tsx",
                    lineNumber: 1570,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/society/page.tsx",
                lineNumber: 1560,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$modals$2f$DeleteSocietyModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: showDeleteModal && !!selectedSociety,
                onClose: ()=>{
                    setShowDeleteModal(false);
                    setSelectedSociety(null);
                },
                onConfirm: handleConfirmDelete,
                societyName: selectedSociety?.name || '',
                loading: isDeleting
            }, void 0, false, {
                fileName: "[project]/src/app/admin/society/page.tsx",
                lineNumber: 1723,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dialogs$2f$PasswordConfirmDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: showBulkDeleteConfirm,
                onClose: ()=>setShowBulkDeleteConfirm(false),
                onConfirm: handleBulkDeleteConfirm,
                title: `Delete ${selectedSocieties.size} ${selectedSocieties.size === 1 ? 'Society' : 'Societies'}`,
                message: `Enter your admin password to confirm deletion of ${selectedSocieties.size} selected ${selectedSocieties.size === 1 ? 'society' : 'societies'}. This action cannot be undone and will be logged for security purposes.`
            }, void 0, false, {
                fileName: "[project]/src/app/admin/society/page.tsx",
                lineNumber: 1735,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$LoadingSnackbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LoadingSnackbar$3e$__["LoadingSnackbar"], {
                isVisible: loading || isDeletingBulk || isDeleting,
                message: isDeletingBulk ? `Deleting ${selectedSocieties.size} ${selectedSocieties.size === 1 ? 'Society' : 'Societies'}` : isDeleting ? "Deleting Society" : "Processing",
                submessage: isDeletingBulk || isDeleting ? "Verifying credentials and removing data..." : "Please wait...",
                showProgress: false
            }, void 0, false, {
                fileName: "[project]/src/app/admin/society/page.tsx",
                lineNumber: 1744,
                columnNumber: 7
            }, this),
            showGraphModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"], {
                                            className: "w-6 h-6 text-blue-600 dark:text-blue-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 1768,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xl font-bold text-gray-900 dark:text-white",
                                            children: [
                                                graphMetric === 'quantity' && 'Collection Volume - Last 30 Days',
                                                graphMetric === 'revenue' && 'Revenue - Last 30 Days',
                                                graphMetric === 'fat' && 'Average Fat % - Last 30 Days',
                                                graphMetric === 'snf' && 'Average SNF % - Last 30 Days',
                                                graphMetric === 'collections' && 'Number of Collections - Last 30 Days',
                                                graphMetric === 'water' && 'Average Water % - Last 30 Days'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 1769,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1767,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowGraphModal(false),
                                    className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "w-5 h-5 text-gray-500 dark:text-gray-400"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                        lineNumber: 1782,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1778,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/society/page.tsx",
                            lineNumber: 1766,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 overflow-y-auto p-6",
                            children: (()=>{
                                const societiesWithStats = societies.filter((s)=>s.totalQuantity30d && s.totalQuantity30d > 0);
                                // Prepare data for line chart (all societies)
                                const chartData = societiesWithStats.map((society)=>({
                                        name: society.name,
                                        societyId: society.societyId,
                                        value: graphMetric === 'quantity' ? society.totalQuantity30d || 0 : graphMetric === 'revenue' ? society.totalAmount30d || 0 : graphMetric === 'fat' ? society.weightedFat30d || 0 : graphMetric === 'snf' ? society.weightedSnf30d || 0 : graphMetric === 'collections' ? society.totalCollections30d || 0 : society.weightedWater30d || 0
                                    })).sort((a, b)=>b.value - a.value);
                                // Get color and settings
                                const getLineColor = ()=>{
                                    switch(graphMetric){
                                        case 'quantity':
                                            return '#10b981';
                                        case 'revenue':
                                            return '#3b82f6';
                                        case 'fat':
                                            return '#8b5cf6';
                                        case 'snf':
                                            return '#f59e0b';
                                        case 'collections':
                                            return '#ec4899';
                                        case 'water':
                                            return '#ef4444';
                                        default:
                                            return '#6b7280';
                                    }
                                };
                                const getYAxisLabel = ()=>{
                                    switch(graphMetric){
                                        case 'quantity':
                                            return 'Quantity (L)';
                                        case 'revenue':
                                            return 'Revenue (₹)';
                                        case 'fat':
                                            return 'Fat %';
                                        case 'snf':
                                            return 'SNF %';
                                        case 'collections':
                                            return 'Collections';
                                        case 'water':
                                            return 'Water %';
                                        default:
                                            return 'Value';
                                    }
                                };
                                const CustomTooltip = ({ active, payload })=>{
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "font-bold text-gray-900 dark:text-white mb-1",
                                                    children: data.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1838,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-gray-500 dark:text-gray-400 mb-2",
                                                    children: [
                                                        "(",
                                                        data.societyId,
                                                        ")"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1839,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "font-semibold",
                                                    style: {
                                                        color: getLineColor()
                                                    },
                                                    children: [
                                                        graphMetric === 'revenue' && '₹',
                                                        data.value.toFixed(2),
                                                        graphMetric === 'fat' || graphMetric === 'snf' || graphMetric === 'water' ? '%' : '',
                                                        graphMetric === 'quantity' ? ' L' : ''
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1840,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 1837,
                                            columnNumber: 23
                                        }, this);
                                    }
                                    return null;
                                };
                                return chartData.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-full h-[500px]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                        width: "100%",
                                        height: "100%",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LineChart"], {
                                            data: chartData,
                                            margin: {
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 80
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                                    strokeDasharray: "3 3",
                                                    stroke: "#e5e7eb",
                                                    className: "dark:stroke-gray-700"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1856,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                                    dataKey: "name",
                                                    angle: -45,
                                                    textAnchor: "end",
                                                    height: 100,
                                                    interval: 0,
                                                    tick: {
                                                        fontSize: 11
                                                    },
                                                    stroke: "#6b7280",
                                                    label: {
                                                        value: 'Society Name',
                                                        position: 'insideBottom',
                                                        offset: -5,
                                                        style: {
                                                            fontSize: 13,
                                                            fontWeight: 500,
                                                            fill: '#9ca3af'
                                                        }
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1857,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                                    label: {
                                                        value: getYAxisLabel(),
                                                        angle: -90,
                                                        position: 'insideLeft',
                                                        style: {
                                                            fontSize: 14,
                                                            fontWeight: 600
                                                        }
                                                    },
                                                    tick: {
                                                        fontSize: 12
                                                    },
                                                    stroke: "#6b7280"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1872,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                    content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CustomTooltip, {}, void 0, false, {
                                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                                        lineNumber: 1882,
                                                        columnNumber: 43
                                                    }, void 0)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1882,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
                                                    type: "monotone",
                                                    dataKey: "value",
                                                    stroke: getLineColor(),
                                                    strokeWidth: 3,
                                                    dot: {
                                                        fill: getLineColor(),
                                                        r: 5
                                                    },
                                                    activeDot: {
                                                        r: 7
                                                    },
                                                    name: getYAxisLabel()
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                                    lineNumber: 1883,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 1855,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/society/page.tsx",
                                        lineNumber: 1854,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1853,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center py-12",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"], {
                                            className: "w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 1897,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-500 dark:text-gray-400",
                                            children: "No data available for the last 30 days"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/society/page.tsx",
                                            lineNumber: 1898,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/society/page.tsx",
                                    lineNumber: 1896,
                                    columnNumber: 19
                                }, this);
                            })()
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/society/page.tsx",
                            lineNumber: 1787,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/society/page.tsx",
                    lineNumber: 1764,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/society/page.tsx",
                lineNumber: 1763,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(SocietyManagement, "WQ1iriUsUuqgDLw5LGo9b9lAD+I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLanguage"]
    ];
});
_c = SocietyManagement;
var _c;
__turbopack_context__.k.register(_c, "SocietyManagement");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_9f4dfe51._.js.map