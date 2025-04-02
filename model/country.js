const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db.js');

const Country = sequelize.define('country_master', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  area_code: {
    type: DataTypes.STRING,
    allowNull: true, // Set to `false` if it's required
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  chat: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
//   district: {
//     type: DataTypes.ARRAY,
//     allowNull: false,
//   },
  createdby: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  updatedby: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },

}, {
  tableName: 'country_master',
  timestamps: false,
  createdby: 'createdby',
  updatedby: 'updatedby',
});

module.exports = Country;
