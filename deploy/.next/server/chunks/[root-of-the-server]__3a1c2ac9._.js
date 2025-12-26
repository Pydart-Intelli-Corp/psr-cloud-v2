module.exports=[136543,e=>{"use strict";var r=e.i(89171);e.i(79832),e.i(213075),e.s(["createErrorResponse",0,(e,t=400)=>r.NextResponse.json({success:!1,error:{message:e,code:t.toString()},timestamp:new Date().toISOString()},{status:t}),"createSuccessResponse",0,(e,t="Success",i=200)=>r.NextResponse.json({success:!0,message:t,data:e,timestamp:new Date().toISOString()},{status:i}),"validateRequiredFields",0,(e,r)=>{let t=r.filter(r=>!e[r]||"string"==typeof e[r]&&""===e[r].trim());return t.length>0?{success:!1,missing:t}:{success:!0}}])},233405,(e,r,t)=>{r.exports=e.x("child_process",()=>require("child_process"))},152562,e=>{"use strict";var r=e.i(79832),t=e.i(136543),i=e.i(84168),s=e.i(686599),o=e.i(129508);let l=new Map;async function n(o){try{let n=o.headers.get("authorization")?.replace("Bearer ","");if(!n)return(0,t.createErrorResponse)("Authentication required",401);let c=(0,r.verifyToken)(n);if(!c||"admin"!==c.role)return(0,t.createErrorResponse)("Admin access required",403);let{bmcId:d,bmcName:p}=await o.json();if(!d)return(0,t.createErrorResponse)("BMC ID is required",400);await (0,i.connectDB)();let{getModels:u}=await e.A(121985),{User:g}=u(),m=await g.findByPk(c.id);if(!m)return(0,t.createErrorResponse)("Admin not found",404);let f=(0,s.generateOTP)(),h=new Date(Date.now()+6e5),x=`${m.id}_${d}`;for(let[e,r]of(l.set(x,{otp:f,expires:h,bmcId:d}),l.entries()))r.expires<new Date&&l.delete(e);try{await a(m.email,f,m.fullName,p),console.log(`✅ Delete confirmation OTP sent to ${m.email} for BMC ${p}`)}catch(e){return console.error("Failed to send OTP email:",e),(0,t.createErrorResponse)("Failed to send OTP email",500)}return(0,t.createSuccessResponse)({expiresIn:600},"OTP sent to your email. Please check and verify.")}catch(e){return console.error("Error sending delete OTP:",e),(0,t.createErrorResponse)("Failed to send OTP",500)}}async function a(e,r,t,i){let s={host:process.env.SMTP_HOST||process.env.EMAIL_HOST||"smtp.gmail.com",port:parseInt(process.env.SMTP_PORT||process.env.EMAIL_PORT||"587"),secure:"true"===(process.env.SMTP_SECURE||process.env.EMAIL_SECURE),auth:{user:process.env.SMTP_USERNAME||process.env.EMAIL_USER,pass:process.env.SMTP_PASSWORD||process.env.EMAIL_PASSWORD}},l=o.default.createTransport(s),n={from:`"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME||process.env.EMAIL_USER}>`,to:e,subject:"⚠️ CRITICAL: BMC Deletion Confirmation Required",html:`
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px;">⚠️ Critical Action Required</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">BMC Deletion Confirmation</p>
        </div>
        
        <div style="padding: 20px; background: #fef2f2; border: 2px solid #dc2626; border-radius: 10px;">
          <h2 style="color: #dc2626; margin-top: 0;">Hello ${t}!</h2>
          <p style="color: #666; line-height: 1.6;">
            You have requested to <strong style="color: #dc2626;">permanently delete</strong> the following BMC and all its associated data:
          </p>
          
          <div style="background: white; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <h3 style="margin: 0; color: #dc2626;">${i}</h3>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
              This action will delete:
            </p>
            <ul style="color: #666; font-size: 14px; margin: 10px 0;">
              <li>All societies under this BMC</li>
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
            <p style="margin: 10px 0 0 0; color: #dc2626; font-weight: bold; font-size: 14px;">
              ⚠️ THIS ACTION CANNOT BE UNDONE!
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            To confirm this deletion, please enter the following OTP:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 15px 30px; background: #dc2626; color: white; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
              ${r}
            </div>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            This OTP is valid for <strong>10 minutes</strong>. If you didn't request this deletion, please ignore this email and contact support immediately.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #fca5a5; color: #888; font-size: 14px;">
            <p>Best regards,<br>Poornasree Equipments Cloud Team</p>
          </div>
        </div>
      </div>
    `};await l.sendMail(n)}function c(e,r,t){let i=`${e}_${r}`,s=l.get(i);return s?s.expires<new Date?(l.delete(i),console.log("❌ OTP expired"),!1):s.otp!==t?(console.log("❌ Invalid OTP"),!1):(l.delete(i),console.log("✅ OTP verified successfully"),!0):(console.log("❌ No OTP found for this deletion request"),!1)}e.s(["POST",()=>n,"verifyDeleteOTP",()=>c])},121985,e=>{e.v(r=>Promise.all(["server/chunks/src_models_index_ts_328304ec._.js"].map(r=>e.l(r))).then(()=>r(540590)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__3a1c2ac9._.js.map