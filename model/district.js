const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db.js');

const District = sequelize.define('districts', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    countryid: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    district: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    flag: {
        type: DataTypes.INTEGER,
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
    tableName: 'districts',
    timestamps:false,
    createdby: 'createdby',
    updatedby: 'updatedby',
});

module.exports = District;
