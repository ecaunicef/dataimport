const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db.js');
const User = require('./user.js');

const Counselling = sequelize.define('counselling', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  // area_level2: {
  //   type: DataTypes.BIGINT,
  //   allowNull: false
  // },
  id_mobileappuser: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  second_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  counselling_given: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mobile_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // email: {
  //   type: DataTypes.STRING,
  //   allowNull: false
  // },
  appointment_reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  appointment_date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  current_status: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1
  },
  flag: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  // appointment_time: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
 
  // country: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  
  
 
  
 
 
  
}, {
  tableName: 'counselling',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

Counselling.belongsTo(User, { foreignKey: 'id_mobileappuser', targetKey: 'id' });


module.exports = Counselling;
