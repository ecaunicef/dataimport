const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db.js');
const Area = require('./area.js');

const Blog = sequelize.define('blog', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subtitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  message_category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  area_level1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // image: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  // description: {
  //   type: DataTypes.TEXT,
  //   allowNull: false,
  // },
  // flag: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false,
  // },
  scheduled: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdby: {
    type: DataTypes.BIGINT,
    allowNull: false,
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
  sent: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_scheduled: {
    type: DataTypes.BIGINT,
    allowNull: true,
    defaultValue: null
  },
  viewblogcount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sending_status: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'blog',
  timestamps: true,
  createdAt: 'created',
  updatedAt: 'updated',
});

module.exports = Blog;
