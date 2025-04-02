const classificationModel = require('../../model/category_master')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

let dependencyTarget = ''

const checkArchiveStatus = async (column_list, model,obj, categoryMasterByid) => {
    // let classificationKey = column_list?.dependency?.target
    let classificationKey = column_list?.dependency?.target
    // let targetValueFromList = obj[column_list.target+'_org']

    const particularKeyClassification = await classificationModel.aggregate([
        {
          $match: {
            "key": classificationKey,
            // "list_name.en":targetValueFromList,
            "associate": { $ne: [] }
          }
        },
        {
            $unwind:"$associate"
        },
        {
            "$lookup": {
              "from": 'category_master',
              "let": { 'classificationId': { "$toObjectId": "$associate.classificationId" } },
              "pipeline": [ {
                "$match": { "$expr": { "$eq": ['$_id', '$$classificationId'] } }
              } ],
              "as":"associate_details"
            }
        },
       

      ]);

    let dependencyStatusorg = false;
    for (let i = 0; i < particularKeyClassification.length; i++) {
        
        for (j = 0; j < particularKeyClassification[i].associate_details.length; j++) {
            associated_find = true;
            let associated_list_name = particularKeyClassification[i].associate_details[j].list_name.en
            let newobj = {
                'associated_name':associated_list_name,
                'column_list' :column_list,
            }

            // console.log(newobj, '11111')

             dependencyStatusorg = await checkForRule(newobj,model, obj, categoryMasterByid);
            //  console.log(dependencyStatusorg, "dependencyStatusorg")


             
        }

        if(dependencyStatusorg==true){
            break;
        }
    }
    
    return dependencyStatusorg;

}





async function checkForRule(newobj, model, obj, categoryMasterByid){

    let sourceData = [];
    let errorflag = 0;
    let temp = {};
    let ruleSource = "";
    let isDependency = false;
    let dependencyStatus = false;
    // for (let u = 0; u < column_list.length; u++) {
      // let element = column_list[u];
      let element = newobj.column_list;
      let ruleArray = element?.dependency;
      let associated_name = newobj.associated_name
      
  
      mappingRulesData = [];
  
      sourceData = [];
      if (ruleArray && ruleArray?.rules.length > 0){
        isDependency = true;
          let allAppliedRules = ruleArray.rules
        //   depdencySource = ruleArray.source
           dependencyTarget = element.target //ruleArray.target //compairing with main input  value getting in import file

        sourceData.push(dependencyTarget);
          for(let j=0; j<allAppliedRules.length; j++){
            let ruleId = allAppliedRules[j];
            let data = await ManageRule.findOne({ _id: ObjectId(ruleId) });
            if (data) {
                mappingRulesData.push(data);
            }
          }
          
            if(obj[dependencyTarget]!=undefined ){
              mappingRulesData?.forEach((rulesData) => {
                switch (rulesData.operator) {
                  case "=":
                    sourceData?.forEach((depdencySource) => {
                      if (rulesData.data_type == "Date") {
                        let sheetDate = new Date(obj[depdencySource]);
                        if (rulesData.values == "system_date") {
                          let dbDate = new Date();
                          if (sheetDate == dbDate) {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          }
                        } else {
                          let dbDate = new Date(rulesData.values);
                          if (sheetDate == dbDate) {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          }
                        }
                      } else {
                        let compareText = obj[depdencySource]

                        if (categoryMasterByid[obj[depdencySource]] != undefined) {
                          compareText = categoryMasterByid[obj[depdencySource]];
                        }

                        if (rulesData.data_type == "Number") {
                          if (!isNaN(Number(compareText))) {
                            compareText = Number(compareText);
                            if (compareText == rulesData.values) {
                              temp = obj;
                              dependencyStatus = true;
                            } else {
                              errorflag = 1;
                              ruleSource = depdencySource;
                            }

                          } else {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          }
                        } else {
                            // console.log(compareText ,associated_name, "compareText == associated_name")
                          if (compareText == associated_name) {
                            temp = obj;
                            dependencyStatus = true;
                            // console.log(dependencyStatus, "dependencyStatus     dependencyStatus")
                          } else {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          }
                        }
                      }
                    });
                    break;

                  case "Like":
                    sourceData?.forEach((depdencySource) => {
                      if (rulesData.data_type == "Text") {
                        if (categoryMasterByid[obj[depdencySource].toString()].toLowerCase().includes(rulesData.values.toLowerCase())) {
                          temp = obj;
                          dependencyStatus = true;
                        } else {
                          errorflag = 1;
                          ruleSource = depdencySource;
                        }
                      } 
                      // else {
                      //   errorflag = 1;
                      //   ruleSource = "Invalid rules applied in this field";
                      // }
                    });
                    break;
                  case "Not In":
                    sourceData?.forEach((depdencySource) => {
                      if (rulesData.data_type == "Text") {
                        console.log(obj[depdencySource], rulesData.values, "(obj[depdencySource] != rulesData.values")
                        if (!categoryMasterByid[obj[depdencySource].toString()].toLowerCase().includes(rulesData.values.toLowerCase())) {
                          temp = obj;
                          dependencyStatus = true;
                        } else {
                          errorflag = 1;
                          ruleSource = depdencySource;
                        }
                      } 
                      // else {
                      //   errorflag = 1;
                      //   ruleSource = "Invalid rules applied in this  field";
                      // }
                    });
                    break;
                  case "In":
                    sourceData?.forEach((depdencySource) => {
                      if (rulesData.data_type == "Text") {
                        if (categoryMasterByid[obj[depdencySource].toString()].toLowerCase().includes(rulesData.values.toLowerCase())) {
                          temp = obj;
                          dependencyStatus = true;
                        } else {
                          errorflag = 1;
                          ruleSource = depdencySource;
                        }
                      }
                      //  else {
                      //   errorflag = 1;
                      //   ruleSource = "Invalid rules applied in this  field";
                      // }
                    });
                    break;
                  case "Unique":
                    sourceData?.forEach(async (depdencySource) => {
                      let uniqueData = obj[depdencySource];
                      if (rulesData.data_type == "Number") {

                        if (!isNaN(Number(obj[depdencySource]))) {
                          let query = await model.find({ [depdencySource]: Number(uniqueData) });
                          if (query.length == 0) {
                            temp = obj;
                            dependencyStatus = true;
                          } else {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          }
                        } else {
                          errorflag = 1;
                          ruleSource = depdencySource;
                        }
                      } else if (rulesData.data_type == "Date") {
                        uniqueData = new Date(uniqueData);
                        let query = await model.find({ [depdencySource]: uniqueData });
                        if (query.length == 0) {
                          temp = obj;
                          dependencyStatus = true;
                        } else {
                          errorflag = 1;
                          ruleSource = depdencySource;
                        }
                      } else {
                        let query = await model.find({ [depdencySource]: uniqueData });
                        if (query.length == 0) {
                          temp = obj;
                          dependencyStatus = true;
                        } else {
                          errorflag = 1;
                          ruleSource = depdencySource;
                        }
                      }
                    });
                    break;
                  case "!=":
                    sourceData?.forEach((depdencySource) => {
                      if (rulesData.data_type == "Number") {
                        if (!isNaN(obj[depdencySource]) && Number(obj[depdencySource]) != rulesData.values) {
                          temp = obj;
                          dependencyStatus = true;
                        } else {
                          errorflag = 1;
                          ruleSource = depdencySource;
                        }
                      } else if (rulesData.data_type == "Text") {
                        if (obj[depdencySource] != rulesData.values) {
                          temp = obj;
                          dependencyStatus = true;
                        } else {
                          errorflag = 1;
                          ruleSource = depdencySource;
                        }
                      }
                      //  else {
                      //   errorflag = 1;
                      //   ruleSource = "Invalid rules applied in this field";
                      // }
                    });
                    break;
                  case ">":
                    sourceData?.forEach((depdencySource) => {
                      if (rulesData.data_type == "Date") {
                        let sheetDate = new Date(obj[depdencySource]);
                        if (rulesData.values == "system_date") {
                          let dbDate = new Date();
                          // console.log(sheetDate, "sheetData", dbDate, "dbDate", obj[depdencySource]);
                          if (sheetDate < dbDate) {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          } else {
                            temp = obj;
                            dependencyStatus = true;
                          }
                        } else {
                          let dbDate = new Date(rulesData.values);

                          if (sheetDate < dbDate) {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          } else {
                            temp = obj;
                            dependencyStatus = true;
                          }
                        }

                      } else {

                        if (rulesData.data_type == "Number") {
                          if (!isNaN(Number(obj[depdencySource])) && Number(obj[depdencySource]) > Number(rulesData.values)) {
                            temp = obj;
                            dependencyStatus = true;
                          } else {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          }
                        } else {

                          if (obj[depdencySource] > rulesData.values) {
                            temp = obj;
                            dependencyStatus = true;
                          } else {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          }
                        }
                      }
                    });
                    break;
                  case "<":
                    sourceData?.forEach((depdencySource) => {
                      if (rulesData.data_type == "Date") {
                        let sheetDate = new Date(obj[depdencySource]);
                        if (rulesData.values == "system_date") {
                          let dbDate = new Date();
                          if (sheetDate > dbDate) {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          } else {
                            temp = obj;
                            dependencyStatus = true;
                          }

                        } else {
                          let dbDate = new Date(rulesData.values);

                          if (sheetDate > dbDate) {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          } else {
                            temp = obj;
                            dependencyStatus = true;
                          }
                        }
                      } else if (rulesData.data_type == "Number") {
                        if (!isNaN(Number(obj[depdencySource])) && Number(obj[depdencySource]) < Number(rulesData.values)) {
                          temp = obj;
                          dependencyStatus = true;
                        } else {
                          errorflag = 1;
                          ruleSource = depdencySource;
                        }
                      } 
                      // else {

                      //   errorflag = 1;
                      //   ruleSource = "Invalid rules applied on this field";
                      // }

                    });
                    break;
                  case "Not Null":
                    sourceData?.forEach((depdencySource) => {
                      // let key =keyData[alphabetPosition(depdencySource)];

                      if (rulesData.data_type == "Date") {
                        if (rulesData.values != '') {
                          errorflag = 1;
                          ruleSource = depdencySource;
                        } else {
                          temp = obj
                          dependencyStatus = true;
                        }
                      } else {
                        if (rulesData.values == '' && obj[depdencySource]) {
                          temp = obj;
                          dependencyStatus = true;
                        } else {
                          errorflag = 1;
                          ruleSource = depdencySource;
                        }
                      }
                    });
                    break;
                  case "Between":
                    sourceData?.forEach((depdencySource) => {
                      // let key =keyData[alphabetPosition(depdencySource)];
                      if (rulesData.data_type == "Date") {
                        const fromtoValues = JSON.parse(rulesData.values)
                        if (fromtoValues.from == "system_date") {
                          // console.log("inside system_date");
                          const fromDate = new Date();
                          const toDate = new Date(fromtoValues.to);
                          if (!(new Date(obj[depdencySource]) < toDate && new Date(obj[depdencySource]) > fromDate)) {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          } else {
                            temp = obj;
                            dependencyStatus = true;
                          }

                        } else {
                          const fromDate = new Date(fromtoValues.from)
                          const toDate = new Date(fromtoValues.to)
                          if (!(new Date(obj[depdencySource]) < toDate && new Date(obj[depdencySource]) > fromDate)) {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          } else {
                            temp = obj
                            dependencyStatus = true;
                          }
                        }
                      } else if (rulesData.data_type == "Number") {
                        if (!isNaN(Number(obj[depdencySource])) && (Number(obj[depdencySource]) < data.to && Number(obj[depdencySource]) > data.from)) {
                          temp = obj;
                          dependencyStatus = true;
                        } else {
                          errorflag = 1;
                          ruleSource = depdencySource;
                        }
                      }
                      //  else {
                      //   errorflag = 1;
                      //   ruleSource = "Invalid field rules applied";
                      // }
                    });
                    break;
                  case "<=":
                    sourceData?.forEach((depdencySource) => {
                      if (rulesData.data_type == "Date") {
                        let sheetDate = new Date(obj[depdencySource]);
                        if (rulesData.values == "system_date") {
                          let dbDate = new Date();
                          if (sheetDate > dbDate) {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          } else {
                            temp = obj;
                            dependencyStatus = true;
                          }
                        } else {

                          let dbDate = new Date(rulesData.values);
                          if (sheetDate > dbDate) {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          } else {
                            temp = obj;
                            dependencyStatus = true;
                          }
                        }
                      } else if (rulesData.data_type == "Number") {
                        if (!isNaN(Number(obj[depdencySource])) && Number(obj[depdencySource]) <= Number(rulesData.values)) {
                          temp = obj;
                          dependencyStatus = true;
                        } else {
                          errorflag = 1;
                          ruleSource = depdencySource;
                        }
                      }
                      //  else {
                      //   errorflag = 1;
                      //   ruleSource = "Invalid rules applied in this field";
                      // }

                    });
                    break;
                  case ">=":
                    sourceData?.forEach((depdencySource) => {
                      if (rulesData.data_type == "Date") {
                        let sheetDate = new Date(obj[depdencySource]);
                        if (rulesData.values == "system_date") {
                          let dbDate = new Date();
                          if (sheetDate < dbDate) {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          } else {
                            temp = obj;
                            dependencyStatus = true;
                          }
                        } else {

                          let dbDate = new Date(rulesData.values);

                          if (sheetDate < dbDate) {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          } else {
                            temp = obj;
                            dependencyStatus = true;
                          }
                        }
                      } else if (rulesData.data_type == "Number") {
                        if (!isNaN(Number(obj[depdencySource])) && Number(obj[depdencySource]) >= Number(rulesData.values)) {
                          temp = obj;
                          dependencyStatus = true;
                        } else {
                          errorflag = 1;
                          ruleSource = depdencySource;
                        }
                      } 
                      // else {
                      //   errorflag = 1;
                      //   ruleSource = "Invalid rules applied in this field";
                      // }
                    });
                    break;
                  default:
                    break;
                }
               
              });
            }
        }
        return dependencyStatus;
}




module.exports = checkArchiveStatus