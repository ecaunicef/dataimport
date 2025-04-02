const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("./db.js");
const User = require("./user.js");

const Feedback = sequelize.define(
  "feedback",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    id_mobileappuser: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    flag:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "feedback",
    timestamps: false,
  }
);

Feedback.beforeCreate((feedback) => {
  feedback.created = new Date();
});

Feedback.belongsTo(User, { foreignKey: 'id_mobileappuser', targetKey: 'id' });

module.exports = Feedback;
