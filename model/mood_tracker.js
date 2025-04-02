const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db.js');
const User = require('./user.js');
const Area = require('./area.js');
const Classification = require('./classification.js');

const MoodTracker = sequelize.define('moodtracker', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    id_mobileappuser: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    flag: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    created: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
    },
    updated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
    },
    deleted: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'moodtracker',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
});

MoodTracker.belongsTo(User, { foreignKey: 'id_mobileappuser', targetKey: 'id', as: 'user'});
// MoodTracker.belongsTo(Area, { foreignKey: 'area_level2', targetKey: 'area_code', as :'area' });
// MoodTracker.belongsTo(Classification, { foreignKey:'mood_type', targetKey:'id', as :'classification'})

// MoodTracker.sync({
//     alter: true
// })


module.exports = MoodTracker;
