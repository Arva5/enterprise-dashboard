const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Payroll = sequelize.define('Payroll', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  month: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  basicSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  allowances: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  deductions: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  netSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'processed', 'paid'),
    defaultValue: 'pending'
  }
}, {
  timestamps: true,
  tableName: 'payrolls'
});

User.hasMany(Payroll, { foreignKey: 'userId', as: 'payrolls' });
Payroll.belongsTo(User, { foreignKey: 'userId', as: 'employee' });

module.exports = Payroll;