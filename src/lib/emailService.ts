import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
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
    from: process.env.SMTP_USERNAME,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    hasPassword: !!process.env.SMTP_PASSWORD
  });

  const mailOptions = {
    from: `"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME}>`,
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
    from: `"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME}>`,
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
            <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
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
    from: `"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME}>`,
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
            <a href="${process.env.FRONTEND_URL}/adminpanel" style="display: inline-block; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
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
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME}>`,
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
    from: `"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME}>`,
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
    from: `"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME}>`,
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

export default transporter;