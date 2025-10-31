import { DataTypes, Model, Sequelize } from 'sequelize';

export interface AuditLogAttributes {
  id?: number;
  userId?: number;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
}

export class AuditLog extends Model<AuditLogAttributes> implements AuditLogAttributes {
  public id!: number;
  public userId?: number;
  public action!: string;
  public resource!: string;
  public resourceId?: string;
  public oldValues?: Record<string, unknown>;
  public newValues?: Record<string, unknown>;
  public ipAddress?: string;
  public userAgent?: string;
  public readonly timestamp!: Date;

  // Model associations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static associate(models: Record<string, any>) {
    AuditLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  }
}

export const initAuditLogModel = (sequelize: Sequelize) => {
  AuditLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      resource: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      resourceId: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      oldValues: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      newValues: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      }
    },
    {
      sequelize,
      modelName: 'AuditLog',
      tableName: 'AuditLogs',
      timestamps: false, // We use custom timestamp field
      indexes: [
        { fields: ['userId'] },
        { fields: ['action'] },
        { fields: ['resource'] },
        { fields: ['resourceId'] },
        { fields: ['timestamp'] },
        { fields: ['ipAddress'] }
      ]
    }
  );

  return AuditLog;
};

export default AuditLog;