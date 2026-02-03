import { DataTypes, Model, Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';

// User roles in hierarchical order
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  DAIRY = 'dairy',
  BMC = 'bmc',
  SOCIETY = 'society',
  FARMER = 'farmer'
}

// User status
export enum UserStatus {
  PENDING = 'pending',
  PENDING_APPROVAL = 'pending_approval', // Email verified, waiting for super admin approval
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

// User attributes interface
export interface UserAttributes {
  id?: number;
  uid: string;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  dbKey?: string; // For admins - their dedicated schema key
  phone?: string;
  companyName?: string;
  companyPincode?: string;
  companyCity?: string;
  companyState?: string;
  parentId?: number; // Reference to parent user in hierarchy
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  otpCode?: string;
  otpExpires?: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// User model class
class User extends Model<UserAttributes> implements UserAttributes {
  // Remove public class fields to avoid shadowing Sequelize getters/setters
  declare id: number;
  declare uid: string;
  declare email: string;
  declare password: string;
  declare fullName: string;
  declare role: UserRole;
  declare status: UserStatus;
  declare dbKey?: string;
  declare phone?: string;
  declare companyName?: string;
  declare companyPincode?: string;
  declare companyCity?: string;
  declare companyState?: string;
  declare parentId?: number;
  declare isEmailVerified: boolean;
  declare emailVerificationToken?: string;
  declare emailVerificationExpires?: Date;
  declare passwordResetToken?: string;
  declare passwordResetExpires?: Date;
  declare otpCode?: string;
  declare otpExpires?: Date;
  declare lastLogin?: Date;
  declare loginAttempts: number;
  declare lockUntil?: Date;

  // Timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Instance methods
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  public async incLoginAttempts(): Promise<void> {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < new Date()) {
      await this.update({
        loginAttempts: 1,
        lockUntil: null as any
      });
      return;
    }

    const updates: Partial<UserAttributes> = { loginAttempts: this.loginAttempts + 1 };

    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
      updates.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    }

    await this.update(updates);
  }

  public async resetLoginAttempts(): Promise<void> {
    await this.update({
      loginAttempts: 0,
      lockUntil: null as any
    });
  }

  public get isLocked(): boolean {
    return !!(this.lockUntil && this.lockUntil > new Date());
  }



  public canManageRole(targetRole: UserRole): boolean {
    const roleHierarchy = [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.DAIRY,
      UserRole.BMC,
      UserRole.SOCIETY,
      UserRole.FARMER
    ];

    const currentRoleIndex = roleHierarchy.indexOf(this.role);
    const targetRoleIndex = roleHierarchy.indexOf(targetRole);

    return currentRoleIndex < targetRoleIndex;
  }
}

// Initialize User model
export const initUserModel = (sequelize: Sequelize): typeof User => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      uid: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [3, 50]
        }
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [6, 255]
        }
      },
      fullName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 200]
        }
      },
      role: {
        type: DataTypes.ENUM(...Object.values(UserRole)),
        allowNull: false,
        defaultValue: UserRole.FARMER
      },
      status: {
        type: DataTypes.ENUM(...Object.values(UserStatus)),
        allowNull: false,
        defaultValue: UserStatus.PENDING_APPROVAL
      },
      dbKey: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        comment: 'Dedicated database schema key for admins'
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          len: [10, 20]
        }
      },
      companyName: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      companyPincode: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
          len: [5, 10]
        }
      },
      companyCity: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: [2, 100]
        }
      },
      companyState: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: [2, 100]
        }
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      emailVerificationToken: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      emailVerificationExpires: {
        type: DataTypes.DATE,
        allowNull: true
      },
      passwordResetToken: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: true
      },
      otpCode: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      otpExpires: {
        type: DataTypes.DATE,
        allowNull: true
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
      },
      loginAttempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      lockUntil: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      hooks: {
        beforeSave: async (user: User) => {
          // Hash password if it's being modified AND not already hashed
          if (user.changed('password') && user.password) {
            // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
            const isBcryptHash = /^\$2[aby]\$/.test(user.password);
            if (!isBcryptHash) {
              const salt = await bcrypt.genSalt(12);
              user.password = await bcrypt.hash(user.password, salt);
            }
          }

          // Generate UID if not provided
          if (!user.uid && user.email) {
            const timestamp = Date.now().toString().slice(-6);
            const emailPrefix = user.email.substring(0, 3).toUpperCase();
            user.uid = `${emailPrefix}${timestamp}`;
          }
        }
      }
    }
  );

  // Define associations
  User.hasMany(User, { 
    as: 'Children', 
    foreignKey: 'parentId',
    onDelete: 'SET NULL'
  });
  
  User.belongsTo(User, { 
    as: 'Parent', 
    foreignKey: 'parentId',
    onDelete: 'SET NULL'
  });

  return User;
};

export default User;