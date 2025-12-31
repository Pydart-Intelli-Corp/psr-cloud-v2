import { DataTypes, Model, Sequelize } from 'sequelize';

export interface MachineAttributes {
  id?: number;
  machineType: string;
  description?: string;
  isActive: boolean;
  imageUrl?: string;
}

export class Machine extends Model<MachineAttributes> implements MachineAttributes {
  public id!: number;
  public machineType!: string;
  public description?: string;
  public isActive!: boolean;
  public imageUrl?: string;
}

export const initMachineModel = (sequelize: Sequelize) => {
  Machine.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      machineType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: 'machine_type',
        validate: {
          notEmpty: true,
          len: [1, 100]
        },
        comment: 'Machine type/model identifier'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Optional description of the machine type'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
        comment: 'Whether this machine type is active'
      },
      imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'image_url',
        comment: 'URL path to machine image'
      }
    },
    {
      sequelize,
      modelName: 'Machine',
      tableName: 'machinetype',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['machine_type']
        },
        {
          fields: ['is_active']
        }
      ]
    }
  );

  return Machine;
};

export default Machine;