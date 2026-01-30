import jsPDF from 'jspdf';
import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587'),
  secure: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true',
  auth: {
    user: process.env.SMTP_USERNAME || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(emailConfig);

interface CollectionData {
  farmerId: string;
  farmerName: string;
  farmerEmail?: string;
  societyName?: string;
  date: string;
  shift: string;
  quantity: number;
  fat: number;
  snf: number;
  rate: number;
  amount: number;
  machineId?: string;
  machineType?: string;
  time?: string;
}

interface InvoiceOptions {
  adminSchema: string;
  invoiceNumber?: string;
}

/**
 * Generate PDF invoice for milk collection
 * Uses the same design pattern as report management PDFs
 */
export const generateCollectionInvoice = async (
  collectionData: CollectionData,
  options: InvoiceOptions
): Promise<Buffer> => {
  const doc = new jsPDF('portrait', 'pt', 'a4');

  // Modern color palette (same as report PDFs)
  const colors = {
    primary: [41, 128, 185] as [number, number, number],
    secondary: [52, 73, 94] as [number, number, number],
    accent: [231, 76, 60] as [number, number, number],
    light: [236, 240, 241] as [number, number, number],
    text: [44, 62, 80] as [number, number, number],
    border: [189, 195, 199] as [number, number, number]
  };

  // Page dimensions and margins
  const pdfPageWidth = 595;
  const pdfPageHeight = 842;
  const margin = 50;
  const headerHeight = 180;

  // Header background
  doc.setFillColor(...colors.light);
  doc.rect(0, 0, pdfPageWidth, headerHeight, 'F');

  // Header accent bar
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pdfPageWidth, 8, 'F');

  // Add logo in left top corner
  try {
    const logoResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/fulllogo.png`);
    const logoBlob = await logoResponse.blob();
    const logoBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(logoBlob);
    });

    const logoWidth = 120;
    const logoHeight = 40;
    doc.addImage(logoBase64, 'PNG', margin, 25, logoWidth, logoHeight);
  } catch (error) {
    console.warn('Could not load logo:', error);
  }

  // Title - centered
  doc.setTextColor(...colors.secondary);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  const title = 'MILK COLLECTION INVOICE';
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pdfPageWidth - titleWidth) / 2, 90);

  // Subtitle - centered
  doc.setTextColor(...colors.text);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const subtitle = 'Poornasree Equipments Cloud';
  const subtitleWidth = doc.getTextWidth(subtitle);
  doc.text(subtitle, (pdfPageWidth - subtitleWidth) / 2, 115);

  // Invoice number and date section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  
  const invoiceNum = options.invoiceNumber || `INV-${Date.now()}`;
  const invoiceDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  doc.text(`Invoice No: ${invoiceNum}`, margin, 145);
  doc.text(`Date: ${invoiceDate}`, pdfPageWidth - margin - doc.getTextWidth(`Date: ${invoiceDate}`), 145);

  // Farmer Information Card
  let yOffset = headerHeight + 30;

  // Card background
  doc.setFillColor(...colors.light);
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yOffset, pdfPageWidth - (margin * 2), 140, 5, 5, 'FD');

  // Card header
  doc.setFillColor(...colors.primary);
  doc.rect(margin, yOffset, pdfPageWidth - (margin * 2), 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FARMER INFORMATION', margin + 15, yOffset + 23);

  // Farmer details
  doc.setTextColor(...colors.text);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const farmerDetails = [
    { label: 'Farmer ID:', value: collectionData.farmerId },
    { label: 'Farmer Name:', value: collectionData.farmerName },
    { label: 'Society:', value: collectionData.societyName || 'N/A' },
    { label: 'Email:', value: collectionData.farmerEmail || 'N/A' }
  ];

  farmerDetails.forEach((detail, index) => {
    const detailY = yOffset + 55 + (index * 22);
    doc.setFont('helvetica', 'bold');
    doc.text(detail.label, margin + 15, detailY);
    doc.setFont('helvetica', 'normal');
    doc.text(detail.value, margin + 120, detailY);
  });

  yOffset += 160;

  // Collection Details Card
  doc.setFillColor(...colors.light);
  doc.roundedRect(margin, yOffset, pdfPageWidth - (margin * 2), 200, 5, 5, 'FD');

  // Card header
  doc.setFillColor(...colors.primary);
  doc.rect(margin, yOffset, pdfPageWidth - (margin * 2), 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('COLLECTION DETAILS', margin + 15, yOffset + 23);

  // Collection info
  doc.setTextColor(...colors.text);
  doc.setFontSize(11);

  const collectionDetails = [
    { label: 'Collection Date:', value: new Date(collectionData.date).toLocaleDateString('en-IN') },
    { label: 'Shift:', value: collectionData.shift.toUpperCase() },
    { label: 'Time:', value: collectionData.time || 'N/A' },
    { label: 'Machine ID:', value: collectionData.machineId || 'N/A' },
    { label: 'Machine Type:', value: collectionData.machineType || 'N/A' }
  ];

  collectionDetails.forEach((detail, index) => {
    const detailY = yOffset + 55 + (index * 22);
    doc.setFont('helvetica', 'bold');
    doc.text(detail.label, margin + 15, detailY);
    doc.setFont('helvetica', 'normal');
    doc.text(detail.value, margin + 140, detailY);
  });

  yOffset += 220;

  // Milk Quality & Amount Table
  doc.setFillColor(...colors.light);
  doc.roundedRect(margin, yOffset, pdfPageWidth - (margin * 2), 180, 5, 5, 'FD');

  // Table header
  doc.setFillColor(...colors.primary);
  doc.rect(margin, yOffset, pdfPageWidth - (margin * 2), 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MILK QUALITY & PRICING', margin + 15, yOffset + 23);

  // Quality parameters
  doc.setTextColor(...colors.text);
  doc.setFontSize(11);

  const qualityParams = [
    { label: 'Quantity (Liters):', value: collectionData.quantity.toFixed(2) + ' L', highlight: true },
    { label: 'Fat (%):', value: collectionData.fat.toFixed(2) + '%' },
    { label: 'SNF (%):', value: collectionData.snf.toFixed(2) + '%' },
    { label: 'Rate (per Liter):', value: '₹' + collectionData.rate.toFixed(2) }
  ];

  qualityParams.forEach((param, index) => {
    const paramY = yOffset + 55 + (index * 25);
    doc.setFont('helvetica', 'bold');
    doc.text(param.label, margin + 15, paramY);
    
    if (param.highlight) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...colors.primary);
      doc.text(param.value, margin + 200, paramY);
      doc.setFontSize(11);
      doc.setTextColor(...colors.text);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.text(param.value, margin + 200, paramY);
    }
  });

  // Total Amount - highlighted
  yOffset += 160;
  doc.setFillColor(...colors.accent);
  doc.roundedRect(margin, yOffset, pdfPageWidth - (margin * 2), 50, 5, 5, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT:', margin + 15, yOffset + 32);
  
  doc.setFontSize(20);
  const totalAmount = `₹${collectionData.amount.toFixed(2)}`;
  const totalWidth = doc.getTextWidth(totalAmount);
  doc.text(totalAmount, pdfPageWidth - margin - totalWidth - 15, yOffset + 32);

  // Footer section
  const footerY = pdfPageHeight - 80;

  // Footer background
  doc.setFillColor(...colors.light);
  doc.rect(0, footerY - 10, pdfPageWidth, 90, 'F');

  // Footer accent line
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(2);
  doc.line(margin, footerY - 5, pdfPageWidth - margin, footerY - 5);

  // Footer content - centered
  doc.setTextColor(...colors.text);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');

  const footerText1 = 'Thank you for your contribution to Poornasree Equipments Cloud';
  const footerWidth1 = doc.getTextWidth(footerText1);
  doc.text(footerText1, (pdfPageWidth - footerWidth1) / 2, footerY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const generatedText = `Generated on: ${new Date().toLocaleString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })}`;
  const generatedWidth = doc.getTextWidth(generatedText);
  doc.text(generatedText, (pdfPageWidth - generatedWidth) / 2, footerY + 28);

  doc.setFont('helvetica', 'bold');
  const companyText = 'Poornasree Equipments Cloud';
  const companyWidth = doc.getTextWidth(companyText);
  doc.text(companyText, (pdfPageWidth - companyWidth) / 2, footerY + 42);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  const confidentialText = 'This is a computer-generated invoice and does not require a signature';
  const confidentialWidth = doc.getTextWidth(confidentialText);
  doc.text(confidentialText, (pdfPageWidth - confidentialWidth) / 2, footerY + 56);

  // Convert PDF to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
};

/**
 * Send collection invoice via email
 */
export const sendCollectionInvoiceEmail = async (
  collectionData: CollectionData,
  pdfBuffer: Buffer,
  options: InvoiceOptions
): Promise<void> => {
  const invoiceNum = options.invoiceNumber || `INV-${Date.now()}`;
  const invoiceDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: `"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME || process.env.EMAIL_USER}>`,
    to: collectionData.farmerEmail,
    subject: `Milk Collection Invoice - ${invoiceDate}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #2980b9 0%, #34495e 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">Poornasree Equipments Cloud</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Milk Collection Invoice</p>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <h2 style="color: #333; margin-top: 0;">Dear ${collectionData.farmerName},</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for your milk collection. Please find attached your invoice for the following collection:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2980b9;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Invoice Number:</strong></td>
                <td style="padding: 8px 0; color: #333;">${invoiceNum}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Collection Date:</strong></td>
                <td style="padding: 8px 0; color: #333;">${new Date(collectionData.date).toLocaleDateString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Shift:</strong></td>
                <td style="padding: 8px 0; color: #333;">${collectionData.shift.toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Quantity:</strong></td>
                <td style="padding: 8px 0; color: #333;">${collectionData.quantity.toFixed(2)} Liters</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Fat:</strong></td>
                <td style="padding: 8px 0; color: #333;">${collectionData.fat.toFixed(2)}%</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>SNF:</strong></td>
                <td style="padding: 8px 0; color: #333;">${collectionData.snf.toFixed(2)}%</td>
              </tr>
              <tr style="background: #e7f3ff;">
                <td style="padding: 12px 8px; color: #2980b9; font-size: 16px;"><strong>Total Amount:</strong></td>
                <td style="padding: 12px 8px; color: #2980b9; font-size: 18px; font-weight: bold;">₹${collectionData.amount.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            The detailed invoice is attached to this email as a PDF document. Please keep it for your records.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 14px;">
            <p>Best regards,<br>Poornasree Equipments Cloud Team</p>
            <p style="font-size: 12px; font-style: italic; color: #999;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Invoice_${collectionData.farmerId}_${collectionData.date}_${collectionData.shift}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
  console.log(`Invoice email sent to ${collectionData.farmerEmail} for Farmer ${collectionData.farmerId}`);
};

/**
 * Generate and send invoice for a collection
 * Main function to be called from collection upload endpoint
 */
export const processCollectionInvoice = async (
  collectionData: CollectionData,
  options: InvoiceOptions
): Promise<{ success: boolean; message: string; invoiceNumber?: string }> => {
  try {
    // Validate farmer email
    if (!collectionData.farmerEmail) {
      console.warn(`No email found for Farmer ${collectionData.farmerId}, skipping invoice`);
      return {
        success: false,
        message: 'No email address available for farmer'
      };
    }

    // Generate invoice number
    const invoiceNumber = options.invoiceNumber || `INV-${options.adminSchema}-${Date.now()}`;
    const invoiceOptions = { ...options, invoiceNumber };

    // Generate PDF
    const pdfBuffer = await generateCollectionInvoice(collectionData, invoiceOptions);
    console.log(`Generated invoice PDF for Farmer ${collectionData.farmerId}`);

    // Send email
    await sendCollectionInvoiceEmail(collectionData, pdfBuffer, invoiceOptions);

    return {
      success: true,
      message: 'Invoice generated and sent successfully',
      invoiceNumber
    };
  } catch (error) {
    console.error('Error processing collection invoice:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process invoice'
    };
  }
};
