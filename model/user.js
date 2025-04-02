const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db.js');
const Area = require('./area.js');
const Classification = require('./classification.js');

const User = sequelize.define('user', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  area_level: {
    type: DataTypes.STRING,
    allowNull: true,
    
  }, 
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  language: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
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
  deleted: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  flag: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue:0
  },
  latlongt: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deviceToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  place: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Null"
  }, 
  district: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Null"
  },
}, {
  tableName: 'user',
  timestamps: true,
  createdAt: 'created',
  updatedAt: 'updated',
});
User.belongsTo(Area, { foreignKey: 'area_level', targetKey: 'area_code' });
// User.belongsTo(Classification, { foreignKey: 'language', targetKey: 'id' });



module.exports = User;
