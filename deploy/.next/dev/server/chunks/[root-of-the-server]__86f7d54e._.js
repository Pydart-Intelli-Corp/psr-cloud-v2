module.exports = [
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[project]/src/lib/migrations.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MigrationRunner",
    ()=>MigrationRunner,
    "migrationRunner",
    ()=>migrationRunner
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/util [external] (util, cjs)");
;
;
const execAsync = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__["promisify"])(__TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["exec"]);
class MigrationRunner {
    constructor(){}
    /**
   * Run all pending migrations
   */ async up() {
        try {
            console.log('🚀 Running database migrations...');
            const { stdout, stderr } = await execAsync('npx sequelize-cli db:migrate');
            if (stderr && !stderr.includes('WARNING')) {
                throw new Error(stderr);
            }
            console.log('✅ Migrations completed successfully');
            if (stdout) console.log(stdout);
        } catch (error) {
            console.error('❌ Migration failed:', error);
            throw error;
        }
    }
    /**
   * Rollback last migration
   */ async down() {
        try {
            console.log('⏪ Rolling back last migration...');
            const { stdout, stderr } = await execAsync('npx sequelize-cli db:migrate:undo');
            if (stderr && !stderr.includes('WARNING')) {
                throw new Error(stderr);
            }
            console.log('✅ Rollback completed successfully');
            if (stdout) console.log(stdout);
        } catch (error) {
            console.error('❌ Rollback failed:', error);
            throw error;
        }
    }
    /**
   * Check migration status
   */ async status() {
        try {
            console.log('📊 Checking migration status...');
            // List executed migrations
            console.log('\n--- Executed Migrations ---');
            const { stdout: executedStdout } = await execAsync('npx sequelize-cli db:migrate:status');
            console.log(executedStdout || 'No migrations executed yet');
        } catch (error) {
            console.error('❌ Status check failed:', error);
            throw error;
        }
    }
    /**
   * Get migration status (alias for status method)
   */ async getMigrationStatus() {
        try {
            console.log('📊 Getting migration status...');
            const { stdout } = await execAsync('npx sequelize-cli db:migrate:status');
            return stdout || 'No migrations executed yet';
        } catch (error) {
            console.error('❌ Get migration status failed:', error);
            throw error;
        }
    }
    /**
   * Run migrations (alias for up method)
   */ async runMigrations() {
        return this.up();
    }
    /**
   * Undo last migration (alias for down method)  
   */ async undoLastMigration() {
        return this.down();
    }
    /**
   * Run seeders (alias for seed method)
   */ async runSeeders() {
        return this.seed();
    }
    /**
   * Undo all seeders
   */ async undoSeeders() {
        try {
            console.log('🔄 Undoing all seeders...');
            const { stdout, stderr } = await execAsync('npx sequelize-cli db:seed:undo:all');
            if (stderr && !stderr.includes('WARNING')) {
                throw new Error(stderr);
            }
            console.log('✅ All seeders undone successfully');
            if (stdout) console.log(stdout);
        } catch (error) {
            console.error('❌ Undo seeders failed:', error);
            throw error;
        }
    }
    /**
   * Initialize database (alias for init method)
   */ async initializeDatabase() {
        return this.init();
    }
    /**
   * Seed the database
   */ async seed() {
        try {
            console.log('🌱 Seeding database...');
            const { stdout, stderr } = await execAsync('npx sequelize-cli db:seed:all');
            if (stderr && !stderr.includes('WARNING')) {
                throw new Error(stderr);
            }
            console.log('✅ Seeding completed successfully');
            if (stdout) console.log(stdout);
        } catch (error) {
            console.error('❌ Seeding failed:', error);
            throw error;
        }
    }
    /**
   * Initialize database (create + migrate + seed)
   */ async init() {
        try {
            console.log('🏗️  Initializing database...');
            // Create database
            console.log('Creating database...');
            try {
                await execAsync('npx sequelize-cli db:create');
            } catch (createError) {
                // Database might already exist, which is fine
                console.log('Database already exists or creation failed, continuing...');
            }
            // Run migrations
            await this.up();
            // Run seeds
            await this.seed();
            console.log('✅ Database initialization completed successfully');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }
    /**
   * Reset database (drop + create + migrate + seed)
   */ async reset() {
        try {
            console.log('🔄 Resetting database...');
            const { stdout, stderr } = await execAsync('npm run db:reset');
            if (stderr && !stderr.includes('WARNING')) {
                throw new Error(stderr);
            }
            console.log('✅ Database reset completed successfully');
            if (stdout) console.log(stdout);
        } catch (error) {
            console.error('❌ Database reset failed:', error);
            throw error;
        }
    }
}
const migrationRunner = new MigrationRunner();
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__86f7d54e._.js.map