import { config } from 'dotenv';
import { updateAdminSchemasWithFarmersTable } from '../src/lib/adminSchema.ts';

// Load environment variables
config({ path: '.env.local' });

async function updateSchemas() {
  try {
    console.log('🚀 Starting admin schema update...');
    await updateAdminSchemasWithFarmersTable();
    console.log('✅ Schema update completed successfully!');
  } catch (error) {
    console.error('❌ Error updating schemas:', error);
  } finally {
    process.exit(0);
  }
}

updateSchemas();