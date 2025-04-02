const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db.js');

const Category = sequelize.define('category', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  flag: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type:{
    type:DataTypes.STRING,
    allowNull:false
  }, 
  created: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  updated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },

}, {
  tableName: 'category',
  timestamps: false,
});

module.exports = Category;
