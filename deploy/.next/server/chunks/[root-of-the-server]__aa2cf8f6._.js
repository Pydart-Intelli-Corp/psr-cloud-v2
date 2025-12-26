module.exports=[213075,e=>{"use strict";var t,a,s=e.i(191273),i=e.i(449632),o=((t={}).SUPER_ADMIN="super_admin",t.ADMIN="admin",t.DAIRY="dairy",t.BMC="bmc",t.SOCIETY="society",t.FARMER="farmer",t),r=((a={}).PENDING="pending",a.PENDING_APPROVAL="pending_approval",a.ACTIVE="active",a.INACTIVE="inactive",a.SUSPENDED="suspended",a);class l extends s.Model{async comparePassword(e){return i.default.compare(e,this.password)}async incLoginAttempts(){if(this.lockUntil&&this.lockUntil<new Date)return void await this.update({loginAttempts:1,lockUntil:void 0});let e={loginAttempts:this.loginAttempts+1};this.loginAttempts+1>=5&&!this.isLocked&&(e.lockUntil=new Date(Date.now()+72e5)),await this.update(e)}async resetLoginAttempts(){await this.update({loginAttempts:0,lockUntil:void 0})}get isLocked(){return!!(this.lockUntil&&this.lockUntil>new Date)}canManageRole(e){let t=["super_admin","admin","dairy","bmc","society","farmer"];return t.indexOf(this.role)<t.indexOf(e)}}e.s(["UserRole",()=>o,"UserStatus",()=>r,"default",0,l,"initUserModel",0,e=>(l.init({id:{type:s.DataTypes.INTEGER,primaryKey:!0,autoIncrement:!0},uid:{type:s.DataTypes.STRING(50),allowNull:!1,unique:!0,validate:{notEmpty:!0,len:[3,50]}},email:{type:s.DataTypes.STRING(255),allowNull:!1,unique:!0,validate:{isEmail:!0,notEmpty:!0}},password:{type:s.DataTypes.STRING(255),allowNull:!1,validate:{notEmpty:!0,len:[6,255]}},fullName:{type:s.DataTypes.STRING(200),allowNull:!1,validate:{notEmpty:!0,len:[2,200]}},role:{type:s.DataTypes.ENUM(...Object.values(o)),allowNull:!1,defaultValue:"farmer"},status:{type:s.DataTypes.ENUM(...Object.values(r)),allowNull:!1,defaultValue:"pending"},dbKey:{type:s.DataTypes.STRING(50),allowNull:!0,unique:!0,comment:"Dedicated database schema key for admins"},companyName:{type:s.DataTypes.STRING(255),allowNull:!0},companyPincode:{type:s.DataTypes.STRING(10),allowNull:!0,validate:{len:[5,10]}},companyCity:{type:s.DataTypes.STRING(100),allowNull:!0,validate:{len:[2,100]}},companyState:{type:s.DataTypes.STRING(100),allowNull:!0,validate:{len:[2,100]}},parentId:{type:s.DataTypes.INTEGER,allowNull:!0,references:{model:"users",key:"id"}},isEmailVerified:{type:s.DataTypes.BOOLEAN,allowNull:!1,defaultValue:!1},emailVerificationToken:{type:s.DataTypes.STRING(255),allowNull:!0},emailVerificationExpires:{type:s.DataTypes.DATE,allowNull:!0},passwordResetToken:{type:s.DataTypes.STRING(255),allowNull:!0},passwordResetExpires:{type:s.DataTypes.DATE,allowNull:!0},otpCode:{type:s.DataTypes.STRING(10),allowNull:!0},otpExpires:{type:s.DataTypes.DATE,allowNull:!0},lastLogin:{type:s.DataTypes.DATE,allowNull:!0},loginAttempts:{type:s.DataTypes.INTEGER,allowNull:!1,defaultValue:0},lockUntil:{type:s.DataTypes.DATE,allowNull:!0}},{sequelize:e,modelName:"User",tableName:"users",timestamps:!0,hooks:{beforeSave:async e=>{if(e.changed("password")&&e.password){let t=await i.default.genSalt(12);e.password=await i.default.hash(e.password,t)}if(!e.uid&&e.email){let t=Date.now().toString().slice(-6),a=e.email.substring(0,3).toUpperCase();e.uid=`${a}${t}`}}}}),l.hasMany(l,{as:"Children",foreignKey:"parentId",onDelete:"SET NULL"}),l.belongsTo(l,{as:"Parent",foreignKey:"parentId",onDelete:"SET NULL"}),l)])},79832,e=>{"use strict";var t=e.i(724652),a=(e.i(254799),e.i(213075));let s=process.env.JWT_SECRET||"your-super-secret-jwt-key",i=process.env.JWT_REFRESH_SECRET||"your-super-secret-refresh-jwt-key";e.s(["generateOTP",0,(e=6)=>{let t="0123456789",a="";for(let s=0;s<e;s++)a+=t[Math.floor(Math.random()*t.length)];return a},"generateTokens",0,e=>{let a={id:e.id,uid:e.uid,email:e.email,role:e.role,dbKey:e.dbKey,entityType:e.entityType,schemaName:e.schemaName};return{token:t.default.sign(a,s,{expiresIn:"7d",issuer:"poornasree-equipments-cloud",audience:"psr-client"}),refreshToken:t.default.sign(a,i,{expiresIn:"30d",issuer:"poornasree-equipments-cloud",audience:"psr-client"})}},"isSuperAdmin",0,e=>{let t=process.env.SUPER_ADMIN_USERNAME||"admin";return e.email===t||e.role===a.UserRole.SUPER_ADMIN},"verifyRefreshToken",0,e=>{try{return t.default.verify(e,i,{issuer:"poornasree-equipments-cloud",audience:"psr-client"})}catch(e){return console.error("Refresh token verification failed:",e),null}},"verifyToken",0,e=>{try{return t.default.verify(e,s,{issuer:"poornasree-equipments-cloud",audience:"psr-client"})}catch(e){return console.error("JWT verification failed:",e),null}}])},136543,e=>{"use strict";var t=e.i(89171);e.i(79832),e.i(213075),e.s(["createErrorResponse",0,(e,a=400)=>t.NextResponse.json({success:!1,error:{message:e,code:a.toString()},timestamp:new Date().toISOString()},{status:a}),"createSuccessResponse",0,(e,a="Success",s=200)=>t.NextResponse.json({success:!0,message:a,data:e,timestamp:new Date().toISOString()},{status:s}),"validateRequiredFields",0,(e,t)=>{let a=t.filter(t=>!e[t]||"string"==typeof e[t]&&""===e[t].trim());return a.length>0?{success:!1,missing:a}:{success:!0}}])},233405,(e,t,a)=>{t.exports=e.x("child_process",()=>require("child_process"))},588111,e=>{"use strict";var t=e.i(79832),a=e.i(136543),s=e.i(84168),i=e.i(686599),o=e.i(129508);global.societyDeleteOtpStore||(global.societyDeleteOtpStore=new Map);let r=global.societyDeleteOtpStore;async function l(l){try{let n=l.headers.get("authorization")?.replace("Bearer ","");if(!n)return(0,a.createErrorResponse)("Authentication required",401);let p=(0,t.verifyToken)(n);if(!p||"admin"!==p.role)return(0,a.createErrorResponse)("Admin access required",403);let{societyId:d}=await l.json();if(!d)return(0,a.createErrorResponse)("Society ID is required",400);await (0,s.connectDB)();let{getModels:c}=await e.A(121985),{User:u}=c(),y=await u.findByPk(p.id);if(!y||!y.email)return(0,a.createErrorResponse)("Admin email not found",404);let m=(0,i.generateOTP)(),f=new Date(Date.now()+6e5),T=`${y.id}_${d}`;for(let[e,t]of(r.set(T,{otp:m,expires:f,societyId:d}),r.entries()))t.expires<new Date&&r.delete(e);try{let e={host:process.env.SMTP_HOST||process.env.EMAIL_HOST||"smtp.gmail.com",port:parseInt(process.env.SMTP_PORT||process.env.EMAIL_PORT||"587"),secure:"true"===(process.env.SMTP_SECURE||process.env.EMAIL_SECURE),auth:{user:process.env.SMTP_USERNAME||process.env.EMAIL_USER,pass:process.env.SMTP_PASSWORD||process.env.EMAIL_PASSWORD}},t=o.default.createTransport(e),a={from:`"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME||process.env.EMAIL_USER}>`,to:y.email,subject:"⚠️ CRITICAL: Society Deletion Confirmation Required",html:`
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
              <p style="margin-top: 0; font-size: 16px;">Hello <strong>${y.fullName}</strong>,</p>
              
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
                <div class="otp">${m}</div>
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
      `};await t.sendMail(a),console.log(`✅ Delete confirmation OTP sent to ${y.email} for society ${d}`)}catch(e){return console.error("Failed to send OTP email:",e),(0,a.createErrorResponse)("Failed to send OTP email",500)}return(0,a.createSuccessResponse)({expiresIn:600},"OTP sent to your email address")}catch(e){return console.error("Error sending delete OTP:",e),(0,a.createErrorResponse)("Failed to send OTP",500)}}function n(e,t,a){let s=`${e}_${t}`;console.log(`🔍 Verifying OTP - Key: ${s}, OTP: ${a}`);let i=r.get(s);return i?i.expires<new Date?(console.log(`❌ OTP expired for key: ${s}`),r.delete(s),!1):i.otp!==a?(console.log(`❌ OTP mismatch - Expected: ${i.otp}, Got: ${a}`),!1):i.societyId!==t?(console.log(`❌ Society ID mismatch - Expected: ${i.societyId}, Got: ${t}`),!1):(console.log(`✅ OTP verified successfully for key: ${s}`),r.delete(s),!0):(console.log(`❌ No OTP found in store for key: ${s}`),console.log(`📋 Available OTP keys:`,Array.from(r.keys())),!1)}e.s(["POST",()=>l,"verifyDeleteOTP",()=>n])},121985,e=>{e.v(t=>Promise.all(["server/chunks/src_models_index_ts_328304ec._.js"].map(t=>e.l(t))).then(()=>t(540590)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__aa2cf8f6._.js.map