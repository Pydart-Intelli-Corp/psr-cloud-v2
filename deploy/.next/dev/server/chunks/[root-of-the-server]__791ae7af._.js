module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[project]/src/models/User.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserRole",
    ()=>UserRole,
    "UserStatus",
    ()=>UserStatus,
    "default",
    ()=>__TURBOPACK__default__export__,
    "initUserModel",
    ()=>initUserModel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sequelize/lib/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
;
;
var UserRole = /*#__PURE__*/ function(UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["DAIRY"] = "dairy";
    UserRole["BMC"] = "bmc";
    UserRole["SOCIETY"] = "society";
    UserRole["FARMER"] = "farmer";
    return UserRole;
}({});
var UserStatus = /*#__PURE__*/ function(UserStatus) {
    UserStatus["PENDING"] = "pending";
    UserStatus["PENDING_APPROVAL"] = "pending_approval";
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
    return UserStatus;
}({});
// User model class
class User extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Model"] {
    // Instance methods
    async comparePassword(candidatePassword) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(candidatePassword, this.password);
    }
    async incLoginAttempts() {
        // If we have a previous lock that has expired, restart at 1
        if (this.lockUntil && this.lockUntil < new Date()) {
            await this.update({
                loginAttempts: 1,
                lockUntil: undefined
            });
            return;
        }
        const updates = {
            loginAttempts: this.loginAttempts + 1
        };
        // Lock account after 5 failed attempts for 2 hours
        if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
            updates.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
        }
        await this.update(updates);
    }
    async resetLoginAttempts() {
        await this.update({
            loginAttempts: 0,
            lockUntil: undefined
        });
    }
    get isLocked() {
        return !!(this.lockUntil && this.lockUntil > new Date());
    }
    canManageRole(targetRole) {
        const roleHierarchy = [
            "super_admin",
            "admin",
            "dairy",
            "bmc",
            "society",
            "farmer"
        ];
        const currentRoleIndex = roleHierarchy.indexOf(this.role);
        const targetRoleIndex = roleHierarchy.indexOf(targetRole);
        return currentRoleIndex < targetRoleIndex;
    }
}
const initUserModel = (sequelize)=>{
    User.init({
        id: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        uid: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                len: [
                    3,
                    50
                ]
            }
        },
        email: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },
        password: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [
                    6,
                    255
                ]
            }
        },
        fullName: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(200),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [
                    2,
                    200
                ]
            }
        },
        role: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].ENUM(...Object.values(UserRole)),
            allowNull: false,
            defaultValue: "farmer"
        },
        status: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].ENUM(...Object.values(UserStatus)),
            allowNull: false,
            defaultValue: "pending"
        },
        dbKey: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(50),
            allowNull: true,
            unique: true,
            comment: 'Dedicated database schema key for admins'
        },
        companyName: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(255),
            allowNull: true
        },
        companyPincode: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(10),
            allowNull: true,
            validate: {
                len: [
                    5,
                    10
                ]
            }
        },
        companyCity: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(100),
            allowNull: true,
            validate: {
                len: [
                    2,
                    100
                ]
            }
        },
        companyState: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(100),
            allowNull: true,
            validate: {
                len: [
                    2,
                    100
                ]
            }
        },
        parentId: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        isEmailVerified: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        emailVerificationToken: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(255),
            allowNull: true
        },
        emailVerificationExpires: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].DATE,
            allowNull: true
        },
        passwordResetToken: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(255),
            allowNull: true
        },
        passwordResetExpires: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].DATE,
            allowNull: true
        },
        otpCode: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(10),
            allowNull: true
        },
        otpExpires: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].DATE,
            allowNull: true
        },
        lastLogin: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].DATE,
            allowNull: true
        },
        loginAttempts: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        lockUntil: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].DATE,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        hooks: {
            beforeSave: async (user)=>{
                // Hash password if it's being modified
                if (user.changed('password') && user.password) {
                    const salt = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].genSalt(12);
                    user.password = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(user.password, salt);
                }
                // Generate UID if not provided
                if (!user.uid && user.email) {
                    const timestamp = Date.now().toString().slice(-6);
                    const emailPrefix = user.email.substring(0, 3).toUpperCase();
                    user.uid = `${emailPrefix}${timestamp}`;
                }
            }
        }
    });
    // Define associations
    User.hasMany(User, {
        as: 'Children',
        foreignKey: 'parentId',
        onDelete: 'SET NULL'
    });
    User.belongsTo(User, {
        as: 'Parent',
        foreignKey: 'parentId',
        onDelete: 'SET NULL'
    });
    return User;
};
const __TURBOPACK__default__export__ = User;
}),
"[project]/src/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canManageRole",
    ()=>canManageRole,
    "default",
    ()=>__TURBOPACK__default__export__,
    "generateOTP",
    ()=>generateOTP,
    "generateRandomToken",
    ()=>generateRandomToken,
    "generateSessionId",
    ()=>generateSessionId,
    "generateTokens",
    ()=>generateTokens,
    "getAllowedRoles",
    ()=>getAllowedRoles,
    "hashToken",
    ()=>hashToken,
    "isSuperAdmin",
    ()=>isSuperAdmin,
    "validatePassword",
    ()=>validatePassword,
    "verifyRefreshToken",
    ()=>verifyRefreshToken,
    "verifyToken",
    ()=>verifyToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/models/User.ts [app-route] (ecmascript)");
;
;
;
// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-jwt-key';
const generateTokens = (user)=>{
    const payload = {
        id: user.id,
        uid: user.uid,
        email: user.email,
        role: user.role,
        dbKey: user.dbKey,
        entityType: user.entityType,
        schemaName: user.schemaName
    };
    const token = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(payload, JWT_SECRET, {
        expiresIn: '7d',
        issuer: 'poornasree-equipments-cloud',
        audience: 'psr-client'
    });
    const refreshToken = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: '30d',
        issuer: 'poornasree-equipments-cloud',
        audience: 'psr-client'
    });
    return {
        token,
        refreshToken
    };
};
const verifyToken = (token)=>{
    try {
        const decoded = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET, {
            issuer: 'poornasree-equipments-cloud',
            audience: 'psr-client'
        });
        return decoded;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
};
const verifyRefreshToken = (token)=>{
    try {
        const decoded = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_REFRESH_SECRET, {
            issuer: 'poornasree-equipments-cloud',
            audience: 'psr-client'
        });
        return decoded;
    } catch (error) {
        console.error('Refresh token verification failed:', error);
        return null;
    }
};
const generateRandomToken = (length = 32)=>{
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(length).toString('hex');
};
const generateOTP = (length = 6)=>{
    const digits = '0123456789';
    let otp = '';
    for(let i = 0; i < length; i++){
        otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
};
const hashToken = (token)=>{
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash('sha256').update(token).digest('hex');
};
const canManageRole = (userRole, targetRole)=>{
    const roleHierarchy = {
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].SUPER_ADMIN]: 0,
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].ADMIN]: 1,
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].DAIRY]: 2,
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].BMC]: 3,
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].SOCIETY]: 4,
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].FARMER]: 5
    };
    return roleHierarchy[userRole] < roleHierarchy[targetRole];
};
const getAllowedRoles = (userRole)=>{
    const allRoles = [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].SUPER_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].DAIRY,
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].BMC,
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].SOCIETY,
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].FARMER
    ];
    const roleHierarchy = {
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].SUPER_ADMIN]: 0,
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].ADMIN]: 1,
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].DAIRY]: 2,
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].BMC]: 3,
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].SOCIETY]: 4,
        [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].FARMER]: 5
    };
    const userLevel = roleHierarchy[userRole];
    return allRoles.filter((role)=>roleHierarchy[role] > userLevel);
};
const isSuperAdmin = (user)=>{
    const superAdminEmail = process.env.SUPER_ADMIN_USERNAME || 'admin';
    return user.email === superAdminEmail || user.role === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"].SUPER_ADMIN;
};
const validatePassword = (password)=>{
    const errors = [];
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
const generateSessionId = ()=>{
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(64).toString('hex');
};
const authUtils = {
    generateTokens,
    verifyToken,
    verifyRefreshToken,
    generateRandomToken,
    generateOTP,
    hashToken,
    canManageRole,
    getAllowedRoles,
    isSuperAdmin,
    validatePassword,
    generateSessionId
};
const __TURBOPACK__default__export__ = authUtils;
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
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/src/lib/database.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "connectDB",
    ()=>connectDB,
    "createAdminSchema",
    ()=>createAdminSchema,
    "default",
    ()=>__TURBOPACK__default__export__,
    "getAdminConnection",
    ()=>getAdminConnection,
    "initDatabase",
    ()=>initDatabase,
    "testConnection",
    ()=>testConnection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sequelize/lib/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mysql2$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/mysql2/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
// Database configuration for Azure MySQL
let sequelize = null;
const createSequelizeInstance = ()=>{
    if (!sequelize) {
        // Don't initialize during build time
        if ("TURBOPACK compile-time truthy", 1) {
            // Determine SSL configuration based on environment
            // Only use SSL if DB_SSL_CA is explicitly set and not empty
            const sslConfig = process.env.DB_SSL_CA && process.env.DB_SSL_CA.trim() !== '' ? {
                require: true,
                rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED !== 'false',
                ca: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), process.env.DB_SSL_CA)
            } : ("TURBOPACK compile-time value", "development") === 'production' && process.env.DB_HOST?.includes('azure') ? "TURBOPACK unreachable" : false;
            sequelize = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Sequelize"](process.env.DB_NAME || 'psr_v4_main', process.env.DB_USER || 'psr_admin', process.env.DB_PASSWORD || 'Access@404', {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306'),
                dialect: 'mysql',
                dialectModule: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mysql2$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"],
                timezone: '+05:30',
                dialectOptions: {
                    ssl: sslConfig,
                    connectTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30') * 1000
                },
                pool: {
                    max: parseInt(process.env.DB_POOL_MAX || '10'),
                    min: parseInt(process.env.DB_POOL_MIN || '0'),
                    acquire: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30') * 1000,
                    idle: parseInt(process.env.DB_CONNECTION_LIFETIME || '300') * 1000
                },
                logging: ("TURBOPACK compile-time truthy", 1) ? console.log : "TURBOPACK unreachable",
                benchmark: ("TURBOPACK compile-time value", "development") === 'development'
            });
        }
    }
    return sequelize;
};
const testConnection = async ()=>{
    try {
        const db = createSequelizeInstance();
        if (!db) {
            console.error('❌ Database not initialized');
            return false;
        }
        await db.authenticate();
        console.log('✅ Database connection established successfully.');
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        return false;
    }
};
const initDatabase = async (useMigrations = false)=>{
    try {
        const db = createSequelizeInstance();
        if (!db) {
            console.error('❌ Database not initialized');
            return false;
        }
        if (useMigrations) {
            // Use migrations instead of sync for production
            const { migrationRunner } = await __turbopack_context__.A("[project]/src/lib/migrations.ts [app-route] (ecmascript, async loader)");
            await migrationRunner.initializeDatabase();
        } else {
            // Development mode - use sync
            await db.sync({
                alter: ("TURBOPACK compile-time value", "development") === 'development'
            });
        }
        console.log('✅ Database synchronized successfully.');
        return true;
    } catch (error) {
        console.error('❌ Database synchronization failed:', error);
        return false;
    }
};
const connectDB = async ()=>{
    try {
        const db = createSequelizeInstance();
        if (!db) {
            throw new Error('Database not initialized');
        }
        await db.authenticate();
        return db;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};
const createAdminSchema = async (adminEmail)=>{
    try {
        // Generate DB key: db-<first 3 letters of email><3 random numbers>
        const emailPrefix = adminEmail.substring(0, 3).toLowerCase();
        const randomSuffix = Math.floor(100 + Math.random() * 900).toString();
        const dbKey = `db_${emailPrefix}${randomSuffix}`;
        // Create new database schema
        const db = createSequelizeInstance();
        if (!db) {
            throw new Error('Database not initialized');
        }
        await db.query(`CREATE DATABASE IF NOT EXISTS \`${dbKey}\``);
        console.log(`✅ Created admin schema: ${dbKey}`);
        return dbKey;
    } catch (error) {
        console.error('❌ Failed to create admin schema:', error);
        throw error;
    }
};
const getAdminConnection = (dbKey)=>{
    // Determine SSL configuration based on environment
    // Only use SSL if DB_SSL_CA is explicitly set and not empty
    const sslConfig = process.env.DB_SSL_CA && process.env.DB_SSL_CA.trim() !== '' ? {
        require: true,
        rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED !== 'false',
        ca: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), process.env.DB_SSL_CA)
    } : ("TURBOPACK compile-time value", "development") === 'production' && process.env.DB_HOST?.includes('azure') ? "TURBOPACK unreachable" : false;
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Sequelize"](dbKey, process.env.DB_USER || 'psr_admin', process.env.DB_PASSWORD || '', {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        dialect: 'mysql',
        dialectModule: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mysql2$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"],
        dialectOptions: {
            ssl: sslConfig,
            connectTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30') * 1000,
            acquireTimeout: parseInt(process.env.DB_COMMAND_TIMEOUT || '60') * 1000,
            timeout: parseInt(process.env.DB_COMMAND_TIMEOUT || '60') * 1000
        },
        pool: {
            max: parseInt(process.env.DB_POOL_MAX || '10'),
            min: parseInt(process.env.DB_POOL_MIN || '0'),
            acquire: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30') * 1000,
            idle: parseInt(process.env.DB_CONNECTION_LIFETIME || '300') * 1000
        },
        logging: ("TURBOPACK compile-time truthy", 1) ? console.log : "TURBOPACK unreachable"
    });
};
const __TURBOPACK__default__export__ = createSequelizeInstance;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/utils/response.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createErrorResponse",
    ()=>createErrorResponse,
    "createSuccessResponse",
    ()=>createSuccessResponse,
    "validateRequiredFields",
    ()=>validateRequiredFields
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
function createSuccessResponse(message, data, status = 200) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: true,
        message,
        data
    }, {
        status
    });
}
function createErrorResponse(error, status = 400, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: false,
        message: 'Error occurred',
        error,
        data
    }, {
        status
    });
}
function validateRequiredFields(body, requiredFields) {
    const missing = requiredFields.filter((field)=>!body[field]);
    return {
        success: missing.length === 0,
        missing: missing.length > 0 ? missing : undefined
    };
}
}),
"[project]/src/app/api/user/machine/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/database.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils/response.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Authentication required', 401);
        }
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(token);
        if (!payload || payload.role !== 'admin') {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Admin access required', 403);
        }
        const body = await request.json();
        const { machineId, machineType, societyId, location, installationDate, operatorName, contactPhone, status = 'active', notes, setAsMaster, disablePasswordInheritance } = body;
        if (!machineId || !machineType || !societyId) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Machine ID, Machine Type, and Society ID are required', 400);
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["connectDB"])();
        const { getModels } = await __turbopack_context__.A("[project]/src/models/index.ts [app-route] (ecmascript, async loader)");
        const { sequelize, User } = getModels();
        // Get admin's dbKey
        const admin = await User.findByPk(payload.id);
        if (!admin || !admin.dbKey) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Admin schema not found', 404);
        }
        // Generate schema name
        const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
        // Check if machine ID already exists in the same society
        const existingQuery = `
      SELECT id FROM \`${schemaName}\`.machines 
      WHERE machine_id = ? AND society_id = ? LIMIT 1
    `;
        const [existing] = await sequelize.query(existingQuery, {
            replacements: [
                machineId,
                societyId
            ]
        });
        if (existing.length > 0) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Machine ID already exists in this society', 409);
        }
        // Verify society exists
        const societyQuery = `
      SELECT id FROM \`${schemaName}\`.societies 
      WHERE id = ? LIMIT 1
    `;
        const [societyExists] = await sequelize.query(societyQuery, {
            replacements: [
                societyId
            ]
        });
        if (societyExists.length === 0) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Selected society not found', 400);
        }
        // Check if this is the first machine for the society (will be master)
        const countQuery = `
      SELECT COUNT(*) as count FROM \`${schemaName}\`.machines 
      WHERE society_id = ?
    `;
        const [countResult] = await sequelize.query(countQuery, {
            replacements: [
                societyId
            ]
        });
        const machineCount = countResult[0]?.count || 0;
        const isFirstMachine = machineCount === 0;
        // Determine if this should be master: first machine OR explicitly requested
        let isMasterMachine = isFirstMachine || setAsMaster ? 1 : 0;
        // If setAsMaster is true and there's already a master, replace it
        if (setAsMaster && !isFirstMachine) {
            // Remove master status from current master
            await sequelize.query(`UPDATE \`${schemaName}\`.machines 
         SET is_master_machine = 0 
         WHERE society_id = ? AND is_master_machine = 1`, {
                replacements: [
                    societyId
                ]
            });
            console.log(`[Machine POST] Replaced existing master machine for society ${societyId}`);
        }
        // If not the first machine AND not being set as master AND inheritance not disabled, get master machine passwords
        let inheritedUserPassword = null;
        let inheritedSupervisorPassword = null;
        let inheritedStatusU = 0;
        let inheritedStatusS = 0;
        if (!isMasterMachine && !isFirstMachine && !disablePasswordInheritance) {
            const masterQuery = `
        SELECT user_password, supervisor_password, statusU, statusS 
        FROM \`${schemaName}\`.machines 
        WHERE society_id = ? AND is_master_machine = 1 
        LIMIT 1
      `;
            const [masterResult] = await sequelize.query(masterQuery, {
                replacements: [
                    societyId
                ]
            });
            if (Array.isArray(masterResult) && masterResult.length > 0) {
                const master = masterResult[0];
                inheritedUserPassword = master.user_password;
                inheritedSupervisorPassword = master.supervisor_password;
                inheritedStatusU = master.statusU;
                inheritedStatusS = master.statusS;
                console.log(`[Machine POST] Inheriting passwords from master machine for society ${societyId}`);
            }
        } else if (disablePasswordInheritance) {
            console.log(`[Machine POST] Password inheritance disabled for machine ${machineId} in society ${societyId}`);
        }
        // Insert new machine
        const insertQuery = `
      INSERT INTO \`${schemaName}\`.machines 
      (machine_id, machine_type, society_id, location, installation_date, 
       operator_name, contact_phone, status, notes, is_master_machine, 
       user_password, supervisor_password, statusU, statusS, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
        await sequelize.query(insertQuery, {
            replacements: [
                machineId,
                machineType,
                societyId,
                location || null,
                installationDate || null,
                operatorName || null,
                contactPhone || null,
                status,
                notes || null,
                isMasterMachine,
                inheritedUserPassword,
                inheritedSupervisorPassword,
                inheritedStatusU,
                inheritedStatusS
            ]
        });
        console.log(`✅ Machine added successfully to schema: ${schemaName}${isMasterMachine ? ' (MASTER MACHINE)' : ' (inherited passwords from master)'}`);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSuccessResponse"])('Machine created successfully');
    } catch (error) {
        console.error('Error creating machine:', error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Failed to create machine', 500);
    }
}
async function GET(request) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Authentication required', 401);
        }
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(token);
        if (!payload || payload.role !== 'admin') {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Admin access required', 403);
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["connectDB"])();
        const { getModels } = await __turbopack_context__.A("[project]/src/models/index.ts [app-route] (ecmascript, async loader)");
        const { sequelize, User } = getModels();
        // Get admin's dbKey
        const admin = await User.findByPk(payload.id);
        if (!admin || !admin.dbKey) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Admin schema not found', 404);
        }
        // Generate schema name
        const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
        // Check if id parameter is provided for single machine fetch
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const societyIdsParam = searchParams.get('societyIds');
        let query;
        let replacements = [];
        if (id) {
            // Query single machine with rate chart information
            query = `
        SELECT 
          m.id, m.machine_id, m.machine_type, m.society_id, m.location, 
          m.installation_date, m.operator_name, m.contact_phone, m.status, 
          m.notes, m.user_password, m.supervisor_password, m.statusU, m.statusS,
          m.is_master_machine, m.created_at, m.updated_at,
          s.name as society_name, s.society_id as society_identifier,
          (SELECT COUNT(*) FROM \`${schemaName}\`.rate_charts rc 
           WHERE rc.society_id = m.society_id AND rc.status = 1) as active_charts_count,
          (SELECT GROUP_CONCAT(DISTINCT 
            CONCAT(rc.channel, ':', rc.file_name, ':', 
              CASE WHEN dh.id IS NOT NULL THEN 'downloaded' ELSE 'pending' END)
            SEPARATOR '|||')
           FROM \`${schemaName}\`.rate_charts rc
           LEFT JOIN \`${schemaName}\`.rate_chart_download_history dh 
             ON dh.rate_chart_id = rc.id AND dh.machine_id = m.id
           WHERE rc.society_id = m.society_id AND rc.status = 1) as chart_details,
          COALESCE(
            (SELECT COUNT(*) 
             FROM \`${schemaName}\`.milk_collections mc 
             WHERE mc.machine_id = m.machine_id 
             AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)), 0
          ) as total_collections_30d,
          COALESCE(
            (SELECT SUM(mc.quantity) 
             FROM \`${schemaName}\`.milk_collections mc 
             WHERE mc.machine_id = m.machine_id 
             AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)), 0
          ) as total_quantity_30d
        FROM \`${schemaName}\`.machines m
        LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
        WHERE m.id = ?
      `;
            replacements = [
                id
            ];
        } else if (societyIdsParam) {
            // Query machines filtered by society IDs
            const societyIds = societyIdsParam.split(',').map((id)=>parseInt(id.trim())).filter((id)=>!isNaN(id));
            if (societyIds.length === 0) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSuccessResponse"])('Machines retrieved successfully', []);
            }
            const placeholders = societyIds.map(()=>'?').join(', ');
            query = `
        SELECT 
          m.id, m.machine_id, m.machine_type, m.society_id, m.location, 
          m.installation_date, m.operator_name, m.contact_phone, m.status, 
          m.notes, m.user_password, m.supervisor_password, m.statusU, m.statusS,
          m.is_master_machine, m.created_at,
          s.name as society_name, s.society_id as society_identifier,
          (SELECT COUNT(*) FROM \`${schemaName}\`.rate_charts rc 
           WHERE rc.society_id = m.society_id AND rc.status = 1) as active_charts_count,
          (SELECT GROUP_CONCAT(DISTINCT 
            CONCAT(rc.channel, ':', rc.file_name, ':', 
              CASE WHEN dh.id IS NOT NULL THEN 'downloaded' ELSE 'pending' END)
            SEPARATOR '|||')
           FROM \`${schemaName}\`.rate_charts rc
           LEFT JOIN \`${schemaName}\`.rate_chart_download_history dh 
             ON dh.rate_chart_id = rc.id AND dh.machine_id = m.id
           WHERE rc.society_id = m.society_id AND rc.status = 1) as chart_details,
          COALESCE(
            (SELECT COUNT(DISTINCT mc.id) 
             FROM \`${schemaName}\`.milk_collections mc 
             WHERE mc.machine_id = m.id
             AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)), 0
          ) as total_collections_30d,
          COALESCE(
            (SELECT ROUND(SUM(mc.quantity), 2)
             FROM \`${schemaName}\`.milk_collections mc 
             WHERE mc.machine_id = m.id
             AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)), 0
          ) as total_quantity_30d
        FROM \`${schemaName}\`.machines m
        LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
        WHERE m.society_id IN (${placeholders})
        ORDER BY m.created_at DESC
      `;
            replacements = societyIds;
        } else {
            // Query all machines with rate chart information
            query = `
        SELECT 
          m.id, m.machine_id, m.machine_type, m.society_id, m.location, 
          m.installation_date, m.operator_name, m.contact_phone, m.status, 
          m.notes, m.user_password, m.supervisor_password, m.statusU, m.statusS,
          m.is_master_machine, m.created_at,
          s.name as society_name, s.society_id as society_identifier,
          (SELECT COUNT(*) FROM \`${schemaName}\`.rate_charts rc 
           WHERE rc.society_id = m.society_id AND rc.status = 1) as active_charts_count,
          (SELECT GROUP_CONCAT(DISTINCT 
            CONCAT(rc.channel, ':', rc.file_name, ':', 
              CASE WHEN dh.id IS NOT NULL THEN 'downloaded' ELSE 'pending' END)
            SEPARATOR '|||')
           FROM \`${schemaName}\`.rate_charts rc
           LEFT JOIN \`${schemaName}\`.rate_chart_download_history dh 
             ON dh.rate_chart_id = rc.id AND dh.machine_id = m.id
           WHERE rc.society_id = m.society_id AND rc.status = 1) as chart_details,
          COALESCE(
            (SELECT COUNT(DISTINCT mc.id) 
             FROM \`${schemaName}\`.milk_collections mc 
             WHERE mc.machine_id = m.id
             AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)), 0
          ) as total_collections_30d,
          COALESCE(
            (SELECT ROUND(SUM(mc.quantity), 2)
             FROM \`${schemaName}\`.milk_collections mc 
             WHERE mc.machine_id = m.id
             AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)), 0
          ) as total_quantity_30d
        FROM \`${schemaName}\`.machines m
        LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
        ORDER BY m.created_at DESC
      `;
        }
        const [results] = await sequelize.query(query, {
            replacements
        });
        const machines = results.map((machine)=>({
                id: machine.id,
                machineId: machine.machine_id,
                machineType: machine.machine_type,
                societyId: machine.society_id,
                societyName: machine.society_name,
                societyIdentifier: machine.society_identifier,
                location: machine.location,
                installationDate: machine.installation_date,
                operatorName: machine.operator_name,
                contactPhone: machine.contact_phone,
                status: machine.status,
                notes: machine.notes,
                isMasterMachine: machine.is_master_machine === 1,
                // Include passwords for admin to check if they're set (needed for ESP32 download too)
                userPassword: machine.user_password,
                supervisorPassword: machine.supervisor_password,
                statusU: machine.statusU,
                statusS: machine.statusS,
                createdAt: machine.created_at,
                updatedAt: machine.updated_at,
                // Rate chart information
                activeChartsCount: machine.active_charts_count,
                chartDetails: machine.chart_details,
                // Collection statistics (last 30 days)
                totalCollections30d: Number(machine.total_collections_30d) || 0,
                totalQuantity30d: Number(machine.total_quantity_30d) || 0
            }));
        if (id) {
            console.log(`✅ Retrieved machine ${id} from schema: ${schemaName}`);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSuccessResponse"])('Machine retrieved successfully', machines);
        } else {
            console.log(`✅ Retrieved ${machines.length} machines from schema: ${schemaName}`);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSuccessResponse"])('Machines retrieved successfully', machines);
        }
    } catch (error) {
        console.error('Error fetching machines:', error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Failed to fetch machines', 500);
    }
}
async function PUT(request) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Authentication required', 401);
        }
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(token);
        if (!payload || payload.role !== 'admin') {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Admin access required', 403);
        }
        const body = await request.json();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["connectDB"])();
        const { getModels } = await __turbopack_context__.A("[project]/src/models/index.ts [app-route] (ecmascript, async loader)");
        const { sequelize, User } = getModels();
        // Get admin's dbKey
        const admin = await User.findByPk(payload.id);
        if (!admin || !admin.dbKey) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Admin schema not found', 404);
        }
        // Generate schema name
        const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
        // Check if this is a bulk status update
        if (body.bulkStatusUpdate && Array.isArray(body.machineIds)) {
            const { machineIds, status: newStatus } = body;
            if (!newStatus || machineIds.length === 0) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Status and machine IDs are required for bulk update', 400);
            }
            console.log(`🔄 Processing bulk status update for ${machineIds.length} machines to status: ${newStatus}`);
            // Use a single UPDATE query with IN clause for better performance
            const placeholders = machineIds.map(()=>'?').join(',');
            const query = `
        UPDATE \`${schemaName}\`.machines 
        SET status = ?, updated_at = NOW()
        WHERE id IN (${placeholders})
      `;
            const replacements = [
                newStatus,
                ...machineIds
            ];
            const [result] = await sequelize.query(query, {
                replacements
            });
            // Check affected rows
            const affectedRows = result.affectedRows || 0;
            console.log(`✅ Successfully updated status for ${affectedRows} machines in schema: ${schemaName}`);
            if (affectedRows === 0) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('No machines were updated', 404);
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSuccessResponse"])(`Successfully updated status to "${newStatus}" for ${affectedRows} machine(s)`, {
                updated: affectedRows
            });
        }
        // Single machine update
        const { id, machineId, machineType, societyId, location, installationDate, operatorName, contactPhone, status, notes } = body;
        if (!id) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Machine ID is required', 400);
        }
        // Check if machine exists
        const existsQuery = `
      SELECT id FROM \`${schemaName}\`.machines 
      WHERE id = ? LIMIT 1
    `;
        const [exists] = await sequelize.query(existsQuery, {
            replacements: [
                id
            ]
        });
        if (exists.length === 0) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Machine not found', 404);
        }
        // If society is being updated, verify it exists
        if (societyId) {
            const societyQuery = `
        SELECT id FROM \`${schemaName}\`.societies 
        WHERE id = ? LIMIT 1
      `;
            const [societyExists] = await sequelize.query(societyQuery, {
                replacements: [
                    societyId
                ]
            });
            if (societyExists.length === 0) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Selected society not found', 400);
            }
        }
        // Check if machine ID already exists in the same society (excluding current machine)
        if (machineId && societyId) {
            const duplicateQuery = `
        SELECT id FROM \`${schemaName}\`.machines 
        WHERE machine_id = ? AND society_id = ? AND id != ? LIMIT 1
      `;
            const [duplicate] = await sequelize.query(duplicateQuery, {
                replacements: [
                    machineId,
                    societyId,
                    id
                ]
            });
            if (duplicate.length > 0) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Machine ID already exists in this society', 409);
            }
        }
        // Update machine
        const updateQuery = `
      UPDATE \`${schemaName}\`.machines 
      SET machine_id = ?, machine_type = ?, society_id = ?, location = ?, 
          installation_date = ?, operator_name = ?, contact_phone = ?, 
          status = ?, notes = ?, updated_at = NOW()
      WHERE id = ?
    `;
        await sequelize.query(updateQuery, {
            replacements: [
                machineId,
                machineType,
                societyId,
                location || null,
                installationDate || null,
                operatorName || null,
                contactPhone || null,
                status || 'active',
                notes || null,
                id
            ]
        });
        console.log(`✅ Machine updated successfully in schema: ${schemaName}`);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSuccessResponse"])('Machine updated successfully');
    } catch (error) {
        console.error('Error updating machine:', error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Failed to update machine', 500);
    }
}
async function DELETE(request) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Authentication required', 401);
        }
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(token);
        if (!payload || payload.role !== 'admin') {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Admin access required', 403);
        }
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const idsParam = searchParams.get('ids');
        if (!id && !idsParam) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Machine ID(s) required', 400);
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["connectDB"])();
        const { getModels } = await __turbopack_context__.A("[project]/src/models/index.ts [app-route] (ecmascript, async loader)");
        const { sequelize, User } = getModels();
        // Get admin's dbKey
        const admin = await User.findByPk(payload.id);
        if (!admin || !admin.dbKey) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Admin schema not found', 404);
        }
        // Generate schema name
        const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
        if (idsParam) {
            // Bulk delete
            const ids = JSON.parse(idsParam).map((id)=>parseInt(id)).filter((id)=>!isNaN(id));
            if (ids.length === 0) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('No valid machine IDs provided', 400);
            }
            // First verify all machines exist
            const placeholders = ids.map(()=>'?').join(',');
            const verifyQuery = `SELECT id FROM \`${schemaName}\`.machines WHERE id IN (${placeholders})`;
            const [verification] = await sequelize.query(verifyQuery, {
                replacements: ids
            });
            if (!Array.isArray(verification) || verification.length !== ids.length) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('One or more machines not found', 404);
            }
            // Delete the machines
            const deleteQuery = `DELETE FROM \`${schemaName}\`.machines WHERE id IN (${placeholders})`;
            await sequelize.query(deleteQuery, {
                replacements: ids
            });
            console.log(`✅ Successfully deleted ${ids.length} machines from schema: ${schemaName}`);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSuccessResponse"])(`Successfully deleted ${ids.length} machines`, null);
        } else {
            // Single delete
            // Check if machine exists
            const existsQuery = `
        SELECT id FROM \`${schemaName}\`.machines 
        WHERE id = ? LIMIT 1
      `;
            const [exists] = await sequelize.query(existsQuery, {
                replacements: [
                    id
                ]
            });
            if (exists.length === 0) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Machine not found', 404);
            }
            // Delete machine
            const deleteQuery = `
        DELETE FROM \`${schemaName}\`.machines 
        WHERE id = ?
      `;
            await sequelize.query(deleteQuery, {
                replacements: [
                    id
                ]
            });
            console.log(`✅ Machine deleted successfully from schema: ${schemaName}`);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSuccessResponse"])('Machine deleted successfully');
        }
    } catch (error) {
        console.error('Error deleting machine:', error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Failed to delete machine', 500);
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__791ae7af._.js.map