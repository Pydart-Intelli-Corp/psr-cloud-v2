module.exports = [
"[project]/src/models/AdminSchema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdminSchema",
    ()=>AdminSchema,
    "default",
    ()=>__TURBOPACK__default__export__,
    "initAdminSchemaModel",
    ()=>initAdminSchemaModel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sequelize/lib/index.mjs [app-route] (ecmascript)");
;
class AdminSchema extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Model"] {
    id;
    adminId;
    schemaKey;
    schemaName;
    status;
    configuration;
    createdAt;
    updatedAt;
    // Model associations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static associate(models) {
        AdminSchema.belongsTo(models.User, {
            foreignKey: 'adminId',
            as: 'admin'
        });
    }
}
const initAdminSchemaModel = (sequelize)=>{
    AdminSchema.init({
        id: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        adminId: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        schemaKey: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(50),
            allowNull: false,
            unique: true
        },
        schemaName: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(255),
            allowNull: false
        },
        status: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].ENUM('active', 'inactive', 'suspended', 'maintenance'),
            allowNull: false,
            defaultValue: 'active'
        },
        configuration: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].JSON,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'AdminSchema',
        tableName: 'AdminSchemas',
        timestamps: true,
        indexes: [
            {
                fields: [
                    'adminId'
                ]
            },
            {
                fields: [
                    'schemaKey'
                ]
            },
            {
                fields: [
                    'status'
                ]
            }
        ]
    });
    return AdminSchema;
};
const __TURBOPACK__default__export__ = AdminSchema;
}),
"[project]/src/models/AuditLog.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuditLog",
    ()=>AuditLog,
    "default",
    ()=>__TURBOPACK__default__export__,
    "initAuditLogModel",
    ()=>initAuditLogModel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sequelize/lib/index.mjs [app-route] (ecmascript)");
;
class AuditLog extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Model"] {
    id;
    userId;
    action;
    resource;
    resourceId;
    oldValues;
    newValues;
    ipAddress;
    userAgent;
    timestamp;
    // Model associations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static associate(models) {
        AuditLog.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    }
}
const initAuditLogModel = (sequelize)=>{
    AuditLog.init({
        id: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].INTEGER,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        action: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(100),
            allowNull: false
        },
        resource: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(100),
            allowNull: false
        },
        resourceId: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(50),
            allowNull: true
        },
        oldValues: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].JSON,
            allowNull: true
        },
        newValues: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].JSON,
            allowNull: true
        },
        ipAddress: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(45),
            allowNull: true
        },
        userAgent: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].TEXT,
            allowNull: true
        },
        timestamp: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].DATE,
            allowNull: false,
            defaultValue: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].NOW
        }
    }, {
        sequelize,
        modelName: 'AuditLog',
        tableName: 'AuditLogs',
        timestamps: false,
        indexes: [
            {
                fields: [
                    'userId'
                ]
            },
            {
                fields: [
                    'action'
                ]
            },
            {
                fields: [
                    'resource'
                ]
            },
            {
                fields: [
                    'resourceId'
                ]
            },
            {
                fields: [
                    'timestamp'
                ]
            },
            {
                fields: [
                    'ipAddress'
                ]
            }
        ]
    });
    return AuditLog;
};
const __TURBOPACK__default__export__ = AuditLog;
}),
"[project]/src/models/Machine.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Machine",
    ()=>Machine,
    "default",
    ()=>__TURBOPACK__default__export__,
    "initMachineModel",
    ()=>initMachineModel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sequelize/lib/index.mjs [app-route] (ecmascript)");
;
class Machine extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Model"] {
    id;
    machineType;
    description;
    isActive;
}
const initMachineModel = (sequelize)=>{
    Machine.init({
        id: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        machineType: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].STRING(100),
            allowNull: false,
            unique: true,
            field: 'machine_type',
            validate: {
                notEmpty: true,
                len: [
                    1,
                    100
                ]
            },
            comment: 'Machine type/model identifier'
        },
        description: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].TEXT,
            allowNull: true,
            comment: 'Optional description of the machine type'
        },
        isActive: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sequelize$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DataTypes"].BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active',
            comment: 'Whether this machine type is active'
        }
    }, {
        sequelize,
        modelName: 'Machine',
        tableName: 'machinetype',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: [
                    'machine_type'
                ]
            },
            {
                fields: [
                    'is_active'
                ]
            }
        ]
    });
    return Machine;
};
const __TURBOPACK__default__export__ = Machine;
}),
"[project]/src/models/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getModels",
    ()=>getModels
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/database.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/models/User.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$AdminSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/models/AdminSchema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$AuditLog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/models/AuditLog.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$Machine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/models/Machine.ts [app-route] (ecmascript)");
;
;
;
;
;
const getModels = ()=>{
    const sequelize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
    if (!sequelize) {
        throw new Error('Database not initialized');
    }
    const User = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initUserModel"])(sequelize);
    const AdminSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$AdminSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initAdminSchemaModel"])(sequelize);
    const AuditLog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$AuditLog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initAuditLogModel"])(sequelize);
    const Machine = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$Machine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initMachineModel"])(sequelize);
    // Set up associations
    const models = {
        User,
        AdminSchema,
        AuditLog,
        Machine
    };
    if (User.associate) {
        User.associate(models);
    }
    if (AdminSchema.associate) {
        AdminSchema.associate(models);
    }
    if (AuditLog.associate) {
        AuditLog.associate(models);
    }
    return {
        User,
        AdminSchema,
        AuditLog,
        Machine,
        sequelize
    };
};
;
;
}),
"[project]/src/models/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Machine",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$Machine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Machine"],
    "UserRole",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserRole"],
    "UserStatus",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UserStatus"],
    "getModels",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModels"],
    "initMachineModel",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$Machine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initMachineModel"],
    "initUserModel",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initUserModel"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/models/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/models/User.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$Machine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/models/Machine.ts [app-route] (ecmascript)");
}),
];

//# sourceMappingURL=src_models_17c83d5a._.js.map