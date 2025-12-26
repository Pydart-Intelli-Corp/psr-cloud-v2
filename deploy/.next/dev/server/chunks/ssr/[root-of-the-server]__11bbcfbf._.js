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
"[project]/src/app/admin/farmer/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/src/app/admin/farmer/page.tsx'\n\nExpected unicode escape");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__11bbcfbf._.js.map