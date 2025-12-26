module.exports=[48798,e=>{"use strict";var t=e.i(89171);function a(e,r,s=200){return t.NextResponse.json({success:!0,message:e,data:r},{status:s})}function r(e,a=400,s){return t.NextResponse.json({success:!1,message:"Error occurred",error:e,data:s},{status:a})}e.s(["createErrorResponse",()=>r,"createSuccessResponse",()=>a])},278593,e=>{"use strict";var t=e.i(747909),a=e.i(174017),r=e.i(996250),s=e.i(759756),i=e.i(561916),o=e.i(114444),n=e.i(837092),c=e.i(869741),l=e.i(316795),d=e.i(487718),u=e.i(995169),m=e.i(47587),E=e.i(666012),_=e.i(570101),C=e.i(626937),T=e.i(10372),p=e.i(193695);e.i(52474);var f=e.i(600220),N=e.i(84168),R=e.i(48798),O=e.i(79832);async function S(t){try{let a=t.headers.get("authorization")?.replace("Bearer ","");if(!a)return(0,R.createErrorResponse)("Authentication required",401);let r=(0,O.verifyToken)(a);if(!r||!r.entityType)return(0,R.createErrorResponse)("Invalid authentication token",401);await (0,N.connectDB)();let{getModels:s}=await e.A(121985),{sequelize:i}=s(),{entityType:o,schemaName:n,id:c}=r;if(!n)return(0,R.createErrorResponse)("Invalid token: missing schema information",401);let l={};try{switch(o){case"society":let[e]=await i.query(`
            SELECT 
              s.id, s.name, s.society_id, s.status,
              COUNT(DISTINCT f.id) as total_farmers,
              COUNT(DISTINCT CASE WHEN f.status = 'active' THEN f.id END) as active_farmers,
              COUNT(DISTINCT mc30.id) as collections_last_30d,
              COALESCE(SUM(mc30.quantity), 0) as quantity_last_30d,
              COALESCE(SUM(mc30.total_amount), 0) as amount_last_30d,
              COUNT(DISTINCT mc7.id) as collections_last_7d,
              COALESCE(SUM(mc7.quantity), 0) as quantity_last_7d,
              COALESCE(SUM(mc7.total_amount), 0) as amount_last_7d,
              COUNT(DISTINCT mctoday.id) as collections_today,
              COALESCE(SUM(mctoday.quantity), 0) as quantity_today,
              COALESCE(SUM(mctoday.total_amount), 0) as amount_today
            FROM \`${n}\`.societies s
            LEFT JOIN \`${n}\`.farmers f ON s.id = f.society_id
            LEFT JOIN \`${n}\`.milk_collections mc30 ON f.id = mc30.farmer_id AND mc30.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            LEFT JOIN \`${n}\`.milk_collections mc7 ON f.id = mc7.farmer_id AND mc7.collection_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            LEFT JOIN \`${n}\`.milk_collections mctoday ON f.id = mctoday.farmer_id AND mctoday.collection_date = CURDATE()
            WHERE s.id = ?
            GROUP BY s.id, s.name, s.society_id, s.status
          `,{replacements:[c]}),[t]=await i.query(`
            SELECT 
              mc.id, mc.collection_date, mc.collection_time, mc.quantity, mc.fat_percentage,
              mc.snf_percentage, mc.total_amount, f.farmer_id, f.name as farmer_name
            FROM \`${n}\`.milk_collections mc
            JOIN \`${n}\`.farmers f ON mc.farmer_id = f.id
            WHERE f.society_id = ?
            ORDER BY mc.collection_date DESC, mc.collection_time DESC
            LIMIT 10
          `,{replacements:[c]});l={type:"society",stats:e[0]||{},recentCollections:t||[]};break;case"farmer":let[a]=await i.query(`
            SELECT 
              f.id, f.farmer_id, f.name, f.status,
              COUNT(DISTINCT mc30.id) as collections_last_30d,
              COALESCE(SUM(mc30.quantity), 0) as quantity_last_30d,
              COALESCE(SUM(mc30.total_amount), 0) as amount_last_30d,
              COALESCE(AVG(mc30.fat_percentage), 0) as avg_fat_30d,
              COALESCE(AVG(mc30.snf_percentage), 0) as avg_snf_30d,
              COUNT(DISTINCT mc7.id) as collections_last_7d,
              COALESCE(SUM(mc7.quantity), 0) as quantity_last_7d,
              COALESCE(SUM(mc7.total_amount), 0) as amount_last_7d,
              COUNT(DISTINCT mctoday.id) as collections_today,
              COALESCE(SUM(mctoday.quantity), 0) as quantity_today,
              COALESCE(SUM(mctoday.total_amount), 0) as amount_today
            FROM \`${n}\`.farmers f
            LEFT JOIN \`${n}\`.milk_collections mc30 ON f.id = mc30.farmer_id AND mc30.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            LEFT JOIN \`${n}\`.milk_collections mc7 ON f.id = mc7.farmer_id AND mc7.collection_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            LEFT JOIN \`${n}\`.milk_collections mctoday ON f.id = mctoday.farmer_id AND mctoday.collection_date = CURDATE()
            WHERE f.id = ?
            GROUP BY f.id, f.farmer_id, f.name, f.status
          `,{replacements:[c]}),[s]=await i.query(`
            SELECT 
              mc.id, mc.collection_date, mc.collection_time, mc.quantity, mc.fat_percentage,
              mc.snf_percentage, mc.clr_value, mc.water_percentage, mc.total_amount
            FROM \`${n}\`.milk_collections mc
            WHERE mc.farmer_id = ?
            ORDER BY mc.collection_date DESC, mc.collection_time DESC
            LIMIT 15
          `,{replacements:[c]});l={type:"farmer",stats:a[0]||{},recentCollections:s||[]};break;case"bmc":let[d]=await i.query(`
            SELECT 
              b.id, b.name, b.bmc_id, b.status,
              COUNT(DISTINCT s.id) as total_societies,
              COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_societies,
              COUNT(DISTINCT f.id) as total_farmers,
              COUNT(DISTINCT CASE WHEN f.status = 'active' THEN f.id END) as active_farmers,
              COUNT(DISTINCT mc30.id) as collections_last_30d,
              COALESCE(SUM(mc30.quantity), 0) as quantity_last_30d,
              COALESCE(SUM(mc30.total_amount), 0) as amount_last_30d
            FROM \`${n}\`.bmcs b
            LEFT JOIN \`${n}\`.societies s ON b.id = s.bmc_id
            LEFT JOIN \`${n}\`.farmers f ON s.id = f.society_id
            LEFT JOIN \`${n}\`.milk_collections mc30 ON f.id = mc30.farmer_id AND mc30.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            WHERE b.id = ?
            GROUP BY b.id, b.name, b.bmc_id, b.status
          `,{replacements:[c]});l={type:"bmc",stats:d[0]||{}};break;case"dairy":let[u]=await i.query(`
            SELECT 
              d.id, d.name, d.dairy_id, d.status,
              COUNT(DISTINCT b.id) as total_bmcs,
              COUNT(DISTINCT CASE WHEN b.status = 'active' THEN b.id END) as active_bmcs,
              COUNT(DISTINCT s.id) as total_societies,
              COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_societies,
              COUNT(DISTINCT f.id) as total_farmers,
              COUNT(DISTINCT CASE WHEN f.status = 'active' THEN f.id END) as active_farmers,
              COUNT(DISTINCT mc30.id) as collections_last_30d,
              COALESCE(SUM(mc30.quantity), 0) as quantity_last_30d,
              COALESCE(SUM(mc30.total_amount), 0) as amount_last_30d
            FROM \`${n}\`.dairies d
            LEFT JOIN \`${n}\`.bmcs b ON d.id = b.dairy_id
            LEFT JOIN \`${n}\`.societies s ON b.id = s.bmc_id
            LEFT JOIN \`${n}\`.farmers f ON s.id = f.society_id
            LEFT JOIN \`${n}\`.milk_collections mc30 ON f.id = mc30.farmer_id AND mc30.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            WHERE d.id = ?
            GROUP BY d.id, d.name, d.dairy_id, d.status
          `,{replacements:[c]});l={type:"dairy",stats:u[0]||{}};break;default:return(0,R.createErrorResponse)("Invalid entity type",400)}return console.log(`✅ Dashboard data fetched for ${o}: ${r.uid}`),(0,R.createSuccessResponse)("Dashboard data retrieved successfully",l)}catch(e){return console.error("Database query error:",e),(0,R.createErrorResponse)("Failed to fetch dashboard data",500)}}catch(e){return console.error("Error fetching dashboard:",e),(0,R.createErrorResponse)("Failed to fetch dashboard data",500)}}e.s(["GET",()=>S],619783);var y=e.i(619783);let h=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/external/auth/dashboard/route",pathname:"/api/external/auth/dashboard",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/external/auth/dashboard/route.ts",nextConfigOutput:"",userland:y}),{workAsyncStorage:A,workUnitAsyncStorage:I,serverHooks:D}=h;function v(){return(0,r.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:I})}async function U(e,t,r){h.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let N="/api/external/auth/dashboard/route";N=N.replace(/\/index$/,"")||"/";let R=await h.prepare(e,t,{srcPage:N,multiZoneDraftMode:!1});if(!R)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:O,params:S,nextConfig:y,parsedUrl:A,isDraftMode:I,prerenderManifest:D,routerServerContext:v,isOnDemandRevalidate:U,revalidateOnlyGenerated:b,resolvedPathname:g,clientReferenceManifest:L,serverActionsManifest:w}=R,q=(0,c.normalizeAppPath)(N),M=!!(D.dynamicRoutes[q]||D.routes[g]),x=async()=>((null==v?void 0:v.render404)?await v.render404(e,t,A,!1):t.end("This page could not be found"),null);if(M&&!I){let e=!!D.routes[g],t=D.dynamicRoutes[q];if(t&&!1===t.fallback&&!e){if(y.experimental.adapterPath)return await x();throw new p.NoFallbackError}}let H=null;!M||h.isDev||I||(H="/index"===(H=g)?"/":H);let k=!0===h.isDev||!M,$=M&&!k;w&&L&&(0,o.setReferenceManifestsSingleton)({page:N,clientReferenceManifest:L,serverActionsManifest:w,serverModuleMap:(0,n.createServerModuleMap)({serverActionsManifest:w})});let F=e.method||"GET",P=(0,i.getTracer)(),B=P.getActiveScopeSpan(),J={params:S,prerenderManifest:D,renderOpts:{experimental:{authInterrupts:!!y.experimental.authInterrupts},cacheComponents:!!y.cacheComponents,supportsDynamicResponse:k,incrementalCache:(0,s.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:y.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r)=>h.onRequestError(e,t,r,v)},sharedContext:{buildId:O}},W=new l.NodeNextRequest(e),Y=new l.NodeNextResponse(t),j=d.NextRequestAdapter.fromNodeNextRequest(W,(0,d.signalFromNodeResponse)(t));try{let o=async e=>h.handle(j,J).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=P.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${F} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t)}else e.updateName(`${F} ${N}`)}),n=!!(0,s.getRequestMeta)(e,"minimalMode"),c=async s=>{var i,c;let l=async({previousCacheEntry:a})=>{try{if(!n&&U&&b&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await o(s);e.fetchMetrics=J.renderOpts.fetchMetrics;let c=J.renderOpts.pendingWaitUntil;c&&r.waitUntil&&(r.waitUntil(c),c=void 0);let l=J.renderOpts.collectedTags;if(!M)return await (0,E.sendResponse)(W,Y,i,J.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,_.toNodeOutgoingHttpHeaders)(i.headers);l&&(t[T.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==J.renderOpts.collectedRevalidate&&!(J.renderOpts.collectedRevalidate>=T.INFINITE_CACHE)&&J.renderOpts.collectedRevalidate,r=void 0===J.renderOpts.collectedExpire||J.renderOpts.collectedExpire>=T.INFINITE_CACHE?void 0:J.renderOpts.collectedExpire;return{value:{kind:f.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await h.onRequestError(e,t,{routerKind:"App Router",routePath:N,routeType:"route",revalidateReason:(0,m.getRevalidateReason)({isStaticGeneration:$,isOnDemandRevalidate:U})},v),t}},d=await h.handleResponse({req:e,nextConfig:y,cacheKey:H,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:D,isRoutePPREnabled:!1,isOnDemandRevalidate:U,revalidateOnlyGenerated:b,responseGenerator:l,waitUntil:r.waitUntil,isMinimalMode:n});if(!M)return null;if((null==d||null==(i=d.value)?void 0:i.kind)!==f.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(c=d.value)?void 0:c.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});n||t.setHeader("x-nextjs-cache",U?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),I&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,_.fromNodeOutgoingHttpHeaders)(d.value.headers);return n&&M||u.delete(T.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,C.getCacheControlHeader)(d.cacheControl)),await (0,E.sendResponse)(W,Y,new Response(d.value.body,{headers:u,status:d.value.status||200})),null};B?await c(B):await P.withPropagatedContext(e.headers,()=>P.trace(u.BaseServerSpan.handleRequest,{spanName:`${F} ${N}`,kind:i.SpanKind.SERVER,attributes:{"http.method":F,"http.target":e.url}},c))}catch(t){if(t instanceof p.NoFallbackError||await h.onRequestError(e,t,{routerKind:"App Router",routePath:q,routeType:"route",revalidateReason:(0,m.getRevalidateReason)({isStaticGeneration:$,isOnDemandRevalidate:U})}),M)throw t;return await (0,E.sendResponse)(W,Y,new Response(null,{status:500})),null}}e.s(["handler",()=>U,"patchFetch",()=>v,"routeModule",()=>h,"serverHooks",()=>D,"workAsyncStorage",()=>A,"workUnitAsyncStorage",()=>I],278593)},453753,e=>{e.v(t=>Promise.all(["server/chunks/[root-of-the-server]__86f7d54e._.js"].map(t=>e.l(t))).then(()=>t(736987)))},121985,e=>{e.v(t=>Promise.all(["server/chunks/src_models_index_ts_328304ec._.js"].map(t=>e.l(t))).then(()=>t(540590)))}];

//# sourceMappingURL=_936a3cd8._.js.map