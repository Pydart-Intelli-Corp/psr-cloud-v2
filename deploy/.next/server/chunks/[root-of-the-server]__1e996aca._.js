module.exports=[141528,(e,t,s)=>{function r(e,t,s,r){return Math.round(e/s)+" "+r+(t>=1.5*s?"s":"")}t.exports=function(e,t){t=t||{};var s,i,a,o,n=typeof e;if("string"===n&&e.length>0){var l=e;if(!((l=String(l)).length>100)){var c=/^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(l);if(c){var u=parseFloat(c[1]);switch((c[2]||"ms").toLowerCase()){case"years":case"year":case"yrs":case"yr":case"y":return 315576e5*u;case"weeks":case"week":case"w":return 6048e5*u;case"days":case"day":case"d":return 864e5*u;case"hours":case"hour":case"hrs":case"hr":case"h":return 36e5*u;case"minutes":case"minute":case"mins":case"min":case"m":return 6e4*u;case"seconds":case"second":case"secs":case"sec":case"s":return 1e3*u;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return u;default:break}}}return}if("number"===n&&isFinite(e)){return t.long?(i=Math.abs(s=e))>=864e5?r(s,i,864e5,"day"):i>=36e5?r(s,i,36e5,"hour"):i>=6e4?r(s,i,6e4,"minute"):i>=1e3?r(s,i,1e3,"second"):s+" ms":(o=Math.abs(a=e))>=864e5?Math.round(a/864e5)+"d":o>=36e5?Math.round(a/36e5)+"h":o>=6e4?Math.round(a/6e4)+"m":o>=1e3?Math.round(a/1e3)+"s":a+"ms"}throw Error("val is not a non-empty string or a valid number. val="+JSON.stringify(e))}},522734,(e,t,s)=>{t.exports=e.x("fs",()=>require("fs"))},446786,(e,t,s)=>{t.exports=e.x("os",()=>require("os"))},792509,(e,t,s)=>{t.exports=e.x("url",()=>require("url"))},254799,(e,t,s)=>{t.exports=e.x("crypto",()=>require("crypto"))},688947,(e,t,s)=>{t.exports=e.x("stream",()=>require("stream"))},500874,(e,t,s)=>{t.exports=e.x("buffer",()=>require("buffer"))},504446,(e,t,s)=>{t.exports=e.x("net",()=>require("net"))},755004,(e,t,s)=>{t.exports=e.x("tls",()=>require("tls"))},427699,(e,t,s)=>{t.exports=e.x("events",()=>require("events"))},406461,(e,t,s)=>{t.exports=e.x("zlib",()=>require("zlib"))},918622,(e,t,s)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},556704,(e,t,s)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},832319,(e,t,s)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},270406,(e,t,s)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},224361,(e,t,s)=>{t.exports=e.x("util",()=>require("util"))},814747,(e,t,s)=>{t.exports=e.x("path",()=>require("path"))},193695,(e,t,s)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},442315,(e,t,s)=>{"use strict";t.exports=e.r(918622)},347540,(e,t,s)=>{"use strict";t.exports=e.r(442315).vendored["react-rsc"].React},819481,(e,t,s)=>{"use strict";var r=Object.defineProperty,i=Object.getOwnPropertyDescriptor,a=Object.getOwnPropertyNames,o=Object.prototype.hasOwnProperty,n={},l={RequestCookies:()=>y,ResponseCookies:()=>E,parseCookie:()=>p,parseSetCookie:()=>d,stringifyCookie:()=>u};for(var c in l)r(n,c,{get:l[c],enumerable:!0});function u(e){var t;let s=["path"in e&&e.path&&`Path=${e.path}`,"expires"in e&&(e.expires||0===e.expires)&&`Expires=${("number"==typeof e.expires?new Date(e.expires):e.expires).toUTCString()}`,"maxAge"in e&&"number"==typeof e.maxAge&&`Max-Age=${e.maxAge}`,"domain"in e&&e.domain&&`Domain=${e.domain}`,"secure"in e&&e.secure&&"Secure","httpOnly"in e&&e.httpOnly&&"HttpOnly","sameSite"in e&&e.sameSite&&`SameSite=${e.sameSite}`,"partitioned"in e&&e.partitioned&&"Partitioned","priority"in e&&e.priority&&`Priority=${e.priority}`].filter(Boolean),r=`${e.name}=${encodeURIComponent(null!=(t=e.value)?t:"")}`;return 0===s.length?r:`${r}; ${s.join("; ")}`}function p(e){let t=new Map;for(let s of e.split(/; */)){if(!s)continue;let e=s.indexOf("=");if(-1===e){t.set(s,"true");continue}let[r,i]=[s.slice(0,e),s.slice(e+1)];try{t.set(r,decodeURIComponent(null!=i?i:"true"))}catch{}}return t}function d(e){if(!e)return;let[[t,s],...r]=p(e),{domain:i,expires:a,httponly:o,maxage:n,path:l,samesite:c,secure:u,partitioned:d,priority:y}=Object.fromEntries(r.map(([e,t])=>[e.toLowerCase().replace(/-/g,""),t]));{var E,h,f={name:t,value:decodeURIComponent(s),domain:i,...a&&{expires:new Date(a)},...o&&{httpOnly:!0},..."string"==typeof n&&{maxAge:Number(n)},path:l,...c&&{sameSite:_.includes(E=(E=c).toLowerCase())?E:void 0},...u&&{secure:!0},...y&&{priority:m.includes(h=(h=y).toLowerCase())?h:void 0},...d&&{partitioned:!0}};let e={};for(let t in f)f[t]&&(e[t]=f[t]);return e}}t.exports=((e,t,s,n)=>{if(t&&"object"==typeof t||"function"==typeof t)for(let s of a(t))o.call(e,s)||void 0===s||r(e,s,{get:()=>t[s],enumerable:!(n=i(t,s))||n.enumerable});return e})(r({},"__esModule",{value:!0}),n);var _=["strict","lax","none"],m=["low","medium","high"],y=class{constructor(e){this._parsed=new Map,this._headers=e;const t=e.get("cookie");if(t)for(const[e,s]of p(t))this._parsed.set(e,{name:e,value:s})}[Symbol.iterator](){return this._parsed[Symbol.iterator]()}get size(){return this._parsed.size}get(...e){let t="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(t)}getAll(...e){var t;let s=Array.from(this._parsed);if(!e.length)return s.map(([e,t])=>t);let r="string"==typeof e[0]?e[0]:null==(t=e[0])?void 0:t.name;return s.filter(([e])=>e===r).map(([e,t])=>t)}has(e){return this._parsed.has(e)}set(...e){let[t,s]=1===e.length?[e[0].name,e[0].value]:e,r=this._parsed;return r.set(t,{name:t,value:s}),this._headers.set("cookie",Array.from(r).map(([e,t])=>u(t)).join("; ")),this}delete(e){let t=this._parsed,s=Array.isArray(e)?e.map(e=>t.delete(e)):t.delete(e);return this._headers.set("cookie",Array.from(t).map(([e,t])=>u(t)).join("; ")),s}clear(){return this.delete(Array.from(this._parsed.keys())),this}[Symbol.for("edge-runtime.inspect.custom")](){return`RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(e=>`${e.name}=${encodeURIComponent(e.value)}`).join("; ")}},E=class{constructor(e){var t,s,r;this._parsed=new Map,this._headers=e;const i=null!=(r=null!=(s=null==(t=e.getSetCookie)?void 0:t.call(e))?s:e.get("set-cookie"))?r:[];for(const e of Array.isArray(i)?i:function(e){if(!e)return[];var t,s,r,i,a,o=[],n=0;function l(){for(;n<e.length&&/\s/.test(e.charAt(n));)n+=1;return n<e.length}for(;n<e.length;){for(t=n,a=!1;l();)if(","===(s=e.charAt(n))){for(r=n,n+=1,l(),i=n;n<e.length&&"="!==(s=e.charAt(n))&&";"!==s&&","!==s;)n+=1;n<e.length&&"="===e.charAt(n)?(a=!0,n=i,o.push(e.substring(t,r)),t=n):n=r+1}else n+=1;(!a||n>=e.length)&&o.push(e.substring(t,e.length))}return o}(i)){const t=d(e);t&&this._parsed.set(t.name,t)}}get(...e){let t="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(t)}getAll(...e){var t;let s=Array.from(this._parsed.values());if(!e.length)return s;let r="string"==typeof e[0]?e[0]:null==(t=e[0])?void 0:t.name;return s.filter(e=>e.name===r)}has(e){return this._parsed.has(e)}set(...e){let[t,s,r]=1===e.length?[e[0].name,e[0].value,e[0]]:e,i=this._parsed;return i.set(t,function(e={name:"",value:""}){return"number"==typeof e.expires&&(e.expires=new Date(e.expires)),e.maxAge&&(e.expires=new Date(Date.now()+1e3*e.maxAge)),(null===e.path||void 0===e.path)&&(e.path="/"),e}({name:t,value:s,...r})),function(e,t){for(let[,s]of(t.delete("set-cookie"),e)){let e=u(s);t.append("set-cookie",e)}}(i,this._headers),this}delete(...e){let[t,s]="string"==typeof e[0]?[e[0]]:[e[0].name,e[0]];return this.set({...s,name:t,value:"",expires:new Date(0)})}[Symbol.for("edge-runtime.inspect.custom")](){return`ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(u).join("; ")}}},290092,e=>{"use strict";var t=e.i(191273);class s{static async updatePulseOnCollection(e,s,r,i,a=!0){try{let o,n;"string"==typeof i?(o=i,n=i.split(" ")[0]):n=(o=new Date(i.getTime()+198e5).toISOString().slice(0,19).replace("T"," ")).split(" ")[0],console.log(`📍 Updating pulse for society ${r} on ${n} at ${o}`),console.log(`   🔢 isNewCollection flag: ${a} (will ${a?"INCREMENT":"NOT INCREMENT"} total_collections)`);let l=await e.query(`
        SELECT id, first_collection_time, total_collections, pulse_status
        FROM \`${s}\`.section_pulse
        WHERE society_id = ? AND DATE(pulse_date) = ?
      `,{replacements:[r,n],type:t.QueryTypes.SELECT});if(console.log(`🔍 Query result:`,{length:l?.length,data:l}),l&&0!==l.length){let t=l[0].pulse_status,i=a?`UPDATE \`${s}\`.section_pulse
             SET 
               last_collection_time = ?,
               total_collections = total_collections + 1,
               pulse_status = 'active',
               section_end_time = NULL,
               last_checked = NOW(),
               updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
             WHERE society_id = ? AND DATE(pulse_date) = ?`:`UPDATE \`${s}\`.section_pulse
             SET 
               last_collection_time = ?,
               pulse_status = 'active',
               section_end_time = NULL,
               last_checked = NOW(),
               updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
             WHERE society_id = ? AND DATE(pulse_date) = ?`;await e.query(i,{replacements:[o,r,n]}),"paused"===t?console.log(`▶️ Section restarted from pause - collection at ${o}`):"ended"===t?console.log(`🔄 Section restarted from ended state - collection at ${o}`):console.log(`🔵 Pulse updated - last collection at ${o}${a?"":" (duplicate, count unchanged)"}`)}else await e.query(`
          INSERT INTO \`${s}\`.section_pulse (
            society_id,
            pulse_date,
            first_collection_time,
            last_collection_time,
            pulse_status,
            total_collections,
            inactive_days,
            last_checked,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, 'active', 1, 0, NOW(), CONVERT_TZ(NOW(), '+00:00', '+05:30'), CONVERT_TZ(NOW(), '+00:00', '+05:30'))
        `,{replacements:[r,n,o,o]}),console.log(`🟢 Section start pulse recorded at ${o}`);await this.resetInactiveDays(e,s,r,n)}catch(e){throw console.error("❌ Error updating pulse on collection:",e),e}}static async checkSectionPauseAndEnd(e,s){try{let r=new Date,i=r.toISOString().split("T")[0],a=new Date(r.getTime()-3e5),o=new Date(r.getTime()-36e5),[n]=await e.query(`
        SELECT id, society_id, pulse_date, last_collection_time
        FROM \`${s}\`.section_pulse
        WHERE pulse_status IN ('active', 'paused')
        AND DATE(pulse_date) < ?
        AND section_end_time IS NULL
      `,{replacements:[i],type:t.QueryTypes.SELECT});for(let t of n||[]){let r=t.last_collection_time?new Date(new Date(t.last_collection_time).getTime()+36e5):null;await e.query(`
          UPDATE \`${s}\`.section_pulse
          SET 
            section_end_time = ?,
            pulse_status = 'ended',
            last_checked = NOW(),
            updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
          WHERE id = ?
        `,{replacements:[r,t.id]}),console.log(`🔴 Old section ended for society ${t.society_id} (date: ${t.pulse_date})`)}let[l]=await e.query(`
        SELECT id, society_id, pulse_date, last_collection_time
        FROM \`${s}\`.section_pulse
        WHERE pulse_status = 'active'
        AND DATE(pulse_date) = ?
        AND last_collection_time IS NOT NULL
        AND last_collection_time <= ?
        AND last_collection_time > ?
      `,{replacements:[i,a,o],type:t.QueryTypes.SELECT});for(let t of l||[])await e.query(`
          UPDATE \`${s}\`.section_pulse
          SET 
            pulse_status = 'paused',
            last_checked = NOW(),
            updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
          WHERE id = ?
        `,{replacements:[t.id]}),console.log(`⏸️ Section paused for society ${t.society_id} - no collection for 5 minutes`);let[c]=await e.query(`
        SELECT id, society_id, pulse_date, last_collection_time
        FROM \`${s}\`.section_pulse
        WHERE pulse_status IN ('active', 'paused')
        AND DATE(pulse_date) = ?
        AND last_collection_time IS NOT NULL
        AND last_collection_time <= ?
        AND section_end_time IS NULL
      `,{replacements:[i,o],type:t.QueryTypes.SELECT});for(let t of c||[]){let r=new Date(t.last_collection_time.getTime()+36e5);await e.query(`
          UPDATE \`${s}\`.section_pulse
          SET 
            section_end_time = ?,
            pulse_status = 'ended',
            last_checked = CONVERT_TZ(NOW(), '+00:00', '+05:30'),
            updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
          WHERE id = ?
        `,{replacements:[r,t.id]}),console.log(`🔴 Section end pulse recorded for society ${t.society_id} at ${r.toISOString()}`)}}catch(e){throw console.error("❌ Error checking section pause and end:",e),e}}static async checkSectionEnd(e,s){try{let r=new Date,i=new Date(r.getTime()-36e5),[a]=await e.query(`
        SELECT id, society_id, pulse_date, last_collection_time
        FROM \`${s}\`.section_pulse
        WHERE pulse_status = 'active'
        AND last_collection_time IS NOT NULL
        AND last_collection_time <= ?
        AND section_end_time IS NULL
      `,{replacements:[i],type:t.QueryTypes.SELECT});for(let t of a||[]){let r=new Date(t.last_collection_time.getTime()+36e5);await e.query(`
          UPDATE \`${s}\`.section_pulse
          SET 
            section_end_time = ?,
            pulse_status = 'ended',
            last_checked = CONVERT_TZ(NOW(), '+00:00', '+05:30'),
            updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
          WHERE id = ?
        `,{replacements:[r,t.id]}),console.log(`🔴 Section end pulse recorded for society ${t.society_id} at ${r.toISOString()}`)}}catch(e){throw console.error("❌ Error checking section end:",e),e}}static async checkInactivity(e,s){try{let r=new Date().toISOString().split("T")[0],i=new Date(Date.now()-864e5).toISOString().split("T")[0],[a]=await e.query(`
        SELECT id FROM \`${s}\`.societies
        WHERE status = 'active'
      `,{type:t.QueryTypes.SELECT});for(let o of a||[]){let[a]=await e.query(`
          SELECT id FROM \`${s}\`.section_pulse
          WHERE society_id = ? AND DATE(pulse_date) = ?
        `,{replacements:[o.id,r],type:t.QueryTypes.SELECT});if(!a||0===a.length){let[a]=await e.query(`
            SELECT inactive_days, pulse_status
            FROM \`${s}\`.section_pulse
            WHERE society_id = ? AND DATE(pulse_date) = ?
          `,{replacements:[o.id,i],type:t.QueryTypes.SELECT}),n=1;a&&a.length>0&&(n=(a[0].inactive_days||0)+1),await e.query(`
            INSERT INTO \`${s}\`.section_pulse (
              society_id,
              pulse_date,
              pulse_status,
              inactive_days,
              last_checked,
              created_at,
              updated_at
            ) VALUES (?, ?, 'inactive', ?, NOW(), CONVERT_TZ(NOW(), '+00:00', '+05:30'), CONVERT_TZ(NOW(), '+00:00', '+05:30'))
            ON DUPLICATE KEY UPDATE
              pulse_status = 'inactive',
              inactive_days = ?,
              last_checked = NOW(),
              updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
          `,{replacements:[o.id,r,n,n]}),console.log(`⚪ No pulse for society ${o.id} - ${n} day(s) inactive`)}}}catch(e){throw console.error("❌ Error checking inactivity:",e),e}}static async resetInactiveDays(e,t,s,r){await e.query(`
      UPDATE \`${t}\`.section_pulse
      SET inactive_days = 0
      WHERE society_id = ? AND DATE(pulse_date) = ?
    `,{replacements:[s,r]})}static async getPulseStatus(e,s,r,i){try{let a=i||new Date().toISOString().split("T")[0],o=await e.query(`
        SELECT 
          society_id,
          pulse_date,
          first_collection_time,
          last_collection_time,
          section_end_time,
          pulse_status,
          total_collections,
          inactive_days,
          created_at
        FROM \`${s}\`.section_pulse
        WHERE society_id = ? AND DATE(pulse_date) = ?
      `,{replacements:[r,a],type:t.QueryTypes.SELECT});if(!o||0===o.length)return{societyId:r,pulseDate:a,firstCollectionTime:null,lastCollectionTime:null,sectionEndTime:null,pulseStatus:"not_started",totalCollections:0,inactiveDays:0,createdAt:null};let n=o[0];return{societyId:n.society_id,pulseDate:n.pulse_date,firstCollectionTime:n.first_collection_time,lastCollectionTime:n.last_collection_time,sectionEndTime:n.section_end_time,pulseStatus:n.pulse_status,totalCollections:n.total_collections,inactiveDays:n.inactive_days,createdAt:n.created_at}}catch(e){throw console.error("❌ Error getting pulse status:",e),e}}static async getAllPulseStatuses(e,s,r){try{let i=r||new Date().toISOString().split("T")[0];return(await e.query(`
        SELECT 
          s.id as society_id,
          s.name as society_name,
          COALESCE(sp.pulse_date, ?) as pulse_date,
          sp.first_collection_time,
          sp.last_collection_time,
          sp.section_end_time,
          COALESCE(sp.pulse_status, 'not_started') as pulse_status,
          COALESCE(sp.total_collections, 0) as total_collections,
          COALESCE(sp.inactive_days, 0) as inactive_days,
          sp.created_at
        FROM \`${s}\`.societies s
        LEFT JOIN \`${s}\`.section_pulse sp 
          ON s.id = sp.society_id AND DATE(sp.pulse_date) = ?
        WHERE s.status = 'active'
        ORDER BY s.name
      `,{replacements:[i,i],type:t.QueryTypes.SELECT})||[]).map(e=>({societyId:e.society_id,pulseDate:e.pulse_date,firstCollectionTime:e.first_collection_time,lastCollectionTime:e.last_collection_time,sectionEndTime:e.section_end_time,pulseStatus:e.pulse_status,totalCollections:e.total_collections,inactiveDays:e.inactive_days,createdAt:e.created_at}))}catch(e){throw console.error("❌ Error getting all pulse statuses:",e),e}}}e.s(["SectionPulseTracker",()=>s])},453753,e=>{e.v(t=>Promise.all(["server/chunks/[root-of-the-server]__86f7d54e._.js"].map(t=>e.l(t))).then(()=>t(736987)))},258566,e=>{e.v(e=>Promise.resolve().then(()=>e(84168)))},121985,e=>{e.v(t=>Promise.all(["server/chunks/src_models_6f8194c7._.js","server/chunks/node_modules_bcryptjs_index_42ebb250.js"].map(t=>e.l(t))).then(()=>t(540590)))},476424,e=>{e.v(t=>Promise.all(["server/chunks/[externals]_child_process_964038fc._.js","server/chunks/[root-of-the-server]__396ce0ea._.js","server/chunks/src_lib_emailService_ts_52f17169._.js"].map(t=>e.l(t))).then(()=>t(686599)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1e996aca._.js.map