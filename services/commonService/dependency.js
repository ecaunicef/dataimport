let mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const ManageRule = require("../../model/manage_rule.js");
const { RootNodesUnavailableError } = require("redis");
const checkArchiveRules = require('../commonService/dependencyClassification')
let mappingRulesData = [];
let depdencySource='';
let dependencyTarget='';
let archiveStatusOfEachCell = []

let checkValidation = async (ruleDependency, model, obj,categoryMasterByid) => {
  try{
    // let keyData = Object.keys(obj);
    // console.log(ruleDependency,obj, "obj")
    // return
    let sourceData = [];
    let errorflag = 0;
    let temp = {};
    let ruleSource = "";
    let isDependency = false;
    let dependencyStatus = false;
    let archiveStatus = false
    // for (let u = 0; u < column_list.length; u++) {
      // let element = column_list[u];
      // let element = ruleDependency;
      // let ruleArray = element?.dependency;
      let ruleArray = ruleDependency;
      // const dependencyType = ruleDependency.dependency_type

      // if(dependencyType != undefined && dependencyType == 2){
      //   let currStatus = await checkArchiveRules(column_list, model, obj,categoryMasterByid)
      //   archiveStatusOfEachCell.push(currStatus)
      // }
  
      mappingRulesData = [];
  
      sourceData = [];

      if (ruleArray && ruleArray?.rules.length > 0){
        isDependency = true;
          let allAppliedRules = ruleArray.rules
          depdencySource = ruleArray.source
           dependencyTarget = ruleArray.target

        sourceData.push(dependencyTarget);
          for(let j=0; j<allAppliedRules.length; j++){
            let ruleId = allAppliedRules[j];
            let data = await ManageRule.findOne({ _id: ObjectId(ruleId) });
            if (data) {
                mappingRulesData.push(data);
            }
          }
          
            if(obj[dependencyTarget]!=undefined ){
    // console.log("mappingRulesData",mappingRulesData)

              // mappingRulesData?.forEach((mappedRule) => {
              for(let i=0;i<mappingRulesData.length;i++){
                let mappedRule = mappingRulesData[i]
                if(errorflag==1){
                    break ;
                }
                // mappedRule.rules?.forEach((rulesData) => {
                for(let j=0;j<mappedRule.rules.length;j++){
                  let rulesData = mappedRule.rules[j]
    

                  if(errorflag==1){
                      break ;
                  }

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
                            if (compareText == rulesData.values) {
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

                    case "Like":
                      sourceData?.forEach((depdencySource) => {
                        if (rulesData.data_type == "Text") {
                          if (categoryMasterByid[obj[depdencySource].toString()]!=undefined && categoryMasterByid[obj[depdencySource].toString()].toLowerCase().includes(rulesData.values.toLowerCase())) {
                            temp = obj;
                            dependencyStatus = true;
                          } else {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          }
                        } else {
                          errorflag = 1;
                          ruleSource = "Invalid rules applied in this field";
                        }
                      });
                      break;
                    case "Not In":
                      sourceData?.forEach((depdencySource) => {
                        if (rulesData.data_type == "Text") {
                          if (categoryMasterByid[obj[depdencySource].toString()]!=undefined && !categoryMasterByid[obj[depdencySource].toString()].includes(rulesData.values)) {
                            temp = obj;
                            dependencyStatus = true;
                          } else {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          }
                        } else {
                          errorflag = 1;
                          ruleSource = "Invalid rules applied in this  field";
                        }
                      });
                      break;
                    case "In":
                      sourceData?.forEach((depdencySource) => {
                        if (rulesData.data_type == "Text") {
                          if (categoryMasterByid[obj[depdencySource].toString()]!=undefined &&  categoryMasterByid[obj[depdencySource].toString()].includes(rulesData.values)) {
                            temp = obj;
                            dependencyStatus = true;
                          } else {
                            errorflag = 1;
                            ruleSource = depdencySource;
                          }
                        } else {
                          errorflag = 1;
                          ruleSource = "Invalid rules applied in this  field";
                        }
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
                        } else {
                          errorflag = 1;
                          ruleSource = "Invalid rules applied in this field";
                        }
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
                        } else {

                          errorflag = 1;
                          ruleSource = "Invalid rules applied on this field";
                        }

                      });
                      break;
                    case "Not Null":
                      sourceData?.forEach((depdencySource) => {
                        // let key =keyData[alphabetPosition(depdencySource)];

                        // if (rulesData.data_type == "Date") {
                        //   if (rulesData.values != '') {
                        //     errorflag = 1;
                        //     ruleSource = depdencySource;
                        //   } else {
                        //     temp = obj
                        //     dependencyStatus = true;
                        //   }
                        // } else {
                          // console.log('rulesData.values-- ',obj,  '===',obj[depdencySource])
                          // if (rulesData.values == '' && obj[depdencySource]) {
                          if (obj[depdencySource]=='' || obj[depdencySource]==null) {
                           
                            errorflag = 1;
                            ruleSource = depdencySource;
                          } else {
                            temp = obj;
                            dependencyStatus = true;
                          }
                        // }
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
                        } else {
                          errorflag = 1;
                          ruleSource = "Invalid field rules applied";
                        }
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
                        } else {
                          errorflag = 1;
                          ruleSource = "Invalid rules applied in this field";
                        }

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
                        } else {
                          errorflag = 1;
                          ruleSource = "Invalid rules applied in this field";
                        }
                      });
                      break;
                    default:
                      break;
                  }
                
                }
              }
            }
        }
    // }

    // console.log(archiveStatusOfEachCell, "archiveStatusOfEachCell Array")

    // if(archiveStatusOfEachCell.includes(true)){
    //   archiveStatus = true
    //   archiveStatusOfEachCell= []
    // }
    
    let finalData = {
      filterData: temp,
      errorFlag: errorflag,
      source: ruleSource,
      isDependency: isDependency,
      dependencyStatus:dependencyStatus,
      archiveStatus:archiveStatus
    };

    // console.log(finalData, "final Data isssss 22222")

    return finalData;

  }catch(err){
    console.log(err);
  }

};

// function alphabetPosition(text) {
//     return [... text].map(a => parseInt(a, 36) - 10).filter(a => a >= 0);
// }

module.exports = checkValidation;
