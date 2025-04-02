const jwt = require("jsonwebtoken");
const config = require("../config/env");
const role = require("../model/role");
const redisClient = require("../model/redis.js");

module.exports =  function ({module,subModule,access_type}) {
    return async function (req, res, next) {
       
        const token =
            req.headers["x-access-token"] ||
            req.headers["authorization"] ||
            req.cookies.auth;
       

        try {
            const decoded = jwt.verify(token, config.privateKey);

           let getpermission =  await redisClient.get('permission_'+token)
          
            if(decoded.type != 'superAdmin'){

            let tempCondition = false

            JSON.parse(getpermission).forEach(element => {
                // console.log('permission',element, element.module, element.subModule, element.actions)
                if (module == element.module && element.subModule == subModule) {
                    element.actions.forEach((item) => {
                        // console.log(item[access_type]);
                        if (item[access_type] != undefined) {
                            if (item[access_type]) {
                                tempCondition = true
                            } 
                        }
                    })
                }
            });

            // console.log('tempCondition',tempCondition);
            
            if(tempCondition){
                next()
            }else{
                await redisClient.set(`blacklist_${token}`, token, {
                    EX: 180,
                }); //expire in 3 minute

                await redisClient.del('permission_'+token)

                return res
                .status(401)
                .send({ status: 0, message: "Unauthorized Access" });
            }

        }else{
            next()
        }
            

          
        } catch (error) {
            //if invalid token
            return res
                .status(400)
                .send({ status: 0, message: error });
        }
    }
};
