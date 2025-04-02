const { DataTypes, Model } = require('sequelize');
const sequelize = require('./db.js');
const Area = require('./area.js');

let AdminUser = sequelize.define('admin_user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    token: {
        type: DataTypes.STRING,
        allowNull: true
    },
    area_level1: {
        type: DataTypes.TEXT, // Set as JSON to store arrays of objects
        allowNull: true
    },
    profile_image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    flag: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    user_role: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }

}, {
    tableName: 'admin_user',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
});

// AdminUser.belongsTo(Area, { foreignKey: 'area_level1', targetKey: 'id' })
// AdminUser.sync({
//     alter:true
// })

module.exports = AdminUser;
