const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db.js');


const MentalHealthChatline = sequelize.define('mental_health_chatline', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  area_level1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  w_link: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    defaultValue: 1
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
}, {
  tableName: 'mental_health_chatline',
  timestamps: true,
  createdAt: 'created',
  updatedAt: 'updated',
});

module.exports = MentalHealthChatline;
