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
"[project]/src/app/api/user/society/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
// Helper function to check email uniqueness across all admin schemas
async function checkGlobalEmailUniqueness(email, excludeSocietyId, currentSchemaName) {
    const { sequelize, User } = await __turbopack_context__.A("[project]/src/models/index.ts [app-route] (ecmascript, async loader)").then((m)=>m.getModels());
    // Get all admin schemas
    const [schemas] = await sequelize.query(`
    SELECT DISTINCT TABLE_SCHEMA 
    FROM information_schema.TABLES 
    WHERE (TABLE_SCHEMA LIKE 'db_%' OR TABLE_SCHEMA LIKE 'tester_%') 
    AND TABLE_NAME = 'societies'
    ORDER BY TABLE_SCHEMA
  `);
    const adminSchemas = schemas.map((s)=>s.TABLE_SCHEMA);
    for (const schema of adminSchemas){
        try {
            let query = `SELECT society_id, name FROM \`${schema}\`.\`societies\` WHERE email = ?`;
            const replacements = [
                email.trim().toLowerCase()
            ];
            // If checking for update (exclude current society)
            if (excludeSocietyId && currentSchemaName && schema === currentSchemaName) {
                query += ' AND id != ?';
                replacements.push(excludeSocietyId);
            }
            const [existingEmail] = await sequelize.query(query, {
                replacements
            });
            if (Array.isArray(existingEmail) && existingEmail.length > 0) {
                return {
                    isUnique: false,
                    existingSchema: schema
                };
            }
        } catch (error) {
            console.log(`⚠️ Schema ${schema} not accessible or doesn't have societies table`);
            continue;
        }
    }
    return {
        isUnique: true
    };
}
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
        const { name, password, societyId, location, presidentName, contactPhone, email, bmcId } = body;
        if (!name || !password || !societyId || !email) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Name, password, society ID, and email are required', 400);
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Please enter a valid email address', 400);
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
        // Check for global email uniqueness across all admin schemas
        const emailCheck = await checkGlobalEmailUniqueness(email);
        if (!emailCheck.isUnique) {
            console.log(`📧 Global duplicate email detected: ${email} (exists in schema: ${emailCheck.existingSchema})`);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Email address already exists in the system. Please use a different email.', 400);
        }
        // Insert society data into admin's schema
        const insertQuery = `
      INSERT INTO \`${schemaName}\`.\`societies\` 
      (name, society_id, password, location, president_name, contact_phone, email, bmc_id, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `;
        await sequelize.query(insertQuery, {
            replacements: [
                name,
                societyId,
                password,
                location || null,
                presidentName || null,
                contactPhone || null,
                email.trim().toLowerCase(),
                bmcId || null
            ]
        });
        console.log(`✅ Society added successfully to schema: ${schemaName}`);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSuccessResponse"])('Society added successfully', {
            societyId,
            name,
            email,
            location,
            presidentName
        });
    } catch (error) {
        console.error('Error adding society:', error);
        if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Society ID already exists', 409);
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Failed to add society', 500);
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
        // Get all societies from admin's schema with BMC names and 30-day statistics
        const [societies] = await sequelize.query(`
      SELECT 
        s.id, s.name, s.society_id, s.location, s.president_name, s.contact_phone, s.email, s.bmc_id, s.status,
        b.name as bmc_name, s.created_at, s.updated_at,
        COALESCE(COUNT(DISTINCT mc.id), 0) as total_collections_30d,
        COALESCE(SUM(mc.quantity), 0) as total_quantity_30d,
        COALESCE(SUM(mc.total_amount), 0) as total_amount_30d,
        COALESCE(
          CASE 
            WHEN SUM(mc.quantity) > 0 
            THEN ROUND(SUM(mc.fat_percentage * mc.quantity) / SUM(mc.quantity), 2)
            ELSE 0 
          END, 0
        ) as weighted_fat_30d,
        COALESCE(
          CASE 
            WHEN SUM(mc.quantity) > 0 
            THEN ROUND(SUM(mc.snf_percentage * mc.quantity) / SUM(mc.quantity), 2)
            ELSE 0 
          END, 0
        ) as weighted_snf_30d,
        COALESCE(
          CASE 
            WHEN SUM(mc.quantity) > 0 
            THEN ROUND(SUM(mc.clr_value * mc.quantity) / SUM(mc.quantity), 2)
            ELSE 0 
          END, 0
        ) as weighted_clr_30d,
        COALESCE(
          CASE 
            WHEN SUM(CASE WHEN mc.water_percentage IS NOT NULL THEN mc.quantity ELSE 0 END) > 0 
            THEN ROUND(
              SUM(CASE WHEN mc.water_percentage IS NOT NULL THEN mc.water_percentage * mc.quantity ELSE 0 END) / 
              SUM(CASE WHEN mc.water_percentage IS NOT NULL THEN mc.quantity ELSE 0 END), 
              2
            )
            ELSE 0 
          END, 0
        ) as weighted_water_30d
      FROM \`${schemaName}\`.\`societies\` s
      LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.\`milk_collections\` mc 
        ON mc.society_id = s.id 
        AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY s.id, s.name, s.society_id, s.location, s.president_name, s.contact_phone, 
               s.bmc_id, s.status, b.name, s.created_at, s.updated_at
      ORDER BY s.created_at DESC
    `);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSuccessResponse"])('Societies retrieved successfully', societies);
    } catch (error) {
        console.error('Error retrieving societies:', error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Failed to retrieve societies', 500);
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
        const societyId = searchParams.get('id');
        const otp = searchParams.get('otp');
        if (!societyId || !otp) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Society ID and OTP are required', 400);
        }
        // Verify OTP
        const { verifyDeleteOTP } = await __turbopack_context__.A("[project]/src/app/api/user/society/send-delete-otp/route.ts [app-route] (ecmascript, async loader)");
        const isValidOTP = verifyDeleteOTP(payload.id, parseInt(societyId), otp);
        if (!isValidOTP) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Invalid or expired OTP', 401);
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
        // Check if society exists
        const [society] = await sequelize.query(`
      SELECT id, name FROM \`${schemaName}\`.\`societies\` WHERE id = ?
    `, {
            replacements: [
                societyId
            ]
        });
        if (!Array.isArray(society) || society.length === 0) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Society not found', 404);
        }
        const societyData = society[0];
        console.log(`🗑️ Starting cascade delete for Society ID ${societyId}: ${societyData.name}`);
        // Get all farmers under this society
        const [farmers] = await sequelize.query(`
      SELECT id FROM \`${schemaName}\`.\`farmers\` WHERE society_id = ?
    `, {
            replacements: [
                societyId
            ]
        });
        const farmerIds = Array.isArray(farmers) ? farmers.map((f)=>f.id) : [];
        // Get rate chart IDs for this society
        const [rateCharts] = await sequelize.query(`
      SELECT id FROM \`${schemaName}\`.\`rate_charts\` WHERE society_id = ?
    `, {
            replacements: [
                societyId
            ]
        });
        const rateChartIds = Array.isArray(rateCharts) ? rateCharts.map((rc)=>rc.id) : [];
        // Start cascade delete (13 steps)
        // Step 1: Delete milk collections for farmers
        if (farmerIds.length > 0) {
            await sequelize.query(`
        DELETE FROM \`${schemaName}\`.\`milk_collections\` 
        WHERE farmer_id IN (?)
      `, {
                replacements: [
                    farmerIds
                ]
            });
            console.log(`✅ Step 1: Deleted milk collections for farmers`);
        }
        // Step 2: Delete milk sales records
        await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`milk_sales\` WHERE society_id = ?
    `, {
            replacements: [
                societyId
            ]
        });
        console.log(`✅ Step 2: Deleted milk sales records`);
        // Step 3: Delete milk dispatches
        await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`milk_dispatches\` WHERE society_id = ?
    `, {
            replacements: [
                societyId
            ]
        });
        console.log(`✅ Step 3: Deleted milk dispatches`);
        // Step 4: Delete section pulse data
        await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`section_pulse\` WHERE society_id = ?
    `, {
            replacements: [
                societyId
            ]
        });
        console.log(`✅ Step 4: Deleted section pulse data`);
        // Step 5: Delete rate chart download history
        if (rateChartIds.length > 0) {
            await sequelize.query(`
        DELETE FROM \`${schemaName}\`.\`rate_chart_download_history\` 
        WHERE rate_chart_id IN (?)
      `, {
                replacements: [
                    rateChartIds
                ]
            });
            console.log(`✅ Step 5: Deleted rate chart download history`);
        }
        // Step 6: Delete rate chart data
        if (rateChartIds.length > 0) {
            await sequelize.query(`
        DELETE FROM \`${schemaName}\`.\`rate_chart_data\` 
        WHERE rate_chart_id IN (?)
      `, {
                replacements: [
                    rateChartIds
                ]
            });
            console.log(`✅ Step 6: Deleted rate chart data`);
        }
        // Step 7: Delete rate charts
        await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`rate_charts\` WHERE society_id = ?
    `, {
            replacements: [
                societyId
            ]
        });
        console.log(`✅ Step 7: Deleted rate charts`);
        // Step 8: Delete machine statistics
        await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`machine_statistics\` WHERE society_id = ?
    `, {
            replacements: [
                societyId
            ]
        });
        console.log(`✅ Step 8: Deleted machine statistics`);
        // Step 9: Delete machine corrections (admin saved)
        await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`machine_corrections\` WHERE society_id = ?
    `, {
            replacements: [
                societyId
            ]
        });
        console.log(`✅ Step 9: Deleted machine corrections (admin saved)`);
        // Step 10: Delete machine corrections from machine (device saved)
        await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`machine_corrections_from_machine\` WHERE society_id = ?
    `, {
            replacements: [
                societyId
            ]
        });
        console.log(`✅ Step 10: Deleted machine corrections (device saved)`);
        // Step 11: Delete farmers
        await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`farmers\` WHERE society_id = ?
    `, {
            replacements: [
                societyId
            ]
        });
        console.log(`✅ Step 11: Deleted farmers`);
        // Step 12: Delete machines (society_id will be set to NULL)
        await sequelize.query(`
      UPDATE \`${schemaName}\`.\`machines\` SET society_id = NULL WHERE society_id = ?
    `, {
            replacements: [
                societyId
            ]
        });
        console.log(`✅ Step 12: Unlinked machines from society`);
        // Step 13: Finally delete the society
        await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`societies\` WHERE id = ?
    `, {
            replacements: [
                societyId
            ]
        });
        console.log(`✅ Step 13: Deleted society "${societyData.name}"`);
        console.log(`🎉 Cascade delete completed successfully for Society ID ${societyId}`);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSuccessResponse"])('Society and all related data deleted successfully', {
            societyId: parseInt(societyId),
            societyName: societyData.name,
            deletedItems: {
                farmers: farmerIds.length,
                rateCharts: rateChartIds.length
            }
        });
    } catch (error) {
        console.error('Error deleting society:', error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Failed to delete society', 500);
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
        const { id, name, location, presidentName, contactPhone, email, bmcId, status, password } = body;
        if (!id || !name || !email) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Society ID, name, and email are required', 400);
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Please enter a valid email address', 400);
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
        // Check if society exists
        const [existingSociety] = await sequelize.query(`
      SELECT id FROM \`${schemaName}\`.\`societies\` WHERE id = ?
    `, {
            replacements: [
                id
            ]
        });
        if (!Array.isArray(existingSociety) || existingSociety.length === 0) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Society not found', 404);
        }
        // Check for global email uniqueness across all admin schemas (exclude current society)
        const emailCheck = await checkGlobalEmailUniqueness(email, id, schemaName);
        if (!emailCheck.isUnique) {
            console.log(`📧 Global duplicate email detected: ${email} (exists in schema: ${emailCheck.existingSchema})`);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Email address already exists in the system. Please use a different email.', 400);
        }
        // Build update query dynamically
        const updateFields = [
            'name = ?',
            'email = ?'
        ];
        const replacements = [
            name,
            email.trim().toLowerCase()
        ];
        if (location !== undefined) {
            updateFields.push('location = ?');
            replacements.push(location);
        }
        if (presidentName !== undefined) {
            updateFields.push('president_name = ?');
            replacements.push(presidentName);
        }
        if (contactPhone !== undefined) {
            updateFields.push('contact_phone = ?');
            replacements.push(contactPhone);
        }
        if (bmcId !== undefined) {
            updateFields.push('bmc_id = ?');
            replacements.push(bmcId);
        }
        if (status !== undefined) {
            updateFields.push('status = ?');
            replacements.push(status);
        }
        if (password) {
            updateFields.push('password = ?');
            replacements.push(password);
        }
        updateFields.push('updated_at = NOW()');
        replacements.push(id);
        // Update the society
        await sequelize.query(`
      UPDATE \`${schemaName}\`.\`societies\` 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, {
            replacements: replacements
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSuccessResponse"])('Society updated successfully', {
            id
        });
    } catch (error) {
        console.error('Error updating society:', error);
        // Check for unique constraint violations
        if (error instanceof Error) {
            const errorMessage = error.message;
            if (errorMessage.includes('email') || errorMessage.includes('unique_society_email')) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Email address already exists. Please use a different email.', 400);
            }
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createErrorResponse"])('Failed to update society', 500);
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__be818a21._.js.map