const jwt = require("jsonwebtoken");
const config = require('../config/env')
const redisClient = require('../model/redis.js');
const contextService = require('request-context');
module.exports = async function(req, res, next) {

  //get the token from the header if present
  const token = req.headers["x-access-token"] || req.headers["authorization"] || req.cookies.auth;
  //if no token found, return response (without going to the next middelware)
  if (!token) {
    return res.status(401).send({status:0,message:"Access denied. No token provided."})
  };

  const inDenyList = await redisClient.get(`blacklist_${token}`);
  // console.log(inDenyList)
  if (inDenyList) {
    //res.clearCookie('auth');
    return res.status(401).send({status:0,message:"Access denied. Invalid token"});
  }
  
  try {
    //if can verify the token, set req.user and pass to next middleware

    const decoded = jwt.verify(token, config.privateKey);
    contextService.set('request:userDetailsAll', decoded);
    req.user = decoded;
    // if(req.user.role != 1 && req.user.role != 3){
    //   res.status(400).send({status:0,message:"Access denied. Invalid User."});
    // }
   
    next();

  } catch (ex) {
  // console.log("🚀 ~ file: auth.js:34 ~ module.exports=function ~ ex:", ex)

    //if invalid token
    return res.status(401).send({status:0,message:"Access denied. Invalid Token."});
  }
};
