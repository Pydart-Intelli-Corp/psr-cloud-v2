module.exports = [
"[project]/src/lib/migrations.ts [app-route] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/[root-of-the-server]__86f7d54e._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/lib/migrations.ts [app-route] (ecmascript)");
    });
});
}),
"[project]/src/models/index.ts [app-route] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/src_models_17c83d5a._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/models/index.ts [app-route] (ecmascript)");
    });
});
}),
"[project]/src/app/api/user/bmc/send-delete-otp/route.ts [app-route] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/src_models_index_ts_fb44e9c0._.js",
  "server/chunks/node_modules_nodemailer_f0e2e4c8._.js",
  "server/chunks/[root-of-the-server]__202f3214._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/app/api/user/bmc/send-delete-otp/route.ts [app-route] (ecmascript)");
    });
});
}),
];