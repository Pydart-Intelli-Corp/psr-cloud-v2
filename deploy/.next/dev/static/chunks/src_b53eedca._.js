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
"[project]/src/components/forms/FormError.tsx [app-client] (ecmascript) <export default as FormError>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FormError",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormError$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormError$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/FormError.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/management/StatusMessage.tsx [app-client] (ecmascript) <export default as StatusMessage>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatusMessage",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatusMessage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatusMessage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/StatusMessage.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/management/ItemCard.tsx [app-client] (ecmascript) <export default as ItemCard>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ItemCard",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ItemCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ItemCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/ItemCard.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/management/EmptyState.tsx [app-client] (ecmascript) <export default as EmptyState>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmptyState",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$EmptyState$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$EmptyState$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/EmptyState.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/management/ConfirmDeleteModal.tsx [app-client] (ecmascript) <export default as ConfirmDeleteModal>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConfirmDeleteModal",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ConfirmDeleteModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ConfirmDeleteModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/ConfirmDeleteModal.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/management/BulkActionsToolbar.tsx [app-client] (ecmascript) <export default as BulkActionsToolbar>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BulkActionsToolbar",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkActionsToolbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkActionsToolbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/BulkActionsToolbar.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/management/BulkDeleteConfirmModal.tsx [app-client] (ecmascript) <export default as BulkDeleteConfirmModal>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BulkDeleteConfirmModal",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkDeleteConfirmModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkDeleteConfirmModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/BulkDeleteConfirmModal.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/management/FloatingActionButton.tsx [app-client] (ecmascript) <export default as FloatingActionButton>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FloatingActionButton",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FloatingActionButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FloatingActionButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/FloatingActionButton.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/management/ViewModeToggle.tsx [app-client] (ecmascript) <export default as ViewModeToggle>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ViewModeToggle",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ViewModeToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ViewModeToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/ViewModeToggle.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/management/ManagementPageHeader.tsx [app-client] (ecmascript) <export default as ManagementPageHeader>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ManagementPageHeader",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ManagementPageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ManagementPageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/ManagementPageHeader.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/management/FilterDropdown.tsx [app-client] (ecmascript) <export default as FilterDropdown>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FilterDropdown",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/FilterDropdown.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/management/StatsGrid.tsx [app-client] (ecmascript) <export default as StatsGrid>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatsGrid",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatsGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatsGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/StatsGrid.tsx [app-client] (ecmascript)");
}),
"[project]/src/app/admin/machine/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/UserContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/LanguageContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$phoneValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/phoneValidation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone.js [app-client] (ecmascript) <export default as Phone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building-2.js [app-client] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wrench.js [app-client] (ecmascript) <export default as Wrench>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Key$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/key.js [app-client] (ecmascript) <export default as Key>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__KeyRound$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/key-round.js [app-client] (ecmascript) <export default as KeyRound>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder.js [app-client] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder-open.js [app-client] (ecmascript) <export default as FolderOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/droplets.js [app-client] (ecmascript) <export default as Droplets>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/award.js [app-client] (ecmascript) <export default as Award>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/LineChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Line.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$loading$2f$FlowerSpinner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlowerSpinner$3e$__ = __turbopack_context__.i("[project]/src/components/loading/FlowerSpinner.tsx [app-client] (ecmascript) <export default as FlowerSpinner>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormModal$3e$__ = __turbopack_context__.i("[project]/src/components/forms/FormModal.tsx [app-client] (ecmascript) <export default as FormModal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__ = __turbopack_context__.i("[project]/src/components/forms/FormInput.tsx [app-client] (ecmascript) <export default as FormInput>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__ = __turbopack_context__.i("[project]/src/components/forms/FormSelect.tsx [app-client] (ecmascript) <export default as FormSelect>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormActions$3e$__ = __turbopack_context__.i("[project]/src/components/forms/FormActions.tsx [app-client] (ecmascript) <export default as FormActions>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormGrid$3e$__ = __turbopack_context__.i("[project]/src/components/forms/FormGrid.tsx [app-client] (ecmascript) <export default as FormGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormError$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormError$3e$__ = __turbopack_context__.i("[project]/src/components/forms/FormError.tsx [app-client] (ecmascript) <export default as FormError>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatusMessage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__StatusMessage$3e$__ = __turbopack_context__.i("[project]/src/components/management/StatusMessage.tsx [app-client] (ecmascript) <export default as StatusMessage>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ItemCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ItemCard$3e$__ = __turbopack_context__.i("[project]/src/components/management/ItemCard.tsx [app-client] (ecmascript) <export default as ItemCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$EmptyState$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EmptyState$3e$__ = __turbopack_context__.i("[project]/src/components/management/EmptyState.tsx [app-client] (ecmascript) <export default as EmptyState>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ConfirmDeleteModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ConfirmDeleteModal$3e$__ = __turbopack_context__.i("[project]/src/components/management/ConfirmDeleteModal.tsx [app-client] (ecmascript) <export default as ConfirmDeleteModal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/management/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkActionsToolbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BulkActionsToolbar$3e$__ = __turbopack_context__.i("[project]/src/components/management/BulkActionsToolbar.tsx [app-client] (ecmascript) <export default as BulkActionsToolbar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkDeleteConfirmModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BulkDeleteConfirmModal$3e$__ = __turbopack_context__.i("[project]/src/components/management/BulkDeleteConfirmModal.tsx [app-client] (ecmascript) <export default as BulkDeleteConfirmModal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FloatingActionButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FloatingActionButton$3e$__ = __turbopack_context__.i("[project]/src/components/management/FloatingActionButton.tsx [app-client] (ecmascript) <export default as FloatingActionButton>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ViewModeToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ViewModeToggle$3e$__ = __turbopack_context__.i("[project]/src/components/management/ViewModeToggle.tsx [app-client] (ecmascript) <export default as ViewModeToggle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ManagementPageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ManagementPageHeader$3e$__ = __turbopack_context__.i("[project]/src/components/management/ManagementPageHeader.tsx [app-client] (ecmascript) <export default as ManagementPageHeader>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FilterDropdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FilterDropdown$3e$__ = __turbopack_context__.i("[project]/src/components/management/FilterDropdown.tsx [app-client] (ecmascript) <export default as FilterDropdown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatsGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__StatsGrid$3e$__ = __turbopack_context__.i("[project]/src/components/management/StatsGrid.tsx [app-client] (ecmascript) <export default as StatsGrid>");
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
const initialFormData = {
    machineId: '',
    machineType: '',
    societyId: '',
    location: '',
    installationDate: '',
    operatorName: '',
    contactPhone: '',
    status: 'active',
    notes: '',
    setAsMaster: false,
    disablePasswordInheritance: false
};
function MachineManagement() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"])();
    const {} = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLanguage"])();
    // State management
    const [machines, setMachines] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [societies, setSocieties] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [dairies, setDairies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [bmcs, setBmcs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [machineTypes, setMachineTypes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [societiesLoading, setSocietiesLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [machineTypesLoading, setMachineTypesLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showAddForm, setShowAddForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showEditForm, setShowEditForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showDeleteModal, setShowDeleteModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showPasswordModal, setShowPasswordModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showRateChartModal, setShowRateChartModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedRateChart, setSelectedRateChart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [rateChartData, setRateChartData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loadingChartData, setLoadingChartData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchFat, setSearchFat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [searchSnf, setSearchSnf] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [searchClr, setSearchClr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedMachine, setSelectedMachine] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialFormData);
    const [passwordData, setPasswordData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        userPassword: '',
        supervisorPassword: '',
        confirmUserPassword: '',
        confirmSupervisorPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        userPassword: '',
        confirmUserPassword: '',
        supervisorPassword: '',
        confirmSupervisorPassword: ''
    });
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [dairyFilter, setDairyFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [bmcFilter, setBmcFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [societyFilter, setSocietyFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [machineFilter, setMachineFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // Performance stats state
    const [performanceStats, setPerformanceStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        topCollector: null,
        mostTests: null,
        bestCleaning: null,
        mostCleaningSkip: null,
        activeToday: null,
        highestUptime: null
    });
    // Graph modal state
    const [showGraphModal, setShowGraphModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [graphMetric, setGraphMetric] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('quantity');
    const [graphData, setGraphData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [fieldErrors, setFieldErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    // Folder view state
    const [expandedSocieties, setExpandedSocieties] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [viewMode, setViewMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('folder');
    const [selectedSocieties, setSelectedSocieties] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    // Selection state
    const [selectedMachines, setSelectedMachines] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [selectAll, setSelectAll] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [updateProgress, setUpdateProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [showDeleteConfirm, setShowDeleteConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isDeletingBulk, setIsDeletingBulk] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [bulkStatus, setBulkStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('active');
    // Master machine state
    const [societyHasMaster, setSocietyHasMaster] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [existingMasterMachine, setExistingMasterMachine] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isFirstMachine, setIsFirstMachine] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Change master modal state
    const [showChangeMasterModal, setShowChangeMasterModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedSocietyForMaster, setSelectedSocietyForMaster] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [newMasterMachineId, setNewMasterMachineId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [setForAll, setSetForAll] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isChangingMaster, setIsChangingMaster] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Password update for multiple machines
    const [applyPasswordsToOthers, setApplyPasswordsToOthers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedMachinesForPassword, setSelectedMachinesForPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [selectAllMachinesForPassword, setSelectAllMachinesForPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Show password modal state
    const [showPasswordViewModal, setShowPasswordViewModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [adminPasswordForView, setAdminPasswordForView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [viewPasswordError, setViewPasswordError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [viewingPasswords, setViewingPasswords] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [revealedPasswords, setRevealedPasswords] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [machineToShowPassword, setMachineToShowPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Password validation functions
    const validatePasswordFormat = (password)=>{
        if (!password) return '';
        if (!/^\d{6}$/.test(password)) {
            return 'Password must be exactly 6 numbers';
        }
        return '';
    };
    // Parse rate chart details from concatenated string
    const parseChartDetails = (chartDetails)=>{
        if (!chartDetails) return {
            pending: [],
            downloaded: []
        };
        const charts = chartDetails.split('|||');
        const pending = [];
        const downloaded = [];
        charts.forEach((chart)=>{
            const [channel, fileName, status] = chart.split(':');
            if (channel && fileName && status) {
                if (status === 'pending') {
                    pending.push({
                        channel,
                        fileName
                    });
                } else if (status === 'downloaded') {
                    downloaded.push({
                        channel,
                        fileName
                    });
                }
            }
        });
        return {
            pending,
            downloaded
        };
    };
    // Check master machine status for selected society
    const checkMasterMachineStatus = (societyId)=>{
        console.log('checkMasterMachineStatus called with:', societyId);
        if (!societyId) {
            setSocietyHasMaster(false);
            setExistingMasterMachine(null);
            setIsFirstMachine(false);
            return;
        }
        const societyMachines = machines.filter((m)=>m.societyId === parseInt(societyId));
        const masterMachine = societyMachines.find((m)=>m.isMasterMachine);
        console.log('Society machines:', societyMachines.length, 'Master:', masterMachine?.machineId);
        setIsFirstMachine(societyMachines.length === 0);
        setSocietyHasMaster(!!masterMachine);
        setExistingMasterMachine(masterMachine ? masterMachine.machineId : null);
        // Auto-check setAsMaster if it's the first machine
        if (societyMachines.length === 0) {
            setFormData((prev)=>({
                    ...prev,
                    setAsMaster: true
                }));
        } else {
            setFormData((prev)=>({
                    ...prev,
                    setAsMaster: false
                }));
        }
    };
    // Handle click on master badge to change master
    const handleMasterBadgeClick = (societyId)=>{
        setSelectedSocietyForMaster(societyId);
        setNewMasterMachineId(null);
        setSetForAll(false);
        setShowChangeMasterModal(true);
    };
    // Handle change master confirmation
    const handleChangeMasterConfirm = async ()=>{
        if (!newMasterMachineId) {
            setError('Please select a machine to set as master');
            return;
        }
        setIsChangingMaster(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            console.log('Token from localStorage:', token);
            console.log('Token type:', typeof token);
            console.log('Token length:', token?.length);
            if (!token) {
                setError('Authentication token not found. Please login again.');
                return;
            }
            const response = await fetch(`/api/user/machine/${newMasterMachineId}/set-master`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    setForAll
                })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess('Master machine updated successfully');
                setShowChangeMasterModal(false);
                await fetchMachines(); // Refresh machines list
                setTimeout(()=>setSuccess(''), 3000);
            } else {
                setError(data.error || data.message || 'Failed to update master machine');
            }
        } catch (error) {
            console.error('Error updating master machine:', error);
            setError('Failed to update master machine');
        } finally{
            setIsChangingMaster(false);
        }
    };
    // Get channel badge color
    const getChannelColor = (channel)=>{
        switch(channel.toUpperCase()){
            case 'COW':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'BUF':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'MIX':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };
    // Fetch rate chart data
    const fetchRateChartData = async (fileName, channel, societyId)=>{
        try {
            setLoadingChartData(true);
            const token = localStorage.getItem('authToken');
            if (!token) return;
            const response = await fetch(`/api/user/ratechart/data?fileName=${encodeURIComponent(fileName)}&channel=${channel}&societyId=${societyId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setRateChartData(data.data || []);
            } else {
                setError(typeof data.error === 'string' ? data.error : data.error?.message || 'Failed to fetch rate chart data');
            }
        } catch (error) {
            console.error('Error fetching rate chart data:', error);
            setError('Failed to fetch rate chart data');
        } finally{
            setLoadingChartData(false);
        }
    };
    // Handle view rate chart
    const handleViewRateChart = (fileName, channel, societyId)=>{
        setSelectedRateChart({
            fileName,
            channel,
            societyId
        });
        setShowRateChartModal(true);
        fetchRateChartData(fileName, channel, societyId);
    };
    // Close rate chart modal
    const closeRateChartModal = ()=>{
        setShowRateChartModal(false);
        setSelectedRateChart(null);
        setRateChartData([]);
        setSearchFat('');
        setSearchSnf('');
        setSearchClr('');
    };
    // Update password validation when data changes
    const updatePasswordData = (newData)=>{
        // Filter and limit input to 4 digits only
        const filteredData = {};
        Object.entries(newData).forEach(([key, value])=>{
            if (typeof value === 'string') {
                // Only allow digits and limit to 6 characters
                const numericValue = value.replace(/\D/g, '').slice(0, 6);
                filteredData[key] = numericValue;
            }
        });
        const updatedData = {
            ...passwordData,
            ...filteredData
        };
        setPasswordData(updatedData);
        // Validate only the field being changed
        const fieldName = Object.keys(newData)[0];
        const newErrors = {
            ...passwordErrors
        };
        if (fieldName === 'userPassword') {
            const formatError = validatePasswordFormat(updatedData.userPassword);
            newErrors.userPassword = formatError;
            newErrors.confirmUserPassword = ''; // Clear confirm field error
        } else if (fieldName === 'confirmUserPassword') {
            const formatError = validatePasswordFormat(updatedData.confirmUserPassword);
            if (formatError) {
                newErrors.confirmUserPassword = formatError;
            } else if (updatedData.userPassword && updatedData.confirmUserPassword && updatedData.userPassword !== updatedData.confirmUserPassword) {
                newErrors.confirmUserPassword = 'Passwords do not match';
            } else {
                newErrors.confirmUserPassword = '';
            }
            newErrors.userPassword = ''; // Clear main field error
        } else if (fieldName === 'supervisorPassword') {
            const formatError = validatePasswordFormat(updatedData.supervisorPassword);
            newErrors.supervisorPassword = formatError;
            newErrors.confirmSupervisorPassword = ''; // Clear confirm field error
        } else if (fieldName === 'confirmSupervisorPassword') {
            const formatError = validatePasswordFormat(updatedData.confirmSupervisorPassword);
            if (formatError) {
                newErrors.confirmSupervisorPassword = formatError;
            } else if (updatedData.supervisorPassword && updatedData.confirmSupervisorPassword && updatedData.supervisorPassword !== updatedData.confirmSupervisorPassword) {
                newErrors.confirmSupervisorPassword = 'Passwords do not match';
            } else {
                newErrors.confirmSupervisorPassword = '';
            }
            newErrors.supervisorPassword = ''; // Clear main field error
        }
        setPasswordErrors(newErrors);
    };
    // Fetch machines
    const fetchPerformanceStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MachineManagement.useCallback[fetchPerformanceStats]": async ()=>{
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/analytics/machine-performance', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('📊 Performance Stats Response Status:', response.status);
                if (response.ok) {
                    const data = await response.json();
                    console.log('📊 Performance Stats Data:', data);
                    setPerformanceStats(data);
                } else {
                    const errorData = await response.json();
                    console.error('❌ Performance Stats Error:', errorData);
                }
            } catch (error) {
                console.error('❌ Error fetching performance stats:', error);
            }
        }
    }["MachineManagement.useCallback[fetchPerformanceStats]"], []);
    const fetchGraphData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MachineManagement.useCallback[fetchGraphData]": async (metric)=>{
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`/api/analytics/machine-performance?graphData=true&metric=${metric}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setGraphData(data);
                }
            } catch (error) {
                console.error('Error fetching graph data:', error);
                setGraphData([]);
            }
        }
    }["MachineManagement.useCallback[fetchGraphData]"], []);
    const handleCardClick = (metric)=>{
        setGraphMetric(metric);
        fetchGraphData(metric);
        setShowGraphModal(true);
    };
    const fetchMachines = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MachineManagement.useCallback[fetchMachines]": async ()=>{
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                if (!token) {
                    router.push('/login');
                    return;
                }
                const response = await fetch('/api/user/machine', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.status === 401) {
                    localStorage.removeItem('authToken');
                    router.push('/login');
                    return;
                }
                const data = await response.json();
                if (data.success) {
                    // Sort machines: master machines first, then by ID
                    const sortedMachines = (data.data || []).sort({
                        "MachineManagement.useCallback[fetchMachines].sortedMachines": (a, b)=>{
                            // Master machines come first
                            if (a.isMasterMachine && !b.isMasterMachine) return -1;
                            if (!a.isMasterMachine && b.isMasterMachine) return 1;
                            // If both are master or both are not, sort by ID
                            return a.id - b.id;
                        }
                    }["MachineManagement.useCallback[fetchMachines].sortedMachines"]);
                    setMachines(sortedMachines);
                } else {
                    setError(typeof data.error === 'string' ? data.error : data.error?.message || 'Failed to fetch machines');
                }
            } catch (error) {
                console.error('Error fetching machines:', error);
                setError('Failed to fetch machines');
            } finally{
                setLoading(false);
            }
        }
    }["MachineManagement.useCallback[fetchMachines]"], [
        router
    ]);
    // Fetch societies for dropdown
    const fetchSocieties = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MachineManagement.useCallback[fetchSocieties]": async ()=>{
            try {
                setSocietiesLoading(true);
                const token = localStorage.getItem('authToken');
                if (!token) return;
                const response = await fetch('/api/user/society', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setSocieties(data.data || []);
                }
            } catch (error) {
                console.error('Error fetching societies:', error);
            } finally{
                setSocietiesLoading(false);
            }
        }
    }["MachineManagement.useCallback[fetchSocieties]"], []);
    // Fetch machine types from superadmin
    const fetchMachineTypes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MachineManagement.useCallback[fetchMachineTypes]": async ()=>{
            try {
                setMachineTypesLoading(true);
                const token = localStorage.getItem('authToken');
                if (!token) return;
                const response = await fetch('/api/superadmin/machines', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setMachineTypes(data.data.machines || []);
                }
            } catch (error) {
                console.error('Error fetching machine types:', error);
            } finally{
                setMachineTypesLoading(false);
            }
        }
    }["MachineManagement.useCallback[fetchMachineTypes]"], []);
    // Fetch dairies
    const fetchDairies = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MachineManagement.useCallback[fetchDairies]": async ()=>{
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
    }["MachineManagement.useCallback[fetchDairies]"], []);
    // Fetch BMCs
    const fetchBmcs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MachineManagement.useCallback[fetchBmcs]": async ()=>{
            try {
                const token = localStorage.getItem('authToken');
                if (!token) return;
                const response = await fetch('/api/user/bmc', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setBmcs(data.data || []);
                }
            } catch (error) {
                console.error('Error fetching BMCs:', error);
            }
        }
    }["MachineManagement.useCallback[fetchBmcs]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MachineManagement.useEffect": ()=>{
            if (user) {
                fetchMachines();
                fetchSocieties();
                fetchMachineTypes();
                fetchDairies();
                fetchBmcs();
                fetchPerformanceStats();
            }
        }
    }["MachineManagement.useEffect"], [
        user,
        fetchMachines,
        fetchSocieties,
        fetchMachineTypes,
        fetchDairies,
        fetchBmcs,
        fetchPerformanceStats
    ]);
    // Listen for global search events from header
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MachineManagement.useEffect": ()=>{
            const handleGlobalSearch = {
                "MachineManagement.useEffect.handleGlobalSearch": (e)=>{
                    const customEvent = e;
                    setSearchQuery(customEvent.detail.query);
                }
            }["MachineManagement.useEffect.handleGlobalSearch"];
            window.addEventListener('globalSearch', handleGlobalSearch);
            return ({
                "MachineManagement.useEffect": ()=>window.removeEventListener('globalSearch', handleGlobalSearch)
            })["MachineManagement.useEffect"];
        }
    }["MachineManagement.useEffect"], []);
    // Clear messages after 5 seconds
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MachineManagement.useEffect": ()=>{
            if (success || error) {
                const timer = setTimeout({
                    "MachineManagement.useEffect.timer": ()=>{
                        setSuccess('');
                        setError('');
                    }
                }["MachineManagement.useEffect.timer"], 5000);
                return ({
                    "MachineManagement.useEffect": ()=>clearTimeout(timer)
                })["MachineManagement.useEffect"];
            }
        }
    }["MachineManagement.useEffect"], [
        success,
        error
    ]);
    // Reset machine filter when society filter changes (similar to farmer management)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MachineManagement.useEffect": ()=>{
            if (societyFilter.length > 0 && machineFilter.length > 0) {
                // Check if current machine selections are still valid for the selected societies
                const validMachineIds = machines.filter({
                    "MachineManagement.useEffect.validMachineIds": (m)=>societyFilter.includes(m.societyId?.toString() || '')
                }["MachineManagement.useEffect.validMachineIds"]).map({
                    "MachineManagement.useEffect.validMachineIds": (m)=>m.id?.toString() || ''
                }["MachineManagement.useEffect.validMachineIds"]);
                const filteredMachineFilter = machineFilter.filter({
                    "MachineManagement.useEffect.filteredMachineFilter": (id)=>validMachineIds.includes(id)
                }["MachineManagement.useEffect.filteredMachineFilter"]);
                if (filteredMachineFilter.length !== machineFilter.length) {
                    setMachineFilter(filteredMachineFilter);
                }
            }
        }
    }["MachineManagement.useEffect"], [
        societyFilter,
        machineFilter,
        machines
    ]);
    // Read URL parameters and initialize filters on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MachineManagement.useEffect": ()=>{
            const societyId = searchParams.get('societyId');
            const societyName = searchParams.get('societyName');
            const dairyFilterParam = searchParams.get('dairyFilter');
            if (societyId && !societyFilter.includes(societyId)) {
                setSocietyFilter([
                    societyId
                ]);
                // Show success message with society name
                if (societyName) {
                    setSuccess(`Filter Applied: ${decodeURIComponent(societyName)}`);
                }
            }
            if (dairyFilterParam && !dairyFilter.includes(dairyFilterParam)) {
                setDairyFilter([
                    dairyFilterParam
                ]);
                setSuccess('Filter Applied: Dairy');
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["MachineManagement.useEffect"], []); // Run once on mount
    // Handle add form submission
    const handleAddSubmit = async (e)=>{
        e.preventDefault();
        // Validate required fields
        if (!formData.machineId || !formData.machineId.trim()) {
            setError('Please enter a machine ID.');
            setSuccess('');
            return;
        }
        if (!formData.machineType || !formData.machineType.trim()) {
            setError('Please select a machine type.');
            setSuccess('');
            return;
        }
        if (!formData.societyId) {
            setError('Please select a society for the machine.');
            setSuccess('');
            return;
        }
        // Validate phone number if provided
        if (formData.contactPhone && formData.contactPhone.trim()) {
            const phoneValidation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$phoneValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateIndianPhone"])(formData.contactPhone);
            if (!phoneValidation.isValid) {
                setFieldErrors({
                    ...fieldErrors,
                    contactPhone: phoneValidation.error || 'Invalid phone number'
                });
                setError('Please fix the phone number error before saving.');
                setSuccess('');
                return;
            }
        }
        // Clear field errors if validation passes
        setFieldErrors({});
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/user/machine', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setShowAddForm(false);
                setFormData(initialFormData);
                setSuccess('Machine created successfully');
                setError('');
                fetchMachines();
            } else {
                const errorResponse = await response.json();
                const errorMessage = errorResponse.error || 'Failed to create machine';
                // Clear previous field errors
                setFieldErrors({});
                // Check for specific field errors
                if (errorMessage.toLowerCase().includes('machine id') && errorMessage.toLowerCase().includes('already exists')) {
                    if (errorMessage.toLowerCase().includes('in this society')) {
                        setFieldErrors({
                            machineId: 'This Machine ID already exists in the selected society'
                        });
                    } else {
                        setFieldErrors({
                            machineId: 'This Machine ID already exists'
                        });
                    }
                } else if (errorMessage.toLowerCase().includes('machine type') && errorMessage.toLowerCase().includes('already exists')) {
                    setFieldErrors({
                        machineType: 'This Machine type already exists for this society'
                    });
                } else {
                    setError(errorMessage);
                }
                setSuccess('');
            }
        } catch (error) {
            console.error('Error creating machine:', error);
            setError('Error creating machine. Please try again.');
            setSuccess('');
        } finally{
            setIsSubmitting(false);
        }
    };
    // Handle edit form submission
    const handleEditSubmit = async (e)=>{
        e.preventDefault();
        if (!selectedMachine) return;
        // Validate required fields
        if (!formData.machineId || !formData.machineId.trim()) {
            setError('Please enter a machine ID.');
            setSuccess('');
            return;
        }
        if (!formData.machineType || !formData.machineType.trim()) {
            setError('Please select a machine type.');
            setSuccess('');
            return;
        }
        if (!formData.societyId) {
            setError('Please select a society for the machine.');
            setSuccess('');
            return;
        }
        // Validate phone number if provided
        if (formData.contactPhone && formData.contactPhone.trim()) {
            const phoneValidation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$phoneValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateIndianPhone"])(formData.contactPhone);
            if (!phoneValidation.isValid) {
                setFieldErrors({
                    ...fieldErrors,
                    contactPhone: phoneValidation.error || 'Invalid phone number'
                });
                setError('Please fix the phone number error before saving.');
                setSuccess('');
                return;
            }
        }
        // Clear field errors if validation passes
        setFieldErrors({});
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/user/machine', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: selectedMachine.id,
                    ...formData
                })
            });
            if (response.ok) {
                setShowEditForm(false);
                setSelectedMachine(null);
                setFormData(initialFormData);
                setSuccess('Machine updated successfully');
                setError('');
                fetchMachines();
            } else {
                const errorResponse = await response.json();
                const errorMessage = errorResponse.error || 'Failed to update machine';
                // Clear previous field errors
                setFieldErrors({});
                // Check for specific field errors
                if (errorMessage.toLowerCase().includes('machine id') && errorMessage.toLowerCase().includes('already exists')) {
                    if (errorMessage.toLowerCase().includes('in this society')) {
                        setFieldErrors({
                            machineId: 'This Machine ID already exists in the selected society'
                        });
                    } else {
                        setFieldErrors({
                            machineId: 'This Machine ID already exists'
                        });
                    }
                } else if (errorMessage.toLowerCase().includes('machine type') && errorMessage.toLowerCase().includes('already exists')) {
                    setFieldErrors({
                        machineType: 'This Machine type already exists for this society'
                    });
                } else {
                    setError(errorMessage);
                }
                setSuccess('');
            }
        } catch (error) {
            console.error('Error updating machine:', error);
            setError('Error updating machine. Please try again.');
            setSuccess('');
        } finally{
            setIsSubmitting(false);
        }
    };
    // Handle delete
    const handleDelete = async ()=>{
        if (!selectedMachine) return;
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/user/machine?id=${selectedMachine.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success) {
                setSuccess('Machine deleted successfully!');
                await fetchMachines();
                setShowDeleteModal(false);
                setSelectedMachine(null);
            } else {
                setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to delete machine');
            }
        } catch (error) {
            console.error('Error deleting machine:', error);
            setError('Failed to delete machine');
        } finally{
            setIsSubmitting(false);
        }
    };
    // Toggle society folder expansion
    const toggleSocietyExpansion = (societyId)=>{
        setExpandedSocieties((prev)=>{
            const newExpanded = new Set(prev);
            if (newExpanded.has(societyId)) {
                newExpanded.delete(societyId);
            } else {
                newExpanded.add(societyId);
            }
            return newExpanded;
        });
    };
    // Expand all societies
    const expandAllSocieties = ()=>{
        const allSocietyIds = new Set(machines.filter((m)=>m.societyId).map((m)=>m.societyId));
        setExpandedSocieties(allSocietyIds);
    };
    // Collapse all societies
    const collapseAllSocieties = ()=>{
        setExpandedSocieties(new Set());
    };
    // Handle individual machine selection
    const handleSelectMachine = (machineId)=>{
        setSelectedMachines((prev)=>{
            const newSelected = new Set(prev);
            const isDeselecting = newSelected.has(machineId);
            if (isDeselecting) {
                newSelected.delete(machineId);
                // When deselecting a machine, uncheck selectAll
                setSelectAll(false);
                // Check if we should deselect the society folder
                const machine = filteredMachines.find((m)=>m.id === machineId);
                if (machine && machine.societyId) {
                    const societyId = machine.societyId;
                    const societyMachines = filteredMachines.filter((m)=>m.societyId === societyId);
                    const allSocietyMachinesSelected = societyMachines.every((m)=>m.id === machineId ? false : newSelected.has(m.id));
                    // If not all machines in the society are selected, deselect the society folder
                    if (!allSocietyMachinesSelected) {
                        setSelectedSocieties((prevSocieties)=>{
                            const updatedSocieties = new Set(prevSocieties);
                            updatedSocieties.delete(societyId);
                            return updatedSocieties;
                        });
                    }
                }
            } else {
                newSelected.add(machineId);
                // Check if the society folder should be selected
                const machine = filteredMachines.find((m)=>m.id === machineId);
                if (machine && machine.societyId) {
                    const societyId = machine.societyId;
                    const societyMachines = filteredMachines.filter((m)=>m.societyId === societyId);
                    const allSocietyMachinesSelected = societyMachines.every((m)=>m.id === machineId ? true : newSelected.has(m.id));
                    // If all machines in the society are now selected, select the society folder
                    if (allSocietyMachinesSelected) {
                        setSelectedSocieties((prevSocieties)=>{
                            const updatedSocieties = new Set(prevSocieties);
                            updatedSocieties.add(societyId);
                            return updatedSocieties;
                        });
                    }
                }
                // Check if all filtered machines are now selected
                const allFilteredIds = new Set(filteredMachines.map((m)=>m.id));
                const allSelected = Array.from(allFilteredIds).every((id)=>id === machineId ? true : newSelected.has(id));
                if (allSelected) {
                    setSelectAll(true);
                }
            }
            return newSelected;
        });
    };
    // Toggle society selection with machine auto-selection
    const toggleSocietySelection = (societyId, machineIds)=>{
        setSelectedSocieties((prev)=>{
            const newSelected = new Set(prev);
            if (newSelected.has(societyId)) {
                // Deselect society and all its machines
                newSelected.delete(societyId);
                setSelectedMachines((prevMachines)=>{
                    const updatedMachines = new Set(prevMachines);
                    machineIds.forEach((id)=>updatedMachines.delete(id));
                    // Check if we should unset selectAll
                    setSelectAll(false);
                    return updatedMachines;
                });
            } else {
                // Select society and all its machines
                newSelected.add(societyId);
                setSelectedMachines((prevMachines)=>{
                    const updatedMachines = new Set(prevMachines);
                    machineIds.forEach((id)=>updatedMachines.add(id));
                    // Check if all filtered machines are now selected
                    const allFilteredIds = new Set(filteredMachines.map((m)=>m.id));
                    const allSelected = Array.from(allFilteredIds).every((id)=>updatedMachines.has(id));
                    if (allSelected) {
                        setSelectAll(true);
                    }
                    return updatedMachines;
                });
            }
            return newSelected;
        });
    };
    // Handle Select All
    const handleSelectAll = ()=>{
        if (selectAll) {
            setSelectedMachines(new Set());
            setSelectedSocieties(new Set());
            setSelectAll(false);
        } else {
            // Select only the currently filtered machines
            setSelectedMachines(new Set(filteredMachines.map((m)=>m.id)));
            // Also select all societies that have machines in the filtered list
            const machinesBySociety = filteredMachines.reduce((acc, machine)=>{
                const societyId = machine.societyId || 0;
                if (!acc.includes(societyId)) {
                    acc.push(societyId);
                }
                return acc;
            }, []);
            setSelectedSocieties(new Set(machinesBySociety));
            setSelectAll(true);
        }
    };
    // Handle bulk delete
    const handleBulkDelete = async ()=>{
        if (selectedMachines.size === 0) return;
        // Close the confirmation modal immediately and show LoadingSnackbar
        setShowDeleteConfirm(false);
        setIsDeletingBulk(true);
        setUpdateProgress(0);
        try {
            const token = localStorage.getItem('authToken');
            setUpdateProgress(10);
            const ids = Array.from(selectedMachines);
            setUpdateProgress(20);
            const response = await fetch(`/api/user/machine?ids=${encodeURIComponent(JSON.stringify(ids))}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUpdateProgress(60);
            if (response.ok) {
                setUpdateProgress(80);
                await fetchMachines(); // Refresh the list
                setUpdateProgress(95);
                setSelectedMachines(new Set());
                setSelectedSocieties(new Set());
                setSelectAll(false);
                setSuccess(`Successfully deleted ${ids.length} machine(s)${statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0 ? ' from filtered results' : ''}`);
                setError('');
                setUpdateProgress(100);
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete selected machines');
                setSuccess('');
            }
        } catch (error) {
            console.error('Error deleting machines:', error);
            setError('Error deleting selected machines');
            setSuccess('');
        } finally{
            setIsDeletingBulk(false);
            setUpdateProgress(0);
        }
    };
    // Handle bulk status update
    const handleBulkStatusUpdate = async (newStatus)=>{
        if (selectedMachines.size === 0) return;
        const statusToUpdate = newStatus || bulkStatus;
        setIsUpdatingStatus(true);
        setUpdateProgress(0);
        try {
            // Step 1: Get token (5%)
            const token = localStorage.getItem('authToken');
            setUpdateProgress(5);
            // Step 2: Prepare machine IDs (10%)
            const machineIds = Array.from(selectedMachines);
            const totalMachines = machineIds.length;
            setUpdateProgress(10);
            console.log(`🔄 Bulk updating ${totalMachines} machines to status: ${statusToUpdate}`);
            // Step 3: Single bulk update API call (10% to 90%)
            setUpdateProgress(30);
            const response = await fetch('/api/user/machine', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    bulkStatusUpdate: true,
                    machineIds: machineIds,
                    status: statusToUpdate
                })
            });
            setUpdateProgress(70);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update machine status');
            }
            const result = await response.json();
            const updatedCount = result.data?.updated || totalMachines;
            // Step 4: Refresh data (90%)
            setUpdateProgress(90);
            await fetchMachines();
            // Step 5: Finalize (100%)
            setUpdateProgress(100);
            setSelectedMachines(new Set());
            setSelectedSocieties(new Set());
            setSelectAll(false);
            console.log(`✅ Successfully updated ${updatedCount} machines`);
            setSuccess(`Successfully updated status to "${statusToUpdate}" for ${updatedCount} machine(s)${statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0 ? ' from filtered results' : ''}`);
            setError('');
        } catch (error) {
            console.error('Error updating machine status:', error);
            setUpdateProgress(100);
            setError(error instanceof Error ? error.message : 'Error updating machine status. Please try again.');
            setSuccess('');
        } finally{
            setIsUpdatingStatus(false);
        }
    };
    // Clear selections when filters or search change or keep only visible machines
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MachineManagement.useEffect": ()=>{
            // Recalculate filtered machines
            const currentFilteredMachines = machines.filter({
                "MachineManagement.useEffect.currentFilteredMachines": (machine)=>{
                    const statusMatch = statusFilter === 'all' || machine.status === statusFilter;
                    const societyMatch = societyFilter.length === 0 || societyFilter.includes(machine.societyId?.toString() || '');
                    const searchMatch = searchQuery === '' || machine.machineId.toLowerCase().includes(searchQuery.toLowerCase()) || machine.machineType.toLowerCase().includes(searchQuery.toLowerCase()) || machine.societyName?.toLowerCase().includes(searchQuery.toLowerCase()) || machine.societyIdentifier?.toLowerCase().includes(searchQuery.toLowerCase()) || machine.location?.toLowerCase().includes(searchQuery.toLowerCase()) || machine.operatorName?.toLowerCase().includes(searchQuery.toLowerCase()) || machine.contactPhone?.toLowerCase().includes(searchQuery.toLowerCase()) || machine.notes?.toLowerCase().includes(searchQuery.toLowerCase());
                    return statusMatch && societyMatch && searchMatch;
                }
            }["MachineManagement.useEffect.currentFilteredMachines"]);
            if (selectedMachines.size > 0) {
                // Keep only machines that are still visible after filtering/searching
                const visibleMachineIds = new Set(currentFilteredMachines.map({
                    "MachineManagement.useEffect": (m)=>m.id
                }["MachineManagement.useEffect"]));
                const updatedSelection = new Set(Array.from(selectedMachines).filter({
                    "MachineManagement.useEffect": (id)=>visibleMachineIds.has(id)
                }["MachineManagement.useEffect"]));
                if (updatedSelection.size !== selectedMachines.size) {
                    setSelectedMachines(updatedSelection);
                    setSelectAll(false);
                    // Update society selections based on remaining selected machines
                    const visibleSocietyIds = new Set(currentFilteredMachines.map({
                        "MachineManagement.useEffect": (m)=>m.societyId
                    }["MachineManagement.useEffect"]).filter(Boolean));
                    const updatedSocietySelection = new Set();
                    visibleSocietyIds.forEach({
                        "MachineManagement.useEffect": (societyId)=>{
                            const societyMachines = currentFilteredMachines.filter({
                                "MachineManagement.useEffect.societyMachines": (m)=>m.societyId === societyId
                            }["MachineManagement.useEffect.societyMachines"]);
                            const allSocietyMachinesSelected = societyMachines.every({
                                "MachineManagement.useEffect.allSocietyMachinesSelected": (m)=>updatedSelection.has(m.id)
                            }["MachineManagement.useEffect.allSocietyMachinesSelected"]);
                            if (allSocietyMachinesSelected && societyMachines.length > 0) {
                                updatedSocietySelection.add(societyId);
                            }
                        }
                    }["MachineManagement.useEffect"]);
                    setSelectedSocieties(updatedSocietySelection);
                }
            } else {
                setSelectAll(false);
                setSelectedSocieties(new Set());
            }
        }
    }["MachineManagement.useEffect"], [
        statusFilter,
        societyFilter,
        searchQuery,
        machines,
        selectedMachines
    ]);
    // Handle status change
    const handleStatusChange = async (machine, newStatus)=>{
        setIsUpdatingStatus(true);
        setUpdateProgress(0);
        try {
            // Step 1: Get token (10%)
            setUpdateProgress(10);
            const token = localStorage.getItem('authToken');
            // Step 2: Prepare request (20%)
            setUpdateProgress(20);
            // Step 3: Build request body (30%)
            const requestBody = {
                id: machine.id,
                machineId: machine.machineId,
                machineType: machine.machineType,
                societyId: machine.societyId,
                location: machine.location,
                installationDate: machine.installationDate,
                operatorName: machine.operatorName,
                contactPhone: machine.contactPhone,
                status: newStatus,
                notes: machine.notes
            };
            setUpdateProgress(30);
            // Step 4: Send API request (60%)
            const response = await fetch('/api/user/machine', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            setUpdateProgress(60);
            // Step 5: Process response (80%)
            setUpdateProgress(80);
            if (response.ok) {
                setSuccess(`Status updated to ${newStatus}!`);
                // Step 6: Refresh data (100%)
                await fetchMachines();
                setUpdateProgress(100);
                setTimeout(()=>setSuccess(''), 3000);
            } else {
                const errorResponse = await response.json();
                const errorMessage = errorResponse.error || 'Failed to update status';
                setUpdateProgress(100);
                setError(errorMessage);
                setTimeout(()=>setError(''), 5000);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setUpdateProgress(100);
            setError('Failed to update status');
            setTimeout(()=>setError(''), 5000);
        } finally{
            setIsUpdatingStatus(false);
        }
    };
    // Utility functions
    const getPasswordStatusDisplay = (statusU, statusS, userPassword, supervisorPassword)=>{
        // Check if both passwords are set (not null/empty)
        const hasUserPassword = userPassword && userPassword.trim() !== '';
        const hasSupervisorPassword = supervisorPassword && supervisorPassword.trim() !== '';
        // Build status messages based on what's set
        const statuses = [];
        let icon = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
            className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
        }, void 0, false, {
            fileName: "[project]/src/app/admin/machine/page.tsx",
            lineNumber: 1342,
            columnNumber: 16
        }, this);
        let className = 'text-red-600 dark:text-red-400';
        // Check user password
        if (hasUserPassword) {
            if (statusU === 1) {
                statuses.push('User');
                className = 'text-amber-600 dark:text-amber-400';
                icon = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Key$3e$__["Key"], {
                    className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/machine/page.tsx",
                    lineNumber: 1350,
                    columnNumber: 16
                }, this);
            } else {
                statuses.push('User ✓');
                className = 'text-green-600 dark:text-green-400';
                icon = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Key$3e$__["Key"], {
                    className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/machine/page.tsx",
                    lineNumber: 1354,
                    columnNumber: 16
                }, this);
            }
        }
        // Check supervisor password
        if (hasSupervisorPassword) {
            if (statusS === 1) {
                statuses.push('Supervisor');
                className = 'text-amber-600 dark:text-amber-400';
                icon = hasUserPassword ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__KeyRound$3e$__["KeyRound"], {
                    className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/machine/page.tsx",
                    lineNumber: 1363,
                    columnNumber: 34
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                    className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/machine/page.tsx",
                    lineNumber: 1363,
                    columnNumber: 87
                }, this);
            } else {
                statuses.push('Supervisor ✓');
                className = 'text-green-600 dark:text-green-400';
                icon = hasUserPassword ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__KeyRound$3e$__["KeyRound"], {
                    className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/machine/page.tsx",
                    lineNumber: 1367,
                    columnNumber: 34
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                    className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/machine/page.tsx",
                    lineNumber: 1367,
                    columnNumber: 87
                }, this);
            }
        }
        // If both are set to inject, use amber color
        if (hasUserPassword && hasSupervisorPassword && statusU === 1 && statusS === 1) {
            className = 'text-amber-600 dark:text-amber-400';
            icon = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__KeyRound$3e$__["KeyRound"], {
                className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
            }, void 0, false, {
                fileName: "[project]/src/app/admin/machine/page.tsx",
                lineNumber: 1374,
                columnNumber: 14
            }, this);
        } else if (hasUserPassword && hasSupervisorPassword && statusU === 0 && statusS === 0) {
            className = 'text-green-600 dark:text-green-400';
            icon = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__KeyRound$3e$__["KeyRound"], {
                className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
            }, void 0, false, {
                fileName: "[project]/src/app/admin/machine/page.tsx",
                lineNumber: 1379,
                columnNumber: 14
            }, this);
        } else if (hasUserPassword && hasSupervisorPassword && (statusU === 1 || statusS === 1)) {
            className = 'text-amber-600 dark:text-amber-400';
            icon = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__KeyRound$3e$__["KeyRound"], {
                className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
            }, void 0, false, {
                fileName: "[project]/src/app/admin/machine/page.tsx",
                lineNumber: 1384,
                columnNumber: 14
            }, this);
        }
        const text = statuses.length > 0 ? statuses.join(' | ') : 'No passwords';
        return {
            icon,
            text,
            className
        };
    };
    // Modal management
    const openAddModal = ()=>{
        const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
        setFormData({
            ...initialFormData,
            installationDate: currentDate
        });
        setShowAddForm(true);
        setError('');
        setSuccess('');
        setFieldErrors({});
    };
    const handleEditClick = (machine)=>{
        setSelectedMachine(machine);
        setFormData({
            machineId: machine.machineId,
            machineType: machine.machineType,
            societyId: machine.societyId.toString(),
            location: machine.location || '',
            installationDate: machine.installationDate || '',
            operatorName: machine.operatorName || '',
            contactPhone: machine.contactPhone || '',
            status: machine.status,
            notes: machine.notes || '',
            setAsMaster: false,
            disablePasswordInheritance: false
        });
        setFieldErrors({}); // Clear field errors
        setError(''); // Clear general errors
        setShowEditForm(true);
    };
    const handleDeleteClick = (machine)=>{
        setSelectedMachine(machine);
        setShowDeleteModal(true);
    };
    const handlePasswordSettingsClick = (machine)=>{
        setSelectedMachine(machine);
        setPasswordData({
            userPassword: '',
            supervisorPassword: '',
            confirmUserPassword: '',
            confirmSupervisorPassword: ''
        });
        setShowPasswordModal(true);
    };
    const closeAddModal = ()=>{
        setShowAddForm(false);
        setFormData(initialFormData);
        setError('');
        setSuccess('');
        setFieldErrors({});
    };
    const closeEditModal = ()=>{
        setShowEditForm(false);
        setSelectedMachine(null);
        setFormData(initialFormData);
        setError('');
        setSuccess('');
        setFieldErrors({});
    };
    const closeDeleteModal = ()=>{
        setShowDeleteModal(false);
        setSelectedMachine(null);
    };
    const closePasswordModal = ()=>{
        setShowPasswordModal(false);
        setPasswordData({
            userPassword: '',
            supervisorPassword: '',
            confirmUserPassword: '',
            confirmSupervisorPassword: ''
        });
        setPasswordErrors({
            userPassword: '',
            confirmUserPassword: '',
            supervisorPassword: '',
            confirmSupervisorPassword: ''
        });
        setError('');
        setSuccess('');
        setSelectedMachine(null);
        setApplyPasswordsToOthers(false);
        setSelectedMachinesForPassword(new Set());
        setSelectAllMachinesForPassword(false);
    };
    // Handle show password request
    const handleShowPasswordClick = (machine)=>{
        setMachineToShowPassword(machine);
        setShowPasswordViewModal(true);
        setAdminPasswordForView('');
        setViewPasswordError('');
        setRevealedPasswords(null);
    };
    // Handle admin password verification and show passwords
    const handleVerifyAndShowPasswords = async (e)=>{
        e.preventDefault();
        if (!machineToShowPassword || !adminPasswordForView) {
            setViewPasswordError('Please enter your admin password');
            return;
        }
        setViewingPasswords(true);
        setViewPasswordError('');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                router.push('/login');
                return;
            }
            const response = await fetch(`/api/user/machine/${machineToShowPassword.id}/show-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    adminPassword: adminPasswordForView
                })
            });
            if (response.status === 401) {
                const errorData = await response.json();
                if (errorData.error === 'Invalid admin password') {
                    setViewPasswordError('Invalid admin password. Please try again.');
                } else {
                    localStorage.removeItem('authToken');
                    router.push('/login');
                }
                return;
            }
            if (!response.ok) {
                const errorData = await response.json();
                setViewPasswordError(errorData.error || 'Failed to retrieve passwords');
                return;
            }
            const result = await response.json();
            setRevealedPasswords({
                userPassword: result.data.userPassword,
                supervisorPassword: result.data.supervisorPassword
            });
            setAdminPasswordForView(''); // Clear admin password after successful verification
        } catch (error) {
            console.error('Error retrieving passwords:', error);
            setViewPasswordError('Failed to retrieve passwords. Please try again.');
        } finally{
            setViewingPasswords(false);
        }
    };
    // Close show password modal
    const closePasswordViewModal = ()=>{
        setShowPasswordViewModal(false);
        setAdminPasswordForView('');
        setViewPasswordError('');
        setRevealedPasswords(null);
        setMachineToShowPassword(null);
    };
    const handlePasswordSubmit = async (e)=>{
        e.preventDefault();
        if (!selectedMachine) return;
        // Clear previous errors
        setError('');
        // Check for live validation errors
        const hasErrors = Object.values(passwordErrors).some((error)=>error !== '');
        if (hasErrors) {
            setError('Please fix password validation errors before submitting');
            return;
        }
        if (!passwordData.userPassword && !passwordData.supervisorPassword) {
            setError('At least one password must be provided');
            return;
        }
        // Ensure passwords are confirmed when provided
        if (passwordData.userPassword && !passwordData.confirmUserPassword) {
            setError('Please confirm the user password');
            return;
        }
        if (passwordData.userPassword && passwordData.confirmUserPassword && passwordData.userPassword !== passwordData.confirmUserPassword) {
            setError('User passwords do not match');
            return;
        }
        if (passwordData.supervisorPassword && !passwordData.confirmSupervisorPassword) {
            setError('Please confirm the supervisor password');
            return;
        }
        if (passwordData.supervisorPassword && passwordData.confirmSupervisorPassword && passwordData.supervisorPassword !== passwordData.confirmSupervisorPassword) {
            setError('Supervisor passwords do not match');
            return;
        }
        // Validate password format (must be 6 digits)
        if (passwordData.userPassword) {
            const userPwdError = validatePasswordFormat(passwordData.userPassword);
            if (userPwdError) {
                setError(`User password: ${userPwdError}`);
                return;
            }
        }
        if (passwordData.supervisorPassword) {
            const supervisorPwdError = validatePasswordFormat(passwordData.supervisorPassword);
            if (supervisorPwdError) {
                setError(`Supervisor password: ${supervisorPwdError}`);
                return;
            }
        }
        // Check if applying to others and validate selection
        if (applyPasswordsToOthers && selectedMachinesForPassword.size === 0) {
            setError('Please select at least one machine to apply passwords to');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                router.push('/login');
                return;
            }
            // Update the master machine first
            const response = await fetch(`/api/user/machine/${selectedMachine.id}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userPassword: passwordData.userPassword || null,
                    supervisorPassword: passwordData.supervisorPassword || null
                })
            });
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                router.push('/login');
                return;
            }
            if (!response.ok) {
                const errorResponse = await response.json();
                const errorMessage = errorResponse.error || errorResponse.message || 'Failed to update passwords';
                setError(errorMessage);
                setIsSubmitting(false);
                return;
            }
            // If applying to other machines, update them as well
            if (applyPasswordsToOthers && selectedMachinesForPassword.size > 0) {
                const updatePromises = Array.from(selectedMachinesForPassword).map(async (machineId)=>{
                    const updateResponse = await fetch(`/api/user/machine/${machineId}/password`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            userPassword: passwordData.userPassword || null,
                            supervisorPassword: passwordData.supervisorPassword || null
                        })
                    });
                    return updateResponse.ok;
                });
                await Promise.all(updatePromises);
                setSuccess(`Passwords updated for master machine and ${selectedMachinesForPassword.size} other machine(s)!`);
            } else {
                setSuccess('Machine passwords updated successfully!');
            }
            await fetchMachines();
            closePasswordModal();
            setTimeout(()=>setSuccess(''), 3000);
        } catch (error) {
            console.error('Error updating passwords:', error);
            setError('Failed to update passwords. Please try again.');
        } finally{
            setIsSubmitting(false);
        }
    };
    // Filter machines with multi-field search
    const filteredMachines = machines.filter((machine)=>{
        const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
        // Get society's BMC and dairy
        const machineSociety = societies.find((s)=>s.id === machine.societyId);
        const machineBmc = machineSociety?.bmc_id ? bmcs.find((b)=>b.id === machineSociety.bmc_id) : null;
        const machineDairy = machineBmc?.dairyFarmId ? dairies.find((d)=>d.id === machineBmc.dairyFarmId) : null;
        const matchesDairy = dairyFilter.length === 0 || dairyFilter.includes(machineDairy?.id.toString() || '');
        const matchesBmc = bmcFilter.length === 0 || bmcFilter.includes(machineBmc?.id.toString() || '');
        const matchesSociety = societyFilter.length === 0 || societyFilter.includes(machine.societyId?.toString() || '');
        const matchesMachine = machineFilter.length === 0 || machineFilter.includes(machine.id?.toString() || '');
        // Multi-field search across machine details (case-insensitive)
        const searchLower = searchQuery.toLowerCase().trim();
        const matchesSearch = searchLower === '' || [
            machine.machineId,
            machine.machineType,
            machine.societyName,
            machine.societyIdentifier,
            machine.location,
            machine.operatorName,
            machine.contactPhone,
            machine.notes
        ].some((field)=>field?.toString().toLowerCase().includes(searchLower));
        return matchesStatus && matchesDairy && matchesBmc && matchesSociety && matchesMachine && matchesSearch;
    });
    // Filter societies to only show those with machines in the current filtered list
    const availableSocieties = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MachineManagement.useMemo[availableSocieties]": ()=>{
            // Get unique society IDs from machines based on current status, search, and machine type filters
            const machinesForSocietyFilter = machines.filter({
                "MachineManagement.useMemo[availableSocieties].machinesForSocietyFilter": (machine)=>{
                    const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
                    const matchesMachine = machineFilter.length === 0 || machineFilter.includes(machine.id?.toString() || '');
                    const searchLower = searchQuery.toLowerCase().trim();
                    const matchesSearch = searchLower === '' || [
                        machine.machineId,
                        machine.machineType,
                        machine.societyName,
                        machine.societyIdentifier,
                        machine.location,
                        machine.operatorName,
                        machine.contactPhone,
                        machine.notes
                    ].some({
                        "MachineManagement.useMemo[availableSocieties].machinesForSocietyFilter": (field)=>field?.toString().toLowerCase().includes(searchLower)
                    }["MachineManagement.useMemo[availableSocieties].machinesForSocietyFilter"]);
                    return matchesStatus && matchesMachine && matchesSearch;
                }
            }["MachineManagement.useMemo[availableSocieties].machinesForSocietyFilter"]);
            const societyIdsWithMachines = new Set(machinesForSocietyFilter.map({
                "MachineManagement.useMemo[availableSocieties]": (m)=>m.societyId
            }["MachineManagement.useMemo[availableSocieties]"]).filter(Boolean));
            return societies.filter({
                "MachineManagement.useMemo[availableSocieties]": (society)=>societyIdsWithMachines.has(society.id)
            }["MachineManagement.useMemo[availableSocieties]"]);
        }
    }["MachineManagement.useMemo[availableSocieties]"], [
        machines,
        societies,
        searchQuery,
        statusFilter,
        machineFilter
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            isUpdatingStatus && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[320px] max-w-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start space-x-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-shrink-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$loading$2f$FlowerSpinner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlowerSpinner$3e$__["FlowerSpinner"], {
                                size: 24
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 1773,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 1772,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-gray-900 dark:text-white mb-1",
                                    children: "Updating status..."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 1776,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-gray-600 dark:text-gray-400 mb-2",
                                    children: "Please wait"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 1779,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ease-out",
                                        style: {
                                            width: `${updateProgress}%`
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 1784,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 1783,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-gray-500 dark:text-gray-400 mt-1 text-right",
                                    children: [
                                        updateProgress,
                                        "%"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 1789,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 1775,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/machine/page.tsx",
                    lineNumber: 1771,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/machine/page.tsx",
                lineNumber: 1770,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-3 xs:p-4 sm:p-6 lg:p-8 space-y-3 xs:space-y-4 sm:space-y-6 lg:pb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ManagementPageHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ManagementPageHeader$3e$__["ManagementPageHeader"], {
                        title: "Machine Management",
                        subtitle: "Manage dairy equipment and machinery across societies",
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                            className: "w-5 h-5 sm:w-6 sm:h-6 text-white"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 1802,
                            columnNumber: 15
                        }, void 0),
                        onRefresh: fetchMachines,
                        onStatistics: ()=>router.push('/admin/machine/statistics'),
                        hasData: filteredMachines.length > 0
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/machine/page.tsx",
                        lineNumber: 1799,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatusMessage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__StatusMessage$3e$__["StatusMessage"], {
                        success: success,
                        error: error
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/machine/page.tsx",
                        lineNumber: 1809,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>performanceStats.topCollector && handleCardClick('quantity'),
                                className: `bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700 ${performanceStats.topCollector ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-semibold text-green-900 dark:text-green-100",
                                                children: "Top Collector (30d)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1820,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__["Droplets"], {
                                                className: "w-5 h-5 text-green-600 dark:text-green-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1821,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 1819,
                                        columnNumber: 15
                                    }, this),
                                    performanceStats.topCollector ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-lg font-bold text-green-800 dark:text-green-200 truncate",
                                                children: performanceStats.topCollector.machine.machineId
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1825,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-green-700 dark:text-green-300 truncate",
                                                children: performanceStats.topCollector.machine.machineType
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1826,
                                                columnNumber: 19
                                            }, this),
                                            performanceStats.topCollector.machine.societyName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-green-600 dark:text-green-400 truncate",
                                                children: performanceStats.topCollector.machine.societyName
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1828,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-green-600 dark:text-green-400 mt-1",
                                                children: [
                                                    performanceStats.topCollector.totalQuantity.toFixed(2),
                                                    " L"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1830,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-500 dark:text-gray-400 mt-2",
                                        children: "No data available"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 1833,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 1816,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>performanceStats.mostTests && handleCardClick('tests'),
                                className: `bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700 ${performanceStats.mostTests ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-semibold text-purple-900 dark:text-purple-100",
                                                children: "Most Tests (30d)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1841,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"], {
                                                className: "w-5 h-5 text-purple-600 dark:text-purple-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1842,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 1840,
                                        columnNumber: 15
                                    }, this),
                                    performanceStats.mostTests ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-lg font-bold text-purple-800 dark:text-purple-200 truncate",
                                                children: performanceStats.mostTests.machine.machineId
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1846,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-purple-700 dark:text-purple-300 truncate",
                                                children: performanceStats.mostTests.machine.machineType
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1847,
                                                columnNumber: 19
                                            }, this),
                                            performanceStats.mostTests.machine.societyName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-purple-600 dark:text-purple-400 truncate",
                                                children: performanceStats.mostTests.machine.societyName
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1849,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-purple-600 dark:text-purple-400 mt-1",
                                                children: [
                                                    performanceStats.mostTests.totalTests,
                                                    " Tests"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1851,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-500 dark:text-gray-400 mt-2",
                                        children: "No data available"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 1854,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 1837,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>performanceStats.bestCleaning && handleCardClick('cleaning'),
                                className: `bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700 ${performanceStats.bestCleaning ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-semibold text-orange-900 dark:text-orange-100",
                                                children: "Best Cleaning (30d)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1862,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__["Award"], {
                                                className: "w-5 h-5 text-orange-600 dark:text-orange-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1863,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 1861,
                                        columnNumber: 15
                                    }, this),
                                    performanceStats.bestCleaning ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-lg font-bold text-orange-800 dark:text-orange-200 truncate",
                                                children: performanceStats.bestCleaning.machine.machineId
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1867,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-orange-700 dark:text-orange-300 truncate",
                                                children: performanceStats.bestCleaning.machine.machineType
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1868,
                                                columnNumber: 19
                                            }, this),
                                            performanceStats.bestCleaning.machine.societyName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-orange-600 dark:text-orange-400 truncate",
                                                children: performanceStats.bestCleaning.machine.societyName
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1870,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-orange-600 dark:text-orange-400 mt-1",
                                                children: [
                                                    performanceStats.bestCleaning.totalCleanings,
                                                    " Cleanings"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1872,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-500 dark:text-gray-400 mt-2",
                                        children: "No data available"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 1875,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 1858,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>performanceStats.mostCleaningSkip && handleCardClick('skip'),
                                className: `bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg border border-red-200 dark:border-red-700 ${performanceStats.mostCleaningSkip ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-semibold text-red-900 dark:text-red-100",
                                                children: "Most Cleaning Skip (30d)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1883,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                className: "w-5 h-5 text-red-600 dark:text-red-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1884,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 1882,
                                        columnNumber: 15
                                    }, this),
                                    performanceStats.mostCleaningSkip ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-lg font-bold text-red-800 dark:text-red-200 truncate",
                                                children: performanceStats.mostCleaningSkip.machine.machineId
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1888,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-red-700 dark:text-red-300 truncate",
                                                children: performanceStats.mostCleaningSkip.machine.machineType
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1889,
                                                columnNumber: 19
                                            }, this),
                                            performanceStats.mostCleaningSkip.machine.societyName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-red-600 dark:text-red-400 truncate",
                                                children: performanceStats.mostCleaningSkip.machine.societyName
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1891,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-red-600 dark:text-red-400 mt-1",
                                                children: [
                                                    performanceStats.mostCleaningSkip.totalSkips,
                                                    " Skips"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1893,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-500 dark:text-gray-400 mt-2",
                                        children: "No data available"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 1896,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 1879,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>performanceStats.activeToday && handleCardClick('today'),
                                className: `bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-4 rounded-lg border border-pink-200 dark:border-pink-700 ${performanceStats.activeToday ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-semibold text-pink-900 dark:text-pink-100",
                                                children: "Active Today"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1904,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                className: "w-5 h-5 text-pink-600 dark:text-pink-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1905,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 1903,
                                        columnNumber: 15
                                    }, this),
                                    performanceStats.activeToday ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-lg font-bold text-pink-800 dark:text-pink-200 truncate",
                                                children: performanceStats.activeToday.machine.machineId
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1909,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-pink-700 dark:text-pink-300 truncate",
                                                children: performanceStats.activeToday.machine.machineType
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1910,
                                                columnNumber: 19
                                            }, this),
                                            performanceStats.activeToday.machine.societyName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-pink-600 dark:text-pink-400 truncate",
                                                children: performanceStats.activeToday.machine.societyName
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1912,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-pink-600 dark:text-pink-400 mt-1",
                                                children: [
                                                    performanceStats.activeToday.collectionsToday,
                                                    " Today"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1914,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-500 dark:text-gray-400 mt-2",
                                        children: "No data available"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 1917,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 1900,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>performanceStats.highestUptime && handleCardClick('uptime'),
                                className: `bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 ${performanceStats.highestUptime ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-shadow`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-semibold text-indigo-900 dark:text-indigo-100",
                                                children: "Highest Uptime (30d)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1925,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                className: "w-5 h-5 text-indigo-600 dark:text-indigo-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1926,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 1924,
                                        columnNumber: 15
                                    }, this),
                                    performanceStats.highestUptime ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-lg font-bold text-indigo-800 dark:text-indigo-200 truncate",
                                                children: performanceStats.highestUptime.machine.machineId
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1930,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-indigo-700 dark:text-indigo-300 truncate",
                                                children: performanceStats.highestUptime.machine.machineType
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1931,
                                                columnNumber: 19
                                            }, this),
                                            performanceStats.highestUptime.machine.societyName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-indigo-600 dark:text-indigo-400 truncate",
                                                children: performanceStats.highestUptime.machine.societyName
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1933,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1",
                                                children: [
                                                    performanceStats.highestUptime.activeDays,
                                                    " Days"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 1935,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-500 dark:text-gray-400 mt-2",
                                        children: "No data available"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 1938,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 1921,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/machine/page.tsx",
                        lineNumber: 1815,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatsGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__StatsGrid$3e$__["StatsGrid"], {
                        allItems: machines,
                        filteredItems: filteredMachines,
                        hasFilters: statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0 || machineFilter.length > 0,
                        onStatusFilterChange: (status)=>setStatusFilter(status),
                        currentStatusFilter: statusFilter
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/machine/page.tsx",
                        lineNumber: 1944,
                        columnNumber: 9
                    }, this),
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
                        societyFilter: societyFilter,
                        onSocietyChange: (value)=>setSocietyFilter(Array.isArray(value) ? value : [
                                value
                            ]),
                        machineFilter: machineFilter,
                        onMachineChange: (value)=>setMachineFilter(Array.isArray(value) ? value : [
                                value
                            ]),
                        dairies: dairies,
                        bmcs: bmcs,
                        societies: availableSocieties,
                        machines: machines,
                        filteredCount: filteredMachines.length,
                        totalCount: machines.length,
                        searchQuery: searchQuery,
                        onSearchChange: setSearchQuery,
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                            className: "w-5 h-5"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 1972,
                            columnNumber: 17
                        }, void 0),
                        hideMainFilterButton: true
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/machine/page.tsx",
                        lineNumber: 1953,
                        columnNumber: 9
                    }, this),
                    filteredMachines.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex items-center space-x-3 cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "checkbox",
                                        checked: selectAll,
                                        onChange: handleSelectAll,
                                        className: "w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 1981,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                        children: [
                                            "Select All ",
                                            filteredMachines.length,
                                            " ",
                                            filteredMachines.length === 1 ? 'machine' : 'machines',
                                            (statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0 || machineFilter.length > 0) && ` (filtered)`
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 1987,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 1980,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ViewModeToggle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ViewModeToggle$3e$__["ViewModeToggle"], {
                                    viewMode: viewMode,
                                    onViewModeChange: setViewMode,
                                    folderLabel: "Folder View",
                                    listLabel: "Grid View"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 1996,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 1994,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/machine/page.tsx",
                        lineNumber: 1978,
                        columnNumber: 9
                    }, this),
                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center py-12 sm:py-20",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$loading$2f$FlowerSpinner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlowerSpinner$3e$__["FlowerSpinner"], {
                            size: 40
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 2008,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/machine/page.tsx",
                        lineNumber: 2007,
                        columnNumber: 11
                    }, this) : filteredMachines.length > 0 ? viewMode === 'folder' ? // Folder View - Grouped by Society
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: (()=>{
                            // Group machines by society
                            const machinesBySociety = filteredMachines.reduce((acc, machine)=>{
                                const societyId = machine.societyId || 0;
                                const societyName = machine.societyName || 'Unassigned';
                                const societyIdentifier = machine.societyIdentifier || 'N/A';
                                if (!acc[societyId]) {
                                    acc[societyId] = {
                                        id: societyId,
                                        name: societyName,
                                        identifier: societyIdentifier,
                                        machines: []
                                    };
                                }
                                acc[societyId].machines.push(machine);
                                return acc;
                            }, {});
                            const societyGroups = Object.values(machinesBySociety).sort((a, b)=>a.name.localeCompare(b.name));
                            return societyGroups.map((society)=>{
                                const isExpanded = expandedSocieties.has(society.id);
                                const machineCount = society.machines.length;
                                const activeCount = society.machines.filter((m)=>m.status === 'active').length;
                                const inactiveCount = society.machines.filter((m)=>m.status === 'inactive').length;
                                const maintenanceCount = society.machines.filter((m)=>m.status === 'maintenance').length;
                                const isSocietySelected = selectedSocieties.has(society.id);
                                const machineIds = society.machines.map((m)=>m.id);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-colors hover:z-10 ${isSocietySelected ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    onClick: (e)=>{
                                                        e.stopPropagation();
                                                        toggleSocietySelection(society.id, machineIds);
                                                    },
                                                    className: "flex items-center justify-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        checked: isSocietySelected,
                                                        onChange: ()=>{},
                                                        className: "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                        lineNumber: 2065,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2058,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>toggleSocietyExpansion(society.id),
                                                    className: "flex-1 flex items-center justify-between p-4 pl-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center space-x-3",
                                                            children: [
                                                                isExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                    className: "w-5 h-5 text-gray-500 dark:text-gray-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                    lineNumber: 2080,
                                                                    columnNumber: 31
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                                    className: "w-5 h-5 text-gray-500 dark:text-gray-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                    lineNumber: 2082,
                                                                    columnNumber: 31
                                                                }, this),
                                                                isExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                                                                    className: "w-5 h-5 text-green-600 dark:text-green-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                    lineNumber: 2085,
                                                                    columnNumber: 31
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"], {
                                                                    className: "w-5 h-5 text-green-600 dark:text-green-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                    lineNumber: 2087,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-left",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                            className: "text-base sm:text-lg font-semibold text-gray-900 dark:text-white",
                                                                            children: society.name
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                            lineNumber: 2090,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-xs sm:text-sm text-gray-500 dark:text-gray-400",
                                                                            children: [
                                                                                "ID: ",
                                                                                society.identifier
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                            lineNumber: 2093,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                    lineNumber: 2089,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2078,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center space-x-4",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center space-x-2",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-right",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "flex items-center space-x-1",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "w-2 h-2 rounded-full bg-green-500"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                            lineNumber: 2103,
                                                                                            columnNumber: 37
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            children: activeCount
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                            lineNumber: 2104,
                                                                                            columnNumber: 37
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                    lineNumber: 2102,
                                                                                    columnNumber: 35
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "flex items-center space-x-1",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "w-2 h-2 rounded-full bg-red-500"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                            lineNumber: 2107,
                                                                                            columnNumber: 37
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            children: inactiveCount
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                            lineNumber: 2108,
                                                                                            columnNumber: 37
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                    lineNumber: 2106,
                                                                                    columnNumber: 35
                                                                                }, this),
                                                                                maintenanceCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "flex items-center space-x-1",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "w-2 h-2 rounded-full bg-blue-500"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                            lineNumber: 2112,
                                                                                            columnNumber: 39
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            children: maintenanceCount
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                            lineNumber: 2113,
                                                                                            columnNumber: 39
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                    lineNumber: 2111,
                                                                                    columnNumber: 37
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                            lineNumber: 2101,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-xs text-gray-500 dark:text-gray-400",
                                                                            children: [
                                                                                machineCount,
                                                                                " ",
                                                                                machineCount === 1 ? 'machine' : 'machines'
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                            lineNumber: 2117,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                    lineNumber: 2100,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                lineNumber: 2099,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2098,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2074,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 2056,
                                            columnNumber: 23
                                        }, this),
                                        isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4",
                                                children: society.machines.map((machine)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "relative hover:z-20",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ItemCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ItemCard$3e$__["ItemCard"], {
                                                            id: machine.id,
                                                            name: machine.machineId,
                                                            identifier: machine.machineType,
                                                            status: machine.status,
                                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__["Wrench"], {
                                                                className: "w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                lineNumber: 2137,
                                                                columnNumber: 39
                                                            }, void 0),
                                                            showStatus: true,
                                                            badge: machine.isMasterMachine ? {
                                                                text: 'Master',
                                                                color: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 border-yellow-600',
                                                                onClick: ()=>handleMasterBadgeClick(society.id)
                                                            } : undefined,
                                                            selectable: true,
                                                            selected: selectedMachines.has(machine.id),
                                                            onSelect: ()=>handleSelectMachine(machine.id),
                                                            onPasswordSettings: ()=>handlePasswordSettingsClick(machine),
                                                            searchQuery: searchQuery,
                                                            details: [
                                                                ...machine.location ? [
                                                                    {
                                                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                                            className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                            lineNumber: 2150,
                                                                            columnNumber: 67
                                                                        }, void 0),
                                                                        text: machine.location
                                                                    }
                                                                ] : [],
                                                                ...machine.operatorName ? [
                                                                    {
                                                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                                            className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                            lineNumber: 2151,
                                                                            columnNumber: 71
                                                                        }, void 0),
                                                                        text: machine.operatorName
                                                                    }
                                                                ] : [],
                                                                ...machine.contactPhone ? [
                                                                    {
                                                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"], {
                                                                            className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                            lineNumber: 2152,
                                                                            columnNumber: 71
                                                                        }, void 0),
                                                                        text: machine.contactPhone
                                                                    }
                                                                ] : [],
                                                                ...machine.installationDate ? [
                                                                    {
                                                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                                            className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                            lineNumber: 2153,
                                                                            columnNumber: 75
                                                                        }, void 0),
                                                                        text: `Installed: ${new Date(machine.installationDate).toLocaleDateString()}`
                                                                    }
                                                                ] : [],
                                                                // Collection Statistics (Last 30 Days)
                                                                {
                                                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-1",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "w-2 h-2 rounded-full bg-blue-500"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                            lineNumber: 2158,
                                                                            columnNumber: 41
                                                                        }, void 0)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                        lineNumber: 2157,
                                                                        columnNumber: 39
                                                                    }, void 0),
                                                                    text: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-xs font-medium text-blue-600 dark:text-blue-400",
                                                                                children: [
                                                                                    machine.totalCollections30d || 0,
                                                                                    " Collections"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                lineNumber: 2163,
                                                                                columnNumber: 41
                                                                            }, void 0),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-xs text-gray-500 dark:text-gray-400",
                                                                                children: "|"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                lineNumber: 2166,
                                                                                columnNumber: 41
                                                                            }, void 0),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-xs text-gray-600 dark:text-gray-400",
                                                                                children: [
                                                                                    (machine.totalQuantity30d || 0).toFixed(2),
                                                                                    " L"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                lineNumber: 2168,
                                                                                columnNumber: 41
                                                                            }, void 0)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                        lineNumber: 2162,
                                                                        columnNumber: 39
                                                                    }, void 0),
                                                                    className: 'text-blue-600 dark:text-blue-400'
                                                                },
                                                                // Rate Chart Information
                                                                ...(()=>{
                                                                    const { pending, downloaded } = parseChartDetails(machine.chartDetails);
                                                                    const details = [];
                                                                    if (pending.length > 0) {
                                                                        details.push({
                                                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-center gap-1",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                    lineNumber: 2184,
                                                                                    columnNumber: 45
                                                                                }, void 0)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                lineNumber: 2183,
                                                                                columnNumber: 43
                                                                            }, void 0),
                                                                            text: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex flex-wrap items-center gap-1.5",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-xs font-medium text-amber-600 dark:text-amber-400",
                                                                                        children: "Ready:"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                        lineNumber: 2189,
                                                                                        columnNumber: 45
                                                                                    }, void 0),
                                                                                    pending.map((chart, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                            onClick: ()=>handleViewRateChart(chart.fileName, chart.channel, machine.societyId),
                                                                                            className: `px-1.5 py-0.5 rounded text-xs font-medium ${getChannelColor(chart.channel)} hover:opacity-80 transition-opacity cursor-pointer`,
                                                                                            children: chart.channel
                                                                                        }, idx, false, {
                                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                            lineNumber: 2191,
                                                                                            columnNumber: 47
                                                                                        }, void 0))
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                lineNumber: 2188,
                                                                                columnNumber: 43
                                                                            }, void 0),
                                                                            className: 'text-amber-600 dark:text-amber-400'
                                                                        });
                                                                    }
                                                                    if (downloaded.length > 0) {
                                                                        details.push({
                                                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                                className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                lineNumber: 2207,
                                                                                columnNumber: 47
                                                                            }, void 0),
                                                                            text: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex flex-wrap items-center gap-1.5",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-xs font-medium",
                                                                                        children: "Downloaded:"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                        lineNumber: 2210,
                                                                                        columnNumber: 45
                                                                                    }, void 0),
                                                                                    downloaded.map((chart, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                            onClick: ()=>handleViewRateChart(chart.fileName, chart.channel, machine.societyId),
                                                                                            className: `px-1.5 py-0.5 rounded text-xs font-medium ${getChannelColor(chart.channel)} hover:opacity-80 transition-opacity cursor-pointer`,
                                                                                            children: chart.channel
                                                                                        }, idx, false, {
                                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                            lineNumber: 2212,
                                                                                            columnNumber: 47
                                                                                        }, void 0))
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                lineNumber: 2209,
                                                                                columnNumber: 43
                                                                            }, void 0),
                                                                            className: 'text-green-600 dark:text-green-400'
                                                                        });
                                                                    }
                                                                    return details;
                                                                })(),
                                                                // Password Status Display
                                                                (()=>{
                                                                    const passwordDisplay = getPasswordStatusDisplay(machine.statusU, machine.statusS, machine.userPassword, machine.supervisorPassword);
                                                                    const hasAnyPassword = machine.userPassword && machine.userPassword.trim() !== '' || machine.supervisorPassword && machine.supervisorPassword.trim() !== '';
                                                                    return {
                                                                        icon: passwordDisplay.icon,
                                                                        text: hasAnyPassword ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex items-center gap-2",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    children: passwordDisplay.text
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                    lineNumber: 2236,
                                                                                    columnNumber: 43
                                                                                }, void 0),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    onClick: (e)=>{
                                                                                        e.stopPropagation();
                                                                                        handleShowPasswordClick(machine);
                                                                                    },
                                                                                    className: "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                                                            className: "w-3 h-3"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                            lineNumber: 2244,
                                                                                            columnNumber: 45
                                                                                        }, void 0),
                                                                                        "Show"
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                                    lineNumber: 2237,
                                                                                    columnNumber: 43
                                                                                }, void 0)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                            lineNumber: 2235,
                                                                            columnNumber: 41
                                                                        }, void 0) : passwordDisplay.text,
                                                                        className: passwordDisplay.className
                                                                    };
                                                                })()
                                                            ],
                                                            onEdit: ()=>handleEditClick(machine),
                                                            onDelete: ()=>handleDeleteClick(machine),
                                                            onView: ()=>router.push(`/admin/machine/${machine.id}`),
                                                            onStatusChange: (status)=>handleStatusChange(machine, status),
                                                            viewText: "View"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2132,
                                                            columnNumber: 31
                                                        }, this)
                                                    }, machine.id, false, {
                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                        lineNumber: 2131,
                                                        columnNumber: 31
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 2129,
                                                columnNumber: 27
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 2128,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, society.id, true, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2047,
                                    columnNumber: 21
                                }, this);
                            });
                        })()
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/machine/page.tsx",
                        lineNumber: 2013,
                        columnNumber: 13
                    }, this) : // List View - Traditional flat grid
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6",
                        children: filteredMachines.map((machine)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ItemCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ItemCard$3e$__["ItemCard"], {
                                id: machine.id,
                                name: machine.machineId,
                                identifier: machine.machineType,
                                status: machine.status,
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__["Wrench"], {
                                    className: "w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2279,
                                    columnNumber: 25
                                }, void 0),
                                showStatus: true,
                                badge: machine.isMasterMachine ? {
                                    text: 'Master',
                                    color: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 border-yellow-600',
                                    onClick: ()=>handleMasterBadgeClick(machine.societyId)
                                } : undefined,
                                selectable: true,
                                selected: selectedMachines.has(machine.id),
                                onSelect: ()=>handleSelectMachine(machine.id),
                                onPasswordSettings: ()=>handlePasswordSettingsClick(machine),
                                searchQuery: searchQuery,
                                details: [
                                    ...machine.societyName ? [
                                        {
                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                                                className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 2293,
                                                columnNumber: 29
                                            }, void 0),
                                            text: machine.societyIdentifier ? `${machine.societyName} (${machine.societyIdentifier})` : machine.societyName,
                                            highlight: true
                                        }
                                    ] : [],
                                    ...machine.location ? [
                                        {
                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 2299,
                                                columnNumber: 53
                                            }, void 0),
                                            text: machine.location
                                        }
                                    ] : [],
                                    ...machine.operatorName ? [
                                        {
                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 2300,
                                                columnNumber: 57
                                            }, void 0),
                                            text: machine.operatorName
                                        }
                                    ] : [],
                                    ...machine.contactPhone ? [
                                        {
                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"], {
                                                className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 2301,
                                                columnNumber: 57
                                            }, void 0),
                                            text: machine.contactPhone
                                        }
                                    ] : [],
                                    ...machine.installationDate ? [
                                        {
                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 2302,
                                                columnNumber: 61
                                            }, void 0),
                                            text: `Installed: ${new Date(machine.installationDate).toLocaleDateString()}`
                                        }
                                    ] : [],
                                    // Collection Statistics (Last 30 Days)
                                    {
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-2 h-2 rounded-full bg-blue-500"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 2307,
                                                columnNumber: 27
                                            }, void 0)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 2306,
                                            columnNumber: 25
                                        }, void 0),
                                        text: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs font-medium text-blue-600 dark:text-blue-400",
                                                    children: [
                                                        machine.totalCollections30d || 0,
                                                        " Collections"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2312,
                                                    columnNumber: 27
                                                }, void 0),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs text-gray-500 dark:text-gray-400",
                                                    children: "|"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2315,
                                                    columnNumber: 27
                                                }, void 0),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs text-gray-600 dark:text-gray-400",
                                                    children: [
                                                        (machine.totalQuantity30d || 0).toFixed(2),
                                                        " L"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2317,
                                                    columnNumber: 27
                                                }, void 0)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 2311,
                                            columnNumber: 25
                                        }, void 0),
                                        className: 'text-blue-600 dark:text-blue-400'
                                    },
                                    // Rate Chart Information
                                    ...(()=>{
                                        const { pending, downloaded } = parseChartDetails(machine.chartDetails);
                                        const details = [];
                                        if (pending.length > 0) {
                                            details.push({
                                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                        lineNumber: 2333,
                                                        columnNumber: 31
                                                    }, void 0)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2332,
                                                    columnNumber: 29
                                                }, void 0),
                                                text: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap items-center gap-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs font-medium text-amber-600 dark:text-amber-400",
                                                            children: "Ready:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2338,
                                                            columnNumber: 31
                                                        }, void 0),
                                                        pending.map((chart, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>handleViewRateChart(chart.fileName, chart.channel, machine.societyId),
                                                                className: `px-1.5 py-0.5 rounded text-xs font-medium ${getChannelColor(chart.channel)} hover:opacity-80 transition-opacity cursor-pointer`,
                                                                children: chart.channel
                                                            }, idx, false, {
                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                lineNumber: 2340,
                                                                columnNumber: 33
                                                            }, void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2337,
                                                    columnNumber: 29
                                                }, void 0),
                                                className: 'text-amber-600 dark:text-amber-400'
                                            });
                                        }
                                        if (downloaded.length > 0) {
                                            details.push({
                                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                    className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2356,
                                                    columnNumber: 33
                                                }, void 0),
                                                text: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap items-center gap-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs font-medium",
                                                            children: "Downloaded:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2359,
                                                            columnNumber: 31
                                                        }, void 0),
                                                        downloaded.map((chart, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>handleViewRateChart(chart.fileName, chart.channel, machine.societyId),
                                                                className: `px-1.5 py-0.5 rounded text-xs font-medium ${getChannelColor(chart.channel)} hover:opacity-80 transition-opacity cursor-pointer`,
                                                                children: chart.channel
                                                            }, idx, false, {
                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                lineNumber: 2361,
                                                                columnNumber: 33
                                                            }, void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2358,
                                                    columnNumber: 29
                                                }, void 0),
                                                className: 'text-green-600 dark:text-green-400'
                                            });
                                        }
                                        return details;
                                    })(),
                                    // Password Status Display
                                    (()=>{
                                        const passwordDisplay = getPasswordStatusDisplay(machine.statusU, machine.statusS, machine.userPassword, machine.supervisorPassword);
                                        const hasAnyPassword = machine.userPassword && machine.userPassword.trim() !== '' || machine.supervisorPassword && machine.supervisorPassword.trim() !== '';
                                        return {
                                            icon: passwordDisplay.icon,
                                            text: hasAnyPassword ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: passwordDisplay.text
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                        lineNumber: 2385,
                                                        columnNumber: 29
                                                    }, void 0),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: (e)=>{
                                                            e.stopPropagation();
                                                            handleShowPasswordClick(machine);
                                                        },
                                                        className: "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                                className: "w-3 h-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                lineNumber: 2393,
                                                                columnNumber: 31
                                                            }, void 0),
                                                            "Show"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                        lineNumber: 2386,
                                                        columnNumber: 29
                                                    }, void 0)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 2384,
                                                columnNumber: 27
                                            }, void 0) : passwordDisplay.text,
                                            className: passwordDisplay.className
                                        };
                                    })()
                                ],
                                onEdit: ()=>handleEditClick(machine),
                                onDelete: ()=>handleDeleteClick(machine),
                                onView: ()=>router.push(`/admin/machine/${machine.id}`),
                                onStatusChange: (status)=>handleStatusChange(machine, status),
                                viewText: "View"
                            }, machine.id, false, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 2273,
                                columnNumber: 17
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/machine/page.tsx",
                        lineNumber: 2271,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$EmptyState$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EmptyState$3e$__["EmptyState"], {
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                            className: "w-12 h-12 sm:w-16 sm:h-16 text-gray-400"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 2413,
                            columnNumber: 19
                        }, void 0),
                        title: "No machines found",
                        message: statusFilter === 'all' ? "You haven't added any machines yet. Click 'Add Machine' to get started." : `No machines found with status: ${statusFilter}`,
                        actionText: statusFilter === 'all' ? 'Add Your First Machine' : undefined,
                        onAction: statusFilter === 'all' ? openAddModal : undefined,
                        showAction: statusFilter === 'all'
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/machine/page.tsx",
                        lineNumber: 2412,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/machine/page.tsx",
                lineNumber: 1797,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormModal$3e$__["FormModal"], {
                isOpen: showAddForm,
                onClose: closeAddModal,
                title: "Add New Machine",
                maxWidth: "lg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleAddSubmit,
                    className: "space-y-4 sm:space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormGrid$3e$__["FormGrid"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Machine ID",
                                    value: formData.machineId,
                                    onChange: (value)=>{
                                        // Allow only one letter followed by numbers
                                        const formatted = value.replace(/[^a-zA-Z0-9]/g, '') // Remove special chars
                                        .replace(/^([a-zA-Z])[a-zA-Z]+/, '$1') // Keep only first letter
                                        .replace(/^([a-zA-Z])(\d*).*/, '$1$2') // One letter + numbers only
                                        .toUpperCase().slice(0, 10); // Max length 10 (1 letter + 9 digits)
                                        setFormData({
                                            ...formData,
                                            machineId: formatted
                                        });
                                    },
                                    placeholder: "e.g., M2232, S3232",
                                    required: true,
                                    error: fieldErrors.machineId,
                                    colSpan: 2
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2435,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: "Machine Type",
                                    value: formData.machineType,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            machineType: value
                                        }),
                                    options: machineTypes.map((type)=>({
                                            value: type.machineType,
                                            label: type.machineType
                                        })),
                                    placeholder: "Select Machine Type",
                                    required: true,
                                    disabled: machineTypesLoading,
                                    error: fieldErrors.machineType
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2454,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: "Society",
                                    value: formData.societyId,
                                    onChange: (value)=>{
                                        console.log('Society selected:', value, 'Type:', typeof value);
                                        setFormData({
                                            ...formData,
                                            societyId: value
                                        });
                                        checkMasterMachineStatus(value);
                                    },
                                    options: societies.map((society)=>({
                                            value: society.id,
                                            label: `${society.name} (${society.society_id})`
                                        })),
                                    placeholder: "Select Society",
                                    required: true,
                                    disabled: societiesLoading,
                                    error: fieldErrors.societyId
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2468,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Location",
                                    value: formData.location,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            location: value
                                        }),
                                    placeholder: "Installation location"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2486,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Installation Date",
                                    type: "date",
                                    value: formData.installationDate,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            installationDate: value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2493,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Operator Name",
                                    value: formData.operatorName,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            operatorName: value
                                        }),
                                    placeholder: "Machine operator name"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2500,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Contact Phone",
                                    type: "tel",
                                    value: formData.contactPhone,
                                    onChange: (value)=>{
                                        const formatted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$phoneValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatPhoneInput"])(value);
                                        setFormData({
                                            ...formData,
                                            contactPhone: formatted
                                        });
                                    },
                                    onBlur: ()=>{
                                        const error = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$phoneValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validatePhoneOnBlur"])(formData.contactPhone);
                                        if (error) {
                                            setFieldErrors((prev)=>({
                                                    ...prev,
                                                    contactPhone: error
                                                }));
                                        } else {
                                            const { contactPhone: _removed, ...rest } = fieldErrors;
                                            setFieldErrors(rest);
                                        }
                                    },
                                    placeholder: "Operator contact number",
                                    error: fieldErrors.contactPhone
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2507,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: "Status",
                                    value: formData.status,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            status: value
                                        }),
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
                                            label: 'Under Maintenance'
                                        },
                                        {
                                            value: 'suspended',
                                            label: 'Suspended'
                                        }
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2528,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Notes",
                                    type: "text",
                                    value: formData.notes,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            notes: value
                                        }),
                                    placeholder: "Additional notes or comments...",
                                    colSpan: 2
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2540,
                                    columnNumber: 13
                                }, this),
                                formData.societyId !== '' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "sm:col-span-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "checkbox",
                                                    id: "setAsMaster",
                                                    checked: formData.setAsMaster,
                                                    onChange: (e)=>setFormData({
                                                            ...formData,
                                                            setAsMaster: e.target.checked
                                                        }),
                                                    disabled: isFirstMachine,
                                                    className: "mt-1 w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 disabled:opacity-50"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2554,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "setAsMaster",
                                                            className: "text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer",
                                                            children: "Set as Master Machine"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2563,
                                                            columnNumber: 23
                                                        }, this),
                                                        isFirstMachine ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-gray-600 dark:text-gray-400 mt-1",
                                                            children: "This is the first machine for this society and will automatically be set as master"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2567,
                                                            columnNumber: 25
                                                        }, this) : societyHasMaster && formData.setAsMaster ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-yellow-700 dark:text-yellow-400 mt-1 font-medium",
                                                            children: [
                                                                "⚠️ Warning: This will replace the current master machine (",
                                                                existingMasterMachine,
                                                                ") with this one"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2571,
                                                            columnNumber: 25
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-gray-600 dark:text-gray-400 mt-1",
                                                            children: "Master machine passwords will be inherited by all machines in this society"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2575,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2562,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 2553,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 2552,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2551,
                                    columnNumber: 15
                                }, this),
                                formData.societyId !== '' && !formData.setAsMaster && societyHasMaster && !isFirstMachine && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "sm:col-span-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-shrink-0",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: "w-5 h-5 text-blue-600 dark:text-blue-400",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        viewBox: "0 0 24 24",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round",
                                                            strokeWidth: 2,
                                                            d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2592,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                        lineNumber: 2591,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2590,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            className: "text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1",
                                                            children: "Password Inheritance Enabled"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2596,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-blue-700 dark:text-blue-300",
                                                            children: [
                                                                "This machine will automatically inherit user and supervisor passwords from the master machine (",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: existingMasterMachine
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                    lineNumber: 2600,
                                                                    columnNumber: 120
                                                                }, this),
                                                                "). The passwords will be set when the machine is created, and you can update them later if needed."
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2599,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "mt-2 text-xs text-blue-600 dark:text-blue-400",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "Note:"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                    lineNumber: 2604,
                                                                    columnNumber: 25
                                                                }, this),
                                                                " Password status (enabled/disabled) will also be inherited from the master machine."
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2603,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2595,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 2589,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 2588,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2587,
                                    columnNumber: 15
                                }, this),
                                formData.societyId !== '' && !formData.setAsMaster && societyHasMaster && !isFirstMachine && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "sm:col-span-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                id: "disablePasswordInheritance",
                                                checked: formData.disablePasswordInheritance,
                                                onChange: (e)=>setFormData({
                                                        ...formData,
                                                        disablePasswordInheritance: e.target.checked
                                                    }),
                                                className: "mt-1 w-4 h-4 text-primary-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 2616,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                htmlFor: "disablePasswordInheritance",
                                                className: "flex-1 cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm font-medium text-gray-900 dark:text-gray-100 mb-1",
                                                        children: "Do not inherit passwords from master machine"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                        lineNumber: 2624,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-gray-600 dark:text-gray-400",
                                                        children: "Check this if you want to set passwords manually later instead of using the master machine's passwords"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                        lineNumber: 2627,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 2623,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 2615,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2614,
                                    columnNumber: 15
                                }, this),
                                formData.societyId !== '' && !formData.setAsMaster && !societyHasMaster && !isFirstMachine && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "sm:col-span-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-shrink-0",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: "w-5 h-5 text-amber-600 dark:text-amber-400",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        viewBox: "0 0 24 24",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round",
                                                            strokeWidth: 2,
                                                            d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2642,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                        lineNumber: 2641,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2640,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            className: "text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1",
                                                            children: "No Master Machine Found"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2646,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-amber-700 dark:text-amber-300",
                                                            children: "This society has machines but no master machine is designated. Passwords will not be inherited automatically. Consider setting this machine as master or designate an existing machine as master first."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2649,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2645,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 2639,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 2638,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2637,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 2434,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormError$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormError$3e$__["FormError"], {
                            error: error
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 2660,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormActions$3e$__["FormActions"], {
                            onCancel: closeAddModal,
                            submitText: "Add Machine",
                            isLoading: isSubmitting,
                            isSubmitDisabled: !formData.machineId || !formData.machineType || !formData.societyId
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 2662,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/machine/page.tsx",
                    lineNumber: 2433,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/machine/page.tsx",
                lineNumber: 2427,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormModal$3e$__["FormModal"], {
                isOpen: showEditForm && !!selectedMachine,
                onClose: closeEditModal,
                title: "Edit Machine",
                maxWidth: "lg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleEditSubmit,
                    className: "space-y-4 sm:space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormGrid$3e$__["FormGrid"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Machine ID",
                                    value: formData.machineId,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            machineId: value
                                        }),
                                    placeholder: "e.g., M2232, S3232",
                                    required: true,
                                    error: fieldErrors.machineId,
                                    colSpan: 2
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2680,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: "Machine Type",
                                    value: formData.machineType,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            machineType: value
                                        }),
                                    options: machineTypes.map((type)=>({
                                            value: type.machineType,
                                            label: type.machineType
                                        })),
                                    placeholder: "Select Machine Type",
                                    required: true,
                                    disabled: machineTypesLoading,
                                    error: fieldErrors.machineType
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2690,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: "Society",
                                    value: formData.societyId,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            societyId: value
                                        }),
                                    options: societies.map((society)=>({
                                            value: society.id,
                                            label: `${society.name} (${society.society_id})`
                                        })),
                                    placeholder: "Select Society",
                                    required: true,
                                    disabled: societiesLoading,
                                    error: fieldErrors.societyId
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2704,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Location",
                                    value: formData.location,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            location: value
                                        }),
                                    placeholder: "Installation location"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2718,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Installation Date",
                                    type: "date",
                                    value: formData.installationDate,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            installationDate: value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2725,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Operator Name",
                                    value: formData.operatorName,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            operatorName: value
                                        }),
                                    placeholder: "Machine operator name"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2732,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Contact Phone",
                                    type: "tel",
                                    value: formData.contactPhone,
                                    onChange: (value)=>{
                                        const formatted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$phoneValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatPhoneInput"])(value);
                                        setFormData({
                                            ...formData,
                                            contactPhone: formatted
                                        });
                                    },
                                    onBlur: ()=>{
                                        const error = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$phoneValidation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validatePhoneOnBlur"])(formData.contactPhone);
                                        if (error) {
                                            setFieldErrors((prev)=>({
                                                    ...prev,
                                                    contactPhone: error
                                                }));
                                        } else {
                                            const { contactPhone: _removed, ...rest } = fieldErrors;
                                            setFieldErrors(rest);
                                        }
                                    },
                                    placeholder: "Operator contact number",
                                    error: fieldErrors.contactPhone
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2739,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: "Status",
                                    value: formData.status,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            status: value
                                        }),
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
                                            label: 'Under Maintenance'
                                        },
                                        {
                                            value: 'suspended',
                                            label: 'Suspended'
                                        }
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2760,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Notes",
                                    type: "text",
                                    value: formData.notes,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            notes: value
                                        }),
                                    placeholder: "Additional notes or comments...",
                                    colSpan: 2
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2772,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 2679,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormError$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormError$3e$__["FormError"], {
                            error: error
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 2782,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormActions$3e$__["FormActions"], {
                            onCancel: closeEditModal,
                            submitText: "Update Machine",
                            isLoading: isSubmitting,
                            isSubmitDisabled: !formData.machineId || !formData.machineType || !formData.societyId
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 2784,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/machine/page.tsx",
                    lineNumber: 2678,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/machine/page.tsx",
                lineNumber: 2672,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormModal$3e$__["FormModal"], {
                isOpen: showPasswordModal && !!selectedMachine,
                onClose: closePasswordModal,
                title: `Password Settings - ${selectedMachine?.machineId || ''}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handlePasswordSubmit,
                    className: "space-y-4 sm:space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormGrid$3e$__["FormGrid"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "User Password (6 digits)",
                                    type: "password",
                                    value: passwordData.userPassword,
                                    onChange: (value)=>updatePasswordData({
                                            userPassword: value
                                        }),
                                    placeholder: "Enter 6-digit code",
                                    maxLength: 6,
                                    pattern: "[0-9]*",
                                    inputMode: "numeric",
                                    error: passwordErrors.userPassword,
                                    colSpan: 2
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2801,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Confirm User Password",
                                    type: "password",
                                    value: passwordData.confirmUserPassword,
                                    onChange: (value)=>updatePasswordData({
                                            confirmUserPassword: value
                                        }),
                                    placeholder: "Re-enter 6-digit code",
                                    maxLength: 6,
                                    pattern: "[0-9]*",
                                    inputMode: "numeric",
                                    error: passwordErrors.confirmUserPassword,
                                    colSpan: 2
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2814,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Supervisor Password (6 digits)",
                                    type: "password",
                                    value: passwordData.supervisorPassword,
                                    onChange: (value)=>updatePasswordData({
                                            supervisorPassword: value
                                        }),
                                    placeholder: "Enter 6-digit code",
                                    maxLength: 6,
                                    pattern: "[0-9]*",
                                    inputMode: "numeric",
                                    error: passwordErrors.supervisorPassword,
                                    colSpan: 2
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2827,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Confirm Supervisor Password",
                                    type: "password",
                                    value: passwordData.confirmSupervisorPassword,
                                    onChange: (value)=>updatePasswordData({
                                            confirmSupervisorPassword: value
                                        }),
                                    placeholder: "Re-enter 6-digit code",
                                    maxLength: 6,
                                    pattern: "[0-9]*",
                                    inputMode: "numeric",
                                    error: passwordErrors.confirmSupervisorPassword,
                                    colSpan: 2
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2840,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 2800,
                            columnNumber: 11
                        }, this),
                        selectedMachine?.isMasterMachine && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border-t border-gray-200 dark:border-gray-700 pt-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-start gap-3 mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            id: "applyPasswordsToOthers",
                                            checked: applyPasswordsToOthers,
                                            onChange: (e)=>{
                                                setApplyPasswordsToOthers(e.target.checked);
                                                if (!e.target.checked) {
                                                    setSelectedMachinesForPassword(new Set());
                                                    setSelectAllMachinesForPassword(false);
                                                }
                                            },
                                            className: "mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 2858,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "applyPasswordsToOthers",
                                                    className: "text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer",
                                                    children: "Apply these passwords to other machines in this society"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2872,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-gray-600 dark:text-gray-400 mt-1",
                                                    children: "Select machines below to update their passwords with the same values"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2875,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 2871,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2857,
                                    columnNumber: 15
                                }, this),
                                applyPasswordsToOthers && selectedMachine && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                    children: [
                                                        "Select Machines (",
                                                        selectedMachinesForPassword.size,
                                                        " selected)"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2885,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>{
                                                        const societyMachines = machines.filter((m)=>m.societyId === selectedMachine.societyId && m.id !== selectedMachine.id);
                                                        if (selectAllMachinesForPassword) {
                                                            setSelectedMachinesForPassword(new Set());
                                                            setSelectAllMachinesForPassword(false);
                                                        } else {
                                                            setSelectedMachinesForPassword(new Set(societyMachines.map((m)=>m.id)));
                                                            setSelectAllMachinesForPassword(true);
                                                        }
                                                    },
                                                    className: "text-xs text-blue-600 dark:text-blue-400 hover:underline",
                                                    children: selectAllMachinesForPassword ? 'Deselect All' : 'Select All'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2888,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 2884,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2",
                                            children: machines.filter((m)=>m.societyId === selectedMachine.societyId && m.id !== selectedMachine.id).map((machine)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            checked: selectedMachinesForPassword.has(machine.id),
                                                            onChange: (e)=>{
                                                                const newSelected = new Set(selectedMachinesForPassword);
                                                                if (e.target.checked) {
                                                                    newSelected.add(machine.id);
                                                                } else {
                                                                    newSelected.delete(machine.id);
                                                                    setSelectAllMachinesForPassword(false);
                                                                }
                                                                setSelectedMachinesForPassword(newSelected);
                                                            },
                                                            className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2916,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-sm font-medium text-gray-900 dark:text-gray-100",
                                                                    children: machine.machineId
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                    lineNumber: 2932,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-xs text-gray-500 dark:text-gray-400",
                                                                    children: machine.machineType
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                    lineNumber: 2935,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 2931,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, machine.id, true, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 2912,
                                                    columnNumber: 25
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 2908,
                                            columnNumber: 19
                                        }, this),
                                        machines.filter((m)=>m.societyId === selectedMachine.societyId && m.id !== selectedMachine.id).length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-gray-500 dark:text-gray-400 text-center py-4",
                                            children: "No other machines in this society"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 2944,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 2883,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 2856,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormError$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormError$3e$__["FormError"], {
                            error: error
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 2953,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormActions$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormActions$3e$__["FormActions"], {
                            onCancel: closePasswordModal,
                            submitText: "Update Passwords",
                            isLoading: isSubmitting,
                            isSubmitDisabled: isSubmitting || Object.values(passwordErrors).some((error)=>error !== '') || !passwordData.userPassword && !passwordData.supervisorPassword || // Disable if password is entered but not confirmed
                            !!(passwordData.userPassword && !passwordData.confirmUserPassword) || !!(passwordData.supervisorPassword && !passwordData.confirmSupervisorPassword) || // Disable if confirmation is entered but password is not
                            !!(!passwordData.userPassword && passwordData.confirmUserPassword) || !!(!passwordData.supervisorPassword && passwordData.confirmSupervisorPassword)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 2955,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/machine/page.tsx",
                    lineNumber: 2799,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/machine/page.tsx",
                lineNumber: 2794,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ConfirmDeleteModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ConfirmDeleteModal$3e$__["ConfirmDeleteModal"], {
                isOpen: showDeleteModal && !!selectedMachine,
                onClose: closeDeleteModal,
                onConfirm: handleDelete,
                title: "Delete Machine",
                itemName: selectedMachine?.machineId || '',
                message: "Are you sure you want to permanently delete machine"
            }, void 0, false, {
                fileName: "[project]/src/app/admin/machine/page.tsx",
                lineNumber: 2975,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormModal$3e$__["FormModal"], {
                isOpen: showRateChartModal && !!selectedRateChart,
                onClose: closeRateChartModal,
                title: `Rate Chart - ${selectedRateChart?.channel || ''} Channel`,
                maxWidth: "2xl",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-50 dark:bg-gray-800 p-4 rounded-lg",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                                children: "File Name"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 2996,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-base font-semibold text-gray-900 dark:text-white",
                                                children: selectedRateChart?.fileName
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 2997,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 2995,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `px-3 py-1 rounded-full text-sm font-medium ${getChannelColor(selectedRateChart?.channel || '')}`,
                                        children: selectedRateChart?.channel
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 2999,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 2994,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 2993,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-3 gap-3 mb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1",
                                            children: "Search FAT"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3008,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: searchFat,
                                            onChange: (e)=>setSearchFat(e.target.value),
                                            placeholder: "e.g., 3.5",
                                            className: "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3009,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 3007,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1",
                                            children: "Search SNF"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3018,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: searchSnf,
                                            onChange: (e)=>setSearchSnf(e.target.value),
                                            placeholder: "e.g., 8.5",
                                            className: "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3019,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 3017,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1",
                                            children: "Search CLR"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3028,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: searchClr,
                                            onChange: (e)=>setSearchClr(e.target.value),
                                            placeholder: "e.g., 25.0",
                                            className: "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3029,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 3027,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 3006,
                            columnNumber: 11
                        }, this),
                        loadingChartData ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-center items-center py-8",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$loading$2f$FlowerSpinner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlowerSpinner$3e$__["FlowerSpinner"], {}, void 0, false, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 3042,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 3041,
                            columnNumber: 13
                        }, this) : (()=>{
                            // Filter data based on search inputs
                            const filteredData = rateChartData.filter((row)=>{
                                const matchFat = !searchFat || row.fat.toLowerCase().includes(searchFat.toLowerCase());
                                const matchSnf = !searchSnf || row.snf.toLowerCase().includes(searchSnf.toLowerCase());
                                const matchClr = !searchClr || row.clr.toLowerCase().includes(searchClr.toLowerCase());
                                return matchFat && matchSnf && matchClr;
                            });
                            return filteredData.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "overflow-x-auto",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                        className: "w-full border-collapse",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    className: "bg-gray-100 dark:bg-gray-700",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600",
                                                            children: "FAT"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 3058,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600",
                                                            children: "SNF"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 3061,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600",
                                                            children: "CLR"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 3064,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-600",
                                                            children: "Rate"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                                            lineNumber: 3067,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 3057,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 3056,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700",
                                                children: filteredData.map((row, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        className: "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600",
                                                                children: row.fat
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                lineNumber: 3075,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600",
                                                                children: row.snf
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                lineNumber: 3078,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600",
                                                                children: row.clr
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                lineNumber: 3081,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600",
                                                                children: [
                                                                    "₹",
                                                                    row.rate
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                lineNumber: 3084,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, index, true, {
                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                        lineNumber: 3074,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 3072,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 3055,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-2 text-xs text-gray-500 dark:text-gray-400 text-right",
                                        children: [
                                            "Showing ",
                                            filteredData.length,
                                            " of ",
                                            rateChartData.length,
                                            " records"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 3091,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 3054,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                        className: "w-12 h-12 text-gray-400 mx-auto mb-3"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 3097,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-500 dark:text-gray-400",
                                        children: searchFat || searchSnf || searchClr ? 'No matching records found' : 'No data available for this rate chart'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 3098,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 3096,
                                columnNumber: 13
                            }, this);
                        })(),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end pt-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: closeRateChartModal,
                                className: "px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors",
                                children: "Close"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 3105,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 3104,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/machine/page.tsx",
                    lineNumber: 2991,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/machine/page.tsx",
                lineNumber: 2985,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormModal$3e$__["FormModal"], {
                isOpen: showChangeMasterModal,
                onClose: ()=>setShowChangeMasterModal(false),
                title: "Change Master Machine",
                maxWidth: "md",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-shrink-0",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-5 h-5 text-yellow-600 dark:text-yellow-400",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 3127,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3126,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 3125,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1",
                                                children: "About Master Machine"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 3131,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-yellow-700 dark:text-yellow-300",
                                                children: "The master machine's passwords are inherited by all other machines in the society. Changing the master will update which machine's passwords are used as the default for new machines."
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 3134,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 3130,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 3124,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 3123,
                            columnNumber: 11
                        }, this),
                        selectedSocietyForMaster && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                                            children: [
                                                "Select New Master Machine ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-red-500",
                                                    children: "*"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 3146,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3145,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            value: newMasterMachineId || '',
                                            onChange: (e)=>setNewMasterMachineId(e.target.value ? parseInt(e.target.value) : null),
                                            className: "w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "",
                                                    children: "Select a machine"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 3153,
                                                    columnNumber: 19
                                                }, this),
                                                machines.filter((m)=>m.societyId === selectedSocietyForMaster).map((machine)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: machine.id,
                                                        children: [
                                                            machine.machineId,
                                                            " - ",
                                                            machine.machineType,
                                                            machine.isMasterMachine ? ' (Current Master)' : ''
                                                        ]
                                                    }, machine.id, true, {
                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                        lineNumber: 3157,
                                                        columnNumber: 23
                                                    }, this))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3148,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 3144,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            id: "setForAllMachines",
                                            checked: setForAll,
                                            onChange: (e)=>setSetForAll(e.target.checked),
                                            className: "mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3166,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "setForAllMachines",
                                                    className: "text-sm font-medium text-blue-900 dark:text-blue-100 cursor-pointer",
                                                    children: "Apply master's passwords to all machines in society"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 3174,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-blue-700 dark:text-blue-300 mt-1",
                                                    children: "If checked, all machines in this society will be updated with the new master machine's passwords immediately."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                                    lineNumber: 3177,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3173,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 3165,
                                    columnNumber: 15
                                }, this),
                                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-red-700 dark:text-red-300",
                                        children: error
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 3185,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 3184,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end gap-3 pt-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowChangeMasterModal(false),
                                    disabled: isChangingMaster,
                                    className: "px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50",
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 3192,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleChangeMasterConfirm,
                                    disabled: isChangingMaster || !newMasterMachineId,
                                    className: "px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
                                    children: isChangingMaster ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "animate-spin h-4 w-4",
                                                fill: "none",
                                                viewBox: "0 0 24 24",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                        className: "opacity-25",
                                                        cx: "12",
                                                        cy: "12",
                                                        r: "10",
                                                        stroke: "currentColor",
                                                        strokeWidth: "4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                        lineNumber: 3207,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        className: "opacity-75",
                                                        fill: "currentColor",
                                                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                        lineNumber: 3208,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 3206,
                                                columnNumber: 19
                                            }, this),
                                            "Changing..."
                                        ]
                                    }, void 0, true) : 'Change Master'
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 3199,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 3191,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/machine/page.tsx",
                    lineNumber: 3122,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/machine/page.tsx",
                lineNumber: 3116,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkDeleteConfirmModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BulkDeleteConfirmModal$3e$__["BulkDeleteConfirmModal"], {
                isOpen: showDeleteConfirm,
                itemCount: selectedMachines.size,
                itemType: "machine",
                onConfirm: handleBulkDelete,
                onClose: ()=>setShowDeleteConfirm(false)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/machine/page.tsx",
                lineNumber: 3221,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkActionsToolbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BulkActionsToolbar$3e$__["BulkActionsToolbar"], {
                selectedCount: selectedMachines.size,
                totalCount: machines.length,
                onBulkDelete: ()=>setShowDeleteConfirm(true),
                onBulkStatusUpdate: handleBulkStatusUpdate,
                onClearSelection: ()=>{
                    setSelectedMachines(new Set());
                    setSelectedSocieties(new Set());
                    setSelectAll(false);
                },
                itemType: "machine",
                showStatusUpdate: true,
                currentBulkStatus: bulkStatus,
                onBulkStatusChange: (status)=>setBulkStatus(status)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/machine/page.tsx",
                lineNumber: 3230,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FloatingActionButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FloatingActionButton$3e$__["FloatingActionButton"], {
                actions: [
                    {
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                            className: "w-6 h-6 text-white"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 3250,
                            columnNumber: 19
                        }, void 0),
                        label: 'Add Machine',
                        onClick: openAddModal,
                        color: 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }
                ],
                directClick: true
            }, void 0, false, {
                fileName: "[project]/src/app/admin/machine/page.tsx",
                lineNumber: 3247,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormModal$3e$__["FormModal"], {
                isOpen: showPasswordViewModal && !!machineToShowPassword,
                onClose: closePasswordViewModal,
                title: `View Passwords - ${machineToShowPassword?.machineId || ''}`,
                children: !revealedPasswords ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleVerifyAndShowPasswords,
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
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 3269,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "text-sm font-medium text-amber-800 dark:text-amber-200 mb-1",
                                                children: "Security Verification Required"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 3271,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-amber-700 dark:text-amber-300",
                                                children: "Enter your admin password to view machine passwords. This action will be logged for security purposes."
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 3274,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 3270,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 3268,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 3267,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                            label: "Admin Password",
                            type: "password",
                            value: adminPasswordForView,
                            onChange: (value)=>setAdminPasswordForView(value),
                            placeholder: "Enter your admin password",
                            error: viewPasswordError,
                            required: true
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 3281,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-3 pt-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: closePasswordViewModal,
                                    className: "flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors",
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 3292,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: viewingPasswords || !adminPasswordForView,
                                    className: "flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2",
                                    children: viewingPasswords ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 3306,
                                                columnNumber: 21
                                            }, this),
                                            "Verifying..."
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 3311,
                                                columnNumber: 21
                                            }, this),
                                            "View Passwords"
                                        ]
                                    }, void 0, true)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 3299,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 3291,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/machine/page.tsx",
                    lineNumber: 3266,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                        className: "w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 3322,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "text-sm font-medium text-green-800 dark:text-green-200 mb-1",
                                                children: "Passwords Retrieved Successfully"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 3324,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-green-700 dark:text-green-300",
                                                children: [
                                                    "Machine passwords for ",
                                                    machineToShowPassword?.machineId
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 3327,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 3323,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 3321,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 3320,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Key$3e$__["Key"], {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                        lineNumber: 3338,
                                                        columnNumber: 21
                                                    }, this),
                                                    "User Password"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 3337,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3336,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-white dark:bg-gray-900 rounded-md px-4 py-3 border border-gray-300 dark:border-gray-600",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-wider",
                                                children: revealedPasswords.userPassword || 'Not Set'
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 3343,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3342,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 3335,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                        lineNumber: 3352,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Supervisor Password"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 3351,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3350,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-white dark:bg-gray-900 rounded-md px-4 py-3 border border-gray-300 dark:border-gray-600",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-wider",
                                                children: revealedPasswords.supervisorPassword || 'Not Set'
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                lineNumber: 3357,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3356,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 3349,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 3334,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-3 pt-2",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: closePasswordViewModal,
                                className: "flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all",
                                children: "Close"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 3365,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 3364,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/machine/page.tsx",
                    lineNumber: 3319,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/machine/page.tsx",
                lineNumber: 3260,
                columnNumber: 7
            }, this),
            showGraphModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4",
                onClick: ()=>setShowGraphModal(false),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden",
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-xl font-semibold text-gray-900 dark:text-white",
                                    children: [
                                        graphMetric === 'quantity' && 'Top 20 Machines by Quantity (Last 30 Days)',
                                        graphMetric === 'tests' && 'Top 20 Machines by Total Tests (Last 30 Days)',
                                        graphMetric === 'cleaning' && 'Top 20 Machines by Cleaning Count (Last 30 Days)',
                                        graphMetric === 'skip' && 'Top 20 Machines by Cleaning Skip Count (Last 30 Days)',
                                        graphMetric === 'today' && 'Most Active Machines Today',
                                        graphMetric === 'uptime' && 'Top 20 Machines by Uptime Days (Last 30 Days)'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 3382,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowGraphModal(false),
                                    className: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "w-6 h-6"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                        lineNumber: 3391,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 3390,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 3381,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 overflow-y-auto max-h-[calc(90vh-80px)]",
                            children: graphData.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                width: "100%",
                                height: 400,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LineChart"], {
                                    data: graphData,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                            strokeDasharray: "3 3"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3398,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                            dataKey: "label",
                                            angle: -45,
                                            textAnchor: "end",
                                            height: 100,
                                            tick: {
                                                fontSize: 12
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3399,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {}, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3406,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                            content: ({ active, payload })=>{
                                                if (active && payload && payload[0]) {
                                                    const data = payload[0].payload;
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "font-semibold text-gray-900 dark:text-white",
                                                                children: data.machine.machineId
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                lineNumber: 3412,
                                                                columnNumber: 29
                                                            }, void 0),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm text-gray-600 dark:text-gray-400",
                                                                children: data.machine.machineType
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                lineNumber: 3413,
                                                                columnNumber: 29
                                                            }, void 0),
                                                            data.machine.societyName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm text-gray-600 dark:text-gray-400",
                                                                children: data.machine.societyName
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                lineNumber: 3415,
                                                                columnNumber: 31
                                                            }, void 0),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1",
                                                                children: [
                                                                    graphMetric === 'quantity' && `${data.value.toFixed(2)} L`,
                                                                    graphMetric === 'tests' && `${data.value} Tests`,
                                                                    graphMetric === 'cleaning' && `${data.value} Cleanings`,
                                                                    graphMetric === 'skip' && `${data.value} Skips`,
                                                                    graphMetric === 'today' && `${data.value} Collections Today`,
                                                                    graphMetric === 'uptime' && `${data.value} Days Active`
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                                                lineNumber: 3417,
                                                                columnNumber: 29
                                                            }, void 0)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/admin/machine/page.tsx",
                                                        lineNumber: 3411,
                                                        columnNumber: 27
                                                    }, void 0);
                                                }
                                                return null;
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3407,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
                                            type: "monotone",
                                            dataKey: "value",
                                            stroke: "#3b82f6",
                                            strokeWidth: 2,
                                            dot: {
                                                fill: '#3b82f6',
                                                r: 4
                                            },
                                            activeDot: {
                                                r: 6
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/machine/page.tsx",
                                            lineNumber: 3430,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/machine/page.tsx",
                                    lineNumber: 3397,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 3396,
                                columnNumber: 17
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center text-gray-500 dark:text-gray-400 py-8",
                                children: "No data available"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/machine/page.tsx",
                                lineNumber: 3441,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/machine/page.tsx",
                            lineNumber: 3394,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/machine/page.tsx",
                    lineNumber: 3380,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/machine/page.tsx",
                lineNumber: 3379,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(MachineManagement, "lVhdFRDFAEF+WnZ0Z3pFASsGqXE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLanguage"]
    ];
});
_c = MachineManagement;
// Wrapper component with Suspense boundary for useSearchParams
function MachineManagementWrapper() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-screen",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"
            }, void 0, false, {
                fileName: "[project]/src/app/admin/machine/page.tsx",
                lineNumber: 3458,
                columnNumber: 9
            }, void 0)
        }, void 0, false, {
            fileName: "[project]/src/app/admin/machine/page.tsx",
            lineNumber: 3457,
            columnNumber: 7
        }, void 0),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MachineManagement, {}, void 0, false, {
            fileName: "[project]/src/app/admin/machine/page.tsx",
            lineNumber: 3461,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/admin/machine/page.tsx",
        lineNumber: 3456,
        columnNumber: 5
    }, this);
}
_c1 = MachineManagementWrapper;
const __TURBOPACK__default__export__ = MachineManagementWrapper;
var _c, _c1;
__turbopack_context__.k.register(_c, "MachineManagement");
__turbopack_context__.k.register(_c1, "MachineManagementWrapper");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_b53eedca._.js.map