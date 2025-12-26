module.exports = [
"[project]/src/lib/validation/phoneValidation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/src/lib/validation/emailValidation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/src/components/forms/FormInput.tsx [app-ssr] (ecmascript) <export default as FormInput>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FormInput",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/FormInput.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/components/forms/FormSelect.tsx [app-ssr] (ecmascript) <export default as FormSelect>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FormSelect",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/FormSelect.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/components/forms/FormActions.tsx [app-ssr] (ecmascript) <export default as FormActions>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FormActions",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormActions$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormActions$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/FormActions.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/components/forms/FormGrid.tsx [app-ssr] (ecmascript) <export default as FormGrid>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FormGrid",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormGrid$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormGrid$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/FormGrid.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/components/management/StatusMessage.tsx [app-ssr] (ecmascript) <export default as StatusMessage>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatusMessage",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatusMessage$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatusMessage$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/StatusMessage.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/components/management/ItemCard.tsx [app-ssr] (ecmascript) <export default as ItemCard>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ItemCard",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ItemCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ItemCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/ItemCard.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/components/management/EmptyState.tsx [app-ssr] (ecmascript) <export default as EmptyState>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmptyState",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$EmptyState$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$EmptyState$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/EmptyState.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/components/forms/ColumnSelectionModal.tsx [app-ssr] (ecmascript) <export default as ColumnSelectionModal>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ColumnSelectionModal",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$ColumnSelectionModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$ColumnSelectionModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/ColumnSelectionModal.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/components/management/BulkDeleteConfirmModal.tsx [app-ssr] (ecmascript) <export default as BulkDeleteConfirmModal>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BulkDeleteConfirmModal",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkDeleteConfirmModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkDeleteConfirmModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/BulkDeleteConfirmModal.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/components/management/ConfirmDeleteModal.tsx [app-ssr] (ecmascript) <export default as ConfirmDeleteModal>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConfirmDeleteModal",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ConfirmDeleteModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ConfirmDeleteModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/ConfirmDeleteModal.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/components/management/BulkActionsToolbar.tsx [app-ssr] (ecmascript) <export default as BulkActionsToolbar>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BulkActionsToolbar",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkActionsToolbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkActionsToolbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/BulkActionsToolbar.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/components/management/LoadingSnackbar.tsx [app-ssr] (ecmascript) <export default as LoadingSnackbar>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LoadingSnackbar",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$LoadingSnackbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$LoadingSnackbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/LoadingSnackbar.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/components/management/ViewModeToggle.tsx [app-ssr] (ecmascript) <export default as ViewModeToggle>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ViewModeToggle",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ViewModeToggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ViewModeToggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/ViewModeToggle.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/components/management/FilterDropdown.tsx [app-ssr] (ecmascript) <export default as FilterDropdown>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FilterDropdown",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FilterDropdown$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FilterDropdown$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/FilterDropdown.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/components/management/StatsGrid.tsx [app-ssr] (ecmascript) <export default as StatsGrid>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatsGrid",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatsGrid$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatsGrid$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/StatsGrid.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/components/management/ManagementPageHeader.tsx [app-ssr] (ecmascript) <export default as ManagementPageHeader>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ManagementPageHeader",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ManagementPageHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ManagementPageHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/ManagementPageHeader.tsx [app-ssr] (ecmascript)");
}),
"[project]/src/components/management/FloatingActionButton.tsx [app-ssr] (ecmascript) <export default as FloatingActionButton>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FloatingActionButton",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FloatingActionButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FloatingActionButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/management/FloatingActionButton.tsx [app-ssr] (ecmascript)");
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/worker_threads [external] (worker_threads, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("worker_threads", () => require("worker_threads"));

module.exports = mod;
}),
"[project]/src/lib/utils/downloadUtils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "downloadAsCSV",
    ()=>downloadAsCSV,
    "downloadAsPDF",
    ()=>downloadAsPDF,
    "downloadFarmersAsCSV",
    ()=>downloadFarmersAsCSV,
    "downloadFarmersAsPDF",
    ()=>downloadFarmersAsPDF,
    "formatCurrency",
    ()=>formatCurrency,
    "formatDate",
    ()=>formatDate,
    "formatStatus",
    ()=>formatStatus,
    "getFarmerColumns",
    ()=>getFarmerColumns
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf/dist/jspdf.node.min.js [app-ssr] (ecmascript)");
;
const downloadAsCSV = (data, columns, filename)=>{
    if (data.length === 0) {
        alert('No data to download');
        return;
    }
    // Create CSV headers
    const headers = columns.map((col)=>col.header);
    // Create CSV rows
    const csvRows = data.map((item)=>{
        return columns.map((col)=>{
            const value = item[col.key];
            const formattedValue = col.formatter ? col.formatter(value) : value;
            // Escape CSV values that contain commas or quotes
            const stringValue = String(formattedValue || '');
            return stringValue.includes(',') || stringValue.includes('"') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
        });
    });
    // Combine headers and rows
    const csvContent = [
        headers,
        ...csvRows
    ].map((row)=>row.join(',')).join('\n');
    // Create and download file
    const blob = new Blob([
        csvContent
    ], {
        type: 'text/csv;charset=utf-8;'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
const downloadAsPDF = async (data, columns, filename, title, additionalInfo)=>{
    if (data.length === 0) {
        alert('No data to download');
        return;
    }
    // Dynamically import jspdf-autotable and get the autoTable function
    const { default: autoTable } = await __turbopack_context__.A("[project]/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs [app-ssr] (ecmascript, async loader)");
    // Create new PDF document in landscape orientation
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]('landscape', 'pt', 'a4');
    // Modern color palette
    const colors = {
        primary: [
            41,
            128,
            185
        ],
        secondary: [
            52,
            73,
            94
        ],
        accent: [
            231,
            76,
            60
        ],
        light: [
            236,
            240,
            241
        ],
        text: [
            44,
            62,
            80
        ],
        border: [
            189,
            195,
            199
        ]
    };
    // Page dimensions and margins
    const pdfPageWidth = 842;
    const pdfPageHeight = 595;
    const margin = 50;
    const headerHeight = 130; // Increased for centered layout
    // Modern header background
    doc.setFillColor(...colors.light);
    doc.rect(0, 0, pdfPageWidth, headerHeight, 'F');
    // Header accent bar
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pdfPageWidth, 8, 'F');
    // Add logo in left top corner with proper aspect ratio
    try {
        const logoResponse = await fetch('/fulllogo.png');
        const logoBlob = await logoResponse.blob();
        const logoBase64 = await new Promise((resolve)=>{
            const reader = new FileReader();
            reader.onloadend = ()=>resolve(reader.result);
            reader.readAsDataURL(logoBlob);
        });
        // Logo positioned in left top corner with proper aspect ratio (don't stretch)
        const logoWidth = 120;
        const logoHeight = 40;
        doc.addImage(logoBase64, 'PNG', margin, 25, logoWidth, logoHeight);
    } catch (error) {
        console.warn('Could not load logo:', error);
    }
    // Modern title design with center alignment
    if (title) {
        doc.setTextColor(...colors.secondary);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        // Title centered below logo
        const titleY = 80;
        const titleWidth = doc.getTextWidth(title);
        const titleX = (pdfPageWidth - titleWidth) / 2;
        doc.text(title, titleX, titleY);
        // Subtitle/tagline area - also centered
        doc.setTextColor(...colors.text);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const subtitle = 'Comprehensive Farmer Management Report';
        const subtitleWidth = doc.getTextWidth(subtitle);
        const subtitleX = (pdfPageWidth - subtitleWidth) / 2;
        doc.text(subtitle, subtitleX, titleY + 20);
    }
    // Document metadata section with modern card-like design
    let yOffset = headerHeight + 30;
    if (additionalInfo && additionalInfo.length > 0) {
        // Info card background
        const cardHeight = additionalInfo.length * 18 + 25;
        doc.setFillColor(...colors.light);
        doc.setDrawColor(...colors.border);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, yOffset - 15, pdfPageWidth - margin * 2, cardHeight, 5, 5, 'FD');
        // Info header - centered
        doc.setTextColor(...colors.primary);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const headerText = 'Report Information';
        const headerWidth = doc.getTextWidth(headerText);
        const headerX = (pdfPageWidth - headerWidth) / 2;
        doc.text(headerText, headerX, yOffset + 5);
        // Info content with centered alignment
        doc.setTextColor(...colors.text);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        additionalInfo.forEach((info, index)=>{
            const infoY = yOffset + 25 + index * 18;
            // Center each info line
            const infoWidth = doc.getTextWidth(info);
            const infoX = (pdfPageWidth - infoWidth) / 2;
            // Add bullet point before centered text
            doc.setFillColor(...colors.primary);
            doc.circle(infoX - 15, infoY - 3, 2, 'F');
            // Add centered info text
            doc.text(info, infoX, infoY);
        });
        yOffset += cardHeight + 20;
    }
    // Prepare table data
    const tableHeaders = columns.map((col)=>col.header);
    const tableData = data.map((item)=>{
        return columns.map((col)=>{
            const value = item[col.key];
            const formattedValue = col.formatter ? col.formatter(value) : value;
            return String(formattedValue || '');
        });
    });
    // Calculate column widths
    const tableMargins = 100; // Left + right margins for table
    const availableWidth = pdfPageWidth - tableMargins;
    const columnWidths = columns.map((col)=>{
        if (col.width) return col.width;
        // Auto-calculate width based on header length and content
        const headerLength = col.header.length;
        const maxContentLength = Math.max(...tableData.map((row)=>{
            const cellIndex = columns.indexOf(col);
            return String(row[cellIndex] || '').length;
        }));
        const maxLength = Math.max(headerLength, maxContentLength);
        return Math.max(60, Math.min(150, maxLength * 6)); // 6 points per character
    });
    // Adjust widths to fit page
    const totalWidth = columnWidths.reduce((sum, width)=>sum + width, 0);
    if (totalWidth > availableWidth) {
        const scale = availableWidth / totalWidth;
        columnWidths.forEach((width, index)=>{
            columnWidths[index] = width * scale;
        });
    }
    // Modern table design
    autoTable(doc, {
        head: [
            tableHeaders
        ],
        body: tableData,
        startY: yOffset,
        margin: {
            left: margin,
            right: margin
        },
        columnStyles: columns.reduce((styles, col, index)=>{
            styles[index] = {
                cellWidth: columnWidths[index]
            };
            return styles;
        }, {}),
        styles: {
            fontSize: 9,
            cellPadding: {
                top: 8,
                right: 6,
                bottom: 8,
                left: 6
            },
            lineColor: colors.border,
            lineWidth: 0.5,
            textColor: colors.text,
            font: 'helvetica',
            overflow: 'linebreak',
            valign: 'middle',
            halign: 'center'
        },
        headStyles: {
            fillColor: colors.primary,
            textColor: [
                255,
                255,
                255
            ],
            fontStyle: 'bold',
            fontSize: 10,
            cellPadding: {
                top: 12,
                right: 8,
                bottom: 12,
                left: 8
            },
            halign: 'center',
            valign: 'middle'
        },
        alternateRowStyles: {
            fillColor: [
                249,
                250,
                251
            ]
        },
        tableLineColor: colors.border,
        tableLineWidth: 0.5
    });
    // Modern footer design
    const footerY = pdfPageHeight - 40;
    // Footer background bar
    doc.setFillColor(...colors.light);
    doc.rect(0, footerY - 10, pdfPageWidth, 50, 'F');
    // Footer accent line
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(2);
    doc.line(margin, footerY - 5, pdfPageWidth - margin, footerY - 5);
    // Footer content - all centered
    doc.setTextColor(...colors.text);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    // Generation info - centered
    const currentDate = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    const dateText = `Generated on: ${currentDate}`;
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, (pdfPageWidth - dateWidth) / 2, footerY + 10);
    // Company info - centered
    doc.setFont('helvetica', 'bold');
    const companyText = 'Poornasree Equipments Cloud • Page 1';
    const companyWidth = doc.getTextWidth(companyText);
    doc.text(companyText, (pdfPageWidth - companyWidth) / 2, footerY + 22);
    // Confidentiality notice - centered
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    const confidentialText = 'This document contains confidential information';
    const confidentialWidth = doc.getTextWidth(confidentialText);
    doc.text(confidentialText, (pdfPageWidth - confidentialWidth) / 2, footerY + 32);
    // Save the PDF
    doc.save(`${filename}.pdf`);
};
const formatDate = (dateString)=>{
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString('en-IN');
    } catch  {
        return '';
    }
};
const formatCurrency = (amount)=>{
    if (amount === null || amount === undefined) return '0';
    return amount.toLocaleString('en-IN');
};
const formatStatus = (status)=>{
    return status.charAt(0).toUpperCase() + status.slice(1);
};
const getFarmerColumns = ()=>[
        {
            key: 'farmerId',
            header: 'Farmer ID'
        },
        {
            key: 'rfId',
            header: 'RF-ID'
        },
        {
            key: 'farmerName',
            header: 'Farmer Name'
        },
        {
            key: 'contactNumber',
            header: 'Contact Number'
        },
        {
            key: 'email',
            header: 'Email'
        },
        {
            key: 'societyInfo',
            header: 'Society',
            formatter: (society)=>{
                const s = society;
                return s ? `${s.name} (${s.id})` : '';
            }
        },
        {
            key: 'status',
            header: 'Status',
            formatter: (status)=>formatStatus(status)
        },
        {
            key: 'smsEnabled',
            header: 'SMS Enabled',
            formatter: (value)=>value ? 'ON' : 'OFF'
        },
        {
            key: 'bonus',
            header: 'Bonus',
            formatter: (amount)=>formatCurrency(amount)
        },
        {
            key: 'address',
            header: 'Address'
        },
        {
            key: 'bankName',
            header: 'Bank Name'
        },
        {
            key: 'bankAccountNumber',
            header: 'Account Number'
        },
        {
            key: 'ifscCode',
            header: 'IFSC Code'
        },
        {
            key: 'notes',
            header: 'Notes'
        }
    ];
const downloadFarmersAsCSV = (farmers, societies, filters = {}, selectedColumns)=>{
    const getSocietyInfo = (societyId)=>{
        if (!societyId) return {
            name: '',
            id: ''
        };
        const society = societies.find((s)=>s.id.toString() === societyId.toString());
        return society ? {
            name: society.name,
            id: society.society_id
        } : {
            name: '',
            id: ''
        };
    };
    // Get all available columns
    const allColumns = getFarmerColumns();
    // Use selected columns or default to all columns
    const columns = selectedColumns && selectedColumns.length > 0 ? allColumns.filter((col)=>selectedColumns.includes(col.key)) : allColumns;
    const processedData = farmers.map((farmer)=>({
            farmerId: farmer.farmerId || '',
            rfId: farmer.rfId || '',
            farmerName: farmer.farmerName || '',
            contactNumber: farmer.contactNumber || '',
            email: farmer.email || '',
            societyInfo: getSocietyInfo(farmer.societyId),
            status: farmer.status || 'active',
            smsEnabled: farmer.smsEnabled,
            bonus: farmer.bonus || 0,
            address: farmer.address || '',
            bankName: farmer.bankName || '',
            bankAccountNumber: farmer.bankAccountNumber || '',
            ifscCode: farmer.ifscCode || '',
            notes: farmer.notes || ''
        }));
    const filterSuffix = getFilterSuffix(filters);
    const filename = `farmers_export${filterSuffix}_${new Date().toISOString().split('T')[0]}`;
    downloadAsCSV(processedData, columns, filename);
};
const downloadFarmersAsPDF = async (farmers, societies, filters = {}, selectedColumns)=>{
    const getSocietyInfo = (societyId)=>{
        if (!societyId) return {
            name: '',
            id: ''
        };
        const society = societies.find((s)=>s.id.toString() === societyId.toString());
        return society ? {
            name: society.name,
            id: society.society_id
        } : {
            name: '',
            id: ''
        };
    };
    // Define all columns with PDF-specific configurations (widths optimized for landscape)
    const allColumns = [
        {
            key: 'farmerId',
            header: 'ID',
            width: 60
        },
        {
            key: 'rfId',
            header: 'RF-ID',
            width: 60
        },
        {
            key: 'farmerName',
            header: 'Name',
            width: 120
        },
        {
            key: 'contactNumber',
            header: 'Contact',
            width: 80
        },
        {
            key: 'email',
            header: 'Email',
            width: 80
        },
        {
            key: 'societyInfo',
            header: 'Society',
            width: 120,
            formatter: (society)=>{
                const s = society;
                return s ? `${s.name}` : '';
            }
        },
        {
            key: 'status',
            header: 'Status',
            width: 60,
            formatter: (status)=>formatStatus(status)
        },
        {
            key: 'smsEnabled',
            header: 'SMS',
            width: 40,
            formatter: (value)=>value ? 'ON' : 'OFF'
        },
        {
            key: 'bonus',
            header: 'Bonus',
            width: 60,
            formatter: (amount)=>formatCurrency(amount)
        },
        {
            key: 'address',
            header: 'Address',
            width: 100
        },
        {
            key: 'bankName',
            header: 'Bank',
            width: 80
        },
        {
            key: 'bankAccountNumber',
            header: 'Account',
            width: 80
        },
        {
            key: 'ifscCode',
            header: 'IFSC',
            width: 60
        },
        {
            key: 'notes',
            header: 'Notes',
            width: 80
        }
    ];
    // Use selected columns or default to essential columns for PDF
    const defaultPDFColumns = [
        'farmerId',
        'rfId',
        'farmerName',
        'contactNumber',
        'societyInfo',
        'status',
        'smsEnabled',
        'bonus'
    ];
    const columns = selectedColumns && selectedColumns.length > 0 ? allColumns.filter((col)=>selectedColumns.includes(col.key)) : allColumns.filter((col)=>defaultPDFColumns.includes(col.key));
    const processedData = farmers.map((farmer)=>({
            farmerId: farmer.farmerId || '',
            rfId: farmer.rfId || '',
            farmerName: farmer.farmerName || '',
            contactNumber: farmer.contactNumber || '',
            email: farmer.email || '',
            societyInfo: getSocietyInfo(farmer.societyId),
            status: farmer.status || 'active',
            smsEnabled: farmer.smsEnabled,
            bonus: farmer.bonus || 0,
            address: farmer.address || '',
            bankName: farmer.bankName || '',
            bankAccountNumber: farmer.bankAccountNumber || '',
            ifscCode: farmer.ifscCode || '',
            notes: farmer.notes || ''
        }));
    const filterSuffix = getFilterSuffix(filters);
    const filterText = getFilterText(filters, societies);
    const title = 'Farmers Report';
    const additionalInfo = [
        `Generated on: ${new Date().toLocaleString()}`,
        `Total Records: ${farmers.length}`,
        ...filterText ? [
            filterText
        ] : []
    ];
    const filename = `farmers_report${filterSuffix}_${new Date().toISOString().split('T')[0]}`;
    await downloadAsPDF(processedData, columns, filename, title, additionalInfo);
};
// Helper functions for filters
const getFilterSuffix = (filters)=>{
    const parts = [];
    if (filters.status && filters.status !== 'all') {
        parts.push(filters.status);
    }
    if (filters.society && filters.society !== 'all') {
        parts.push('society_filtered');
    }
    if (filters.selection) {
        parts.push(filters.selection);
    }
    return parts.length > 0 ? `_${parts.join('_')}` : '';
};
const getFilterText = (filters, societies)=>{
    const parts = [];
    if (filters.status && filters.status !== 'all') {
        parts.push(`Status: ${formatStatus(filters.status)}`);
    }
    if (filters.society && filters.society !== 'all') {
        const society = societies.find((s)=>s.id.toString() === filters.society);
        if (society) {
            parts.push(`Society: ${society.name} (${society.society_id})`);
        }
    }
    if (filters.selection) {
        parts.push(`Selection: ${filters.selection.replace('-', ' ')}`);
    }
    return parts.length > 0 ? `Filters Applied: ${parts.join(', ')}` : '';
};
}),
"[project]/src/app/admin/farmer/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/LanguageContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-check.js [app-ssr] (ecmascript) <export default as UserCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone.js [app-ssr] (ecmascript) <export default as Phone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.js [app-ssr] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building-2.js [app-ssr] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder.js [app-ssr] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder-open.js [app-ssr] (ecmascript) <export default as FolderOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-ssr] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/droplets.js [app-ssr] (ecmascript) <export default as Droplets>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-ssr] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/award.js [app-ssr] (ecmascript) <export default as Award>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-ssr] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/LineChart.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Line.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$phoneValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/phoneValidation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$emailValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/emailValidation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$loading$2f$FlowerSpinner$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FlowerSpinner$3e$__ = __turbopack_context__.i("[project]/src/components/loading/FlowerSpinner.tsx [app-ssr] (ecmascript) <export default as FlowerSpinner>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormModal$3e$__ = __turbopack_context__.i("[project]/src/components/forms/FormModal.tsx [app-ssr] (ecmascript) <export default as FormModal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__ = __turbopack_context__.i("[project]/src/components/forms/FormInput.tsx [app-ssr] (ecmascript) <export default as FormInput>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__ = __turbopack_context__.i("[project]/src/components/forms/FormSelect.tsx [app-ssr] (ecmascript) <export default as FormSelect>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormActions$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormActions$3e$__ = __turbopack_context__.i("[project]/src/components/forms/FormActions.tsx [app-ssr] (ecmascript) <export default as FormActions>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormGrid$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormGrid$3e$__ = __turbopack_context__.i("[project]/src/components/forms/FormGrid.tsx [app-ssr] (ecmascript) <export default as FormGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatusMessage$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__StatusMessage$3e$__ = __turbopack_context__.i("[project]/src/components/management/StatusMessage.tsx [app-ssr] (ecmascript) <export default as StatusMessage>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ItemCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ItemCard$3e$__ = __turbopack_context__.i("[project]/src/components/management/ItemCard.tsx [app-ssr] (ecmascript) <export default as ItemCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$EmptyState$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EmptyState$3e$__ = __turbopack_context__.i("[project]/src/components/management/EmptyState.tsx [app-ssr] (ecmascript) <export default as EmptyState>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$ColumnSelectionModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ColumnSelectionModal$3e$__ = __turbopack_context__.i("[project]/src/components/forms/ColumnSelectionModal.tsx [app-ssr] (ecmascript) <export default as ColumnSelectionModal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/management/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkDeleteConfirmModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BulkDeleteConfirmModal$3e$__ = __turbopack_context__.i("[project]/src/components/management/BulkDeleteConfirmModal.tsx [app-ssr] (ecmascript) <export default as BulkDeleteConfirmModal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ConfirmDeleteModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ConfirmDeleteModal$3e$__ = __turbopack_context__.i("[project]/src/components/management/ConfirmDeleteModal.tsx [app-ssr] (ecmascript) <export default as ConfirmDeleteModal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkActionsToolbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BulkActionsToolbar$3e$__ = __turbopack_context__.i("[project]/src/components/management/BulkActionsToolbar.tsx [app-ssr] (ecmascript) <export default as BulkActionsToolbar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$LoadingSnackbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LoadingSnackbar$3e$__ = __turbopack_context__.i("[project]/src/components/management/LoadingSnackbar.tsx [app-ssr] (ecmascript) <export default as LoadingSnackbar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ViewModeToggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ViewModeToggle$3e$__ = __turbopack_context__.i("[project]/src/components/management/ViewModeToggle.tsx [app-ssr] (ecmascript) <export default as ViewModeToggle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FilterDropdown$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FilterDropdown$3e$__ = __turbopack_context__.i("[project]/src/components/management/FilterDropdown.tsx [app-ssr] (ecmascript) <export default as FilterDropdown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatsGrid$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__StatsGrid$3e$__ = __turbopack_context__.i("[project]/src/components/management/StatsGrid.tsx [app-ssr] (ecmascript) <export default as StatsGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ManagementPageHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ManagementPageHeader$3e$__ = __turbopack_context__.i("[project]/src/components/management/ManagementPageHeader.tsx [app-ssr] (ecmascript) <export default as ManagementPageHeader>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FloatingActionButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FloatingActionButton$3e$__ = __turbopack_context__.i("[project]/src/components/management/FloatingActionButton.tsx [app-ssr] (ecmascript) <export default as FloatingActionButton>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$CSVUploadModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/CSVUploadModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$downloadUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils/downloadUtils.ts [app-ssr] (ecmascript)");
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
const FarmerManagement = ()=>{
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLanguage"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const [farmers, setFarmers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [societies, setSocieties] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [machines, setMachines] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [dairies, setDairies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [bmcs, setBmcs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [machinesLoading, setMachinesLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('all');
    const [dairyFilter, setDairyFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [bmcFilter, setBmcFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [societyFilter, setSocietyFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [machineFilter, setMachineFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [showAddForm, setShowAddForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showEditForm, setShowEditForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showBulkModal, setShowBulkModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showCSVUpload, setShowCSVUpload] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedFarmer, setSelectedFarmer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedFile, setSelectedFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [bulkSocietyId, setBulkSocietyId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [fieldErrors, setFieldErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    // Selective deletion state
    const [selectedFarmers, setSelectedFarmers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [selectAll, setSelectAll] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [farmerToDelete, setFarmerToDelete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showSingleDeleteConfirm, setShowSingleDeleteConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isDownloading, setIsDownloading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isDeletingBulk, setIsDeletingBulk] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showColumnSelection, setShowColumnSelection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isBulkUpdatingStatus, setIsBulkUpdatingStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [updateProgress, setUpdateProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    // Folder view state
    const [expandedSocieties, setExpandedSocieties] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [viewMode, setViewMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('folder');
    const [selectedSocieties, setSelectedSocieties] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    // Graph modal state
    const [showGraphModal, setShowGraphModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [graphMetric, setGraphMetric] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('quantity');
    const [graphData, setGraphData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    // Bulk status update state
    const [bulkStatus, setBulkStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('active');
    const [performanceStats, setPerformanceStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        topCollector: null,
        bestFat: null,
        bestSnf: null,
        topRevenue: null,
        mostActive: null,
        bestQuality: null
    });
    // Form state
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        farmerId: '',
        rfId: '',
        farmerName: '',
        contactNumber: '',
        email: '',
        smsEnabled: 'OFF',
        emailNotificationsEnabled: 'ON',
        bonus: 0,
        address: '',
        bankName: '',
        bankAccountNumber: '',
        ifscCode: '',
        societyId: '',
        machineId: '',
        status: 'active',
        notes: ''
    });
    // Fetch farmers, societies, and machines
    // Clear messages after 5 seconds
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (success || error) {
            const timer = setTimeout(()=>{
                setSuccess('');
                setError('');
            }, 5000);
            return ()=>clearTimeout(timer);
        }
    }, [
        success,
        error
    ]);
    // Listen for global search events from header
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleGlobalSearch = (event)=>{
            const customEvent = event;
            const query = customEvent.detail?.query || '';
            setSearchQuery(query);
        };
        window.addEventListener('globalSearch', handleGlobalSearch);
        return ()=>{
            window.removeEventListener('globalSearch', handleGlobalSearch);
        };
    }, []);
    // Reset machine filter when society filter changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (societyFilter.length > 0 && machineFilter.length > 0) {
            // Check if current machine selections are still valid for the selected society
            const validMachines = machineFilter.filter((mId)=>{
                const machine = machines.find((m)=>m.id.toString() === mId);
                return machine && societyFilter.includes(machine.societyId?.toString() || '');
            });
            if (validMachines.length !== machineFilter.length) {
                setMachineFilter(validMachines);
            }
        }
    }, [
        societyFilter,
        machineFilter,
        machines
    ]);
    // Read URL parameters and initialize filters on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const societyId = searchParams.get('societyId');
        const societyName = searchParams.get('societyName');
        const dairyFilterParam = searchParams.get('dairyFilter');
        const bmcFilterParam = searchParams.get('bmcFilter');
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
        if (bmcFilterParam && !bmcFilter.includes(bmcFilterParam)) {
            setBmcFilter([
                bmcFilterParam
            ]);
            setSuccess('Filter Applied: BMC');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount
    const fetchFarmers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                router.push('/login');
                return;
            }
            const response = await fetch('/api/user/farmer', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                router.push('/login');
                return;
            }
            if (response.ok) {
                const data = await response.json();
                setFarmers(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching farmers:', error);
        } finally{
            setLoading(false);
        }
    }, [
        router
    ]);
    const fetchPerformanceStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/analytics/farmer-performance', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setPerformanceStats(data.stats || {
                    topCollector: null,
                    bestFat: null,
                    bestSnf: null,
                    topRevenue: null,
                    mostActive: null,
                    bestQuality: null
                });
            }
        } catch (error) {
            console.error('Error fetching performance stats:', error);
        }
    }, []);
    const fetchGraphData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (metric)=>{
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/analytics/farmer-performance?graphData=true`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                const allFarmers = data.farmers || [];
                const chartData = allFarmers.map((farmer)=>({
                        name: farmer.farmer_name,
                        farmerId: farmer.farmer_id,
                        societyName: farmer.society_name,
                        value: metric === 'quantity' ? parseFloat(farmer.total_quantity) || 0 : metric === 'revenue' ? parseFloat(farmer.total_amount) || 0 : metric === 'fat' ? parseFloat(farmer.avg_fat) || 0 : metric === 'snf' ? parseFloat(farmer.avg_snf) || 0 : metric === 'collections' ? parseInt(farmer.total_collections) || 0 : parseFloat(farmer.avg_rate) || 0
                    })).sort((a, b)=>b.value - a.value).slice(0, 20); // Top 20 farmers
                setGraphData(chartData);
            }
        } catch (error) {
            console.error('Error fetching graph data:', error);
            setGraphData([]);
        }
    }, []);
    const handleCardClick = (metric)=>{
        setGraphMetric(metric);
        fetchGraphData(metric);
        setShowGraphModal(true);
    };
    const fetchSocieties = async ()=>{
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/user/society', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSocieties(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching societies:', error);
        }
    };
    // Fetch dairies
    const fetchDairies = async ()=>{
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/user/dairy', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setDairies(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching dairies:', error);
        }
    };
    // Fetch BMCs
    const fetchBmcs = async ()=>{
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/user/bmc', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setBmcs(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching BMCs:', error);
        }
    };
    // Fetch all machines
    const fetchAllMachines = async ()=>{
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/user/machine', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMachines(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching machines:', error);
            setMachines([]);
        }
    };
    // Fetch machines by society ID
    const fetchMachinesBySociety = async (societyId)=>{
        if (!societyId) {
            setMachines([]);
            return;
        }
        try {
            setMachinesLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/user/machine/by-society?societyId=${societyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMachines(data.data || []);
            } else {
                setMachines([]);
            }
        } catch (error) {
            console.error('Error fetching machines:', error);
            setMachines([]);
        } finally{
            setMachinesLoading(false);
        }
    };
    // Handle status change
    const handleStatusChange = async (id, newStatus)=>{
        setIsUpdatingStatus(true);
        setUpdateProgress(0);
        try {
            const farmer = farmers.find((f)=>f.id === id);
            if (!farmer) return;
            setUpdateProgress(30);
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/user/farmer', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: farmer.id,
                    farmerId: farmer.farmerId,
                    rfId: farmer.rfId,
                    farmerName: farmer.farmerName,
                    contactNumber: farmer.contactNumber,
                    smsEnabled: farmer.smsEnabled,
                    emailNotificationsEnabled: farmer.emailNotificationsEnabled || 'ON',
                    bonus: farmer.bonus,
                    address: farmer.address,
                    bankName: farmer.bankName,
                    bankAccountNumber: farmer.bankAccountNumber,
                    ifscCode: farmer.ifscCode,
                    societyId: farmer.societyId,
                    machineId: farmer.machineId,
                    status: newStatus,
                    notes: farmer.notes
                })
            });
            setUpdateProgress(70);
            if (response.ok) {
                setFarmers((prev)=>prev.map((f)=>f.id === id ? {
                            ...f,
                            status: newStatus
                        } : f));
                setUpdateProgress(100);
                setSuccess('Farmer status updated successfully');
                setError('');
            } else {
                setError('Failed to update farmer status');
                setSuccess('');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setError('Error updating farmer status');
            setSuccess('');
        } finally{
            setIsUpdatingStatus(false);
        }
    };
    // Handle farmer deletion - show confirmation
    const handleDelete = (id)=>{
        const farmer = farmers.find((f)=>f.id === id);
        if (farmer) {
            setFarmerToDelete({
                id: farmer.id,
                name: farmer.farmerName,
                farmerId: farmer.farmerId
            });
            setShowSingleDeleteConfirm(true);
        }
    };
    // Confirm single farmer deletion
    const confirmDeleteFarmer = async ()=>{
        if (!farmerToDelete) return;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/user/farmer?id=${farmerToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                setFarmers((prev)=>prev.filter((f)=>f.id !== farmerToDelete.id));
                setSuccess(t.farmerManagement.deletedSuccessfully || 'Farmer deleted successfully');
                setError('');
            } else {
                setError(t.farmerManagement.deleteError || 'Failed to delete farmer. Please try again.');
                setSuccess('');
            }
        } catch (error) {
            console.error('Error deleting farmer:', error);
            setError(t.farmerManagement.deleteError || 'Error deleting farmer. Please try again.');
            setSuccess('');
        } finally{
            setShowSingleDeleteConfirm(false);
            setFarmerToDelete(null);
        }
    };
    // Selection handlers
    const handleSelectFarmer = (farmerId)=>{
        setSelectedFarmers((prev)=>{
            const newSelected = new Set(prev);
            const isDeselecting = newSelected.has(farmerId);
            if (isDeselecting) {
                newSelected.delete(farmerId);
                // When deselecting a farmer, uncheck selectAll
                setSelectAll(false);
                // Check if we should deselect the society folder
                const farmer = filteredFarmers.find((f)=>f.id === farmerId);
                if (farmer && farmer.societyId) {
                    const societyId = farmer.societyId;
                    const societyFarmers = filteredFarmers.filter((f)=>f.societyId === societyId);
                    const allSocietyFarmersSelected = societyFarmers.every((f)=>f.id === farmerId ? false : newSelected.has(f.id));
                    // If not all farmers in the society are selected, deselect the society folder
                    if (!allSocietyFarmersSelected) {
                        setSelectedSocieties((prevSocieties)=>{
                            const updatedSocieties = new Set(prevSocieties);
                            updatedSocieties.delete(societyId);
                            return updatedSocieties;
                        });
                    }
                }
            } else {
                newSelected.add(farmerId);
                // Check if the society folder should be selected
                const farmer = filteredFarmers.find((f)=>f.id === farmerId);
                if (farmer && farmer.societyId) {
                    const societyId = farmer.societyId;
                    const societyFarmers = filteredFarmers.filter((f)=>f.societyId === societyId);
                    const allSocietyFarmersSelected = societyFarmers.every((f)=>f.id === farmerId ? true : newSelected.has(f.id));
                    // If all farmers in the society are now selected, select the society folder
                    if (allSocietyFarmersSelected) {
                        setSelectedSocieties((prevSocieties)=>{
                            const updatedSocieties = new Set(prevSocieties);
                            updatedSocieties.add(societyId);
                            return updatedSocieties;
                        });
                    }
                }
                // Check if all filtered farmers are now selected
                const allFilteredIds = new Set(filteredFarmers.map((f)=>f.id));
                const allSelected = Array.from(allFilteredIds).every((id)=>id === farmerId ? true : newSelected.has(id));
                if (allSelected) {
                    setSelectAll(true);
                }
            }
            return newSelected;
        });
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
    // Toggle society selection
    const toggleSocietySelection = (societyId, farmerIds)=>{
        setSelectedSocieties((prev)=>{
            const newSelected = new Set(prev);
            if (newSelected.has(societyId)) {
                // Deselect society and all its farmers
                newSelected.delete(societyId);
                setSelectedFarmers((prevFarmers)=>{
                    const updatedFarmers = new Set(prevFarmers);
                    farmerIds.forEach((id)=>updatedFarmers.delete(id));
                    // Check if we should unset selectAll
                    // If any farmer is deselected, selectAll should be false
                    setSelectAll(false);
                    return updatedFarmers;
                });
            } else {
                // Select society and all its farmers
                newSelected.add(societyId);
                setSelectedFarmers((prevFarmers)=>{
                    const updatedFarmers = new Set(prevFarmers);
                    farmerIds.forEach((id)=>updatedFarmers.add(id));
                    // Check if all filtered farmers are now selected
                    const allFilteredIds = new Set(filteredFarmers.map((f)=>f.id));
                    const allSelected = Array.from(allFilteredIds).every((id)=>updatedFarmers.has(id));
                    if (allSelected) {
                        setSelectAll(true);
                    }
                    return updatedFarmers;
                });
            }
            return newSelected;
        });
    };
    const handleSelectAll = ()=>{
        if (selectAll) {
            setSelectedFarmers(new Set());
            setSelectedSocieties(new Set());
            setSelectAll(false);
        } else {
            // Select only the currently filtered farmers
            setSelectedFarmers(new Set(filteredFarmers.map((f)=>f.id)));
            // Also select all societies that have farmers in the filtered list
            const farmersBySociety = filteredFarmers.reduce((acc, farmer)=>{
                const societyId = farmer.societyId || 0;
                if (!acc.includes(societyId)) {
                    acc.push(societyId);
                }
                return acc;
            }, []);
            setSelectedSocieties(new Set(farmersBySociety));
            setSelectAll(true);
        }
    };
    // Clear selections when filters or search change or keep only visible farmers
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (selectedFarmers.size > 0) {
            // Calculate filtered farmers inline to avoid dependency issues
            const currentlyFilteredFarmers = farmers.filter((farmer)=>{
                const statusMatch = statusFilter === 'all' || farmer.status === statusFilter;
                const societyMatch = societyFilter.length === 0 || societyFilter.includes(farmer.societyId?.toString() || '');
                const machineMatch = machineFilter.length === 0 || machineFilter.includes(farmer.machineId?.toString() || '');
                const searchMatch = searchQuery === '' || farmer.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.farmerId.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.contactNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.rfId?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.societyName?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.societyIdentifier?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.address?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.bankName?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.bankAccountNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.ifscCode?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.notes?.toLowerCase().includes(searchQuery.toLowerCase());
                return statusMatch && societyMatch && machineMatch && searchMatch;
            });
            // Keep only farmers that are still visible after filtering/searching
            const visibleFarmerIds = new Set(currentlyFilteredFarmers.map((f)=>f.id));
            const updatedSelection = new Set(Array.from(selectedFarmers).filter((id)=>visibleFarmerIds.has(id)));
            if (updatedSelection.size !== selectedFarmers.size) {
                setSelectedFarmers(updatedSelection);
                setSelectAll(false);
                // Update society selections based on remaining selected farmers
                const visibleSocietyIds = new Set(currentlyFilteredFarmers.map((f)=>f.societyId).filter(Boolean));
                const updatedSocietySelection = new Set();
                visibleSocietyIds.forEach((societyId)=>{
                    const societyFarmers = currentlyFilteredFarmers.filter((f)=>f.societyId === societyId);
                    const allSocietyFarmersSelected = societyFarmers.every((f)=>updatedSelection.has(f.id));
                    if (allSocietyFarmersSelected && societyFarmers.length > 0) {
                        updatedSocietySelection.add(societyId);
                    }
                });
                setSelectedSocieties(updatedSocietySelection);
            }
        } else {
            setSelectAll(false);
            setSelectedSocieties(new Set());
        }
    }, [
        statusFilter,
        societyFilter,
        machineFilter,
        searchQuery,
        farmers,
        selectedFarmers
    ]);
    const handleBulkDelete = async ()=>{
        if (selectedFarmers.size === 0) return;
        // Close the confirmation modal immediately and show LoadingSnackbar
        setShowDeleteConfirm(false);
        setIsDeletingBulk(true);
        setUpdateProgress(0);
        try {
            const token = localStorage.getItem('authToken');
            setUpdateProgress(10);
            const ids = Array.from(selectedFarmers);
            setUpdateProgress(20);
            const response = await fetch(`/api/user/farmer?ids=${encodeURIComponent(JSON.stringify(ids))}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUpdateProgress(60);
            if (response.ok) {
                setUpdateProgress(80);
                await fetchFarmers(); // Refresh the list
                setUpdateProgress(95);
                setSelectedFarmers(new Set());
                setSelectAll(false);
                setSuccess(`Successfully deleted ${ids.length} farmer(s)${statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0 || machineFilter.length > 0 ? ' from filtered results' : ''}`);
                setSocietyFilter([]);
                setError('');
                setUpdateProgress(100);
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete selected farmers');
                setSuccess('');
            }
        } catch (error) {
            console.error('Error deleting farmers:', error);
            setError('Error deleting selected farmers');
            setSuccess('');
        } finally{
            setIsDeletingBulk(false);
            setUpdateProgress(0);
        }
    };
    // Handle bulk status update
    const handleBulkStatusUpdate = async (newStatus)=>{
        if (selectedFarmers.size === 0) return;
        const statusToUpdate = newStatus || bulkStatus;
        setIsBulkUpdatingStatus(true);
        setUpdateProgress(0);
        try {
            // Step 1: Get token (5%)
            const token = localStorage.getItem('authToken');
            setUpdateProgress(5);
            // Step 2: Prepare farmer IDs (10%)
            const farmerIds = Array.from(selectedFarmers);
            const totalFarmers = farmerIds.length;
            setUpdateProgress(10);
            console.log(`🔄 Bulk updating ${totalFarmers} farmers to status: ${statusToUpdate}`);
            // Step 3: Single bulk update API call (10% to 90%)
            setUpdateProgress(30);
            const response = await fetch('/api/user/farmer', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    bulkStatusUpdate: true,
                    farmerIds: farmerIds,
                    status: statusToUpdate
                })
            });
            setUpdateProgress(70);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update farmer status');
            }
            const result = await response.json();
            const updatedCount = result.data?.updated || totalFarmers;
            // Step 4: Refresh data (90%)
            setUpdateProgress(90);
            await fetchFarmers();
            // Step 5: Finalize (100%)
            setUpdateProgress(100);
            setSelectedFarmers(new Set());
            setSelectedSocieties(new Set());
            setSelectAll(false);
            console.log(`✅ Successfully updated ${updatedCount} farmers`);
            setSuccess(`Successfully updated status to "${statusToUpdate}" for ${updatedCount} farmer(s)${statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0 ? ' from filtered results' : ''}`);
            setError('');
        } catch (error) {
            console.error('Error updating farmer status:', error);
            setUpdateProgress(100);
            setError(error instanceof Error ? error.message : 'Error updating farmer status. Please try again.');
            setSuccess('');
        } finally{
            setIsBulkUpdatingStatus(false);
        }
    };
    // Handle bulk download for selected farmers
    const handleBulkDownload = ()=>{
        if (selectedFarmers.size === 0) {
            setError('No farmers selected');
            return;
        }
        handleOpenColumnSelection();
    };
    // Handle opening column selection modal
    const handleOpenColumnSelection = ()=>{
        setShowColumnSelection(true);
    };
    // Handle download with selected columns
    const handleDownloadWithColumns = async (selectedColumns, format)=>{
        setIsDownloading(true);
        try {
            // If farmers are selected, download only selected farmers (that are also filtered)
            // If no farmers are selected, download all filtered farmers
            const farmersForDownload = selectedFarmers.size > 0 ? filteredFarmers.filter((farmer)=>selectedFarmers.has(farmer.id)) : filteredFarmers;
            const farmersToDownload = farmersForDownload.map((farmer)=>({
                    farmerId: farmer.farmerId,
                    rfId: farmer.rfId,
                    farmerName: farmer.farmerName,
                    contactNumber: farmer.contactNumber,
                    email: farmer.contactNumber,
                    societyId: farmer.societyId,
                    address: farmer.address,
                    notes: farmer.notes,
                    status: farmer.status,
                    smsEnabled: farmer.smsEnabled === 'ON',
                    bonus: farmer.bonus,
                    bankName: farmer.bankName,
                    bankAccountNumber: farmer.bankAccountNumber,
                    ifscCode: farmer.ifscCode
                }));
            const societiesData = societies.map((society)=>({
                    id: society.id,
                    name: society.name,
                    society_id: society.society_id
                }));
            const filters = {
                status: statusFilter !== 'all' ? statusFilter : undefined,
                society: societyFilter.length > 0 ? societyFilter[0] : undefined,
                selection: selectedFarmers.size > 0 ? `${selectedFarmers.size}-selected` : undefined
            };
            const downloadMessage = selectedFarmers.size > 0 ? `${selectedFarmers.size} selected farmer(s) downloaded successfully` : `${farmersToDownload.length} farmer(s) downloaded successfully`;
            if (format === 'csv') {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$downloadUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["downloadFarmersAsCSV"])(farmersToDownload, societiesData, filters, selectedColumns);
                setSuccess(`${downloadMessage} as CSV`);
            } else {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$downloadUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["downloadFarmersAsPDF"])(farmersToDownload, societiesData, filters, selectedColumns);
                setSuccess(`${downloadMessage} as PDF`);
            }
        } catch (error) {
            console.error(`Error downloading ${format.toUpperCase()}:`, error);
            setError(`Failed to download ${format.toUpperCase()} file`);
        } finally{
            setIsDownloading(false);
        }
    };
    // Handle add form submission
    const handleAddSubmit = async (e)=>{
        e.preventDefault();
        // Validate required fields
        if (!formData.farmerId || !formData.farmerId.trim()) {
            setError('Please enter a farmer ID.');
            setSuccess('');
            return;
        }
        if (!formData.farmerName || !formData.farmerName.trim()) {
            setError('Please enter the farmer name.');
            setSuccess('');
            return;
        }
        if (!formData.societyId) {
            setError('Please select a society for the farmer.');
            setSuccess('');
            return;
        }
        if (!formData.machineId) {
            setError('Please select a machine for the farmer.');
            setSuccess('');
            return;
        }
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/user/farmer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    societyId: formData.societyId ? parseInt(formData.societyId) : null,
                    bonus: Number(formData.bonus)
                })
            });
            if (response.ok) {
                setShowAddForm(false);
                setFormData({
                    farmerId: '',
                    rfId: '',
                    farmerName: '',
                    contactNumber: '',
                    email: '',
                    smsEnabled: 'OFF',
                    emailNotificationsEnabled: 'ON',
                    bonus: 0,
                    address: '',
                    bankName: '',
                    bankAccountNumber: '',
                    ifscCode: '',
                    societyId: '',
                    machineId: '',
                    status: 'active',
                    notes: ''
                });
                setSuccess('Farmer created successfully');
                setError('');
                fetchFarmers();
            } else {
                const errorResponse = await response.json();
                const errorMessage = errorResponse.error || errorResponse.message || 'Failed to create farmer';
                // Clear previous field errors
                setFieldErrors({});
                // Check for specific field errors
                if (errorMessage.toLowerCase().includes('farmer id') && errorMessage.toLowerCase().includes('already exists')) {
                    setFieldErrors({
                        farmerId: 'This Farmer ID already exists'
                    });
                } else if (errorMessage.toLowerCase().includes('farmer name') && errorMessage.toLowerCase().includes('already exists')) {
                    setFieldErrors({
                        farmerName: 'This Farmer name already exists'
                    });
                } else if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('already exists')) {
                    setFieldErrors({
                        email: 'This email address already exists'
                    });
                } else {
                    setError(errorMessage);
                }
                setSuccess('');
            }
        } catch (error) {
            console.error('Error creating farmer:', error);
            setError('Error creating farmer. Please try again.');
            setSuccess('');
        } finally{
            setIsSubmitting(false);
        }
    };
    // Handle edit form submission
    const handleEditSubmit = async (e)=>{
        e.preventDefault();
        if (!selectedFarmer) return;
        // Validate required fields
        if (!formData.farmerId || !formData.farmerId.trim()) {
            setError('Please enter a farmer ID.');
            setSuccess('');
            return;
        }
        if (!formData.farmerName || !formData.farmerName.trim()) {
            setError('Please enter the farmer name.');
            setSuccess('');
            return;
        }
        if (!formData.societyId) {
            setError('Please select a society for the farmer.');
            setSuccess('');
            return;
        }
        if (!formData.machineId) {
            setError('Please select a machine for the farmer.');
            setSuccess('');
            return;
        }
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/user/farmer', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: selectedFarmer.id,
                    ...formData,
                    societyId: formData.societyId ? parseInt(formData.societyId) : null,
                    bonus: Number(formData.bonus)
                })
            });
            if (response.ok) {
                setShowEditForm(false);
                setSelectedFarmer(null);
                setFormData({
                    farmerId: '',
                    rfId: '',
                    farmerName: '',
                    contactNumber: '',
                    email: '',
                    smsEnabled: 'OFF',
                    emailNotificationsEnabled: 'ON',
                    bonus: 0,
                    address: '',
                    bankName: '',
                    bankAccountNumber: '',
                    ifscCode: '',
                    societyId: '',
                    machineId: '',
                    status: 'active',
                    notes: ''
                });
                setSuccess('Farmer updated successfully');
                setError('');
                fetchFarmers();
            } else {
                const errorResponse = await response.json();
                const errorMessage = errorResponse.error || errorResponse.message || 'Failed to update farmer';
                // Clear previous field errors
                setFieldErrors({});
                // Check for specific field errors
                if (errorMessage.toLowerCase().includes('farmer id') && errorMessage.toLowerCase().includes('already exists')) {
                    setFieldErrors({
                        farmerId: 'This Farmer ID already exists'
                    });
                } else if (errorMessage.toLowerCase().includes('farmer name') && errorMessage.toLowerCase().includes('already exists')) {
                    setFieldErrors({
                        farmerName: 'This Farmer name already exists'
                    });
                } else if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('already exists')) {
                    setFieldErrors({
                        email: 'This email address already exists'
                    });
                } else {
                    setError(errorMessage);
                }
                setSuccess('');
            }
        } catch (error) {
            console.error('Error updating farmer:', error);
            setError('Error updating farmer. Please try again.');
            setSuccess('');
        } finally{
            setIsSubmitting(false);
        }
    };
    // Handle bulk upload
    const handleBulkUpload = async (e)=>{
        e.preventDefault();
        if (!selectedFile) return;
        // Validate required fields
        if (!bulkSocietyId) {
            setError('Please select a default society for bulk upload.');
            setSuccess('');
            return;
        }
        setIsSubmitting(true);
        try {
            const text = await selectedFile.text();
            const lines = text.split('\n').filter((line)=>line.trim());
            const headers = lines[0].split(',').map((h)=>h.trim().replace(/"/g, ''));
            const farmers = lines.slice(1).map((line)=>{
                const values = line.split(',').map((v)=>v.trim().replace(/"/g, ''));
                const farmer = {};
                headers.forEach((header, index)=>{
                    const value = values[index] || '';
                    // Map CSV headers to our farmer fields
                    switch(header.toLowerCase()){
                        case 'id':
                        case 'farmer_id':
                        case 'farmerid':
                            farmer.farmerId = value;
                            break;
                        case 'rf-id':
                        case 'rfid':
                        case 'rf_id':
                            farmer.rfId = value;
                            break;
                        case 'name':
                        case 'farmer_name':
                        case 'farmername':
                            farmer.farmerName = value;
                            break;
                        case 'mobile':
                        case 'phone':
                        case 'contact':
                        case 'contact_number':
                            farmer.contactNumber = value;
                            break;
                        case 'sms':
                        case 'sms_enabled':
                            farmer.smsEnabled = value.toUpperCase() === 'ON' ? 'ON' : 'OFF';
                            break;
                        case 'bonus':
                            farmer.bonus = parseFloat(value) || 0;
                            break;
                        case 'address':
                            farmer.address = value;
                            break;
                        case 'bank_name':
                        case 'bankname':
                            farmer.bankName = value;
                            break;
                        case 'bank_account_number':
                        case 'account_number':
                        case 'accountnumber':
                            farmer.bankAccountNumber = value;
                            break;
                        case 'ifsc_code':
                        case 'ifsc':
                            farmer.ifscCode = value;
                            break;
                        case 'society_id':
                        case 'societyid':
                        case 'society':
                            const societyId = parseInt(value);
                            if (societyId && !isNaN(societyId)) {
                                farmer.societyId = societyId;
                            }
                            break;
                        case 'machine-id':
                        case 'machine_id':
                        case 'machineid':
                            const machineId = parseInt(value);
                            if (machineId && !isNaN(machineId)) {
                                farmer.machineId = machineId;
                            }
                            break;
                    }
                });
                // Ensure every farmer has a society ID - use CSV value if available, otherwise use default
                if (!farmer.societyId) {
                    farmer.societyId = parseInt(bulkSocietyId);
                }
                return farmer;
            }).filter((farmer)=>farmer.farmerId && farmer.farmerName);
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/user/farmer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    farmers
                })
            });
            if (response.ok) {
                setShowBulkModal(false);
                setSelectedFile(null);
                setBulkSocietyId('');
                setSuccess('Farmers uploaded successfully');
                setError('');
                fetchFarmers();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to upload farmers');
                setSuccess('');
            }
        } catch (error) {
            console.error('Error uploading farmers:', error);
            setError('Error uploading farmers. Please try again.');
            setSuccess('');
        } finally{
            setIsSubmitting(false);
        }
    };
    // Modal control functions
    const openAddModal = ()=>{
        setFormData({
            farmerId: '',
            rfId: '',
            farmerName: '',
            contactNumber: '',
            email: '',
            smsEnabled: 'OFF',
            emailNotificationsEnabled: 'ON',
            bonus: 0,
            address: '',
            bankName: '',
            bankAccountNumber: '',
            ifscCode: '',
            societyId: '',
            machineId: '',
            status: 'active',
            notes: ''
        });
        setShowAddForm(true);
        setError('');
        setSuccess('');
        setFieldErrors({});
    };
    const handleEditClick = (farmer)=>{
        setSelectedFarmer(farmer);
        const societyId = farmer.societyId?.toString() || '';
        setFormData({
            farmerId: farmer.farmerId,
            rfId: farmer.rfId || '',
            farmerName: farmer.farmerName,
            contactNumber: farmer.contactNumber || '',
            email: farmer.email || '',
            smsEnabled: farmer.smsEnabled,
            emailNotificationsEnabled: farmer.emailNotificationsEnabled || 'ON',
            bonus: farmer.bonus,
            address: farmer.address || '',
            bankName: farmer.bankName || '',
            bankAccountNumber: farmer.bankAccountNumber || '',
            ifscCode: farmer.ifscCode || '',
            societyId: societyId,
            machineId: farmer.machineId?.toString() || '',
            status: farmer.status,
            notes: farmer.notes || ''
        });
        // Load machines for the farmer's society
        if (societyId) {
            fetchMachinesBySociety(societyId);
        }
        setShowEditForm(true);
        setError('');
        setSuccess('');
        setFieldErrors({});
    };
    const closeAddModal = ()=>{
        setShowAddForm(false);
        setFormData({
            farmerId: '',
            rfId: '',
            farmerName: '',
            contactNumber: '',
            email: '',
            smsEnabled: 'OFF',
            emailNotificationsEnabled: 'ON',
            bonus: 0,
            address: '',
            bankName: '',
            bankAccountNumber: '',
            ifscCode: '',
            societyId: '',
            machineId: '',
            status: 'active',
            notes: ''
        });
        setError('');
        setSuccess('');
    };
    const closeEditModal = ()=>{
        setShowEditForm(false);
        setSelectedFarmer(null);
        setFormData({
            farmerId: '',
            rfId: '',
            farmerName: '',
            contactNumber: '',
            email: '',
            smsEnabled: 'OFF',
            emailNotificationsEnabled: 'ON',
            bonus: 0,
            address: '',
            bankName: '',
            bankAccountNumber: '',
            ifscCode: '',
            societyId: '',
            machineId: '',
            status: 'active',
            notes: ''
        });
        setError('');
        setSuccess('');
    };
    // Initial data fetch
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchFarmers();
        fetchDairies();
        fetchBmcs();
        fetchSocieties();
        fetchAllMachines();
        fetchPerformanceStats();
    }, [
        fetchFarmers,
        fetchPerformanceStats
    ]);
    // Filter farmers using inline logic that supports array-based filters
    const filteredFarmers = farmers.filter((farmer)=>{
        // Search query filter
        const searchMatch = searchQuery === '' || farmer.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.farmerId.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.contactNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.rfId?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.societyName?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.societyIdentifier?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.address?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.bankName?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.bankAccountNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.ifscCode?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        if (!searchMatch) return false;
        // Status filter
        const statusMatch = statusFilter === 'all' || farmer.status === statusFilter;
        if (!statusMatch) return false;
        // Get farmer's society, BMC, and dairy
        const farmerSociety = societies.find((s)=>s.id === farmer.societyId);
        const farmerBmc = farmerSociety?.bmc_id ? bmcs.find((b)=>b.id === farmerSociety.bmc_id) : null;
        const farmerDairy = farmerBmc?.dairyFarmId ? dairies.find((d)=>d.id === farmerBmc.dairyFarmId) : null;
        // Dairy filter
        if (dairyFilter.length > 0) {
            if (!farmerDairy || !dairyFilter.includes(farmerDairy.id.toString())) {
                return false;
            }
        }
        // BMC filter
        if (bmcFilter.length > 0) {
            if (!farmerBmc || !bmcFilter.includes(farmerBmc.id.toString())) {
                return false;
            }
        }
        // Society filter (additional check beyond the utility function)
        if (societyFilter.length > 0) {
            if (!farmer.societyId || !societyFilter.includes(farmer.societyId.toString())) {
                return false;
            }
        }
        // Machine filter
        if (machineFilter.length > 0) {
            const farmerMachineId = farmer.machineId?.toString();
            if (!farmerMachineId || !machineFilter.includes(farmerMachineId)) {
                return false;
            }
        }
        return true;
    });
    // Filter societies to only show those with farmers in the current filtered list
    const availableSocieties = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        // Get unique society IDs from farmers based on current status and search filters
        const farmersForSocietyFilter = farmers.filter((farmer)=>{
            // Search filter
            const searchMatch = searchQuery === '' || farmer.farmerName?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.farmerId?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.contactNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.rfId?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.societyName?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.societyIdentifier?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.address?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.bankName?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.bankAccountNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.ifscCode?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.notes?.toLowerCase().includes(searchQuery.toLowerCase());
            if (!searchMatch) return false;
            // Status filter
            const statusMatch = statusFilter === 'all' || farmer.status === statusFilter;
            if (!statusMatch) return false;
            // Machine filter (but not society filter)
            if (machineFilter.length > 0) {
                const farmerMachineId = farmer.machineId?.toString();
                if (!farmerMachineId || !machineFilter.includes(farmerMachineId)) {
                    return false;
                }
            }
            return true;
        });
        const societyIdsWithFarmers = new Set(farmersForSocietyFilter.map((f)=>f.societyId).filter(Boolean));
        return societies.filter((society)=>societyIdsWithFarmers.has(society.id));
    }, [
        farmers,
        societies,
        searchQuery,
        statusFilter,
        machineFilter
    ]);
    // Filter machines to only show those with farmers in the current filtered list
    const availableMachines = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        // Get unique machine IDs from farmers based on current status, search, and society filters
        const farmersForMachineFilter = farmers.filter((farmer)=>{
            // Search filter
            const searchMatch = searchQuery === '' || farmer.farmerName?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.farmerId?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.contactNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.rfId?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.societyName?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.societyIdentifier?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.address?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.bankName?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.bankAccountNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.ifscCode?.toLowerCase().includes(searchQuery.toLowerCase()) || farmer.notes?.toLowerCase().includes(searchQuery.toLowerCase());
            if (!searchMatch) return false;
            // Status filter
            const statusMatch = statusFilter === 'all' || farmer.status === statusFilter;
            if (!statusMatch) return false;
            // Society filter (but not machine filter)
            if (societyFilter.length > 0) {
                if (!societyFilter.includes(farmer.societyId?.toString() || '')) {
                    return false;
                }
            }
            return true;
        });
        const machineIdsWithFarmers = new Set(farmersForMachineFilter.map((f)=>f.machineId).filter(Boolean));
        return machines.filter((machine)=>machineIdsWithFarmers.has(machine.id));
    }, [
        farmers,
        machines,
        searchQuery,
        statusFilter,
        societyFilter
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$LoadingSnackbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LoadingSnackbar$3e$__["LoadingSnackbar"], {
                isVisible: isSubmitting || isUpdatingStatus || isBulkUpdatingStatus || isDeletingBulk,
                message: isSubmitting ? selectedFarmer ? t.farmerManagement.updatingFarmer : t.farmerManagement.addingFarmer : isDeletingBulk ? t.farmerManagement.deletingFarmers : isBulkUpdatingStatus ? t.farmerManagement.updatingFarmers : t.farmerManagement.updatingStatus,
                submessage: t.farmerManagement.pleaseWait,
                progress: isBulkUpdatingStatus || isDeletingBulk ? updateProgress : undefined,
                showProgress: isBulkUpdatingStatus || isDeletingBulk
            }, void 0, false, {
                fileName: "[project]/src/app/admin/farmer/page.tsx",
                lineNumber: 1469,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-3 xs:p-4 sm:p-6 lg:p-8 space-y-3 xs:space-y-4 sm:space-y-6 lg:pb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ManagementPageHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ManagementPageHeader$3e$__["ManagementPageHeader"], {
                        title: t.farmerManagement.title,
                        subtitle: t.farmerManagement.subtitle,
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                            className: "w-5 h-5 sm:w-6 sm:h-6 text-white"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                            lineNumber: 1487,
                            columnNumber: 15
                        }, void 0),
                        onRefresh: fetchFarmers,
                        hasData: filteredFarmers.length > 0
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                        lineNumber: 1484,
                        columnNumber: 7
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatusMessage$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__StatusMessage$3e$__["StatusMessage"], {
                        success: success,
                        error: error
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                        lineNumber: 1493,
                        columnNumber: 7
                    }, ("TURBOPACK compile-time value", void 0)),
                    (performanceStats.topCollector || performanceStats.bestFat || performanceStats.topRevenue) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4",
                        children: [
                            performanceStats.topCollector && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>handleCardClick('quantity'),
                                className: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700 hover:shadow-lg transition-shadow cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-semibold text-green-900 dark:text-green-100",
                                                children: "Top Collector (30d)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1506,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__["Droplets"], {
                                                className: "w-5 h-5 text-green-600 dark:text-green-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1507,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1505,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-bold text-green-800 dark:text-green-200 truncate",
                                        children: performanceStats.topCollector.farmer.farmerName
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1509,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-green-700 dark:text-green-300 truncate",
                                        children: [
                                            "ID: ",
                                            performanceStats.topCollector.farmer.farmerId
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1510,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    performanceStats.topCollector.farmer.societyName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-green-600 dark:text-green-400 truncate",
                                        children: performanceStats.topCollector.farmer.societyName
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1512,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-semibold text-green-600 dark:text-green-400 mt-1",
                                        children: [
                                            performanceStats.topCollector.totalQuantity.toFixed(2),
                                            " L"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1514,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                lineNumber: 1502,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            performanceStats.topRevenue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>handleCardClick('revenue'),
                                className: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-shadow cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-semibold text-blue-900 dark:text-blue-100",
                                                children: "Top Earner (30d)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1523,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                className: "w-5 h-5 text-blue-600 dark:text-blue-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1524,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1522,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-bold text-blue-800 dark:text-blue-200 truncate",
                                        children: performanceStats.topRevenue.farmer.farmerName
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1526,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-blue-700 dark:text-blue-300 truncate",
                                        children: [
                                            "ID: ",
                                            performanceStats.topRevenue.farmer.farmerId
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1527,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    performanceStats.topRevenue.farmer.societyName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-blue-600 dark:text-blue-400 truncate",
                                        children: performanceStats.topRevenue.farmer.societyName
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1529,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1",
                                        children: [
                                            "₹",
                                            performanceStats.topRevenue.totalAmount.toFixed(2)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1531,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                lineNumber: 1519,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            performanceStats.bestFat && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>handleCardClick('fat'),
                                className: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-shadow cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-semibold text-purple-900 dark:text-purple-100",
                                                children: "Best Fat (30d)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1540,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__["Award"], {
                                                className: "w-5 h-5 text-purple-600 dark:text-purple-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1541,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1539,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-bold text-purple-800 dark:text-purple-200 truncate",
                                        children: performanceStats.bestFat.farmer.farmerName
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1543,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-purple-700 dark:text-purple-300 truncate",
                                        children: [
                                            "ID: ",
                                            performanceStats.bestFat.farmer.farmerId
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1544,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    performanceStats.bestFat.farmer.societyName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-purple-600 dark:text-purple-400 truncate",
                                        children: performanceStats.bestFat.farmer.societyName
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1546,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-semibold text-purple-600 dark:text-purple-400 mt-1",
                                        children: [
                                            performanceStats.bestFat.avgFat.toFixed(2),
                                            "% Fat"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1548,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                lineNumber: 1536,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            performanceStats.bestSnf && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>handleCardClick('snf'),
                                className: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-shadow cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-semibold text-orange-900 dark:text-orange-100",
                                                children: "Best SNF (30d)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1557,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"], {
                                                className: "w-5 h-5 text-orange-600 dark:text-orange-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1558,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1556,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-bold text-orange-800 dark:text-orange-200 truncate",
                                        children: performanceStats.bestSnf.farmer.farmerName
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1560,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-orange-700 dark:text-orange-300 truncate",
                                        children: [
                                            "ID: ",
                                            performanceStats.bestSnf.farmer.farmerId
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1561,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    performanceStats.bestSnf.farmer.societyName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-orange-600 dark:text-orange-400 truncate",
                                        children: performanceStats.bestSnf.farmer.societyName
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1563,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-semibold text-orange-600 dark:text-orange-400 mt-1",
                                        children: [
                                            performanceStats.bestSnf.avgSnf.toFixed(2),
                                            "% SNF"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1565,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                lineNumber: 1553,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            performanceStats.mostActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>handleCardClick('collections'),
                                className: "bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-4 rounded-lg border border-pink-200 dark:border-pink-700 hover:shadow-lg transition-shadow cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-semibold text-pink-900 dark:text-pink-100",
                                                children: "Most Active (30d)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1574,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                className: "w-5 h-5 text-pink-600 dark:text-pink-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1575,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1573,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-bold text-pink-800 dark:text-pink-200 truncate",
                                        children: performanceStats.mostActive.farmer.farmerName
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1577,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-pink-700 dark:text-pink-300 truncate",
                                        children: [
                                            "ID: ",
                                            performanceStats.mostActive.farmer.farmerId
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1578,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    performanceStats.mostActive.farmer.societyName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-pink-600 dark:text-pink-400 truncate",
                                        children: performanceStats.mostActive.farmer.societyName
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1580,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-semibold text-pink-600 dark:text-pink-400 mt-1",
                                        children: [
                                            performanceStats.mostActive.totalCollections,
                                            " Collections"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1582,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                lineNumber: 1570,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            performanceStats.bestQuality && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>handleCardClick('rate'),
                                className: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 hover:shadow-lg transition-shadow cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-sm font-semibold text-indigo-900 dark:text-indigo-100",
                                                children: "Best Rate (30d)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1591,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__["Award"], {
                                                className: "w-5 h-5 text-indigo-600 dark:text-indigo-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1592,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1590,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-bold text-indigo-800 dark:text-indigo-200 truncate",
                                        children: performanceStats.bestQuality.farmer.farmerName
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1594,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-indigo-700 dark:text-indigo-300 truncate",
                                        children: [
                                            "ID: ",
                                            performanceStats.bestQuality.farmer.farmerId
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1595,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    performanceStats.bestQuality.farmer.societyName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-indigo-600 dark:text-indigo-400 truncate",
                                        children: performanceStats.bestQuality.farmer.societyName
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1597,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1",
                                        children: [
                                            "₹",
                                            performanceStats.bestQuality.avgRate.toFixed(2),
                                            "/L"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1599,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                lineNumber: 1587,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                        lineNumber: 1500,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$StatsGrid$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__StatsGrid$3e$__["StatsGrid"], {
                        allItems: farmers,
                        filteredItems: filteredFarmers,
                        hasFilters: statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0 || machineFilter.length > 0,
                        onStatusFilterChange: (status)=>setStatusFilter(status),
                        currentStatusFilter: statusFilter
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                        lineNumber: 1606,
                        columnNumber: 7
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FilterDropdown$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FilterDropdown$3e$__["FilterDropdown"], {
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
                        machines: availableMachines,
                        filteredCount: filteredFarmers.length,
                        totalCount: farmers.length,
                        searchQuery: searchQuery,
                        onSearchChange: setSearchQuery,
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                            className: "w-5 h-5"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                            lineNumber: 1634,
                            columnNumber: 15
                        }, void 0),
                        hideMainFilterButton: true
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                        lineNumber: 1615,
                        columnNumber: 7
                    }, ("TURBOPACK compile-time value", void 0)),
                    filteredFarmers.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex items-center space-x-3 cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "checkbox",
                                        checked: selectAll,
                                        onChange: handleSelectAll,
                                        className: "w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1643,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-medium text-gray-700 dark:text-gray-300",
                                        children: [
                                            t.farmerManagement.selectAll,
                                            " ",
                                            filteredFarmers.length,
                                            " ",
                                            filteredFarmers.length === 1 ? t.roles.farmer : t.farmerManagement.farmers,
                                            (statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0 || machineFilter.length > 0) && ` (${t.common.filter.toLowerCase()})`
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1649,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                lineNumber: 1642,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ViewModeToggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ViewModeToggle$3e$__["ViewModeToggle"], {
                                    viewMode: viewMode,
                                    onViewModeChange: setViewMode,
                                    folderLabel: "Folder View",
                                    listLabel: "Grid View"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 1658,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                lineNumber: 1656,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                        lineNumber: 1640,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center py-12 sm:py-20",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$loading$2f$FlowerSpinner$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FlowerSpinner$3e$__["FlowerSpinner"], {
                            size: 40
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                            lineNumber: 1671,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                        lineNumber: 1670,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)) : filteredFarmers.length > 0 ? viewMode === 'folder' ? // Folder View - Grouped by Society
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: (()=>{
                            // Group farmers by society
                            const farmersBySociety = filteredFarmers.reduce((acc, farmer)=>{
                                const societyId = farmer.societyId || 0;
                                const societyName = farmer.societyName || 'Unassigned';
                                const societyIdentifier = farmer.societyIdentifier || 'N/A';
                                if (!acc[societyId]) {
                                    acc[societyId] = {
                                        id: societyId,
                                        name: societyName,
                                        identifier: societyIdentifier,
                                        farmers: []
                                    };
                                }
                                acc[societyId].farmers.push(farmer);
                                return acc;
                            }, {});
                            const societyGroups = Object.values(farmersBySociety).sort((a, b)=>a.name.localeCompare(b.name));
                            return societyGroups.map((society)=>{
                                const isExpanded = expandedSocieties.has(society.id);
                                const isSocietySelected = selectedSocieties.has(society.id);
                                const farmerCount = society.farmers.length;
                                const activeCount = society.farmers.filter((f)=>f.status === 'active').length;
                                const inactiveCount = society.farmers.filter((f)=>f.status === 'inactive').length;
                                const farmerIds = society.farmers.map((f)=>f.id);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-colors hover:z-10 ${isSocietySelected ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    onClick: (e)=>{
                                                        e.stopPropagation();
                                                        toggleSocietySelection(society.id, farmerIds);
                                                    },
                                                    className: "flex items-center mr-3 cursor-pointer",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        checked: isSocietySelected,
                                                        onChange: ()=>{},
                                                        className: "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                        lineNumber: 1724,
                                                        columnNumber: 25
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                    lineNumber: 1717,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>toggleSocietyExpansion(society.id),
                                                    className: "flex-1 flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center space-x-3",
                                                            children: [
                                                                isExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                    className: "w-5 h-5 text-gray-500 dark:text-gray-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                    lineNumber: 1739,
                                                                    columnNumber: 29
                                                                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                                    className: "w-5 h-5 text-gray-500 dark:text-gray-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                    lineNumber: 1741,
                                                                    columnNumber: 29
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                isExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                                                                    className: "w-5 h-5 text-blue-600 dark:text-blue-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                    lineNumber: 1744,
                                                                    columnNumber: 29
                                                                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"], {
                                                                    className: "w-5 h-5 text-blue-600 dark:text-blue-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                    lineNumber: 1746,
                                                                    columnNumber: 29
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-left",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                            className: "text-base sm:text-lg font-semibold text-gray-900 dark:text-white",
                                                                            children: society.name
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                            lineNumber: 1749,
                                                                            columnNumber: 29
                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-xs sm:text-sm text-gray-500 dark:text-gray-400",
                                                                            children: [
                                                                                "ID: ",
                                                                                society.identifier
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                            lineNumber: 1752,
                                                                            columnNumber: 27
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                    lineNumber: 1748,
                                                                    columnNumber: 27
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                            lineNumber: 1737,
                                                            columnNumber: 25
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center space-x-4",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center space-x-2",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-right",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "flex items-center space-x-1",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "w-2 h-2 rounded-full bg-green-500"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                                            lineNumber: 1762,
                                                                                            columnNumber: 33
                                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            children: activeCount
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                                            lineNumber: 1763,
                                                                                            columnNumber: 33
                                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                                    lineNumber: 1761,
                                                                                    columnNumber: 31
                                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "flex items-center space-x-1",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "w-2 h-2 rounded-full bg-red-500"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                                            lineNumber: 1766,
                                                                                            columnNumber: 33
                                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            children: inactiveCount
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                                            lineNumber: 1767,
                                                                                            columnNumber: 33
                                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                                    lineNumber: 1765,
                                                                                    columnNumber: 31
                                                                                }, ("TURBOPACK compile-time value", void 0))
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                            lineNumber: 1760,
                                                                            columnNumber: 29
                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-xs text-gray-500 dark:text-gray-400",
                                                                            children: [
                                                                                farmerCount,
                                                                                " ",
                                                                                farmerCount === 1 ? 'farmer' : 'farmers'
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                            lineNumber: 1770,
                                                                            columnNumber: 29
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                    lineNumber: 1759,
                                                                    columnNumber: 27
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                lineNumber: 1758,
                                                                columnNumber: 25
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                            lineNumber: 1757,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                    lineNumber: 1733,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                            lineNumber: 1715,
                                            columnNumber: 21
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
                                                children: society.farmers.map((farmer)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "relative hover:z-20",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ItemCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ItemCard$3e$__["ItemCard"], {
                                                            id: farmer.id,
                                                            name: farmer.farmerName,
                                                            identifier: `ID: ${farmer.farmerId}`,
                                                            status: farmer.status,
                                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                                className: "w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                lineNumber: 1790,
                                                                columnNumber: 37
                                                            }, void 0),
                                                            details: [
                                                                ...farmer.contactNumber ? [
                                                                    {
                                                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"], {
                                                                            className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                            lineNumber: 1792,
                                                                            columnNumber: 69
                                                                        }, void 0),
                                                                        text: farmer.contactNumber
                                                                    }
                                                                ] : [],
                                                                ...farmer.email ? [
                                                                    {
                                                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                                                            className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                            lineNumber: 1793,
                                                                            columnNumber: 61
                                                                        }, void 0),
                                                                        text: farmer.email
                                                                    }
                                                                ] : [],
                                                                ...farmer.machineName || farmer.machineType ? [
                                                                    {
                                                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                                                            className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                            lineNumber: 1795,
                                                                            columnNumber: 41
                                                                        }, void 0),
                                                                        text: farmer.machineType && farmer.machineName ? `${farmer.machineType} (${farmer.machineName})` : farmer.machineName || farmer.machineType || 'Machine Not Assigned',
                                                                        highlight: farmer.machineName ? false : undefined
                                                                    }
                                                                ] : [
                                                                    {
                                                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                                                            className: "w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                            lineNumber: 1801,
                                                                            columnNumber: 41
                                                                        }, void 0),
                                                                        text: 'No Machine Assigned',
                                                                        className: 'text-gray-500 dark:text-gray-400'
                                                                    }
                                                                ],
                                                                {
                                                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__["UserCheck"], {
                                                                        className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                                        lineNumber: 1805,
                                                                        columnNumber: 41
                                                                    }, void 0),
                                                                    text: `Bonus: ${farmer.bonus}`
                                                                }
                                                            ],
                                                            onStatusChange: (newStatus)=>handleStatusChange(farmer.id, newStatus),
                                                            onView: ()=>router.push(`/admin/farmer/${farmer.id}`),
                                                            onEdit: ()=>handleEditClick(farmer),
                                                            onDelete: ()=>handleDelete(farmer.id),
                                                            viewText: "View Details",
                                                            selectable: true,
                                                            selected: selectedFarmers.has(farmer.id),
                                                            onSelect: ()=>handleSelectFarmer(farmer.id),
                                                            searchQuery: searchQuery
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                            lineNumber: 1785,
                                                            columnNumber: 29
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, farmer.id, false, {
                                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                        lineNumber: 1784,
                                                        columnNumber: 29
                                                    }, ("TURBOPACK compile-time value", void 0)))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1782,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                            lineNumber: 1781,
                                            columnNumber: 23
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, society.id, true, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 1709,
                                    columnNumber: 19
                                }, ("TURBOPACK compile-time value", void 0));
                            });
                        })()
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                        lineNumber: 1676,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)) : // List View - Traditional flat grid
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                        children: filteredFarmers.map((farmer)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ItemCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ItemCard$3e$__["ItemCard"], {
                                id: farmer.id,
                                name: farmer.farmerName,
                                identifier: `ID: ${farmer.farmerId}`,
                                status: farmer.status,
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                    className: "w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 1837,
                                    columnNumber: 23
                                }, void 0),
                                details: [
                                    ...farmer.contactNumber ? [
                                        {
                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"], {
                                                className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1839,
                                                columnNumber: 55
                                            }, void 0),
                                            text: farmer.contactNumber
                                        }
                                    ] : [],
                                    ...farmer.email ? [
                                        {
                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                                className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1840,
                                                columnNumber: 47
                                            }, void 0),
                                            text: farmer.email
                                        }
                                    ] : [],
                                    ...farmer.societyName ? [
                                        {
                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                                                className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1842,
                                                columnNumber: 27
                                            }, void 0),
                                            text: farmer.societyIdentifier ? `${farmer.societyName} (${farmer.societyIdentifier})` : farmer.societyName,
                                            highlight: true
                                        }
                                    ] : [],
                                    ...farmer.machineName || farmer.machineType ? [
                                        {
                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                                className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1849,
                                                columnNumber: 27
                                            }, void 0),
                                            text: farmer.machineType && farmer.machineName ? `${farmer.machineType} (${farmer.machineName})` : farmer.machineName || farmer.machineType || 'Machine Not Assigned',
                                            highlight: farmer.machineName ? false : undefined
                                        }
                                    ] : [
                                        {
                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                                className: "w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1855,
                                                columnNumber: 27
                                            }, void 0),
                                            text: 'No Machine Assigned',
                                            className: 'text-gray-500 dark:text-gray-400'
                                        }
                                    ],
                                    {
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__["UserCheck"], {
                                            className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                            lineNumber: 1859,
                                            columnNumber: 27
                                        }, void 0),
                                        text: `Bonus: ${farmer.bonus}`
                                    }
                                ],
                                onStatusChange: (newStatus)=>handleStatusChange(farmer.id, newStatus),
                                onView: ()=>router.push(`/admin/farmer/${farmer.id}`),
                                onEdit: ()=>handleEditClick(farmer),
                                onDelete: ()=>handleDelete(farmer.id),
                                viewText: "View Details",
                                selectable: true,
                                selected: selectedFarmers.has(farmer.id),
                                onSelect: ()=>handleSelectFarmer(farmer.id),
                                searchQuery: searchQuery
                            }, farmer.id, false, {
                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                lineNumber: 1831,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)))
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                        lineNumber: 1829,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$EmptyState$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EmptyState$3e$__["EmptyState"], {
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                            className: "w-12 h-12 sm:w-16 sm:h-16 text-gray-400"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                            lineNumber: 1876,
                            columnNumber: 17
                        }, void 0),
                        title: farmers.length === 0 ? t.farmerManagement.noFarmersFound : t.farmerManagement.noMatchingFarmers,
                        message: farmers.length === 0 ? t.farmerManagement.getStartedMessage : searchQuery ? `${t.farmerManagement.noMatchingFarmers}. ${t.farmerManagement.tryChangingFilters}` : t.farmerManagement.tryChangingFilters,
                        actionText: farmers.length === 0 ? t.farmerManagement.addFarmer : undefined,
                        onAction: farmers.length === 0 ? openAddModal : undefined,
                        showAction: farmers.length === 0
                    }, void 0, false, {
                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                        lineNumber: 1875,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/admin/farmer/page.tsx",
                lineNumber: 1482,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormModal$3e$__["FormModal"], {
                isOpen: showAddForm,
                onClose: closeAddModal,
                title: t.farmerManagement.addFarmer,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleAddSubmit,
                    className: "space-y-4 sm:space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormGrid$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormGrid$3e$__["FormGrid"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.farmerId,
                                    type: "text",
                                    value: formData.farmerId,
                                    onChange: (value)=>{
                                        // Allow only numbers
                                        const numericValue = value.replace(/[^0-9]/g, '');
                                        setFormData({
                                            ...formData,
                                            farmerId: numericValue
                                        });
                                    },
                                    placeholder: t.farmerManagement.enterFarmerId,
                                    required: true,
                                    error: fieldErrors.farmerId
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 1900,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.farmerName,
                                    type: "text",
                                    value: formData.farmerName,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            farmerName: value
                                        }),
                                    placeholder: t.farmerManagement.enterFarmerName,
                                    required: true,
                                    error: fieldErrors.farmerName
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 1913,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: t.farmerManagement.society,
                                    value: formData.societyId,
                                    onChange: (value)=>{
                                        setFormData({
                                            ...formData,
                                            societyId: value,
                                            machineId: ''
                                        });
                                        fetchMachinesBySociety(value);
                                    },
                                    options: societies.map((society)=>({
                                            value: society.id.toString(),
                                            label: `${society.name} (${society.society_id})`
                                        })),
                                    placeholder: t.farmerManagement.selectSociety,
                                    required: true,
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 1922,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: t.farmerManagement.machine,
                                    value: formData.machineId,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            machineId: value
                                        }),
                                    options: machines.map((machine)=>({
                                            value: machine.id.toString(),
                                            label: `${machine.machineId} - ${machine.machineType}`
                                        })),
                                    placeholder: machinesLoading ? t.common.loading : machines.length > 0 ? t.farmerManagement.selectMachine : t.farmerManagement.unassigned,
                                    disabled: machinesLoading,
                                    required: true,
                                    colSpan: 1,
                                    className: "sm:max-w-[320px]"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 1939,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                formData.societyId && !machinesLoading && machines.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "col-span-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-yellow-700 dark:text-yellow-300",
                                        children: [
                                            "No machines found for this society. You can ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "add machines first"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                lineNumber: 1958,
                                                columnNumber: 61
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            " from the Machine Management section, or proceed without assigning a machine."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 1957,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 1956,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.contactNumber,
                                    type: "tel",
                                    value: formData.contactNumber,
                                    onChange: (value)=>{
                                        const formatted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$phoneValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatPhoneInput"])(value);
                                        setFormData({
                                            ...formData,
                                            contactNumber: formatted
                                        });
                                    },
                                    onBlur: ()=>{
                                        const error = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$phoneValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validatePhoneOnBlur"])(formData.contactNumber);
                                        if (error) {
                                            setFieldErrors((prev)=>({
                                                    ...prev,
                                                    contactNumber: error
                                                }));
                                        } else {
                                            const { contactNumber: _removed, ...rest } = fieldErrors;
                                            setFieldErrors(rest);
                                        }
                                    },
                                    placeholder: t.farmerManagement.enterContactNumber,
                                    error: fieldErrors.contactNumber
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 1964,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Email",
                                    type: "email",
                                    value: formData.email,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            email: value
                                        }),
                                    onBlur: ()=>{
                                        const error = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$emailValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validateEmailOnBlur"])(formData.email);
                                        if (error) {
                                            setFieldErrors((prev)=>({
                                                    ...prev,
                                                    email: error
                                                }));
                                        } else {
                                            const { email: _removed, ...rest } = fieldErrors;
                                            setFieldErrors(rest);
                                        }
                                    },
                                    placeholder: "Enter Email Address",
                                    error: fieldErrors.email
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 1984,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: t.farmerManagement.smsEnabled,
                                    value: formData.smsEnabled,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            smsEnabled: value
                                        }),
                                    options: [
                                        {
                                            value: 'OFF',
                                            label: 'OFF'
                                        },
                                        {
                                            value: 'ON',
                                            label: 'ON'
                                        }
                                    ],
                                    placeholder: t.farmerManagement.selectStatus
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2001,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: "Email Notifications",
                                    value: formData.emailNotificationsEnabled,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            emailNotificationsEnabled: value
                                        }),
                                    options: [
                                        {
                                            value: 'OFF',
                                            label: 'OFF'
                                        },
                                        {
                                            value: 'ON',
                                            label: 'ON'
                                        }
                                    ],
                                    placeholder: "Select Option"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2011,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.rfId,
                                    type: "text",
                                    value: formData.rfId,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            rfId: value
                                        }),
                                    placeholder: t.farmerManagement.enterRfId
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2023,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.bonus,
                                    type: "number",
                                    value: formData.bonus,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            bonus: Number(value)
                                        }),
                                    placeholder: t.farmerManagement.enterBonus
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2030,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: t.farmerManagement.status,
                                    value: formData.status,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            status: value
                                        }),
                                    options: [
                                        {
                                            value: 'active',
                                            label: t.farmerManagement.active
                                        },
                                        {
                                            value: 'inactive',
                                            label: t.farmerManagement.inactive
                                        },
                                        {
                                            value: 'suspended',
                                            label: t.farmerManagement.suspended
                                        },
                                        {
                                            value: 'maintenance',
                                            label: t.farmerManagement.maintenance
                                        }
                                    ],
                                    placeholder: t.farmerManagement.selectStatus
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2037,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.bankName,
                                    type: "text",
                                    value: formData.bankName,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            bankName: value
                                        }),
                                    placeholder: t.farmerManagement.enterBankName
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2051,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.bankAccountNumber,
                                    type: "number",
                                    value: formData.bankAccountNumber,
                                    onChange: (value)=>{
                                        // Only allow numbers
                                        const numericValue = value.replace(/\D/g, '');
                                        setFormData({
                                            ...formData,
                                            bankAccountNumber: numericValue
                                        });
                                    },
                                    placeholder: t.farmerManagement.enterAccountNumber,
                                    pattern: "[0-9]*",
                                    inputMode: "numeric"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2058,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.ifscCode,
                                    type: "text",
                                    value: formData.ifscCode,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            ifscCode: value
                                        }),
                                    placeholder: t.farmerManagement.enterIfscCode
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2071,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.address,
                                    type: "text",
                                    value: formData.address,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            address: value
                                        }),
                                    placeholder: t.farmerManagement.enterAddress
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2079,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.notes,
                                    type: "text",
                                    value: formData.notes,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            notes: value
                                        }),
                                    placeholder: t.farmerManagement.enterNotes
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2087,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                            lineNumber: 1898,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormActions$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormActions$3e$__["FormActions"], {
                            onCancel: closeAddModal,
                            submitText: t.farmerManagement.createFarmer,
                            isLoading: isSubmitting,
                            isSubmitDisabled: !formData.societyId || !formData.machineId || !formData.farmerId || !formData.farmerName || Object.values(fieldErrors).some((error)=>error !== ''),
                            submitType: "submit"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                            lineNumber: 2096,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                    lineNumber: 1897,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/app/admin/farmer/page.tsx",
                lineNumber: 1892,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormModal$3e$__["FormModal"], {
                isOpen: showEditForm && !!selectedFarmer,
                onClose: closeEditModal,
                title: t.farmerManagement.editFarmer,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleEditSubmit,
                    className: "space-y-4 sm:space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormGrid$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormGrid$3e$__["FormGrid"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.farmerId,
                                    type: "text",
                                    value: formData.farmerId,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            farmerId: value
                                        }),
                                    placeholder: t.farmerManagement.enterUniqueFarmerId,
                                    required: true,
                                    readOnly: true,
                                    colSpan: 1,
                                    error: fieldErrors.farmerId
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2121,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.farmerName,
                                    type: "text",
                                    value: formData.farmerName,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            farmerName: value
                                        }),
                                    placeholder: t.farmerManagement.enterFarmerFullName,
                                    required: true,
                                    colSpan: 1,
                                    error: fieldErrors.farmerName
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2133,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: t.farmerManagement.society,
                                    value: formData.societyId,
                                    onChange: (value)=>{
                                        setFormData({
                                            ...formData,
                                            societyId: value,
                                            machineId: ''
                                        });
                                        fetchMachinesBySociety(value.toString());
                                    },
                                    options: societies.map((society)=>({
                                            value: society.id,
                                            label: `${society.name} (${society.society_id})`
                                        })),
                                    placeholder: t.farmerManagement.selectSociety,
                                    required: true,
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2144,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: t.farmerManagement.machine,
                                    value: formData.machineId,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            machineId: value
                                        }),
                                    options: machines.map((machine)=>({
                                            value: machine.id.toString(),
                                            label: `${machine.machineId} - ${machine.machineType}`
                                        })),
                                    placeholder: machinesLoading ? t.common.loading : machines.length > 0 ? t.farmerManagement.selectMachine : t.farmerManagement.noMachinesAvailable,
                                    disabled: machinesLoading,
                                    required: true,
                                    colSpan: 1,
                                    className: "sm:max-w-[320px]"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2158,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.rfId,
                                    type: "text",
                                    value: formData.rfId,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            rfId: value
                                        }),
                                    placeholder: t.farmerManagement.enterRfIdOptional,
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2174,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.contactNumber,
                                    type: "tel",
                                    value: formData.contactNumber,
                                    onChange: (value)=>{
                                        const formatted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$phoneValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatPhoneInput"])(value);
                                        setFormData({
                                            ...formData,
                                            contactNumber: formatted
                                        });
                                        if (fieldErrors.contactNumber) {
                                            setFieldErrors({
                                                ...fieldErrors,
                                                contactNumber: ''
                                            });
                                        }
                                    },
                                    onBlur: ()=>{
                                        const validationError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$phoneValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validatePhoneOnBlur"])(formData.contactNumber);
                                        if (validationError) {
                                            setFieldErrors({
                                                ...fieldErrors,
                                                contactNumber: validationError
                                            });
                                        }
                                    },
                                    error: fieldErrors.contactNumber,
                                    placeholder: t.farmerManagement.enterMobileNumber,
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2183,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: "Email",
                                    type: "email",
                                    value: formData.email,
                                    onChange: (value)=>{
                                        setFormData({
                                            ...formData,
                                            email: value
                                        });
                                        if (fieldErrors.email) {
                                            setFieldErrors({
                                                ...fieldErrors,
                                                email: ''
                                            });
                                        }
                                    },
                                    onBlur: ()=>{
                                        const validationError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$emailValidation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validateEmailOnBlur"])(formData.email);
                                        if (validationError) {
                                            setFieldErrors({
                                                ...fieldErrors,
                                                email: validationError
                                            });
                                        }
                                    },
                                    error: fieldErrors.email,
                                    placeholder: "Enter email address",
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2205,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: t.farmerManagement.smsEnabled,
                                    value: formData.smsEnabled,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            smsEnabled: value
                                        }),
                                    options: [
                                        {
                                            value: 'OFF',
                                            label: 'OFF'
                                        },
                                        {
                                            value: 'ON',
                                            label: 'ON'
                                        }
                                    ],
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2226,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: "Email Notifications",
                                    value: formData.emailNotificationsEnabled,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            emailNotificationsEnabled: value
                                        }),
                                    options: [
                                        {
                                            value: 'OFF',
                                            label: 'OFF'
                                        },
                                        {
                                            value: 'ON',
                                            label: 'ON'
                                        }
                                    ],
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2237,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.bonus,
                                    type: "number",
                                    value: formData.bonus,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            bonus: parseFloat(value) || 0
                                        }),
                                    placeholder: t.farmerManagement.enterBonus,
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2248,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.address,
                                    type: "text",
                                    value: formData.address,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            address: value
                                        }),
                                    placeholder: t.farmerManagement.enterFarmerAddress,
                                    colSpan: 2
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2257,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.bankName,
                                    type: "text",
                                    value: formData.bankName,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            bankName: value
                                        }),
                                    placeholder: t.farmerManagement.enterBankName,
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2266,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.bankAccountNumber,
                                    type: "number",
                                    value: formData.bankAccountNumber,
                                    onChange: (value)=>{
                                        // Only allow numbers
                                        const numericValue = value.replace(/\D/g, '');
                                        setFormData({
                                            ...formData,
                                            bankAccountNumber: numericValue
                                        });
                                    },
                                    placeholder: t.farmerManagement.enterAccountNumber,
                                    pattern: "[0-9]*",
                                    inputMode: "numeric",
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2275,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.ifscCode,
                                    type: "text",
                                    value: formData.ifscCode,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            ifscCode: value.toUpperCase()
                                        }),
                                    placeholder: t.farmerManagement.enterIfscCode,
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2290,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                                    label: t.farmerManagement.status,
                                    value: formData.status,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            status: value
                                        }),
                                    options: [
                                        {
                                            value: 'active',
                                            label: t.farmerManagement.active
                                        },
                                        {
                                            value: 'inactive',
                                            label: t.farmerManagement.inactive
                                        },
                                        {
                                            value: 'suspended',
                                            label: t.farmerManagement.suspended
                                        },
                                        {
                                            value: 'maintenance',
                                            label: t.farmerManagement.maintenance
                                        }
                                    ],
                                    colSpan: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2299,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormInput$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormInput$3e$__["FormInput"], {
                                    label: t.farmerManagement.notes,
                                    type: "text",
                                    value: formData.notes,
                                    onChange: (value)=>setFormData({
                                            ...formData,
                                            notes: value
                                        }),
                                    placeholder: t.farmerManagement.enterNotes,
                                    colSpan: 2
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2312,
                                    columnNumber: 11
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                            lineNumber: 2119,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormActions$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormActions$3e$__["FormActions"], {
                            onCancel: closeEditModal,
                            submitText: t.farmerManagement.updateFarmer,
                            isLoading: isSubmitting,
                            isSubmitDisabled: !formData.societyId || !formData.machineId || !formData.farmerId || !formData.farmerName || Object.values(fieldErrors).some((error)=>error !== ''),
                            submitType: "submit"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                            lineNumber: 2322,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                    lineNumber: 2118,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/app/admin/farmer/page.tsx",
                lineNumber: 2113,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormModal$3e$__["FormModal"], {
                isOpen: showBulkModal,
                onClose: ()=>{
                    setShowBulkModal(false);
                    setBulkSocietyId('');
                    setSelectedFile(null);
                },
                title: "Bulk Upload Farmers",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleBulkUpload,
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormSelect$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormSelect$3e$__["FormSelect"], {
                            label: "Default Society",
                            value: bulkSocietyId,
                            onChange: (value)=>setBulkSocietyId(value),
                            options: [
                                ...societies.map((society)=>({
                                        value: society.id.toString(),
                                        label: `${society.name} (${society.society_id})`
                                    }))
                            ],
                            placeholder: "Select Society",
                            required: true
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                            lineNumber: 2349,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-sm text-gray-600 dark:text-gray-400",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "This society will be assigned to all farmers that don't have a society_id in the CSV"
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/farmer/page.tsx",
                                lineNumber: 2363,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                            lineNumber: 2362,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                                    children: "CSV File"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2367,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "file",
                                    accept: ".csv",
                                    onChange: (e)=>setSelectedFile(e.target.files?.[0] || null),
                                    className: "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2370,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                            lineNumber: 2366,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-sm text-gray-600 dark:text-gray-400",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-medium mb-2",
                                    children: "CSV Format Requirements:"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2378,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "list-disc list-inside space-y-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: "Headers: ID, RF-ID, NAME, MOBILE, SMS, BONUS (minimum)"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                            lineNumber: 2380,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: "Optional: ADDRESS, BANK_NAME, ACCOUNT_NUMBER, IFSC_CODE, SOCIETY_ID, MACHINE-ID"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                            lineNumber: 2381,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: "SMS values: ON or OFF"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                            lineNumber: 2382,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: "MACHINE-ID should be a valid machine ID (optional)"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                            lineNumber: 2383,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: "All farmers must have a society - either from CSV SOCIETY_ID or the default above"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                            lineNumber: 2384,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: "File should be UTF-8 encoded"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                            lineNumber: 2385,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2379,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                            lineNumber: 2377,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$FormActions$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FormActions$3e$__["FormActions"], {
                            onCancel: ()=>setShowBulkModal(false),
                            submitText: "Upload Farmers",
                            isLoading: isSubmitting,
                            isSubmitDisabled: !selectedFile || !bulkSocietyId,
                            submitType: "submit"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                            lineNumber: 2389,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                    lineNumber: 2348,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/app/admin/farmer/page.tsx",
                lineNumber: 2339,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkDeleteConfirmModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BulkDeleteConfirmModal$3e$__["BulkDeleteConfirmModal"], {
                isOpen: showDeleteConfirm,
                onClose: ()=>setShowDeleteConfirm(false),
                onConfirm: handleBulkDelete,
                itemCount: selectedFarmers.size,
                itemType: "farmer",
                hasFilters: statusFilter !== 'all' || dairyFilter.length > 0 || bmcFilter.length > 0 || societyFilter.length > 0
            }, void 0, false, {
                fileName: "[project]/src/app/admin/farmer/page.tsx",
                lineNumber: 2400,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$CSVUploadModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: showCSVUpload,
                onClose: ()=>setShowCSVUpload(false),
                societies: societies,
                onUploadComplete: ()=>{
                    fetchFarmers(); // Refresh the farmer list
                    setSuccess('CSV upload completed successfully!');
                }
            }, void 0, false, {
                fileName: "[project]/src/app/admin/farmer/page.tsx",
                lineNumber: 2410,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$ColumnSelectionModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ColumnSelectionModal$3e$__["ColumnSelectionModal"], {
                isOpen: showColumnSelection,
                onClose: ()=>setShowColumnSelection(false),
                onDownload: handleDownloadWithColumns,
                availableColumns: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$downloadUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFarmerColumns"])().map((col)=>({
                        key: col.key,
                        label: col.header,
                        required: [
                            'farmerId'
                        ].includes(col.key) // Make farmer ID required
                    })),
                defaultColumns: [
                    'farmerId',
                    'rfId',
                    'farmerName',
                    'contactNumber',
                    'smsEnabled',
                    'bonus'
                ],
                title: "Select Columns for Farmer Download",
                isDownloading: isDownloading
            }, void 0, false, {
                fileName: "[project]/src/app/admin/farmer/page.tsx",
                lineNumber: 2421,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$BulkActionsToolbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BulkActionsToolbar$3e$__["BulkActionsToolbar"], {
                selectedCount: selectedFarmers.size,
                totalCount: farmers.length,
                onBulkDelete: ()=>setShowDeleteConfirm(true),
                onBulkDownload: handleBulkDownload,
                onBulkStatusUpdate: handleBulkStatusUpdate,
                onClearSelection: ()=>{
                    setSelectedFarmers(new Set());
                    setSelectedSocieties(new Set());
                    setSelectAll(false);
                },
                itemType: "farmer",
                showStatusUpdate: true,
                currentBulkStatus: bulkStatus,
                onBulkStatusChange: (status)=>setBulkStatus(status)
            }, void 0, false, {
                fileName: "[project]/src/app/admin/farmer/page.tsx",
                lineNumber: 2436,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$ConfirmDeleteModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ConfirmDeleteModal$3e$__["ConfirmDeleteModal"], {
                isOpen: showSingleDeleteConfirm,
                onClose: ()=>{
                    setShowSingleDeleteConfirm(false);
                    setFarmerToDelete(null);
                },
                onConfirm: confirmDeleteFarmer,
                itemName: farmerToDelete?.farmerId || '',
                title: "Delete Farmer",
                message: "Are you sure you want to permanently delete farmer",
                confirmText: t.common.delete,
                cancelText: t.common.cancel
            }, void 0, false, {
                fileName: "[project]/src/app/admin/farmer/page.tsx",
                lineNumber: 2454,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$management$2f$FloatingActionButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FloatingActionButton$3e$__["FloatingActionButton"], {
                actions: [
                    {
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                            className: "w-6 h-6 text-white"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                            lineNumber: 2472,
                            columnNumber: 19
                        }, void 0),
                        label: t.farmerManagement.addFarmer,
                        onClick: openAddModal,
                        color: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                    },
                    {
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                            className: "w-6 h-6 text-white"
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                            lineNumber: 2478,
                            columnNumber: 19
                        }, void 0),
                        label: t.farmerManagement.uploadCSV,
                        onClick: ()=>setShowCSVUpload(true),
                        color: 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/src/app/admin/farmer/page.tsx",
                lineNumber: 2469,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            showGraphModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"], {
                                            className: "w-6 h-6 text-blue-600 dark:text-blue-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                            lineNumber: 2493,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xl font-bold text-gray-900 dark:text-white",
                                            children: [
                                                graphMetric === 'quantity' && 'Top Collectors - Last 30 Days',
                                                graphMetric === 'revenue' && 'Top Earners - Last 30 Days',
                                                graphMetric === 'fat' && 'Best Fat Percentage - Last 30 Days',
                                                graphMetric === 'snf' && 'Best SNF Percentage - Last 30 Days',
                                                graphMetric === 'collections' && 'Most Active Farmers - Last 30 Days',
                                                graphMetric === 'rate' && 'Best Rates - Last 30 Days'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                            lineNumber: 2494,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2492,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowGraphModal(false),
                                    className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "w-5 h-5 text-gray-500 dark:text-gray-400"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 2507,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2503,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                            lineNumber: 2491,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 overflow-y-auto p-6",
                            children: (()=>{
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
                                        case 'rate':
                                            return '#6366f1';
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
                                        case 'rate':
                                            return 'Rate (₹/L)';
                                        default:
                                            return 'Value';
                                    }
                                };
                                const CustomTooltip = ({ active, payload })=>{
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "font-bold text-gray-900 dark:text-white mb-1",
                                                    children: data.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                    lineNumber: 2548,
                                                    columnNumber: 25
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-gray-500 dark:text-gray-400 mb-1",
                                                    children: [
                                                        "ID: ",
                                                        data.farmerId
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                    lineNumber: 2549,
                                                    columnNumber: 25
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                data.societyName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-gray-500 dark:text-gray-400 mb-2",
                                                    children: data.societyName
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                    lineNumber: 2551,
                                                    columnNumber: 27
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "font-semibold",
                                                    style: {
                                                        color: getLineColor()
                                                    },
                                                    children: [
                                                        graphMetric === 'revenue' && '₹',
                                                        data.value.toFixed(2),
                                                        graphMetric === 'fat' || graphMetric === 'snf' ? '%' : '',
                                                        graphMetric === 'quantity' ? ' L' : '',
                                                        graphMetric === 'rate' ? '/L' : ''
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                    lineNumber: 2553,
                                                    columnNumber: 25
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                            lineNumber: 2547,
                                            columnNumber: 23
                                        }, ("TURBOPACK compile-time value", void 0));
                                    }
                                    return null;
                                };
                                return graphData.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-full h-[500px]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                        width: "100%",
                                        height: "100%",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LineChart"], {
                                            data: graphData,
                                            margin: {
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 80
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                                    strokeDasharray: "3 3",
                                                    stroke: "#e5e7eb",
                                                    className: "dark:stroke-gray-700"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                    lineNumber: 2570,
                                                    columnNumber: 25
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["XAxis"], {
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
                                                        value: 'Farmer Name',
                                                        position: 'insideBottom',
                                                        offset: -5,
                                                        style: {
                                                            fontSize: 13,
                                                            fontWeight: 500,
                                                            fill: '#9ca3af'
                                                        }
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                    lineNumber: 2571,
                                                    columnNumber: 25
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["YAxis"], {
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
                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                    lineNumber: 2586,
                                                    columnNumber: 25
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                    content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CustomTooltip, {}, void 0, false, {
                                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                        lineNumber: 2596,
                                                        columnNumber: 43
                                                    }, void 0)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                    lineNumber: 2596,
                                                    columnNumber: 25
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Line"], {
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
                                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                                    lineNumber: 2597,
                                                    columnNumber: 25
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                            lineNumber: 2569,
                                            columnNumber: 23
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/admin/farmer/page.tsx",
                                        lineNumber: 2568,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2567,
                                    columnNumber: 19
                                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center py-12",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"], {
                                            className: "w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                            lineNumber: 2611,
                                            columnNumber: 21
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-500 dark:text-gray-400",
                                            children: "No data available for the last 30 days"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                                            lineNumber: 2612,
                                            columnNumber: 21
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                                    lineNumber: 2610,
                                    columnNumber: 19
                                }, ("TURBOPACK compile-time value", void 0));
                            })()
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/farmer/page.tsx",
                            lineNumber: 2512,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/farmer/page.tsx",
                    lineNumber: 2489,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/app/admin/farmer/page.tsx",
                lineNumber: 2488,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true);
};
// Wrapper component with Suspense boundary for useSearchParams
const FarmerManagementWrapper = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-screen",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"
            }, void 0, false, {
                fileName: "[project]/src/app/admin/farmer/page.tsx",
                lineNumber: 2629,
                columnNumber: 9
            }, void 0)
        }, void 0, false, {
            fileName: "[project]/src/app/admin/farmer/page.tsx",
            lineNumber: 2628,
            columnNumber: 7
        }, void 0),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FarmerManagement, {}, void 0, false, {
            fileName: "[project]/src/app/admin/farmer/page.tsx",
            lineNumber: 2632,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/app/admin/farmer/page.tsx",
        lineNumber: 2627,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = FarmerManagementWrapper;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2e65d386._.js.map