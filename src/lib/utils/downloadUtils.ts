import jsPDF from 'jspdf';

// jsPDF and autoTable will be imported as needed

// Types for farmer download functions
interface FarmerDownloadData {
  farmerId: string;
  rfId?: string;
  farmerName: string;
  contactNumber?: string;
  email?: string;
  societyId?: string | number;
  status: string;
  smsEnabled: boolean;
  bonus?: number;
  address?: string;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  notes?: string;
}

interface SocietyDownloadData {
  id: number;
  name: string;
  society_id: string;
}

interface SocietyInfo {
  name: string;
  id: string;
}

export interface DownloadableData {
  [key: string]: unknown;
}

export interface ColumnConfig {
  key: string;
  header: string;
  width?: number;
  formatter?: (value: unknown) => string;
}

/**
 * Download data as CSV file
 */
export const downloadAsCSV = (
  data: DownloadableData[],
  columns: ColumnConfig[],
  filename: string
) => {
  if (data.length === 0) {
    alert('No data to download');
    return;
  }

  // Create CSV headers
  const headers = columns.map(col => col.header);
  
  // Create CSV rows
  const csvRows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key];
      const formattedValue = col.formatter ? col.formatter(value) : value;
      // Escape CSV values that contain commas or quotes
      const stringValue = String(formattedValue || '');
      return stringValue.includes(',') || stringValue.includes('"') 
        ? `"${stringValue.replace(/"/g, '""')}"` 
        : stringValue;
    });
  });

  // Combine headers and rows
  const csvContent = [headers, ...csvRows]
    .map(row => row.join(','))
    .join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Download data as PDF file in landscape orientation
 */
export const downloadAsPDF = async (
  data: DownloadableData[],
  columns: ColumnConfig[],
  filename: string,
  title?: string,
  additionalInfo?: string[]
) => {
  if (data.length === 0) {
    alert('No data to download');
    return;
  }

  // Dynamically import jspdf-autotable and get the autoTable function
  const { default: autoTable } = await import('jspdf-autotable');

  // Create new PDF document in landscape orientation
  const doc = new jsPDF('landscape', 'pt', 'a4');
  
  // Modern color palette
  const colors = {
    primary: [41, 128, 185] as [number, number, number],      // Professional blue
    secondary: [52, 73, 94] as [number, number, number],      // Dark blue-gray
    accent: [231, 76, 60] as [number, number, number],        // Red accent
    light: [236, 240, 241] as [number, number, number],       // Light gray
    text: [44, 62, 80] as [number, number, number],           // Dark text
    border: [189, 195, 199] as [number, number, number]       // Light border
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
    const logoBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
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
    doc.roundedRect(margin, yOffset - 15, pdfPageWidth - (margin * 2), cardHeight, 5, 5, 'FD');
    
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
    
    additionalInfo.forEach((info, index) => {
      const infoY = yOffset + 25 + (index * 18);
      
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
  const tableHeaders = columns.map(col => col.header);
  const tableData = data.map(item => {
    return columns.map(col => {
      const value = item[col.key];
      const formattedValue = col.formatter ? col.formatter(value) : value;
      return String(formattedValue || '');
    });
  });

  // Calculate column widths
  const tableMargins = 100; // Left + right margins for table
  const availableWidth = pdfPageWidth - tableMargins;
  
  const columnWidths = columns.map(col => {
    if (col.width) return col.width;
    // Auto-calculate width based on header length and content
    const headerLength = col.header.length;
    const maxContentLength = Math.max(
      ...tableData.map(row => {
        const cellIndex = columns.indexOf(col);
        return String(row[cellIndex] || '').length;
      })
    );
    const maxLength = Math.max(headerLength, maxContentLength);
    return Math.max(60, Math.min(150, maxLength * 6)); // 6 points per character
  });

  // Adjust widths to fit page
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  if (totalWidth > availableWidth) {
    const scale = availableWidth / totalWidth;
    columnWidths.forEach((width, index) => {
      columnWidths[index] = width * scale;
    });
  }

  // Modern table design
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: yOffset,
    margin: { left: margin, right: margin },
    columnStyles: columns.reduce((styles: { [key: number]: { cellWidth?: number } }, col, index) => {
      styles[index] = { cellWidth: columnWidths[index] };
      return styles;
    }, {}),
    styles: {
      fontSize: 9,
      cellPadding: { top: 8, right: 6, bottom: 8, left: 6 },
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
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      cellPadding: { top: 12, right: 8, bottom: 12, left: 8 },
      halign: 'center',
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251] as [number, number, number], // Light gray
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

/**
 * Format date for display
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-IN');
  } catch {
    return '';
  }
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '0';
  return amount.toLocaleString('en-IN');
};

/**
 * Format status for display
 */
export const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Farmer-specific download functions
 */

// Import types at the top if not already imported
// import { Farmer, Society } from '@/types';

// Get all available farmer columns
export const getFarmerColumns = (): ColumnConfig[] => [
  { key: 'farmerId', header: 'Farmer ID' },
  { key: 'rfId', header: 'RF-ID' },
  { key: 'farmerName', header: 'Farmer Name' },
  { key: 'contactNumber', header: 'Contact Number' },
  { key: 'email', header: 'Email' },
  { key: 'societyInfo', header: 'Society', formatter: (society: unknown) => {
    const s = society as SocietyInfo;
    return s ? `${s.name} (${s.id})` : '';
  }},
  { key: 'status', header: 'Status', formatter: (status: unknown) => formatStatus(status as string) },
  { key: 'smsEnabled', header: 'SMS Enabled', formatter: (value: unknown) => (value as boolean) ? 'ON' : 'OFF' },
  { key: 'bonus', header: 'Bonus', formatter: (amount: unknown) => formatCurrency(amount as number | null | undefined) },
  { key: 'address', header: 'Address' },
  { key: 'bankName', header: 'Bank Name' },
  { key: 'bankAccountNumber', header: 'Account Number' },
  { key: 'ifscCode', header: 'IFSC Code' },
  { key: 'notes', header: 'Notes' }
];

export const downloadFarmersAsCSV = (
  farmers: FarmerDownloadData[],
  societies: SocietyDownloadData[],
  filters: { status?: string; society?: string } = {},
  selectedColumns?: string[]
) => {
  const getSocietyInfo = (societyId: string | number | undefined): SocietyInfo => {
    if (!societyId) return { name: '', id: '' };
    const society = societies.find(s => s.id.toString() === societyId.toString());
    return society ? { name: society.name, id: society.society_id } : { name: '', id: '' };
  };

  // Get all available columns
  const allColumns = getFarmerColumns();
  
  // Use selected columns or default to all columns
  const columns = selectedColumns && selectedColumns.length > 0 
    ? allColumns.filter(col => selectedColumns.includes(col.key))
    : allColumns;

  const processedData = farmers.map(farmer => ({
    farmerId: farmer.farmerId || '',
    rfId: farmer.rfId || '', // Add RF-ID field
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

export const downloadFarmersAsPDF = async (
  farmers: FarmerDownloadData[],
  societies: SocietyDownloadData[],
  filters: { status?: string; society?: string; selection?: string } = {},
  selectedColumns?: string[]
) => {
  const getSocietyInfo = (societyId: string | number | undefined): SocietyInfo => {
    if (!societyId) return { name: '', id: '' };
    const society = societies.find(s => s.id.toString() === societyId.toString());
    return society ? { name: society.name, id: society.society_id } : { name: '', id: '' };
  };

  // Define all columns with PDF-specific configurations (widths optimized for landscape)
  const allColumns: ColumnConfig[] = [
    { key: 'farmerId', header: 'ID', width: 60 },
    { key: 'rfId', header: 'RF-ID', width: 60 },
    { key: 'farmerName', header: 'Name', width: 120 },
    { key: 'contactNumber', header: 'Contact', width: 80 },
    { key: 'email', header: 'Email', width: 80 },
    { key: 'societyInfo', header: 'Society', width: 120, formatter: (society: unknown) => {
      const s = society as SocietyInfo;
      return s ? `${s.name}` : '';
    }},
    { key: 'status', header: 'Status', width: 60, formatter: (status: unknown) => formatStatus(status as string) },
    { key: 'smsEnabled', header: 'SMS', width: 40, formatter: (value: unknown) => (value as boolean) ? 'ON' : 'OFF' },
    { key: 'bonus', header: 'Bonus', width: 60, formatter: (amount: unknown) => formatCurrency(amount as number | null | undefined) },
    { key: 'address', header: 'Address', width: 100 },
    { key: 'bankName', header: 'Bank', width: 80 },
    { key: 'bankAccountNumber', header: 'Account', width: 80 },
    { key: 'ifscCode', header: 'IFSC', width: 60 },
    { key: 'notes', header: 'Notes', width: 80 }
  ];

  // Use selected columns or default to essential columns for PDF
  const defaultPDFColumns = ['farmerId', 'rfId', 'farmerName', 'contactNumber', 'societyInfo', 'status', 'smsEnabled', 'bonus'];
  const columns = selectedColumns && selectedColumns.length > 0 
    ? allColumns.filter(col => selectedColumns.includes(col.key))
    : allColumns.filter(col => defaultPDFColumns.includes(col.key));

  const processedData = farmers.map(farmer => ({
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
    ...(filterText ? [filterText] : [])
  ];
  
  const filename = `farmers_report${filterSuffix}_${new Date().toISOString().split('T')[0]}`;

  await downloadAsPDF(processedData, columns, filename, title, additionalInfo);
};

// Helper functions for filters
const getFilterSuffix = (filters: { status?: string; society?: string; selection?: string }): string => {
  const parts: string[] = [];
  
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

const getFilterText = (filters: { status?: string; society?: string; selection?: string }, societies: SocietyDownloadData[]): string => {
  const parts: string[] = [];
  
  if (filters.status && filters.status !== 'all') {
    parts.push(`Status: ${formatStatus(filters.status)}`);
  }
  
  if (filters.society && filters.society !== 'all') {
    const society = societies.find(s => s.id.toString() === filters.society);
    if (society) {
      parts.push(`Society: ${society.name} (${society.society_id})`);
    }
  }
  
  if (filters.selection) {
    parts.push(`Selection: ${filters.selection.replace('-', ' ')}`);
  }
  
  return parts.length > 0 ? `Filters Applied: ${parts.join(', ')}` : '';
};;