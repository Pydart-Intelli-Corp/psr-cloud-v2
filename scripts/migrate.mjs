#!/usr/bin/env node

import { migrationRunner } from '../src/lib/migrations.mjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const command = process.argv[2];
const subcommand = process.argv[3];

async function main() {
  try {
    switch (command) {
      case 'migrate':
        if (subcommand === 'up') {
          await migrationRunner.up();
        } else if (subcommand === 'down') {
          await migrationRunner.down();
        } else if (subcommand === 'status') {
          await migrationRunner.status();
        } else {
          await migrationRunner.up();
        }
        break;
        
      case 'seed':
        if (subcommand === 'up') {
          await migrationRunner.seed();
        } else if (subcommand === 'down') {
          console.log('Seed undo not implemented yet');
        } else {
          await migrationRunner.seed();
        }
        break;
        
      case 'init':
        await migrationRunner.init();
        break;
        
      case 'reset':
        await migrationRunner.reset();
        break;
        
      default:
        console.log(`
Poornasree Equipments Cloud - Database Migration Tool

Usage: node scripts/migrate.mjs <command> [subcommand]

Commands:
  migrate [up|down|status]  Run migrations (up), undo last migration (down), or check status
  seed [up|down]           Run seeders (up) or undo all seeders (down)  
  init                     Initialize database with migrations and seeders
  reset                    Reset database (WARNING: deletes all data)

Examples:
  node scripts/migrate.mjs migrate        # Run all pending migrations
  node scripts/migrate.mjs migrate up     # Run all pending migrations
  node scripts/migrate.mjs migrate down   # Undo last migration
  node scripts/migrate.mjs migrate status # Check migration status
  node scripts/migrate.mjs seed           # Run all seeders
  node scripts/migrate.mjs seed up        # Run all seeders
  node scripts/migrate.mjs seed down      # Undo all seeders
  node scripts/migrate.mjs init           # Initialize database
        `);
    }
  } catch (error) {
    console.error('❌ Migration tool error:', error);
    process.exit(1);
  }
}

main();