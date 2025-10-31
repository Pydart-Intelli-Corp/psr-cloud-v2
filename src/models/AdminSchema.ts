import { DataTypes, Model, Sequelize } from 'sequelize';

export interface AdminSchemaAttributes {
  id?: number;
  adminId: number;
  schemaKey: string;
  schemaName: string;
  status: 'active' | 'inactive' | 'suspended' | 'maintenance';
  configuration?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AdminSchema extends Model<AdminSchemaAttributes> implements AdminSchemaAttributes {
  public id!: number;
  public adminId!: number;
  public schemaKey!: string;
  public schemaName!: string;
  public status!: 'active' | 'inactive' | 'suspended' | 'maintenance';
  public configuration?: Record<string, unknown>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Model associations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static associate(models: Record<string, any>) {
    AdminSchema.belongsTo(models.User, {
      foreignKey: 'adminId',
      as: 'admin'
    });
  }
}

export const initAdminSchemaModel = (sequelize: Sequelize) => {
  AdminSchema.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      adminId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      schemaKey: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      schemaName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended', 'maintenance'),
        allowNull: false,
        defaultValue: 'active',
      },
      configuration: {
        type: DataTypes.JSON,
        allowNull: true,
      }
    },
    {
      sequelize,
      modelName: 'AdminSchema',
      tableName: 'AdminSchemas',
      timestamps: true,
      indexes: [
        { fields: ['adminId'] },
        { fields: ['schemaKey'] },
        { fields: ['status'] }
      ]
    }
  );

  return AdminSchema;
};

export default AdminSchema;