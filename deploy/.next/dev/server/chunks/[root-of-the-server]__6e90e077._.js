module.exports = [
"[externals]/node-cron [external] (node-cron, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("node-cron");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/timers [external] (timers, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("timers", () => require("timers"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[project]/src/lib/pulseSchedulerService.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

/**
 * Pulse Scheduler Service
 * Runs automatically when Next.js server starts
 * Checks pulse status every 2 minutes and inactivity daily at midnight
 */ __turbopack_context__.s([
    "startPulseScheduler",
    ()=>startPulseScheduler,
    "stopPulseScheduler",
    ()=>stopPulseScheduler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$2d$cron__$5b$external$5d$__$28$node$2d$cron$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/node-cron [external] (node-cron, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mysql2$2f$promise$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/mysql2/promise.js [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$2d$cron__$5b$external$5d$__$28$node$2d$cron$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$node$2d$cron__$5b$external$5d$__$28$node$2d$cron$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const config = {
    host: process.env.DB_HOST || '168.231.121.19',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'psr_admin',
    password: process.env.DB_PASSWORD || 'PsrAdmin@2025!',
    database: process.env.DB_NAME || 'psr_v4_main',
    timezone: '+05:30',
    // Ensure NOW() returns IST time
    connectTimeout: 10000
};
let pool = null;
let isSchedulerRunning = false;
// Initialize database connection pool
function getPool() {
    if (!pool) {
        pool = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mysql2$2f$promise$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["default"].createPool(config);
    }
    return pool;
}
// Get all admin schemas
async function getAllAdminSchemas() {
    try {
        const db = getPool();
        const [rows] = await db.query(`
      SELECT DISTINCT TABLE_SCHEMA 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA LIKE 'db_%' OR TABLE_SCHEMA LIKE 'tester_%'
      ORDER BY TABLE_SCHEMA
    `);
        return rows.map((s)=>s.TABLE_SCHEMA);
    } catch (error) {
        console.error('❌ Error getting admin schemas:', error instanceof Error ? error.message : 'Unknown error');
        return [];
    }
}
// Check section pause and end
async function checkSectionPauseAndEnd(schemaName) {
    const db = getPool();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const sixtyMinutesAgo = new Date(now.getTime() - 60 * 60 * 1000);
    // 1. End all active/paused sections from previous days
    const [oldPulses] = await db.query(`
    SELECT id, society_id, pulse_date, last_collection_time
    FROM \`${schemaName}\`.section_pulse
    WHERE pulse_status IN ('active', 'paused')
      AND DATE(pulse_date) < ?
      AND section_end_time IS NULL
  `, [
        today
    ]);
    let oldEndedCount = 0;
    for (const pulse of oldPulses){
        const sectionEndTime = pulse.last_collection_time ? new Date(new Date(pulse.last_collection_time).getTime() + 60 * 60 * 1000) : null;
        await db.query(`
      UPDATE \`${schemaName}\`.section_pulse
      SET section_end_time = ?,
          pulse_status = 'ended',
          last_checked = CONVERT_TZ(NOW(), '+00:00', '+05:30'),
          updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
      WHERE id = ?
    `, [
            sectionEndTime,
            pulse.id
        ]);
        oldEndedCount++;
    }
    // 2. Check for sections to pause (5 minutes inactive, currently active, TODAY only)
    const [activePulses] = await db.query(`
    SELECT id, society_id, pulse_date, last_collection_time
    FROM \`${schemaName}\`.section_pulse
    WHERE pulse_status = 'active'
      AND DATE(pulse_date) = ?
      AND last_collection_time IS NOT NULL
      AND last_collection_time <= ?
      AND last_collection_time > ?
  `, [
        today,
        fiveMinutesAgo,
        sixtyMinutesAgo
    ]);
    let pausedCount = 0;
    for (const pulse of activePulses){
        await db.query(`
      UPDATE \`${schemaName}\`.section_pulse
      SET pulse_status = 'paused',
          last_checked = CONVERT_TZ(NOW(), '+00:00', '+05:30'),
          updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
      WHERE id = ?
    `, [
            pulse.id
        ]);
        pausedCount++;
    }
    // 3. Check for sections to end (60 minutes inactive, currently active or paused, TODAY only)
    const [inactivePulses] = await db.query(`
    SELECT id, society_id, pulse_date, last_collection_time
    FROM \`${schemaName}\`.section_pulse
    WHERE pulse_status IN ('active', 'paused')
      AND DATE(pulse_date) = ?
      AND last_collection_time IS NOT NULL
      AND last_collection_time <= ?
      AND section_end_time IS NULL
  `, [
        today,
        sixtyMinutesAgo
    ]);
    let endedCount = 0;
    for (const pulse of inactivePulses){
        const sectionEndTime = new Date(new Date(pulse.last_collection_time).getTime() + 60 * 60 * 1000);
        await db.query(`
      UPDATE \`${schemaName}\`.section_pulse
      SET section_end_time = ?,
          pulse_status = 'ended',
          last_checked = CONVERT_TZ(NOW(), '+00:00', '+05:30'),
          updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
      WHERE id = ?
    `, [
            sectionEndTime,
            pulse.id
        ]);
        endedCount++;
    }
    return {
        oldEndedCount,
        pausedCount,
        endedCount
    };
}
// Check inactivity
async function checkInactivity(schemaName) {
    const db = getPool();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const [activeSocieties] = await db.query(`
    SELECT id FROM \`${schemaName}\`.societies WHERE status = 'active'
  `);
    let inactiveCount = 0;
    for (const society of activeSocieties){
        const [todayPulse] = await db.query(`
      SELECT id FROM \`${schemaName}\`.section_pulse
      WHERE society_id = ? AND pulse_date = ?
    `, [
            society.id,
            today
        ]);
        if (!todayPulse || todayPulse.length === 0) {
            const [yesterdayPulse] = await db.query(`
        SELECT inactive_days, pulse_status
        FROM \`${schemaName}\`.section_pulse
        WHERE society_id = ? AND pulse_date = ?
      `, [
                society.id,
                yesterday
            ]);
            let inactiveDays = 1;
            if (yesterdayPulse && yesterdayPulse.length > 0) {
                inactiveDays = (yesterdayPulse[0].inactive_days || 0) + 1;
            }
            await db.query(`
        INSERT INTO \`${schemaName}\`.section_pulse (
          society_id,
          pulse_date,
          pulse_status,
          inactive_days,
          last_checked,
          created_at,
          updated_at
        ) VALUES (?, ?, 'inactive', ?, CONVERT_TZ(NOW(), '+00:00', '+05:30'), CONVERT_TZ(NOW(), '+00:00', '+05:30'), CONVERT_TZ(NOW(), '+00:00', '+05:30'))
        ON DUPLICATE KEY UPDATE
          pulse_status = 'inactive',
          inactive_days = ?,
          last_checked = CONVERT_TZ(NOW(), '+00:00', '+05:30'),
          updated_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
      `, [
                society.id,
                today,
                inactiveDays,
                inactiveDays
            ]);
            inactiveCount++;
        }
    }
    return inactiveCount;
}
// Run section end check
async function runSectionEndCheck() {
    const startTime = Date.now();
    const istTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
    console.log(`\n⏰ [${istTime} IST] Running section pause/end check...`);
    try {
        const schemas = await getAllAdminSchemas();
        for (const schema of schemas){
            try {
                const { oldEndedCount, pausedCount, endedCount } = await checkSectionPauseAndEnd(schema);
                if (oldEndedCount > 0 || pausedCount > 0 || endedCount > 0) {
                    console.log(`   ✅ ${schema} - ${oldEndedCount} old ended, ${pausedCount} paused, ${endedCount} ended`);
                }
            } catch (error) {
                console.error(`   ❌ ${schema}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        const duration = Date.now() - startTime;
        console.log(`   ✅ Section pause/end check completed in ${duration}ms`);
    } catch (error) {
        console.error(`   ❌ Section pause/end check failed:`, error instanceof Error ? error.message : 'Unknown error');
    }
}
// Run inactivity check
async function runInactivityCheck() {
    const startTime = Date.now();
    const istTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
    console.log(`\n⏰ [${istTime} IST] Running inactivity check...`);
    try {
        const schemas = await getAllAdminSchemas();
        for (const schema of schemas){
            try {
                const inactiveCount = await checkInactivity(schema);
                if (inactiveCount > 0) {
                    console.log(`   ✅ ${schema} - ${inactiveCount} inactive societie(s)`);
                }
            } catch (error) {
                console.error(`   ❌ ${schema}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        const duration = Date.now() - startTime;
        console.log(`   ✅ Inactivity check completed in ${duration}ms`);
    } catch (error) {
        console.error(`   ❌ Inactivity check failed:`, error instanceof Error ? error.message : 'Unknown error');
    }
}
async function startPulseScheduler() {
    if (isSchedulerRunning) {
        console.log('⚠️ Pulse scheduler already running');
        return;
    }
    try {
        const db = getPool();
        // Test connection
        await db.query('SELECT 1');
        console.log('✅ Pulse Scheduler: Database connection established');
        // Schedule section pause and end check every 2 minutes
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$2d$cron__$5b$external$5d$__$28$node$2d$cron$2c$__esm_import$29$__["default"].schedule('*/2 * * * *', ()=>{
            runSectionEndCheck();
        }, {
            timezone: "Asia/Kolkata"
        });
        // Schedule inactivity check daily at midnight
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$2d$cron__$5b$external$5d$__$28$node$2d$cron$2c$__esm_import$29$__["default"].schedule('0 0 * * *', ()=>{
            runInactivityCheck();
        }, {
            timezone: "Asia/Kolkata"
        });
        isSchedulerRunning = true;
        console.log('✅ Pulse scheduler started');
        console.log('   - Section pause/end check: Every 2 minutes');
        console.log('   - Inactivity check: Daily at midnight\n');
        // Run initial checks
        console.log('🚀 Running initial pulse checks...');
        await runSectionEndCheck();
    } catch (error) {
        console.error('❌ Pulse scheduler failed to start:', error instanceof Error ? error.message : 'Unknown error');
    }
}
async function stopPulseScheduler() {
    if (pool) {
        await pool.end();
        pool = null;
    }
    isSchedulerRunning = false;
    console.log('⏹️ Pulse scheduler stopped');
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6e90e077._.js.map