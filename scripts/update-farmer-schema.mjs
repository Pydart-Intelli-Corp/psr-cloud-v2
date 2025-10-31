import { updateAdminSchemasWithFarmersTable } from '../src/lib/adminSchema.ts';

console.log('🔄 Starting farmer table schema update...');

try {
  await updateAdminSchemasWithFarmersTable();
  console.log('✅ Schema update completed successfully');
} catch (error) {
  console.error('❌ Schema update failed:', error);
  process.exit(1);
}