const redis = require('redis');
require('dotenv').config();
const env = require('../config/env');

// const redisClient = redis.createClient(env.dbConfig.radisPort, env.dbConfig.hostIp)

const redisClient = redis.createClient({
    url: `redis://${env.dbConfig.hostIp}:${env.dbConfig.radisPort}`
})

redisClient.connect();

redisClient.on('connect', res => console.log('Redis Client Connected'));

redisClient.on('error', err => console.log('Redis Client Error', err));

module.exports = redisClient;
