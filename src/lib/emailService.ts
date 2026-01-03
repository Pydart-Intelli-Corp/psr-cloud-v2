import nodemailer from 'nodemailer';

// Email configuration
// Support both SMTP_* (local) and EMAIL_* (production) environment variables
const emailConfig = {
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587'),
  secure: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USERNAME || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD,
  },
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Generate OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (
  email: string, 
  otp: string, 
  name: string
): Promise<void> => {
  // Debug logging
  console.log('Email config debug:', {
    to: email,
    from: process.env.SMTP_USERNAME || process.env.EMAIL_USER,
    host: process.env.SMTP_HOST || process.env.EMAIL_HOST,
    port: process.env.SMTP_PORT || process.env.EMAIL_PORT,
    hasPassword: !!(process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD),
    secure: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true'
  });

  const mailOptions = {
    from: `"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME || process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Email Verification - Poornasree Equipments Cloud',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">Poornasree Equipments Cloud</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for registering with Poornasree Equipments Cloud. Please verify your email address using the OTP below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 15px 30px; background: #667eea; color: white; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 8px;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            This OTP is valid for 10 minutes. If you didn't create an account, please ignore this email.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 14px;">
            <p>Best regards,<br>Poornasree Equipments Cloud Team</p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send welcome email
export const sendWelcomeEmail = async (
  email: string, 
  name: string, 
  role: string
): Promise<void> => {
  const mailOptions = {
    from: `"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME || process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Poornasree Equipments Cloud',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">Poornasree Equipments Cloud</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome!</p>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <h2 style="color: #333; margin-top: 0;">Welcome ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Your account has been successfully verified and activated. You can now access the Poornasree Equipments Cloud platform with your ${role} account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.CLIENT_URL}/login" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Login to Dashboard
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 14px;">
            <p>Best regards,<br>Poornasree Equipments Cloud Team</p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send admin welcome email with dbKey
export const sendAdminWelcomeEmail = async (
  email: string, 
  name: string, 
  dbKey: string
): Promise<void> => {
  const apiUrl = `http://lactosure.azurewebsites.net/api/${dbKey}`;
  
  const mailOptions = {
    from: `"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME || process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Admin Account Approved - Your Personal Database Access',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Admin Account is Approved</p>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <h2 style="color: #333; margin-top: 0;">Welcome ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Congratulations! Your admin account has been approved by the Super Admin. Your personal database schema has been created and is ready for use.
          </p>
          
          <div style="background: #fff; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #ef4444; margin-top: 0; font-size: 18px;">🔒 CONFIDENTIAL - Database Access Key</h3>
            <p style="color: #666; margin-bottom: 15px;">Your unique database access key:</p>
            <div style="background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 15px; text-align: center; font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #1f2937; letter-spacing: 3px;">
              ${dbKey}
            </div>
            <p style="color: #ef4444; font-weight: bold; margin-top: 15px; margin-bottom: 0;">
              ⚠️ KEEP THIS KEY STRICTLY CONFIDENTIAL AND SECURE
            </p>
          </div>
          
          <div style="background: #fff; border: 1px solid #d1d5db; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">🌐 Your Personal API Endpoint</h3>
            <p style="color: #666; margin-bottom: 10px;">Use this URL on your machine to access your database:</p>
            <div style="background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 4px; padding: 12px; font-family: 'Courier New', monospace; word-break: break-all; color: #1f2937;">
              ${apiUrl}
            </div>
            <p style="color: #ef4444; font-size: 14px; margin-top: 10px; margin-bottom: 0;">
              <strong>Important:</strong> Only enter this URL on your designated work machine. Do not share this URL with anyone.
            </p>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0; margin-bottom: 10px;">🛡️ Security Guidelines:</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Never share your dbKey with anyone</li>
              <li>Only access the API from secure, trusted machines</li>
              <li>Log out completely when finished working</li>
              <li>Report any suspicious activity immediately</li>
              <li>Change your password regularly</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.CLIENT_URL}/adminpanel" style="display: inline-block; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              🚀 Access Admin Dashboard
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 14px;">
            <p><strong>Support:</strong> If you have any questions or issues, please contact our support team.</p>
            <p>Best regards,<br>Poornasree Equipments Cloud Team</p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string, 
  name: string, 
  resetToken: string
): Promise<void> => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME || process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset - Poornasree Equipments Cloud',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">Poornasree Equipments Cloud</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset</p>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            You have requested to reset your password. Click the button below to set a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            This link is valid for 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 14px;">
            <p>Best regards,<br>Poornasree Equipments Cloud Team</p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send admin approval request to super admin
export const sendAdminApprovalRequest = async (
  adminEmail: string,
  adminName: string,
  companyName: string
): Promise<void> => {
  const approvalUrl = `${process.env.CLIENT_URL}/adminpanel/dashboard#pending-approvals`;
  
  const mailOptions = {
    from: `"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME || process.env.EMAIL_USER}>`,
    to: process.env.SUPER_ADMIN_EMAIL || 'admin@poornasreeequipments.com',
    subject: 'New Admin Registration - Approval Required',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">Poornasree Equipments Cloud</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Admin Approval Required</p>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <h2 style="color: #333; margin-top: 0;">New Admin Registration</h2>
          <p style="color: #666; line-height: 1.6;">
            A new admin has completed email verification and is requesting account activation:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="color: #dc3545; margin-top: 0;">Admin Details:</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${adminName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${adminEmail}</p>
            <p style="margin: 5px 0;"><strong>Company:</strong> ${companyName}</p>
            <p style="margin: 5px 0;"><strong>Role:</strong> Admin</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #fd7e14;">Pending Approval</span></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${approvalUrl}" style="display: inline-block; padding: 15px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
              Review & Approve
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px; border-top: 1px solid #ddd; padding-top: 15px; margin-top: 25px;">
            <strong>Action Required:</strong> Please log in to the admin panel to review and approve/reject this admin registration request.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 14px;">
            <p>Best regards,<br>Poornasree Equipments Cloud System</p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send admin rejection email
export const sendAdminRejectionEmail = async (
  adminEmail: string,
  adminName: string,
  reason?: string
): Promise<void> => {
  const supportEmail = 'support@poornasreeequipments.com';
  
  const mailOptions = {
    from: `"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME || process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: 'Admin Application Status - Poornasree Equipments Cloud',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">Poornasree Equipments Cloud</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Application Status Update</p>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${adminName},</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for your interest in joining Poornasree Equipments Cloud as an administrator.
          </p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Application Status: Not Approved</h3>
            <p style="color: #856404; margin-bottom: 0;">
              After careful review, we are unable to approve your admin application at this time.
            </p>
          </div>
          
          ${reason ? `
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #dee2e6;">
            <h4 style="color: #495057; margin-top: 0;">Reason:</h4>
            <p style="color: #666; margin-bottom: 0;">${reason}</p>
          </div>
          ` : ''}
          
          <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0dcaf0;">
            <h4 style="color: #055160; margin-top: 0;">What's Next?</h4>
            <p style="color: #055160; margin-bottom: 10px;">
              If you believe this decision was made in error or if you have additional information to provide, 
              please don't hesitate to contact our support team.
            </p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="mailto:${supportEmail}" style="display: inline-block; padding: 12px 24px; background: #0dcaf0; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Contact Support
              </a>
            </div>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            We appreciate your understanding and thank you for your interest in our platform.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 14px;">
            <p>Best regards,<br>Poornasree Equipments Cloud Team</p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send milk collection notification email
export const sendMilkCollectionEmail = async (
  email: string,
  farmerName: string,
  collectionDetails: {
    farmerId: string;
    societyName?: string;
    collectionDate: string;
    collectionTime: string;
    shiftType: string;
    channel: string;
    quantity: number;
    fatPercentage: number;
    snfPercentage: number;
    clrValue: number;
    proteinPercentage: number;
    lactosePercentage: number;
    waterPercentage: number;
    temperature: number;
    ratePerLiter: number;
    totalAmount: number;
    bonus: number;
  }
): Promise<void> => {
  const formattedDate = new Date(collectionDetails.collectionDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: `"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME || process.env.EMAIL_USER}>`,
    to: email,
    subject: `Milk Collection Receipt - ${collectionDetails.farmerId} - ${formattedDate}`,
    html: `
      <div style="max-width: 650px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🥛 Milk Collection Receipt</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 16px;">Poornasree Equipments Cloud</p>
        </div>
        
        <!-- Body -->
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Greeting -->
          <div style="margin-bottom: 25px;">
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 22px;">Hello ${farmerName},</h2>
            <p style="color: #6b7280; margin: 0; line-height: 1.6;">
              Your milk collection has been successfully recorded. Here are the details:
            </p>
          </div>

          <!-- Collection Details Card -->
          <div style="background: #f9fafb; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📋 Collection Information</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 45%;">Farmer ID:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${collectionDetails.farmerId}</td>
              </tr>
              ${collectionDetails.societyName ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Society:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${collectionDetails.societyName}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Date:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Time:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${collectionDetails.collectionTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Shift:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">
                  <span style="background: ${collectionDetails.shiftType === 'morning' ? '#fef3c7' : '#dbeafe'}; color: ${collectionDetails.shiftType === 'morning' ? '#92400e' : '#1e40af'}; padding: 4px 12px; border-radius: 12px; font-size: 14px;">
                    ${collectionDetails.shiftType === 'morning' ? '🌅 Morning' : '🌆 Evening'}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Milk Type:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${collectionDetails.channel}</td>
              </tr>
            </table>
          </div>

          <!-- Quality Parameters Card -->
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">🔬 Quality Parameters</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 45%;">Fat:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${collectionDetails.fatPercentage.toFixed(2)}%</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">SNF:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${collectionDetails.snfPercentage.toFixed(2)}%</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">CLR:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${collectionDetails.clrValue.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Protein:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${collectionDetails.proteinPercentage.toFixed(2)}%</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Lactose:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${collectionDetails.lactosePercentage.toFixed(2)}%</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Water:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${collectionDetails.waterPercentage.toFixed(2)}%</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Temperature:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${collectionDetails.temperature.toFixed(2)}°C</td>
              </tr>
            </table>
          </div>

          <!-- Payment Details Card -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; color: white;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">💰 Payment Details</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; opacity: 0.9; width: 45%;">Quantity:</td>
                <td style="padding: 8px 0; font-weight: 600; font-size: 16px;">${collectionDetails.quantity.toFixed(2)} Liters</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; opacity: 0.9;">Rate per Liter:</td>
                <td style="padding: 8px 0; font-weight: 600; font-size: 16px;">₹${collectionDetails.ratePerLiter.toFixed(2)}</td>
              </tr>
              ${collectionDetails.bonus > 0 ? `
              <tr>
                <td style="padding: 8px 0; opacity: 0.9;">Bonus:</td>
                <td style="padding: 8px 0; font-weight: 600; font-size: 16px;">₹${collectionDetails.bonus.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr style="border-top: 1px solid rgba(255,255,255,0.3);">
                <td style="padding: 12px 0; font-size: 18px; font-weight: 600;">Total Amount:</td>
                <td style="padding: 12px 0; font-size: 24px; font-weight: 700;">₹${collectionDetails.totalAmount.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <!-- Footer Note -->
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #92400e; line-height: 1.6; font-size: 14px;">
              <strong>📝 Note:</strong> This is an automated notification for your milk collection. Please keep this email for your records. For any discrepancies, contact your society office within 24 hours.
            </p>
          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
              Thank you for your continued support!
            </p>
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              Best regards,<br>
              <strong>Poornasree Equipments Cloud Team</strong>
            </p>
          </div>
        </div>
        
        <!-- Disclaimer -->
        <div style="margin-top: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 11px; line-height: 1.4; margin: 0;">
            This is an automated email. Please do not reply to this email.<br>
            © ${new Date().getFullYear()} Poornasree Equipments Cloud. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Collection email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send collection email to ${email}:`, error);
    throw error;
  }
};

// Machine update notification email types
export type MachineUpdateType = 'password' | 'ratechart' | 'correction';

export interface MachineUpdateDetails {
  machineName: string;
  machineId: string;
  societyName: string;
  updateType: MachineUpdateType;
  channel?: string; // For rate chart: COW, BUF, MIX
  channels?: string[]; // For corrections: which channels were updated
  passwordType?: 'user' | 'supervisor' | 'both'; // For password updates
  updatedBy: string;
  recordCount?: number; // For rate chart
}

// Send machine update notification email to society
export const sendMachineUpdateEmail = async (
  email: string,
  details: MachineUpdateDetails
): Promise<void> => {
  const updateTypeConfig: Record<MachineUpdateType, { icon: string; title: string; color: string; lightColor: string }> = {
    password: { icon: '🔐', title: 'Password Updated', color: '#f59e0b', lightColor: '#fef3c7' },
    ratechart: { icon: '📊', title: 'Rate Chart Uploaded', color: '#3b82f6', lightColor: '#dbeafe' },
    correction: { icon: '⚙️', title: 'Correction Updated', color: '#10b981', lightColor: '#d1fae5' }
  };

  const config = updateTypeConfig[details.updateType];
  
  // Generate update-specific details
  let updateDetails = '';
  
  if (details.updateType === 'password') {
    const passwordTypes = details.passwordType === 'both' 
      ? 'User & Supervisor' 
      : details.passwordType === 'user' ? 'User' : 'Supervisor';
    updateDetails = `<span style="color: ${config.color}; font-weight: 600;">${passwordTypes} Password</span>`;
  } else if (details.updateType === 'ratechart') {
    const channelNames: Record<string, string> = { 'COW': 'C1', 'BUF': 'C2', 'MIX': 'C3' };
    const channelDisplay = channelNames[details.channel || ''] || details.channel;
    updateDetails = `<span style="color: ${config.color}; font-weight: 600;">Channel ${channelDisplay}</span>${details.recordCount ? ` (${details.recordCount} entries)` : ''}`;
  } else if (details.updateType === 'correction') {
    const channelNames: Record<string, string> = { '1': 'C1', '2': 'C2', '3': 'C3' };
    const channelsDisplay = (details.channels || []).map(c => channelNames[c] || c).join(', ');
    updateDetails = `<span style="color: ${config.color}; font-weight: 600;">${channelsDisplay || 'All Channels'}</span>`;
  }

  const mailOptions = {
    from: `"Poornasree Cloud" <${process.env.SMTP_USERNAME || process.env.EMAIL_USER}>`,
    to: email,
    subject: `${config.icon} ${config.title} - ${details.machineName} | Action Required`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header with Icon -->
          <tr>
            <td style="background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); padding: 32px 24px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 12px;">${config.icon}</div>
              <h1 style="margin: 0; color: white; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">${config.title}</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Please update your machine</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 24px;">
              
              <!-- Machine Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                          <span style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Machine</span>
                          <div style="color: #1e293b; font-size: 18px; font-weight: 700; margin-top: 4px;">${details.machineName}</div>
                          <div style="color: #64748b; font-size: 13px; margin-top: 2px;">ID: ${details.machineId}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 12px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%">
                                <span style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Society</span>
                                <div style="color: #1e293b; font-size: 14px; font-weight: 600; margin-top: 4px;">${details.societyName}</div>
                              </td>
                              <td width="50%">
                                <span style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Updated</span>
                                <div style="color: #1e293b; font-size: 14px; font-weight: 600; margin-top: 4px;">${updateDetails}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Update Instructions -->
              <div style="margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px; color: #1e293b; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">How to Update</h3>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 36px; vertical-align: top;">
                            <div style="width: 28px; height: 28px; background: ${config.lightColor}; color: ${config.color}; border-radius: 8px; text-align: center; line-height: 28px; font-weight: 700; font-size: 13px;">1</div>
                          </td>
                          <td style="vertical-align: top;">
                            <div style="color: #1e293b; font-size: 14px; font-weight: 600;">Connect WiFi</div>
                            <div style="color: #64748b; font-size: 13px; margin-top: 2px;">Ensure machine is connected to network</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 36px; vertical-align: top;">
                            <div style="width: 28px; height: 28px; background: ${config.lightColor}; color: ${config.color}; border-radius: 8px; text-align: center; line-height: 28px; font-weight: 700; font-size: 13px;">2</div>
                          </td>
                          <td style="vertical-align: top;">
                            <div style="color: #1e293b; font-size: 14px; font-weight: 600;">Press UP Arrow ↑</div>
                            <div style="color: #64748b; font-size: 13px; margin-top: 2px;">Navigate to update option</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 36px; vertical-align: top;">
                            <div style="width: 28px; height: 28px; background: ${config.lightColor}; color: ${config.color}; border-radius: 8px; text-align: center; line-height: 28px; font-weight: 700; font-size: 13px;">3</div>
                          </td>
                          <td style="vertical-align: top;">
                            <div style="color: #1e293b; font-size: 14px; font-weight: 600;">Press OK ✓</div>
                            <div style="color: #64748b; font-size: 13px; margin-top: 2px;">Confirm to download updates</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Alert Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #fef3c7; border-radius: 10px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: top; padding-right: 10px;">⚡</td>
                        <td>
                          <div style="color: #92400e; font-size: 13px; line-height: 1.5;">
                            <strong>Update soon!</strong> Changes take effect only after machine downloads the update.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 20px 24px; border-top: 1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">Updated by <strong>${details.updatedBy}</strong></div>
                    <div style="color: #94a3b8; font-size: 11px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
        <!-- Bottom Text -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; margin-top: 24px;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                Poornasree Equipments Cloud<br>
                <span style="color: #cbd5e1;">This is an automated notification</span>
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Machine update email sent to ${email} for ${details.updateType}`);
  } catch (error) {
    console.error(`❌ Failed to send machine update email to ${email}:`, error);
    throw error;
  }
};

export default transporter;