module.exports = [
"[project]/src/middleware/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authenticateToken",
    ()=>authenticateToken,
    "authorizeRole",
    ()=>authorizeRole,
    "checkRateLimit",
    ()=>checkRateLimit,
    "createErrorResponse",
    ()=>createErrorResponse,
    "createSuccessResponse",
    ()=>createSuccessResponse,
    "default",
    ()=>__TURBOPACK__default__export__,
    "requireAdmin",
    ()=>requireAdmin,
    "requireHierarchyAccess",
    ()=>requireHierarchyAccess,
    "requireSuperAdmin",
    ()=>requireSuperAdmin,
    "setCorsHeaders",
    ()=>setCorsHeaders,
    "validateRequiredFields",
    ()=>validateRequiredFields
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/models/User.ts [app-route] (ecmascript)");
;
;
;
const authenticateToken = (req)=>{
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            return {
                success: false,
                error: 'Access token required'
            };
        }
        const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(token);
        if (!decoded) {
            return {
                success: false,
                error: 'Invalid or expired token'
            };
        }
        return {
            success: true,
            user: decoded
        };
    } catch  {
        return {
            success: false,
            error: 'Authentication failed'
        };
    }
};
const authorizeRole = (requiredRoles)=>{
    return (user)=>{
        if (!user) {
            return {
                success: false,
                error: 'User not authenticated'
            };
        }
        if (!requiredRoles.includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions'
            };
        }
        return {
            success: true
        };
    };
};
const requireSuperAdmin = (user)=>{
    if (!user) {
        return {
            success: false,
            error: 'User not authenticated'
        };
    }
    if (user.role !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].SUPER_ADMIN && user.email !== (process.env.SUPER_ADMIN_USERNAME || 'admin')) {
        return {
            success: false,
            error: 'Super Admin access required'
        };
    }
    return {
        success: true
    };
};
const requireAdmin = (user)=>{
    if (!user) {
        return {
            success: false,
            error: 'User not authenticated'
        };
    }
    const adminRoles = [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].SUPER_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].ADMIN
    ];
    if (!adminRoles.includes(user.role)) {
        return {
            success: false,
            error: 'Admin access required'
        };
    }
    return {
        success: true
    };
};
const requireHierarchyAccess = (targetUserId, currentUser)=>{
    // Super admin can access everything
    if (currentUser.role === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].SUPER_ADMIN) {
        return {
            success: true
        };
    }
    // Admin can access users in their schema
    if (currentUser.role === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].ADMIN && currentUser.dbKey) {
        // Additional logic would be needed to check if targetUser belongs to admin's schema
        return {
            success: true
        };
    }
    // For other roles, implement specific hierarchy checks
    // This would require database queries to verify parent-child relationships
    return {
        success: false,
        error: 'Access denied'
    };
};
const createErrorResponse = (message, status = 400)=>{
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: false,
        error: {
            message,
            code: status.toString()
        },
        timestamp: new Date().toISOString()
    }, {
        status
    });
};
const createSuccessResponse = (data, message = 'Success', status = 200)=>{
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    }, {
        status
    });
};
const validateRequiredFields = (body, requiredFields)=>{
    const missing = requiredFields.filter((field)=>!body[field] || typeof body[field] === 'string' && body[field].trim() === '');
    if (missing.length > 0) {
        return {
            success: false,
            missing
        };
    }
    return {
        success: true
    };
};
// Rate limiting (basic implementation)
const rateLimitMap = new Map();
const checkRateLimit = (identifier, maxRequests = 100, windowMs = 15 * 60 * 1000 // 15 minutes
)=>{
    const now = Date.now();
    const record = rateLimitMap.get(identifier);
    if (!record || now > record.resetTime) {
        // Reset or create new record
        rateLimitMap.set(identifier, {
            count: 1,
            resetTime: now + windowMs
        });
        return {
            success: true
        };
    }
    if (record.count >= maxRequests) {
        return {
            success: false,
            resetTime: record.resetTime
        };
    }
    record.count++;
    return {
        success: true
    };
};
const setCorsHeaders = (response)=>{
    response.headers.set('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
};
const middleware = {
    authenticateToken,
    authorizeRole,
    requireSuperAdmin,
    requireAdmin,
    requireHierarchyAccess,
    createErrorResponse,
    createSuccessResponse,
    validateRequiredFields,
    checkRateLimit,
    setCorsHeaders
};
const __TURBOPACK__default__export__ = middleware;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[project]/src/lib/emailService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "generateOTP",
    ()=>generateOTP,
    "sendAdminApprovalRequest",
    ()=>sendAdminApprovalRequest,
    "sendAdminRejectionEmail",
    ()=>sendAdminRejectionEmail,
    "sendAdminWelcomeEmail",
    ()=>sendAdminWelcomeEmail,
    "sendMilkCollectionEmail",
    ()=>sendMilkCollectionEmail,
    "sendOTPEmail",
    ()=>sendOTPEmail,
    "sendPasswordResetEmail",
    ()=>sendPasswordResetEmail,
    "sendWelcomeEmail",
    ()=>sendWelcomeEmail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nodemailer/lib/nodemailer.js [app-route] (ecmascript)");
;
// Email configuration
// Support both SMTP_* (local) and EMAIL_* (production) environment variables
const emailConfig = {
    host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587'),
    secure: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true',
    auth: {
        user: process.env.SMTP_USERNAME || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD
    }
};
// Create transporter
const transporter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createTransport(emailConfig);
const generateOTP = ()=>{
    return Math.floor(100000 + Math.random() * 900000).toString();
};
const sendOTPEmail = async (email, otp, name)=>{
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
    `
    };
    await transporter.sendMail(mailOptions);
};
const sendWelcomeEmail = async (email, name, role)=>{
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
            <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Login to Dashboard
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 14px;">
            <p>Best regards,<br>Poornasree Equipments Cloud Team</p>
          </div>
        </div>
      </div>
    `
    };
    await transporter.sendMail(mailOptions);
};
const sendAdminWelcomeEmail = async (email, name, dbKey)=>{
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
    `
    };
    await transporter.sendMail(mailOptions);
};
const sendPasswordResetEmail = async (email, name, resetToken)=>{
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
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
    `
    };
    await transporter.sendMail(mailOptions);
};
const sendAdminApprovalRequest = async (adminEmail, adminName, companyName)=>{
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
    `
    };
    await transporter.sendMail(mailOptions);
};
const sendAdminRejectionEmail = async (adminEmail, adminName, reason)=>{
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
    `
    };
    await transporter.sendMail(mailOptions);
};
const sendMilkCollectionEmail = async (email, farmerName, collectionDetails)=>{
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
    `
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Collection email sent to ${email}`);
    } catch (error) {
        console.error(`❌ Failed to send collection email to ${email}:`, error);
        throw error;
    }
};
const __TURBOPACK__default__export__ = transporter;
}),
"[project]/src/app/api/user/society/send-delete-otp/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "verifyDeleteOTP",
    ()=>verifyDeleteOTP
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$middleware$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/middleware/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/database.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$emailService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/emailService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nodemailer/lib/nodemailer.js [app-route] (ecmascript)");
;
;
;
;
;
// Initialize global OTP store if it doesn't exist
if (!global.societyDeleteOtpStore) {
    global.societyDeleteOtpStore = new Map();
}
const otpStore = global.societyDeleteOtpStore;
async function POST(request) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$middleware$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Authentication required', 401);
        }
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(token);
        if (!payload || payload.role !== 'admin') {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$middleware$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Admin access required', 403);
        }
        const body = await request.json();
        const { societyId } = body;
        if (!societyId) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$middleware$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Society ID is required', 400);
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["connectDB"])();
        const { getModels } = await __turbopack_context__.A("[project]/src/models/index.ts [app-route] (ecmascript, async loader)");
        const { User } = getModels();
        // Get admin details
        const admin = await User.findByPk(payload.id);
        if (!admin || !admin.email) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$middleware$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Admin email not found', 404);
        }
        // Generate OTP
        const otp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$emailService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateOTP"])();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Store OTP in memory
        const otpKey = `${admin.id}_${societyId}`;
        otpStore.set(otpKey, {
            otp,
            expires,
            societyId
        });
        // Clean up expired OTPs
        for (const [key, value] of otpStore.entries()){
            if (value.expires < new Date()) {
                otpStore.delete(key);
            }
        }
        // Send OTP email
        try {
            const emailConfig = {
                host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587'),
                secure: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true',
                auth: {
                    user: process.env.SMTP_USERNAME || process.env.EMAIL_USER,
                    pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD
                }
            };
            const transporter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createTransport(emailConfig);
            const mailOptions = {
                from: `"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME || process.env.EMAIL_USER}>`,
                to: admin.email,
                subject: '⚠️ CRITICAL: Society Deletion Confirmation Required',
                html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border: 2px solid #fee2e2; }
            .otp-box { background: white; border: 3px dashed #dc2626; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
            .otp { font-size: 36px; font-weight: bold; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
            .icon { font-size: 48px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">🚨</div>
              <h1 style="margin: 0; font-size: 24px;">CRITICAL DELETION REQUEST</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.95;">Society & All Related Data</p>
            </div>
            
            <div class="content">
              <p style="margin-top: 0; font-size: 16px;">Hello <strong>${admin.fullName}</strong>,</p>
              
              <div class="warning">
                <strong style="color: #dc2626; font-size: 18px;">⚠️ THIS ACTION CANNOT BE UNDONE!</strong>
                <p style="margin: 10px 0 0 0;">You are about to permanently delete a society and ALL associated data from your system.</p>
              </div>

              <p style="font-weight: 600; margin-bottom: 10px;">The following data will be permanently deleted:</p>
              <ul style="color: #666; font-size: 14px; margin: 10px 0;">
                <li>All farmers under this society</li>
                <li>All machines linked to this society</li>
                <li>All machine statistics</li>
                <li>All machine corrections (admin & device saved)</li>
                <li>All rate charts and rate chart data</li>
                <li>All milk collections</li>
                <li>All sales records</li>
                <li>All dispatch records</li>
                <li>All section pulse tracking data</li>
              </ul>

              <p style="font-weight: 600; margin-top: 25px;">Your One-Time Verification Code:</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">OTP Code</p>
                <div class="otp">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes only</p>
              </div>

              <div style="background: #fee2e2; border-radius: 8px; padding: 15px; margin-top: 20px;">
                <p style="margin: 0; font-size: 13px; color: #991b1b;">
                  <strong>Security Notice:</strong> If you did not request this deletion, please ignore this email and contact your system administrator immediately.
                </p>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0;">Poornasree Equipments Cloud</p>
              <p style="margin: 5px 0;">This is an automated security message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
            };
            await transporter.sendMail(mailOptions);
            console.log(`✅ Delete confirmation OTP sent to ${admin.email} for society ${societyId}`);
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$middleware$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Failed to send OTP email', 500);
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$middleware$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSuccessResponse"])({
            expiresIn: 600
        }, 'OTP sent to your email address');
    } catch (error) {
        console.error('Error sending delete OTP:', error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$middleware$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Failed to send OTP', 500);
    }
}
function verifyDeleteOTP(adminId, societyId, otp) {
    const otpKey = `${adminId}_${societyId}`;
    console.log(`🔍 Verifying OTP - Key: ${otpKey}, OTP: ${otp}`);
    const stored = otpStore.get(otpKey);
    if (!stored) {
        console.log(`❌ No OTP found in store for key: ${otpKey}`);
        console.log(`📋 Available OTP keys:`, Array.from(otpStore.keys()));
        return false;
    }
    if (stored.expires < new Date()) {
        console.log(`❌ OTP expired for key: ${otpKey}`);
        otpStore.delete(otpKey);
        return false;
    }
    if (stored.otp !== otp) {
        console.log(`❌ OTP mismatch - Expected: ${stored.otp}, Got: ${otp}`);
        return false;
    }
    if (stored.societyId !== societyId) {
        console.log(`❌ Society ID mismatch - Expected: ${stored.societyId}, Got: ${societyId}`);
        return false;
    }
    // OTP is valid, delete it (one-time use)
    console.log(`✅ OTP verified successfully for key: ${otpKey}`);
    otpStore.delete(otpKey);
    return true;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__74594915._.js.map