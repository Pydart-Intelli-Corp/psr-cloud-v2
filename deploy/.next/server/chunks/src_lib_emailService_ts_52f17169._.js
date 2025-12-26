module.exports=[686599,e=>{"use strict";var t=e.i(129508);let o={host:process.env.SMTP_HOST||process.env.EMAIL_HOST||"smtp.gmail.com",port:parseInt(process.env.SMTP_PORT||process.env.EMAIL_PORT||"587"),secure:"true"===(process.env.SMTP_SECURE||process.env.EMAIL_SECURE),auth:{user:process.env.SMTP_USERNAME||process.env.EMAIL_USER,pass:process.env.SMTP_PASSWORD||process.env.EMAIL_PASSWORD}},i=t.default.createTransport(o),r=async(e,t,o)=>{console.log("Email config debug:",{to:e,from:process.env.SMTP_USERNAME||process.env.EMAIL_USER,host:process.env.SMTP_HOST||process.env.EMAIL_HOST,port:process.env.SMTP_PORT||process.env.EMAIL_PORT,hasPassword:!!(process.env.SMTP_PASSWORD||process.env.EMAIL_PASSWORD),secure:"true"===(process.env.SMTP_SECURE||process.env.EMAIL_SECURE)});let r={from:`"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME||process.env.EMAIL_USER}>`,to:e,subject:"Email Verification - Poornasree Equipments Cloud",html:`
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">Poornasree Equipments Cloud</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${o}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for registering with Poornasree Equipments Cloud. Please verify your email address using the OTP below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 15px 30px; background: #667eea; color: white; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 8px;">
              ${t}
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
    `};await i.sendMail(r)},d=async(e,t,o)=>{let r={from:`"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME||process.env.EMAIL_USER}>`,to:e,subject:"Welcome to Poornasree Equipments Cloud",html:`
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">Poornasree Equipments Cloud</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome!</p>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <h2 style="color: #333; margin-top: 0;">Welcome ${t}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Your account has been successfully verified and activated. You can now access the Poornasree Equipments Cloud platform with your ${o} account.
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
    `};await i.sendMail(r)},n=async(e,t,o)=>{let r=`http://lactosure.azurewebsites.net/api/${o}`,d={from:`"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME||process.env.EMAIL_USER}>`,to:e,subject:"🎉 Admin Account Approved - Your Personal Database Access",html:`
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Admin Account is Approved</p>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <h2 style="color: #333; margin-top: 0;">Welcome ${t}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Congratulations! Your admin account has been approved by the Super Admin. Your personal database schema has been created and is ready for use.
          </p>
          
          <div style="background: #fff; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #ef4444; margin-top: 0; font-size: 18px;">🔒 CONFIDENTIAL - Database Access Key</h3>
            <p style="color: #666; margin-bottom: 15px;">Your unique database access key:</p>
            <div style="background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 15px; text-align: center; font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #1f2937; letter-spacing: 3px;">
              ${o}
            </div>
            <p style="color: #ef4444; font-weight: bold; margin-top: 15px; margin-bottom: 0;">
              ⚠️ KEEP THIS KEY STRICTLY CONFIDENTIAL AND SECURE
            </p>
          </div>
          
          <div style="background: #fff; border: 1px solid #d1d5db; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">🌐 Your Personal API Endpoint</h3>
            <p style="color: #666; margin-bottom: 10px;">Use this URL on your machine to access your database:</p>
            <div style="background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 4px; padding: 12px; font-family: 'Courier New', monospace; word-break: break-all; color: #1f2937;">
              ${r}
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
    `};await i.sendMail(d)},a=async(e,t,o)=>{let r=`${process.env.FRONTEND_URL}/reset-password?token=${o}`,d={from:`"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME||process.env.EMAIL_USER}>`,to:e,subject:"Password Reset - Poornasree Equipments Cloud",html:`
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">Poornasree Equipments Cloud</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset</p>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${t}!</h2>
          <p style="color: #666; line-height: 1.6;">
            You have requested to reset your password. Click the button below to set a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${r}" style="display: inline-block; padding: 12px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
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
    `};await i.sendMail(d)},s=async(e,t,o)=>{let r=`${process.env.CLIENT_URL}/adminpanel/dashboard#pending-approvals`,d={from:`"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME||process.env.EMAIL_USER}>`,to:process.env.SUPER_ADMIN_EMAIL||"admin@poornasreeequipments.com",subject:"New Admin Registration - Approval Required",html:`
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
            <p style="margin: 5px 0;"><strong>Name:</strong> ${t}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${e}</p>
            <p style="margin: 5px 0;"><strong>Company:</strong> ${o}</p>
            <p style="margin: 5px 0;"><strong>Role:</strong> Admin</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #fd7e14;">Pending Approval</span></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${r}" style="display: inline-block; padding: 15px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
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
    `};await i.sendMail(d)},p=async(e,t,o)=>{let r={from:`"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME||process.env.EMAIL_USER}>`,to:e,subject:"Admin Application Status - Poornasree Equipments Cloud",html:`
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">Poornasree Equipments Cloud</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Application Status Update</p>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${t},</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for your interest in joining Poornasree Equipments Cloud as an administrator.
          </p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Application Status: Not Approved</h3>
            <p style="color: #856404; margin-bottom: 0;">
              After careful review, we are unable to approve your admin application at this time.
            </p>
          </div>
          
          ${o?`
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #dee2e6;">
            <h4 style="color: #495057; margin-top: 0;">Reason:</h4>
            <p style="color: #666; margin-bottom: 0;">${o}</p>
          </div>
          `:""}
          
          <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0dcaf0;">
            <h4 style="color: #055160; margin-top: 0;">What's Next?</h4>
            <p style="color: #055160; margin-bottom: 10px;">
              If you believe this decision was made in error or if you have additional information to provide, 
              please don't hesitate to contact our support team.
            </p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="mailto:support@poornasreeequipments.com" style="display: inline-block; padding: 12px 24px; background: #0dcaf0; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
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
    `};await i.sendMail(r)},l=async(e,t,o)=>{let r=new Date(o.collectionDate).toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),d={from:`"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME||process.env.EMAIL_USER}>`,to:e,subject:`Milk Collection Receipt - ${o.farmerId} - ${r}`,html:`
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
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 22px;">Hello ${t},</h2>
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
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${o.farmerId}</td>
              </tr>
              ${o.societyName?`
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Society:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${o.societyName}</td>
              </tr>
              `:""}
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Date:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${r}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Time:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${o.collectionTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Shift:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">
                  <span style="background: ${"morning"===o.shiftType?"#fef3c7":"#dbeafe"}; color: ${"morning"===o.shiftType?"#92400e":"#1e40af"}; padding: 4px 12px; border-radius: 12px; font-size: 14px;">
                    ${"morning"===o.shiftType?"🌅 Morning":"🌆 Evening"}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Milk Type:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${o.channel}</td>
              </tr>
            </table>
          </div>

          <!-- Quality Parameters Card -->
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">🔬 Quality Parameters</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 45%;">Fat:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${o.fatPercentage.toFixed(2)}%</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">SNF:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${o.snfPercentage.toFixed(2)}%</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">CLR:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${o.clrValue.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Protein:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${o.proteinPercentage.toFixed(2)}%</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Lactose:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${o.lactosePercentage.toFixed(2)}%</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Water:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${o.waterPercentage.toFixed(2)}%</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Temperature:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${o.temperature.toFixed(2)}\xb0C</td>
              </tr>
            </table>
          </div>

          <!-- Payment Details Card -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; color: white;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">💰 Payment Details</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; opacity: 0.9; width: 45%;">Quantity:</td>
                <td style="padding: 8px 0; font-weight: 600; font-size: 16px;">${o.quantity.toFixed(2)} Liters</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; opacity: 0.9;">Rate per Liter:</td>
                <td style="padding: 8px 0; font-weight: 600; font-size: 16px;">₹${o.ratePerLiter.toFixed(2)}</td>
              </tr>
              ${o.bonus>0?`
              <tr>
                <td style="padding: 8px 0; opacity: 0.9;">Bonus:</td>
                <td style="padding: 8px 0; font-weight: 600; font-size: 16px;">₹${o.bonus.toFixed(2)}</td>
              </tr>
              `:""}
              <tr style="border-top: 1px solid rgba(255,255,255,0.3);">
                <td style="padding: 12px 0; font-size: 18px; font-weight: 600;">Total Amount:</td>
                <td style="padding: 12px 0; font-size: 24px; font-weight: 700;">₹${o.totalAmount.toFixed(2)}</td>
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
            \xa9 ${new Date().getFullYear()} Poornasree Equipments Cloud. All rights reserved.
          </p>
        </div>
      </div>
    `};try{await i.sendMail(d),console.log(`✅ Collection email sent to ${e}`)}catch(t){throw console.error(`❌ Failed to send collection email to ${e}:`,t),t}};e.s(["default",0,i,"generateOTP",0,()=>Math.floor(1e5+9e5*Math.random()).toString(),"sendAdminApprovalRequest",0,s,"sendAdminRejectionEmail",0,p,"sendAdminWelcomeEmail",0,n,"sendMilkCollectionEmail",0,l,"sendOTPEmail",0,r,"sendPasswordResetEmail",0,a,"sendWelcomeEmail",0,d])}];

//# sourceMappingURL=src_lib_emailService_ts_52f17169._.js.map