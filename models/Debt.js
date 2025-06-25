const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Debt = sequelize.define('Debt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  institution: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

module.exports = Debt;
