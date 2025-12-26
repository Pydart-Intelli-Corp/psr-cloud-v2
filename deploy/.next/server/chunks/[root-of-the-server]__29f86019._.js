module.exports=[136543,e=>{"use strict";var r=e.i(89171);e.i(79832),e.i(213075),e.s(["createErrorResponse",0,(e,t=400)=>r.NextResponse.json({success:!1,error:{message:e,code:t.toString()},timestamp:new Date().toISOString()},{status:t}),"createSuccessResponse",0,(e,t="Success",i=200)=>r.NextResponse.json({success:!0,message:t,data:e,timestamp:new Date().toISOString()},{status:i}),"validateRequiredFields",0,(e,r)=>{let t=r.filter(r=>!e[r]||"string"==typeof e[r]&&""===e[r].trim());return t.length>0?{success:!1,missing:t}:{success:!0}}])},233405,(e,r,t)=>{r.exports=e.x("child_process",()=>require("child_process"))},168761,e=>{"use strict";var r=e.i(79832),t=e.i(136543),i=e.i(84168),s=e.i(686599),o=e.i(129508);let a=new Map;async function n(n){try{let l=n.headers.get("authorization")?.replace("Bearer ","");if(!l)return(0,t.createErrorResponse)("Authentication required",401);let d=(0,r.verifyToken)(l);if(!d||"admin"!==d.role)return(0,t.createErrorResponse)("Admin access required",403);let{dairyId:c}=await n.json();if(!c)return(0,t.createErrorResponse)("Dairy ID is required",400);await (0,i.connectDB)();let{getModels:p}=await e.A(121985),{User:m}=p(),u=await m.findByPk(d.id);if(!u||!u.email)return(0,t.createErrorResponse)("Admin email not found",404);let g=(0,s.generateOTP)(),f=new Date(Date.now()+6e5),x=`${u.id}_${c}`;for(let[e,r]of(a.set(x,{otp:g,expires:f,dairyId:c}),a.entries()))r.expires<new Date&&a.delete(e);try{let e={host:process.env.SMTP_HOST||process.env.EMAIL_HOST||"smtp.gmail.com",port:parseInt(process.env.SMTP_PORT||process.env.EMAIL_PORT||"587"),secure:"true"===(process.env.SMTP_SECURE||process.env.EMAIL_SECURE),auth:{user:process.env.SMTP_USERNAME||process.env.EMAIL_USER,pass:process.env.SMTP_PASSWORD||process.env.EMAIL_PASSWORD}},r=o.default.createTransport(e),t={from:`"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME||process.env.EMAIL_USER}>`,to:u.email,subject:"⚠️ CRITICAL: Dairy Deletion Confirmation Required",html:`
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
              <p style="margin: 10px 0 0 0; opacity: 0.95;">Dairy Farm & All Related Data</p>
            </div>
            
            <div class="content">
              <p style="margin-top: 0; font-size: 16px;">Hello <strong>${u.fullName}</strong>,</p>
              
              <div class="warning">
                <strong style="color: #dc2626; font-size: 18px;">⚠️ THIS ACTION CANNOT BE UNDONE!</strong>
                <p style="margin: 10px 0 0 0;">You are about to permanently delete a dairy farm and ALL associated data from your system.</p>
              </div>

              <p style="font-weight: 600; margin-bottom: 10px;">The following data will be permanently deleted:</p>
              <ul style="color: #666; font-size: 14px; margin: 10px 0;">
                <li>All BMCs under this dairy</li>
                <li>All societies under these BMCs</li>
                <li>All farmers</li>
                <li>All machines</li>
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
                <div class="otp">${g}</div>
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
      `};await r.sendMail(t),console.log(`✅ Delete confirmation OTP sent to ${u.email} for dairy ${c}`)}catch(e){return console.error("Failed to send OTP email:",e),(0,t.createErrorResponse)("Failed to send OTP email",500)}return(0,t.createSuccessResponse)({expiresIn:600},"OTP sent to your email address")}catch(e){return console.error("Error sending delete OTP:",e),(0,t.createErrorResponse)("Failed to send OTP",500)}}function l(e,r,t){let i=`${e}_${r}`,s=a.get(i);return!!s&&(s.expires<new Date?(a.delete(i),!1):s.otp===t&&s.dairyId===r&&(a.delete(i),!0))}e.s(["POST",()=>n,"verifyDeleteOTP",()=>l])},121985,e=>{e.v(r=>Promise.all(["server/chunks/src_models_index_ts_328304ec._.js"].map(r=>e.l(r))).then(()=>r(540590)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__29f86019._.js.map