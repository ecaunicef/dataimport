const Area = require('../model/area');
const Admin_user = require('../model/admin_user');
const { Sequelize, where } = require('sequelize');

let areaController={
    createArea:async (req,res)=>{
        try{
            const { name, area_code, parent_area_code}=req.body;



            let areaCode = await Area.findOne({
                where:{
                    area_code: area_code
                }
            });
            if (area_code && areaCode){
                return res.send({
                    status:false,
                    message:'Area code already exists!'
                })
            }

            if ( area_code && area_code == parent_area_code){
                return res.send({
                    status:false,
                    message:'Same parent area code already exists!'
                })
            }
            if (!parent_area_code){
    
                const area=await Area.create({
                    name:name,
                    name_nl:"#"+name,
                    name_fr:"#"+name,
                    name_es:"#"+name,
                    area_code:area_code,
                    level:1,
                    parent_area_code:null,
                    chat:0
                });
            }else{

                let areaCode = await Area.findOne({
                    where:{
                        area_code: parent_area_code
                    }
                })
                let level1 = 0;
                if (!areaCode) {
                    level1 += 1;
                } else {
                    level1 = areaCode.level+1;
                }



                const area = await Area.create({
                    name: name,
                    name_nl: "#" + name,
                    name_fr: "#" + name,
                    name_es: "#" + name,
                    area_code: area_code,
                    level: level1,
                    parent_area_code: parent_area_code,
                    chat: 0
                });
            }



            return res.status(200).json({
                status:true,
                message:"Area created successfully"
            })
        }catch(err){
            console.log(err);
            return res.send({
                status:false,
                message:"Error creating area"
            })
        }
    },


    deleteArea: async (req, res) => {
        try {
            const id = req.params?.id;

            // Validate if ID is provided
            if (!id) {
                return res.send({
                    status: false,
                    message: "Area ID is required"
                });
            }

        

            // Delete the area
            const data = await Area.destroy({ where: { id } });

            if (data) {
                return res.status(200).send({
                    status: true,
                    message: "Area deleted successfully"
                });
            } else {
                return res.send({
                    status: false,
                    message: "Failed to delete the area"
                });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).send({
                status: false,
                message: "An unexpected error occurred"
            });
        }
    },
    updateArea:async (req,res)=>{
        try{

            let { id, payload }=req.body;

            const existingArea = await Area.findOne({
                where: {
                    area_code: payload.area_code,
                    id: { [Sequelize.Op.ne]:id } // Exclude the current record by ID
                }
            });

            if (existingArea) {
                return res.send({
                    status: false,
                    message: "Area code already exists"
                });
            }

            let updateArea = await Area.update(
                {
                    name: payload.name,
                    area_code: payload.area_code,
                    parent_area_code: payload.parent_area_code
                },
                {
                    where: {
                        id: id
                    }
                }
            );

            return res.send({
                status: true,
                message: "Area updated successfully",
                data: updateArea
            });

        }catch(err){
            console.log(err);
            return res.send({
                status:false,
                message:"Something went wrong"
            })
        }
    },
    updateStatus:async (req,res)=>{
      try {
        let {rowId,status}=req.body;

          if (status){
              let userDetails = await Admin_user.findAll({
                  attributes: ['area_level1']
              });
    
              if (userDetails.length>0){
                  let count = 0;
                  let totalUsers = userDetails?.length;
                  userDetails.forEach((ele) => {
                      let countryList = JSON.parse(ele.area_level1);
                      if (countryList.some((country) => country.country_id == rowId )) {
                          count++;
                      }
                  });
    
                  if (count){
                    return res.send({
                        message: `Area not disabled, it's assoicated with  ${count} users`
                    })
                  }
              }
          }


          let payload = { status };


          let updateStatus = await Area.update(
              payload,
              { where: { id: rowId } }
          );

          if (updateStatus && updateStatus[0] >= 1) {
              return res.send({
                  status: true,
                  message: "Status updated successfully",
              });
          } else {
              return res.send({
                  status: false,
                  message: "Error updating status or no rows matched the condition",
              });
          }
      } catch (err) {
        console.log(err);
        return res.send({
            status:false,
            message:"Something went wrong"
        })
        
      }
    },

    associatedUser: async (req, res) => {
        try {
            const id = req.params?.id;
            // Find the area by ID
            const areaList = await Area.findOne({ where: { id } });

            if (!areaList) {
                return res.send({
                    status: false,
                    message: "Area not found"
                });
            }

            // Check for associated child areas
            const AssociatedParent = await Area.findAll({
                where: { parent_area_code: areaList.area_code }
            });

            if (AssociatedParent.length > 0) {
                return res.send({
                    status: false,
                    message: "Area is associated with child areas"
                });
            }






            let userDetails = await Admin_user.findAll({
                attributes: ['area_level1']
            });

            let count = 0;


            userDetails.forEach((ele) => {
                let countryList = JSON.parse(ele.area_level1);
                if (countryList.some((country) => country.country_id == id)) {
                    count++;
                }
            });
            if (count) {
                return res.send({
                    status: false,
                    message: `its not delete users ${count} associated`
                })
            }else{
                return res.send({
                    status:true,
                    message:''
                })
            }

        } catch (error) {
            console.log(error);
            return res.send({
                status: false,
                message: "Something went wrong"
            })
        }
    }
}


module.exports =areaController