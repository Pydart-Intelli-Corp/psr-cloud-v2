module.exports=[871366,309241,e=>{"use strict";class t{static validateSocietyId(e){let t;if(!e||"string"==typeof e&&""===e.trim())return{isValid:!1,id:e,fallback:e,error:"Society ID cannot be empty"};let r=e;e.startsWith("S-")&&(r=e.substring(2));let s=parseInt(r);return isNaN(s)||(t=s),{isValid:!0,id:e,fallback:r,numericId:t}}static validateMachineId(e){let t,r,s;if(!e||""===e.trim())return{isValid:!1,error:"Machine ID is required but not provided"};if(!e.startsWith("M")||e.length<2)return{isValid:!1,error:`Invalid machine ID format: "${e}"`};let i=e.substring(1);if(!/^[a-zA-Z0-9]+$/.test(i))return{isValid:!1,error:`Invalid machine ID format: "${e}" - contains invalid characters`};let n=!1;if(/[a-zA-Z]/.test(i)){let e=i.replace(/^0+/,"")||i;if(/^[a-zA-Z]/.test(e)){let r=e.charAt(0).toLowerCase(),i=e.substring(1);s=t=/^\d+$/.test(i)?r+(i.replace(/^0+/,"")||"0"):e}else s=t=e}else{let s=parseInt(t=i.replace(/^0+/,"")||"0");if(isNaN(s)||!(s>0))return{isValid:!1,error:`Invalid machine ID: "${e}" - invalid numeric format`};n=!0,r=s}console.log(`🔄 Machine ID conversion: "${e}" -> "${i}" -> "${t}"`);let a=[];if(n&&r)a.push(r),a.push(e),a.push(i),a.push(t),a.push(String(r));else if(s){a.push(s),a.push(i);let e=i.replace(/^0+/,"");e&&e!==s&&e!==i&&a.push(e)}return{isValid:!0,numericId:r,alphanumericId:s,withoutPrefix:i,strippedId:t,variants:a,isNumeric:n}}static validateDbKey(e){return e&&""!==e.trim()?e.length<2?{isValid:!1,error:"DB Key must be at least 2 characters"}:{isValid:!0}:{isValid:!1,error:"DB Key is required"}}static validateMachineModel(e){return e&&""!==e.trim()?{isValid:!0}:{isValid:!0,warning:`Machine model is empty: "${e}"`}}static validatePasswordType(e){if(!e)return{isValid:!1,isUser:!1,isSupervisor:!1,error:"Password type is required"};let t=e.startsWith("U"),r=e.startsWith("S");return t||r?{isValid:!0,isUser:t,isSupervisor:r}:{isValid:!1,isUser:!1,isSupervisor:!1,error:`Invalid password type: "${e}"`}}}e.s(["InputValidator",()=>t],871366);class r{static buildSocietyFilter(e,t,r){return{condition:"(s.society_id = ? OR s.society_id = ? OR m.society_id = ?)",replacements:[e,t,r||t]}}static buildMachineFilter(e,t=!0){if(e.isNumeric&&e.numericId&&t)return{condition:"m.id = ?",replacements:[e.numericId]};if(e.variants&&e.variants.length>0){let t=e.variants.map(()=>"?").join(", ");return{condition:`m.machine_id IN (${t})`,replacements:e.variants}}if(e.alphanumericId)return{condition:"m.machine_id = ?",replacements:[e.alphanumericId]};throw Error("Invalid machine validation result for query building")}static buildBaseQuery(e,t){let s=r.escapeIdentifier(e);if("farmers"===t)return`
        FROM ${s}.farmers f
        LEFT JOIN ${s}.societies s ON f.society_id = s.id
        LEFT JOIN ${s}.machines m ON f.machine_id = m.id
      `;if("machines"===t)return`
        FROM ${s}.machines m
        LEFT JOIN ${s}.societies s ON m.society_id = s.id
      `;throw Error(`Unsupported table name: ${t}`)}static buildFarmerQuery(e,t,s,i){let n=r.buildBaseQuery(e,"farmers"),a=`
      SELECT 
        f.id, 
        f.farmer_id,
        f.rf_id, 
        f.name, 
        f.phone, 
        f.sms_enabled, 
        f.bonus
      ${n}
      WHERE ${t.condition}
        AND f.status = 'active'
        AND ${s.condition}
      ORDER BY f.farmer_id
    `,o=[...t.replacements,...s.replacements];return i&&(a+=" LIMIT ? OFFSET ?",o=[...o,i.limit,i.offset]),{query:a,replacements:o}}static buildMachinePasswordQuery(e,t,s){let i=r.buildBaseQuery(e,"machines");return{query:`
      SELECT 
        m.id, 
        m.machine_id, 
        m.user_password, 
        m.supervisor_password, 
        m.statusU, 
        m.statusS,
        s.society_id as society_string_id
      ${i}
      WHERE ${t.condition}
        AND ${s.condition}
        AND m.status = 'active'
    `,replacements:[...t.replacements,...s.replacements]}}static buildSocietyLookupQuery(e,t){let s=r.escapeIdentifier(e);return{query:`
      SELECT id FROM ${s}.societies 
      WHERE society_id = ? OR society_id = ?
      LIMIT 1
    `,replacements:t.startsWith("S-")?[t,t.substring(2)]:[`S-${t}`,t]}}static escapeIdentifier(e){let t=e.replace(/[^a-zA-Z0-9_]/g,"");return`\`${t}\``}static buildPagination(e,t=5){let r=Math.max(1,e);return{limit:t,offset:(r-1)*t,pageNumber:r}}static parsePageNumber(e){return e&&e.startsWith("C")?Math.max(1,parseInt(e.replace(/^C0*/,""))||1):1}}e.s(["QueryBuilder",()=>r],309241)},375448,e=>{"use strict";class t{static createResponse(e,t){let{contentType:r="text/plain; charset=utf-8",addQuotes:s=!0,additionalHeaders:i={}}=t||{},n=s?`"${e}"`:e,a=Buffer.byteLength(n,"utf8");return new Response(n,{status:200,headers:{"Content-Type":r,"Content-Length":a.toString(),Connection:"close","Cache-Control":"no-cache","Access-Control-Allow-Origin":"*",...i}})}static createErrorResponse(e){return t.createResponse(e)}static createDataResponse(e){return t.createResponse(e,{additionalHeaders:{"Access-Control-Allow-Methods":"GET, POST","Access-Control-Allow-Headers":"Content-Type"}})}static createCSVResponse(e,t="data.csv"){return new Response(e,{status:200,headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="${t}"`,"Content-Length":Buffer.byteLength(e,"utf8").toString(),Connection:"close","Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, POST","Access-Control-Allow-Headers":"Content-Type"}})}static createCORSResponse(){return new Response(null,{status:200,headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type"}})}static async extractInputString(e){let t=null;if("GET"===e.method){let{searchParams:r}=new URL(e.url);if(!(t=r.get("InputString"))){for(let[e,s]of r.entries())if(e.includes("InputString")){t=s,console.log(`   ✅ ESP32: Found InputString in malformed param key: "${e}"`);break}}}else if("POST"===e.method)try{t=(await e.json()).InputString||null}catch{try{t=(await e.formData()).get("InputString")||null}catch(e){console.log(`❌ ESP32: Failed to parse POST body:`,e)}}return t}static filterLineEndings(e){if(!e)return e;let t=e.replace(/\$0D\$0A/g,"").replace(/\$0D/g,"").replace(/\$0A/g,"").replace(/\r\n/g,"").replace(/\r/g,"").replace(/\n/g,"");return e!==t&&console.log(`🧹 ESP32: Filtered line endings: "${e}" -> "${t}"`),t}static logRequest(e,t,r){console.log(`
${"=".repeat(80)}`),console.log(`📡 ESP32 External API Request:`),console.log(`   Timestamp: ${new Date().toISOString()}`),console.log(`   Method: ${e.method}`),console.log(`   Full URL: ${e.url}`),console.log(`   DB Key: "${t}"`),console.log(`   InputString: "${r}"`),console.log("   Headers:",{"user-agent":e.headers.get("user-agent"),"content-type":e.headers.get("content-type"),connection:e.headers.get("connection"),host:e.headers.get("host")}),console.log(`${"=".repeat(80)}
`)}}e.s(["ESP32ResponseHelper",()=>t])},512982,e=>{"use strict";e.i(871366),e.i(309241),e.i(375448),e.s([],512982)}];

//# sourceMappingURL=src_lib_external-api_ba3ac1c3._.js.map