const Country = require('../model/country');
const District =require('../model/district');

let countryController = {

    addCountry: async function (req, res) {
        try {
            // const name = req.body.name;
            const { areaName, areaCode, parentId}=req.body;
            if (!parentId || parentId==''){
                let areacode=await Country.findOne({
                    where:{
                      area_code:areaCode,  
                    }
                })

                if(areacode){
                    res.status(409).json({
                        status:false,
                        message:"Area code already exists"
                    })

                }else{
                    let create = await Country.create({
                        name: areaName,
                        area_code: areaCode,
                        level:1,
                        chat: 0
                    });
                    await create.save();
                    return res.status(200).json({ status: true, message: "Area created successfully!" })
                }


            }else{


                let areacode = await District.findOne({
                    where: {
                        area_code: areaCode,
                    }
                });

                if (areacode){
                    res.status(409).json({
                        status: false,
                        message: "Area code already exists"
                    })
                }else{
    
                    let countryList=await Country.findOne({
                        where:{
                            name: parentId
                        }
                    });

                    let level =1;
                    level+=countryList?.level;
    
                    let jsonData = {
                        countryid: countryList?.id,
                        district: areaName,
                        level: level,
                        area_code: areaCode,
                        flag:1
                    }
                    if (countryList?.id){
    
                        await District.create(jsonData);
                        return res.status(200).json({ status: true, message: "Area created successfully!" })
                    }else{
                        return res.status(403).json({ status:false, message: "Area code does not exits!" })
                    }
    
                    

                }

            }

           



        }
        catch (error) {
            console.error(error);
            return res.status(500).json({status: false, message: error.message});
        }

    },

    deleteCountry: async function(req, res){

        try{
            let row = req.body.row;
            let records;
            if (row.country_id){

                records = await Country.findOne({ where: { id: row.country_id }});
            }else{

                records=await District.findOne({ where: {area_code:row.district_areaCode}});
            }

            if (!records) {

                return res.status(400).json({ status: false, message: "Area data not found." })
            }

            await records.destroy();

            return res.status(200).json({status: true, message: "Area deleted successfully!"});
        } catch(error){
            console.error(error);
            return res.status(500).json({status: true, message: error.message});

        }
       

    },
    updateArea: async function (req, res) {
        try {
            const { row, payload } = req.body;

            if (!payload.parentId || payload.parentId == '') {
                const updateResult = await Country.update(
                    {
                        name: payload.areaName,
                        area_code: payload.areaCode,
                    },
                    {
                        where: {
                            id: row.country_id,
                        },
                    }
                );

                if (updateResult[0] === 0) {
                    return res.status(402).send({
                        status: false,
                        message: "No matching country record found to update.",
                    });
                }

                return res.send({
                    status: true,
                    message: "Area updated successfully",
                });
            } else {
                if(payload.parentId==payload.areaName){
                  return res.send({ status: false, message: "Same Area cannot be parent and child!" });
                }




                const countryList = await Country.findOne({
                    where: {
                        name: payload?.parentId,
                    },
                });

                if (!countryList) {
                    return res.status(402).send({
                        status: false,
                        message: "Parent country not found",
                    });
                }

                // let level = 1;
                // level += countryList.level || 0; 
              

                let updateDistrict
                if(row?.district_areaCode){

                    let jsonData = {
                        district: payload.areaName,
                        area_code: payload.areaCode,
                        countryid: countryList.id,
                    };

                    if (payload?.areaCode){
                         updateDistrict = await District.update(
                            jsonData,
                            {
                                where: {
                                    area_code: payload.areaCode,
                                },
                            }
                        );
                    }else{
    
                        updateDistrict = await District.update(
                            jsonData,
                            {
                                where: {
                                    district: row.district_name
                                },
                            }
                        );
                    }

                }else{
                    return res.send({status:true,message:"It has level1 it can't be updated"})

                }

               


                if (updateDistrict[0] === 0) {
                    return res.status(402).send({
                        status: false,
                        message: "No matching district record found to update.",
                    });
                }

                return res.send({
                    status: true,
                    message: "Area updated successfully",
                });
            }
        } catch (err) {
            console.log("Error:", err);
            return res.status(500).json({ status: false, message: err.message });
        }
    }


};

module.exports = countryController; 
