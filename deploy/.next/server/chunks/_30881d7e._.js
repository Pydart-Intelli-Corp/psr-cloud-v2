module.exports=[197373,e=>{"use strict";var t=e.i(747909),n=e.i(174017),a=e.i(996250),r=e.i(759756),s=e.i(561916),o=e.i(114444),i=e.i(837092),c=e.i(869741),l=e.i(316795),u=e.i(487718),d=e.i(995169),h=e.i(47587),p=e.i(666012),_=e.i(570101),m=e.i(626937),f=e.i(10372),R=e.i(193695);e.i(52474);var E=e.i(600220),y=e.i(89171),w=e.i(79832),v=e.i(84168),N=e.i(191273),T=e.i(213075);async function g(t){try{let n=t.headers.get("authorization")?.replace("Bearer ","");if(!n)return y.NextResponse.json({success:!1,error:"Authentication required"},{status:401});let a=(0,w.verifyToken)(n);if(!a)return y.NextResponse.json({success:!1,error:"Unauthorized"},{status:401});if(a.role!==T.UserRole.ADMIN)return y.NextResponse.json({success:!1,error:"Only admins can add correction data"},{status:403});let r=(0,v.default)();if(!r)return y.NextResponse.json({success:!1,error:"Database connection not available"},{status:500});let{getModels:s}=await e.A(121985),{User:o}=s(),{machineId:i,societyId:c,channel1_fat:l,channel1_snf:u,channel1_clr:d,channel1_temp:h,channel1_water:p,channel1_protein:_,channel2_fat:m,channel2_snf:f,channel2_clr:R,channel2_temp:E,channel2_water:g,channel2_protein:x,channel3_fat:C,channel3_snf:A,channel3_clr:I,channel3_temp:O,channel3_water:S,channel3_protein:b}=await t.json();if(!i||!c)return y.NextResponse.json({success:!1,error:"Machine ID and Society ID are required"},{status:400});let D=await o.findByPk(a.id);if(!D||!D.dbKey)return y.NextResponse.json({success:!1,error:"Admin schema not found"},{status:404});let P=D.fullName.replace(/[^a-zA-Z0-9]/g,"").toLowerCase(),M=`${P}_${D.dbKey.toLowerCase()}`,[j]=await r.query(`SELECT machine_type FROM \`${M}\`.\`machines\` WHERE id = :machineId LIMIT 1`,{replacements:{machineId:i},type:N.QueryTypes.SELECT}),q=j?.machine_type||null,U=e=>{if(!e||""===e)return 0;let t=parseFloat(e);return isNaN(t)?0:t},H=await r.transaction();try{await r.query(`UPDATE \`${M}\`.\`machine_corrections\` 
         SET status = 0 
         WHERE machine_id = :machineId AND status = 1`,{replacements:{machineId:i},type:N.QueryTypes.UPDATE,transaction:H}),await r.query(`INSERT INTO \`${M}\`.\`machine_corrections\` (
          machine_id,
          society_id,
          machine_type,
          channel1_fat,
          channel1_snf,
          channel1_clr,
          channel1_temp,
          channel1_water,
          channel1_protein,
          channel2_fat,
          channel2_snf,
          channel2_clr,
          channel2_temp,
          channel2_water,
          channel2_protein,
          channel3_fat,
          channel3_snf,
          channel3_clr,
          channel3_temp,
          channel3_water,
          channel3_protein,
          status,
          created_at,
          updated_at
        ) VALUES (
          :machineId,
          :societyId,
          :machineType,
          :channel1_fat,
          :channel1_snf,
          :channel1_clr,
          :channel1_temp,
          :channel1_water,
          :channel1_protein,
          :channel2_fat,
          :channel2_snf,
          :channel2_clr,
          :channel2_temp,
          :channel2_water,
          :channel2_protein,
          :channel3_fat,
          :channel3_snf,
          :channel3_clr,
          :channel3_temp,
          :channel3_water,
          :channel3_protein,
          1,
          NOW(),
          NOW()
        )`,{replacements:{machineId:i,societyId:c,machineType:q,channel1_fat:U(l),channel1_snf:U(u),channel1_clr:U(d),channel1_temp:U(h),channel1_water:U(p),channel1_protein:U(_),channel2_fat:U(m),channel2_snf:U(f),channel2_clr:U(R),channel2_temp:U(E),channel2_water:U(g),channel2_protein:U(x),channel3_fat:U(C),channel3_snf:U(A),channel3_clr:U(I),channel3_temp:U(O),channel3_water:U(S),channel3_protein:U(b)},type:N.QueryTypes.INSERT,transaction:H});let e=await r.query(`SELECT id FROM \`${M}\`.\`machine_corrections\` 
         WHERE machine_id = :machineId 
         ORDER BY created_at DESC 
         LIMIT 5`,{replacements:{machineId:i},type:N.QueryTypes.SELECT,transaction:H});if(e.length>0){let t=e.map(e=>e.id);await r.query(`DELETE FROM \`${M}\`.\`machine_corrections\` 
           WHERE machine_id = :machineId 
           AND id NOT IN (:idsToKeep)`,{replacements:{machineId:i,idsToKeep:t},type:N.QueryTypes.DELETE,transaction:H})}return await H.commit(),y.NextResponse.json({success:!0,message:"Correction data saved successfully"})}catch(e){throw await H.rollback(),e}}catch(e){return console.error("Error saving correction data:",e),y.NextResponse.json({success:!1,error:e instanceof Error?e.message:"Failed to save correction data"},{status:500})}}async function x(t){try{let n=t.headers.get("authorization")?.replace("Bearer ","");if(!n)return y.NextResponse.json({success:!1,error:"Authentication required"},{status:401});let a=(0,w.verifyToken)(n);if(!a)return y.NextResponse.json({success:!1,error:"Unauthorized"},{status:401});if(a.role!==T.UserRole.ADMIN)return y.NextResponse.json({success:!1,error:"Only admins can view correction data"},{status:403});let r=(0,v.default)();if(!r)return y.NextResponse.json({success:!1,error:"Database connection not available"},{status:500});let{getModels:s}=await e.A(121985),{User:o}=s(),{searchParams:i}=new URL(t.url),c=i.get("machineId");if(!c)return y.NextResponse.json({success:!1,error:"Machine ID is required"},{status:400});let l=await o.findByPk(a.id);if(!l||!l.dbKey)return y.NextResponse.json({success:!1,error:"Admin schema not found"},{status:404});let u=l.fullName.replace(/[^a-zA-Z0-9]/g,"").toLowerCase(),d=`${u}_${l.dbKey.toLowerCase()}`,h=await r.query(`SELECT * FROM \`${d}\`.\`machine_corrections\` 
       WHERE machine_id = :machineId 
       ORDER BY created_at DESC
       LIMIT 5`,{replacements:{machineId:c},type:N.QueryTypes.SELECT}),p=h.find(e=>1===e.status);return y.NextResponse.json({success:!0,data:p||(h.length>0?h[0]:null),history:h})}catch(e){return console.error("Error fetching correction data:",e),y.NextResponse.json({success:!1,error:e instanceof Error?e.message:"Failed to fetch correction data"},{status:500})}}e.s(["GET",()=>x,"POST",()=>g],767208);var C=e.i(767208);let A=new t.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/user/machine-correction/route",pathname:"/api/user/machine-correction",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/user/machine-correction/route.ts",nextConfigOutput:"",userland:C}),{workAsyncStorage:I,workUnitAsyncStorage:O,serverHooks:S}=A;function b(){return(0,a.patchFetch)({workAsyncStorage:I,workUnitAsyncStorage:O})}async function D(e,t,a){A.isDev&&(0,r.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let y="/api/user/machine-correction/route";y=y.replace(/\/index$/,"")||"/";let w=await A.prepare(e,t,{srcPage:y,multiZoneDraftMode:!1});if(!w)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:v,params:N,nextConfig:T,parsedUrl:g,isDraftMode:x,prerenderManifest:C,routerServerContext:I,isOnDemandRevalidate:O,revalidateOnlyGenerated:S,resolvedPathname:b,clientReferenceManifest:D,serverActionsManifest:P}=w,M=(0,c.normalizeAppPath)(y),j=!!(C.dynamicRoutes[M]||C.routes[b]),q=async()=>((null==I?void 0:I.render404)?await I.render404(e,t,g,!1):t.end("This page could not be found"),null);if(j&&!x){let e=!!C.routes[b],t=C.dynamicRoutes[M];if(t&&!1===t.fallback&&!e){if(T.experimental.adapterPath)return await q();throw new R.NoFallbackError}}let U=null;!j||A.isDev||x||(U="/index"===(U=b)?"/":U);let H=!0===A.isDev||!j,L=j&&!H;P&&D&&(0,o.setReferenceManifestsSingleton)({page:y,clientReferenceManifest:D,serverActionsManifest:P,serverModuleMap:(0,i.createServerModuleMap)({serverActionsManifest:P})});let k=e.method||"GET",$=(0,s.getTracer)(),F=$.getActiveScopeSpan(),K={params:N,prerenderManifest:C,renderOpts:{experimental:{authInterrupts:!!T.experimental.authInterrupts},cacheComponents:!!T.cacheComponents,supportsDynamicResponse:H,incrementalCache:(0,r.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:T.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,n,a)=>A.onRequestError(e,t,a,I)},sharedContext:{buildId:v}},B=new l.NodeNextRequest(e),W=new l.NodeNextResponse(t),z=u.NextRequestAdapter.fromNodeNextRequest(B,(0,u.signalFromNodeResponse)(t));try{let o=async e=>A.handle(z,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let n=$.getRootSpanAttributes();if(!n)return;if(n.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${n.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=n.get("next.route");if(a){let t=`${k} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t)}else e.updateName(`${k} ${y}`)}),i=!!(0,r.getRequestMeta)(e,"minimalMode"),c=async r=>{var s,c;let l=async({previousCacheEntry:n})=>{try{if(!i&&O&&S&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await o(r);e.fetchMetrics=K.renderOpts.fetchMetrics;let c=K.renderOpts.pendingWaitUntil;c&&a.waitUntil&&(a.waitUntil(c),c=void 0);let l=K.renderOpts.collectedTags;if(!j)return await (0,p.sendResponse)(B,W,s,K.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,_.toNodeOutgoingHttpHeaders)(s.headers);l&&(t[f.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let n=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=f.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,a=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=f.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:E.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:n,expire:a}}}}catch(t){throw(null==n?void 0:n.isStale)&&await A.onRequestError(e,t,{routerKind:"App Router",routePath:y,routeType:"route",revalidateReason:(0,h.getRevalidateReason)({isStaticGeneration:L,isOnDemandRevalidate:O})},I),t}},u=await A.handleResponse({req:e,nextConfig:T,cacheKey:U,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:O,revalidateOnlyGenerated:S,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:i});if(!j)return null;if((null==u||null==(s=u.value)?void 0:s.kind)!==E.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==u||null==(c=u.value)?void 0:c.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});i||t.setHeader("x-nextjs-cache",O?"REVALIDATED":u.isMiss?"MISS":u.isStale?"STALE":"HIT"),x&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,_.fromNodeOutgoingHttpHeaders)(u.value.headers);return i&&j||d.delete(f.NEXT_CACHE_TAGS_HEADER),!u.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,m.getCacheControlHeader)(u.cacheControl)),await (0,p.sendResponse)(B,W,new Response(u.value.body,{headers:d,status:u.value.status||200})),null};F?await c(F):await $.withPropagatedContext(e.headers,()=>$.trace(d.BaseServerSpan.handleRequest,{spanName:`${k} ${y}`,kind:s.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},c))}catch(t){if(t instanceof R.NoFallbackError||await A.onRequestError(e,t,{routerKind:"App Router",routePath:M,routeType:"route",revalidateReason:(0,h.getRevalidateReason)({isStaticGeneration:L,isOnDemandRevalidate:O})}),j)throw t;return await (0,p.sendResponse)(B,W,new Response(null,{status:500})),null}}e.s(["handler",()=>D,"patchFetch",()=>b,"routeModule",()=>A,"serverHooks",()=>S,"workAsyncStorage",()=>I,"workUnitAsyncStorage",()=>O],197373)},453753,e=>{e.v(t=>Promise.all(["server/chunks/[root-of-the-server]__86f7d54e._.js"].map(t=>e.l(t))).then(()=>t(736987)))},121985,e=>{e.v(t=>Promise.all(["server/chunks/src_models_index_ts_328304ec._.js"].map(t=>e.l(t))).then(()=>t(540590)))}];

//# sourceMappingURL=_30881d7e._.js.map