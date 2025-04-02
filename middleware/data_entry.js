const jwt = require("jsonwebtoken");
const config = require('../config/env')

module.exports = function(req, res, next) {
  //get the token from the header if present
  const token = req.headers["x-access-token"] || req.headers["authorization"] || req.cookies.auth;
  //if no token found, return response (without going to the next middelware)
  if (!token) return res.status(401).send({status:0,message:"Access denied. No token provided."});

  try {
    //if can verify the token, set req.user and pass to next middleware
    const decoded = jwt.verify(token, config.privateKey);
    req.user = decoded;
    if(req.user.role != 1 && req.user.role != 3 && req.user.role != 2 ){
      res.status(400).send({status:0,message:"Access denied. Invalid User."});
    }
    next();
  } catch (ex) {
    //if invalid token
    res.status(401).send({status:0,message:"Access denied. Invalid Token."});
  }
};
