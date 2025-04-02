const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db.js');

const MoodMapper = sequelize.define('mood_mapper', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    mood:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    mood_fr:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    mood_es:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    mood_nl:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    description_fr: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    description_es: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    description_nl: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    assigned_modules:{
        type: DataTypes.TEXT,
        allowNull: true,
    },
    assigned_modules_fr:{
        type: DataTypes.TEXT,
        allowNull: true,
    },
    assigned_modules_es:{
        type: DataTypes.TEXT,
        allowNull: true,
    },
    assigned_modules_nl:{
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    tableName: 'mood_mapper',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated'
});

module.exports = MoodMapper;