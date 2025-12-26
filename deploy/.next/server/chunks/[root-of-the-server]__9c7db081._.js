module.exports=[136543,e=>{"use strict";var t=e.i(89171);e.i(79832),e.i(213075),e.s(["createErrorResponse",0,(e,r=400)=>t.NextResponse.json({success:!1,error:{message:e,code:r.toString()},timestamp:new Date().toISOString()},{status:r}),"createSuccessResponse",0,(e,r="Success",a=200)=>t.NextResponse.json({success:!0,message:r,data:e,timestamp:new Date().toISOString()},{status:a}),"validateRequiredFields",0,(e,t)=>{let r=t.filter(t=>!e[t]||"string"==typeof e[t]&&""===e[t].trim());return r.length>0?{success:!1,missing:r}:{success:!0}}])},233405,(e,t,r)=>{t.exports=e.x("child_process",()=>require("child_process"))},168761,e=>{"use strict";var t=e.i(79832),r=e.i(136543),a=e.i(84168),i=e.i(686599),n=e.i(129508);let o=new Map;async function s(s){try{let l=s.headers.get("authorization")?.replace("Bearer ","");if(!l)return(0,r.createErrorResponse)("Authentication required",401);let d=(0,t.verifyToken)(l);if(!d||"admin"!==d.role)return(0,r.createErrorResponse)("Admin access required",403);let{dairyId:c}=await s.json();if(!c)return(0,r.createErrorResponse)("Dairy ID is required",400);await (0,a.connectDB)();let{getModels:p}=await e.A(121985),{User:u}=p(),m=await u.findByPk(d.id);if(!m||!m.email)return(0,r.createErrorResponse)("Admin email not found",404);let h=(0,i.generateOTP)(),g=new Date(Date.now()+6e5),f=`${m.id}_${c}`;for(let[e,t]of(o.set(f,{otp:h,expires:g,dairyId:c}),o.entries()))t.expires<new Date&&o.delete(e);try{let e={host:process.env.SMTP_HOST||process.env.EMAIL_HOST||"smtp.gmail.com",port:parseInt(process.env.SMTP_PORT||process.env.EMAIL_PORT||"587"),secure:"true"===(process.env.SMTP_SECURE||process.env.EMAIL_SECURE),auth:{user:process.env.SMTP_USERNAME||process.env.EMAIL_USER,pass:process.env.SMTP_PASSWORD||process.env.EMAIL_PASSWORD}},t=n.default.createTransport(e),r={from:`"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME||process.env.EMAIL_USER}>`,to:m.email,subject:"⚠️ CRITICAL: Dairy Deletion Confirmation Required",html:`
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
              <p style="margin-top: 0; font-size: 16px;">Hello <strong>${m.fullName}</strong>,</p>
              
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
                <div class="otp">${h}</div>
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
      `};await t.sendMail(r),console.log(`✅ Delete confirmation OTP sent to ${m.email} for dairy ${c}`)}catch(e){return console.error("Failed to send OTP email:",e),(0,r.createErrorResponse)("Failed to send OTP email",500)}return(0,r.createSuccessResponse)({expiresIn:600},"OTP sent to your email address")}catch(e){return console.error("Error sending delete OTP:",e),(0,r.createErrorResponse)("Failed to send OTP",500)}}function l(e,t,r){let a=`${e}_${t}`,i=o.get(a);return!!i&&(i.expires<new Date?(o.delete(a),!1):i.otp===r&&i.dairyId===t&&(o.delete(a),!0))}e.s(["POST",()=>s,"verifyDeleteOTP",()=>l])},737661,e=>{"use strict";var t=e.i(747909),r=e.i(174017),a=e.i(996250),i=e.i(759756),n=e.i(561916),o=e.i(114444),s=e.i(837092),l=e.i(869741),d=e.i(316795),c=e.i(487718),p=e.i(995169),u=e.i(47587),m=e.i(666012),h=e.i(570101),g=e.i(626937),f=e.i(10372),v=e.i(193695);e.i(52474);var x=e.i(600220),R=e.i(168761);let y=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/user/dairy/send-delete-otp/route",pathname:"/api/user/dairy/send-delete-otp",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/user/dairy/send-delete-otp/route.ts",nextConfigOutput:"",userland:R}),{workAsyncStorage:E,workUnitAsyncStorage:w,serverHooks:A}=y;function T(){return(0,a.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:w})}async function b(e,t,a){y.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let R="/api/user/dairy/send-delete-otp/route";R=R.replace(/\/index$/,"")||"/";let E=await y.prepare(e,t,{srcPage:R,multiZoneDraftMode:!1});if(!E)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:w,params:A,nextConfig:T,parsedUrl:b,isDraftMode:C,prerenderManifest:S,routerServerContext:P,isOnDemandRevalidate:_,revalidateOnlyGenerated:O,resolvedPathname:I,clientReferenceManifest:N,serverActionsManifest:M}=E,D=(0,l.normalizeAppPath)(R),U=!!(S.dynamicRoutes[D]||S.routes[I]),k=async()=>((null==P?void 0:P.render404)?await P.render404(e,t,b,!1):t.end("This page could not be found"),null);if(U&&!C){let e=!!S.routes[I],t=S.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(T.experimental.adapterPath)return await k();throw new v.NoFallbackError}}let q=null;!U||y.isDev||C||(q="/index"===(q=I)?"/":q);let H=!0===y.isDev||!U,$=U&&!H;M&&N&&(0,o.setReferenceManifestsSingleton)({page:R,clientReferenceManifest:N,serverActionsManifest:M,serverModuleMap:(0,s.createServerModuleMap)({serverActionsManifest:M})});let L=e.method||"GET",F=(0,n.getTracer)(),j=F.getActiveScopeSpan(),z={params:A,prerenderManifest:S,renderOpts:{experimental:{authInterrupts:!!T.experimental.authInterrupts},cacheComponents:!!T.cacheComponents,supportsDynamicResponse:H,incrementalCache:(0,i.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:T.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a)=>y.onRequestError(e,t,a,P)},sharedContext:{buildId:w}},B=new d.NodeNextRequest(e),K=new d.NodeNextResponse(t),V=c.NextRequestAdapter.fromNodeNextRequest(B,(0,c.signalFromNodeResponse)(t));try{let o=async e=>y.handle(V,z).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=F.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${L} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t)}else e.updateName(`${L} ${R}`)}),s=!!(0,i.getRequestMeta)(e,"minimalMode"),l=async i=>{var n,l;let d=async({previousCacheEntry:r})=>{try{if(!s&&_&&O&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await o(i);e.fetchMetrics=z.renderOpts.fetchMetrics;let l=z.renderOpts.pendingWaitUntil;l&&a.waitUntil&&(a.waitUntil(l),l=void 0);let d=z.renderOpts.collectedTags;if(!U)return await (0,m.sendResponse)(B,K,n,z.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,h.toNodeOutgoingHttpHeaders)(n.headers);d&&(t[f.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==z.renderOpts.collectedRevalidate&&!(z.renderOpts.collectedRevalidate>=f.INFINITE_CACHE)&&z.renderOpts.collectedRevalidate,a=void 0===z.renderOpts.collectedExpire||z.renderOpts.collectedExpire>=f.INFINITE_CACHE?void 0:z.renderOpts.collectedExpire;return{value:{kind:x.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await y.onRequestError(e,t,{routerKind:"App Router",routePath:R,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:$,isOnDemandRevalidate:_})},P),t}},c=await y.handleResponse({req:e,nextConfig:T,cacheKey:q,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:S,isRoutePPREnabled:!1,isOnDemandRevalidate:_,revalidateOnlyGenerated:O,responseGenerator:d,waitUntil:a.waitUntil,isMinimalMode:s});if(!U)return null;if((null==c||null==(n=c.value)?void 0:n.kind)!==x.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(l=c.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});s||t.setHeader("x-nextjs-cache",_?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),C&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let p=(0,h.fromNodeOutgoingHttpHeaders)(c.value.headers);return s&&U||p.delete(f.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||p.get("Cache-Control")||p.set("Cache-Control",(0,g.getCacheControlHeader)(c.cacheControl)),await (0,m.sendResponse)(B,K,new Response(c.value.body,{headers:p,status:c.value.status||200})),null};j?await l(j):await F.withPropagatedContext(e.headers,()=>F.trace(p.BaseServerSpan.handleRequest,{spanName:`${L} ${R}`,kind:n.SpanKind.SERVER,attributes:{"http.method":L,"http.target":e.url}},l))}catch(t){if(t instanceof v.NoFallbackError||await y.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:$,isOnDemandRevalidate:_})}),U)throw t;return await (0,m.sendResponse)(B,K,new Response(null,{status:500})),null}}e.s(["handler",()=>b,"patchFetch",()=>T,"routeModule",()=>y,"serverHooks",()=>A,"workAsyncStorage",()=>E,"workUnitAsyncStorage",()=>w])},453753,e=>{e.v(t=>Promise.all(["server/chunks/src_lib_migrations_ts_7dc08040._.js"].map(t=>e.l(t))).then(()=>t(736987)))},121985,e=>{e.v(t=>Promise.all(["server/chunks/src_models_index_ts_328304ec._.js"].map(t=>e.l(t))).then(()=>t(540590)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__9c7db081._.js.map