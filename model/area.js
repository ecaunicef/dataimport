const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db.js');

const Area = sequelize.define('area', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name_nl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name_fr: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name_es: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  area_code: {
    type: DataTypes.STRING,
    allowNull: false,
    // unique: true
  },
  status:{
    type:DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue:1
  },
  parent_area_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  chat: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  updatedBy: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  deletedBy: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'area',
  timestamps: true,
  createdAt: 'created',
  updatedAt: 'updated',
});


// Area.sync({
//   alter: true,
// })

module.exports = Area;
