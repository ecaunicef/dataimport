const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db.js');
const Area = require('./area.js');
const Classification = require('./classification.js');

const Helpline = sequelize.define('helplinenumber', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    area_level1:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    helplinenumber: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    classification_id:{
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    emergency_service:{
         type:DataTypes.STRING,
         allowNull:true,
    },
    organization: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    place: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    district: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    hotline: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // name: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    // },
    website: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    add1: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    add2: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tel1: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tel2: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tel3: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    geolocation: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    subcategory: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    flag: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
    tableName: 'helplinenumber',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated'
});

Helpline.belongsTo(Area, { foreignKey: 'area_level1', targetKey: 'area_code' });
Helpline.belongsTo(Classification, { foreignKey:'classification_id', targetKey:'id'})

// Helpline.sync({
//     alter: true
// })



module.exports = Helpline;