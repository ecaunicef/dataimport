
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db.js');


const Classification = sequelize.define('classification', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    classification_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    classification_name_nl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    classification_name_fr: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    classification_name_es: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    classification_type: {
        type: DataTypes.STRING,
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
    flag: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'classification',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
});

Classification.sync({
    alter: true,
})


module.exports = Classification;
