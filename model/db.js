// // var mongoose = require('mongoose');
// const mysql = require('mysql2');
// const env = require('../config/env')

// const db = env.dbConfig.db;
// // mongoose.connect(db);
// mysql.createConnection(db);


const env = require('../config/env.js')
const { Sequelize } = require('sequelize');
// require('dotenv').config();

const sequelize = new Sequelize(env.dbConfig.db.database, env.dbConfig.db.user, env.dbConfig.db.password, {
  host: env.dbConfig.db.host,
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;
