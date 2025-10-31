import createSequelizeInstance from '@/lib/database';
import { initUserModel } from './User';
import { initAdminSchemaModel } from './AdminSchema';
import { initAuditLogModel } from './AuditLog';
import { initMachineModel } from './Machine';

// Get models - lazy initialization
export const getModels = () => {
  const sequelize = createSequelizeInstance();
  if (!sequelize) {
    throw new Error('Database not initialized');
  }
  
  const User = initUserModel(sequelize);
  const AdminSchema = initAdminSchemaModel(sequelize);
  const AuditLog = initAuditLogModel(sequelize);
  const Machine = initMachineModel(sequelize);
  
  // Set up associations
  const models = { User, AdminSchema, AuditLog, Machine };
  
  // Initialize associations if they exist
  type AssociateFn = (models: Record<string, unknown>) => void;
  type ModelWithAssociate = { associate?: AssociateFn };
  
  if ((User as unknown as ModelWithAssociate).associate) {
    (User as unknown as ModelWithAssociate).associate!(models);
  }
  if ((AdminSchema as unknown as ModelWithAssociate).associate) {
    (AdminSchema as unknown as ModelWithAssociate).associate!(models);
  }
  if ((AuditLog as unknown as ModelWithAssociate).associate) {
    (AuditLog as unknown as ModelWithAssociate).associate!(models);
  }
  
  return {
    User,
    AdminSchema,
    AuditLog,
    Machine,
    sequelize
  };
};

// Export types
export * from './User';
export * from './Machine';