const jwt = require("jsonwebtoken");
const config = require("../config/env");
const role = require("../model/role");

module.exports = async function (req, res, next) {
  //get the token from the header if present
  const token =
    req.headers["x-access-token"] ||
    req.headers["authorization"] ||
    req.cookies.auth;
  //if no token found, return response (without going to the next middelware)
  if (!token)
    return res
      .status(401)
      .send({ status: 0, message: "Access denied. No token provided." });

  try {
    //if can verify the token, set req.user and pass to next middleware
    const decoded = jwt.verify(token, config.privateKey);
    req.user = decoded;

    
    // console.log(decoded)

    if (decoded.type != "superAdmin") {

      const roleId = decoded.role;
      const roleDetails = await role.findById(roleId);
      const permission = roleDetails.permissions.find(
        (e) => e.subModule == "Data Approve"
      );
      
      let isPermitted = false;

      permission.actions.forEach((ele) => {
        if(ele.add_edit == true){
          isPermitted = true;
        }
      });
      
     if (isPermitted) {
        next();
     } else {
       return res
         .status(401)
         .send({ status: 0, message: "Access denied. Unauthorized User." });
     }

    }else{
      next()
    }
  } catch (ex) {
    //if invalid token
    return res
      .status(401)
      .send({ status: 0, message: "Access denied. Invalid Token." });
  }
};
