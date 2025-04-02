const { DataTypes, Model } = require('sequelize');
const sequelize = require('./db.js');

class Credential extends Model { }

Credential.init({
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
    user_role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 0
    },
    flag: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    cid: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
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
    profile: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Credential',
    tableName: 'credential',
    timestamps: false
});

module.exports = Credential;















