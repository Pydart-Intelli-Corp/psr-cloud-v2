module.exports = [
"[project]/instrumentation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Next.js Instrumentation Hook
 * This runs when the Next.js server starts
 * Used to initialize background services like the pulse scheduler
 */ __turbopack_context__.s([
    "register",
    ()=>register
]);
async function register() {
    if ("TURBOPACK compile-time truthy", 1) {
        const { startPulseScheduler } = await __turbopack_context__.A("[project]/src/lib/pulseSchedulerService.ts [instrumentation] (ecmascript, async loader)");
        await startPulseScheduler();
    }
}
}),
];

//# sourceMappingURL=instrumentation_ts_cf8be71b._.js.map