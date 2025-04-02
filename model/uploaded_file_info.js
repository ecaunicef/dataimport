const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db.js');

const UploadedFileInfo = sequelize.define('UploadedFileInfo', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: true,
        trim: true, // Sequelize doesn't have a `trim` attribute, but you can handle it in hooks or manually during processing.
    },
    language_type: {
        type: DataTypes.STRING,
        allowNull: true,
        trim: true, // Sequelize doesn't have a `trim` attribute, but you can handle it in hooks or manually during processing.
    },
    file_detail: {
        type: DataTypes.JSON, // Use JSON to store object data in Sequelize.
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
        trim: true,
    },
    error_file: {
        type: DataTypes.TEXT,
        allowNull: true,
        trim: true,
    },
  
    createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
    },
}, {
    tableName: 'uploaded_file_info', // Maps to the table name in the database.
    timestamps: true,
});

module.exports = UploadedFileInfo;
