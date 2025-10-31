import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class MigrationRunner {
  constructor() {}

  /**
   * Run all pending migrations
   */
  async up() {
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
   */
  async down() {
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
   */
  async status() {
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
   * Seed the database
   */
  async seed() {
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
   */
  async init() {
    try {
      console.log('🏗️  Initializing database...');
      
      // Create database
      console.log('Creating database...');
      try {
        await execAsync('npx sequelize-cli db:create');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
   */
  async reset() {
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

// Export singleton instance
export const migrationRunner = new MigrationRunner();
export { MigrationRunner };