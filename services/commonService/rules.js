let mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const ManageRule = require("../../model/manage_rule.js");
const { RootNodesUnavailableError } = require("redis");
let mappingRulesData = [];
let checkDependencyRules = require("./dependency.js")

let checkValidation = async (mapping_data, model, obj,categoryMasterByid) => {

  // console.log( "mapping_data----- ",mapping_data);
  // return
  try{
    // let keyData = Object.keys(obj);
    let sourceData = [];
    let errorflag = 0;
    let temp = {};
    let ruleSource = "";
    let isRule = false;
    let rulesExist=false;
    let archive = false

    let allRules = []


    for (let u = 0; u < mapping_data.length; u++) {
      let element = mapping_data[u];
      
      if(element.rules!=undefined && element.rules.length>0){
        rulesExist=true;
      }
    }
    if(rulesExist){
      let tempAllRules =  await ManageRule.find();
      tempAllRules.forEach((ele)=>{
        allRules[ele._id] = ele;
      })
    }else{
      let finalData = {
        filterData: obj,
        errorFlag: errorflag,
        source: ruleSource,
        isRule: isRule,
      };
      
      return finalData;
    }
  //  console.log("allRules-----",allRules);


    for (let u = 0; u < mapping_data.length; u++) {
      let element = mapping_data[u];
      let ruleArray = element?.rules;
      // let ruleDependency = element?.dependency
      let checkRule = 0;

      mappingRulesData = [];
  
      sourceData = [];


      // console.log('element-- ',element)

      let dependencyTarget;
      // console.log('ruleArray-- ',ruleArray)

      // if(checkRule == 0){
        if (ruleArray && ruleArray.length > 0) {

          isRule = true;
          // dependencyTarget = ruleDependency.target
          sourceData.push(element.target);
          for (let i = 0; i < ruleArray.length; i++) {
            
            let ruleId = ruleArray[i].rule;

            // let data = await ManageRule.findOne({ _id: ObjectId(ruleId) });

            let data = (allRules[ruleId]==undefined)?{}:allRules[ruleId];
            if (data) {
              mappingRulesData.push({
                'rule':data,
                'dependency':ruleArray[i].dependency
              });
            }
          }
        }
        // mappingRulesData?.forEach(async (mappedRule) => {
        for(let r=0;r<mappingRulesData.length;r++) {
            mappedRule = mappingRulesData[r]
          // console.log('mappedRule-- ',mappedRule)
          let rulesData = mappedRule?.rule;
          
          let ruleDependency = mappedRule?.dependency
          dependencyTarget = ruleDependency?.target
          //dependency will check here-start

          let dependencyExists=false, dependencyStatus = false;
          let ruleValueIs;
          // console.log( "obj 22222");

          // if(checkRule==1){
          //   break;
          // }
          if(ruleDependency.rules!=undefined && ruleDependency.rules.length>0){
            let checkEnterPriseDependencyRules = await checkDependencyRules(ruleDependency, model, obj,categoryMasterByid);
            // console.log( "obj 3333");
            // console.log("checkEnterP riseDependencyRules---- ",checkEnterPriseDependencyRules)

            // archive = checkEnterPriseDependencyRules.archiveStatus == true ? true : false

            if (checkEnterPriseDependencyRules && checkEnterPriseDependencyRules.isDependency == true) {
              dependencyExists = checkEnterPriseDependencyRules.isDependency;
              dependencyStatus = checkEnterPriseDependencyRules.dependencyStatus;
              
              ruleSource = checkEnterPriseDependencyRules.source;
              errorflag = checkEnterPriseDependencyRules.errorFlag;
              isRule = dependencyExists;
              
              

              // if (checkEnterPriseDependencyRules.errorFlag == 0) {
              //   obj = checkEnterPriseDependencyRules.filterData;
                
              // } 
            }
            

            if(dependencyExists==true) {
            
              if(dependencyStatus){
                checkRule = 0;
              }
              else if(!dependencyStatus){
              // console.log("dependency obj--- ",checkEnterPriseDependencyRules);
                temp = obj;
                checkRule = 1;
                // ruleSource = '';
                // errorflag = 0;
                // isRule = false;
                ruleArray = [];
              }

              // console.log('isRule-- ',isRule,errorflag)
            }
            //dependency will check here-end
          }


          // console.log("checkRulecheckRule---",checkRule);

          //check rule if dependency rule returns 0
          if(checkRule == 0){

          // console.log("rulesData---",rulesData);
            for(let rd=0;rd<rulesData.rules.length;rd++) {
              let rulesDataDetail = rulesData.rules[rd];
            //  console.log("rulesDataDetail--->>  ",errorflag,'   <-----------',rulesDataDetail);

              if(errorflag==1){
                break;
              }
              // console.log("errorflag---",errorflag);
              
              switch (rulesDataDetail?.operator) {
                case "=":
                  sourceData?.forEach((source) => {
                    if (rulesDataDetail.data_type == "Date") {
                      let sheetDate = new Date(obj[source]);
                      if(rulesDataDetail.value =="system_date"){
                        let dbDate = new Date();
                        if (sheetDate == dbDate) {
                          errorflag = 1;
                          ruleSource = source;
                        }else{
                          temp = obj;
                        }
                      }
                      else if(rulesDataDetail.value =="dependency_column"){
                        // console.log("==============")
                        let sheetDate = new Date(obj[source]);
                        let dependencyTargetValue = new Date(obj[dependencyTarget]);

                        if (sheetDate.getTime() !== dependencyTargetValue.getTime()) {
                          errorflag = 1;
                          ruleSource = source;
                        }else{
                          temp = obj;
                        }
                      }                
                      else{
                        let dbDate = new Date(rulesDataDetail.value);  
                        if (sheetDate == dbDate) {
                          errorflag = 1;
                          ruleSource = source;
                        }else{
                          temp = obj;
                        }
                      }
                    } else {
                      let compareText = obj[source]
                      if(categoryMasterByid[obj[source]]!=undefined){
                        compareText = categoryMasterByid[obj[source]];
                      }

                      if(rulesDataDetail.data_type=="Number")
                      {
                        if(!isNaN(Number(compareText))){
                          compareText =Number(compareText);
                          if (compareText == rulesDataDetail.value) {
                            temp = obj;
                          } else {
                            errorflag = 1;
                            ruleSource = source;
                          }

                        }else{
                          errorflag = 1;
                          ruleSource = source;
                        }
                      }else{
                        if (compareText == rulesDataDetail.value) {
                          temp = obj;
                        } else {
                          errorflag = 1;
                          ruleSource = source;
                        }
                      }
                    }
                  });
                  break;
                case "Like":
                  sourceData?.forEach((source) => {
                    let compareText = obj[source]
                    if (categoryMasterByid[obj[source]] != undefined) {
                      compareText = categoryMasterByid[obj[source]];
                    }
                    if (rulesDataDetail.data_type == "Text"){
                      if (compareText.toLowerCase().includes(rulesDataDetail.value.toLowerCase())) {
                        temp = obj;
                      } else {
                        errorflag = 1;
                        ruleSource = source;
                      }
                    }else{
                      errorflag = 1;
                      ruleSource = "Invalid rules applied in this field";
                    }
                  });
                  break;
                case "Not In":

                // console.log('sourceData--- ',sourceData);

                  sourceData?.forEach((source) => {
                    let compareText = obj[source]
                    // if (categoryMasterByid[obj[source]] != undefined) {
                    //   compareText = categoryMasterByid[obj[source]];
                    // }
                    if (rulesDataDetail.data_type == "Text") {
                      if (!compareText.toString().includes(rulesDataDetail.value)) {
                        // if (!compareText.toLowerCase().includes(rulesDataDetail.value.toLowerCase())) {
                        temp = obj;
                      } else {
                        errorflag = 1;
                        ruleSource = source;
                      }
                    } else {
                      errorflag = 1;
                      ruleSource = "Invalid rules applied in this  field";
                    }
                  });
                  break;
                  case "In":
                  sourceData?.forEach((source) => {
                    let compareText = obj[source]
                    // if (categoryMasterByid[obj[source]] != undefined) {
                    //   compareText = categoryMasterByid[obj[source]];
                    // }
                    if (rulesDataDetail.data_type == "Text") {
                      if (compareText.toLowerCase().includes(rulesDataDetail.value.toLowerCase())) {
                        temp = obj;
                      } else {
                        errorflag = 1;
                        ruleSource = source;
                      }
                    } else {
                      errorflag = 1;
                      ruleSource = "Invalid rules applied in this  field";
                    }
                  });
                  break;
                case "Unique":
                  sourceData?.forEach(async (source) => {
                    let uniqueData = obj[source];
                    if(rulesDataDetail.data_type=="Number"){
                      if(!isNaN(Number(obj[source]))){
                        let query = await model.find({ [source]: Number(uniqueData) });
                        if (query.length == 0) {
                          temp = obj;
                        } else {
                          errorflag = 1;
                          ruleSource = source;
                        }
                      }else{
                        errorflag = 1;
                        ruleSource = source;
                      }
                    } else if (rulesDataDetail.data_type == "Date"){
                      uniqueData = new Date(uniqueData);
                      let query = await model.find({ [source]: uniqueData });
                      if (query.length == 0) {
                        temp = obj;
                      } else {
                        errorflag = 1;
                        ruleSource = source;
                      }
                    }
                    else if(rulesDataDetail.value =="dependency_column"){
                      console.log("Uniqueeeeee")
                      let sheetDate = new Date(obj[source]);
                      let query = await model.find({ [source]: sheetDate });
                      if (query.length > 0) {
                        errorflag = 1;
                        ruleSource = source;
                      }
                      else{
                        temp = obj;
                      }
                    }
                    else{
                      let query = await model.find({ [source]: uniqueData });
                      if (query.length == 0) {
                        temp = obj;
                      } else {
                        errorflag = 1;
                        ruleSource = source;
                      }
                    }
                  });
                  break;
                case "!=":
                  sourceData?.forEach((source) => {
                    let compareText = obj[source]
                    if (categoryMasterByid[obj[source]] != undefined) {
                      compareText = categoryMasterByid[obj[source]];
                    }
                    if(rulesDataDetail.data_type=="Number"){
                      if (!isNaN(compareText) && Number(compareText) != rulesDataDetail.value) {
                          temp = obj;
                        } else {
                          errorflag = 1;
                          ruleSource = source;
                        }
                    } else if (rulesDataDetail.data_type=="Text"){
                      if (compareText != rulesDataDetail.value) {
                        temp = obj;
                      } else {
                        errorflag = 1;
                        ruleSource = source;
                      }
                    }else{
                      errorflag = 1;
                      ruleSource = "Invalid rules applied in this field";
                    }
                  });
                  break;
                case ">":
                  sourceData?.forEach((source) => {
                    let compareText = obj[source]
                    if (categoryMasterByid[obj[source]] != undefined) {
                      compareText = categoryMasterByid[obj[source]];
                    }
                    if (rulesDataDetail.data_type == "Date") {
                      let sheetDate = new Date(compareText);
                      if(rulesDataDetail.value=="dependency_column"){
                        let dbDate=new Date();
                        if (sheetDate < dbDate) {
                          errorflag = 1;
                          ruleSource = source;
                        } else {
                          temp = obj;
                        }
                      }
                      else if(rulesDataDetail.value =="dependency"){
                        console.log(">>>>>>>>>>>>>>>>>", source, dependencyTarget);

                        let sheetDate = new Date(obj[source]);
                        let dependencyTargetValue = new Date(obj[dependencyTarget]);
                        
                        if (!(sheetDate.getTime() > dependencyTargetValue.getTime())) {
                            errorflag = 1;
                            ruleSource = source;
                        }else{
                          temp = obj;
                        }                    
                      }
                      else{
                        let dbDate = new Date(rulesDataDetail.value);
          
                        if (sheetDate < dbDate) {
                          errorflag = 1;
                          ruleSource = source;
                        }else{
                            temp = obj;
                        }
                      }
        
                    } else {
        
                      if(rulesDataDetail.data_type=="Number"){
                        if (!isNaN(Number(compareText)) && Number(compareText) > Number(rulesDataDetail.value)){
                          temp = obj;
                        }else{
                          errorflag = 1;
                          ruleSource = source;
                        }
                      }else{
        
                        if (compareText> rulesDataDetail.value) {
                          temp = obj;
                        } else {
                          errorflag = 1;
                          ruleSource = source;
                        }
                      }
                    }
                  });
                  break;
                case "<":
                  sourceData?.forEach((source) => {
                    let compareText = obj[source]
                    if (categoryMasterByid[obj[source]] != undefined) {
                      compareText = categoryMasterByid[obj[source]];
                    }
                    if (rulesDataDetail.data_type == "Date") {
                      let sheetDate = new Date(compareText);
                      if(rulesDataDetail.value=="system_date"){
                        let dbDate=new Date();
                        if(sheetDate>dbDate){
                          errorflag = 1;
                          ruleSource = source;
                        }else{
                          temp=obj;
                        }

                      }
                      else if(rulesDataDetail.value =="dependency_column"){
                        console.log("<<<<<<<<<<<<<<<<<<<")
                        let sheetDate = new Date(obj[source]);
                        let dependencyTargetValue = new Date(obj[dependencyTarget]);

                        if (!(sheetDate.getTime() < dependencyTargetValue.getTime())) {
                          errorflag = 1;
                          ruleSource = source;
                        }else{
                          temp = obj;
                        }
                      }
                      else{
                        let dbDate = new Date(rulesDataDetail.value);
          
                        if (sheetDate > dbDate) {
                          errorflag = 1;
                          ruleSource = source;
                        }else{
                            temp = obj;
                        }
                      }
                    } else if (rulesDataDetail.data_type == "Number") {
                      if (!isNaN(Number(compareText)) && Number(compareText) < Number(rulesDataDetail.value)){
                        temp = obj;
                      }else{
                        errorflag = 1;
                        ruleSource = source;
                      }
                    }else{

                      errorflag = 1;
                      ruleSource = "Invalid rules applied on this field";
                    }
                    
                  });
                  break;
                case "Not Null":
                  // console.log("Not Null---",rulesDataDetail.data_type,sourceData);
                  // sourceData?.forEach((source) => {
                    // let key =keyData[alphabetPosition(source)];
                    if (rulesDataDetail.data_type == "Date") {

                      sourceData?.forEach((source) => {
                        let compareText = obj[source]

                        if(compareText =='' || compareText =='NULL' ) {
                            errorflag = 1;
                            ruleSource = source;
                        }else{
                            temp= obj
                        }
                      })
                    }
                    else if(rulesDataDetail.value =="dependency_column"){
                      let sheetDate = new Date(obj[source]);
                      let dependencyTargetValue = new Date(obj[dependencyTarget]);

                      if (sheetDate.getTime() == '') {
                        errorflag = 1;
                        ruleSource = source;
                      }else{
                        temp = obj;
                      }
                    }
                    else{
                      sourceData?.forEach((source) => {
                        let compareText = obj[source]

                        if (compareText != '' && obj[source]) {
                          temp = obj;
                        } else {

                          errorflag = 1;
                          ruleSource = source;
                        }
                      })
                    }


                  // });
                  break;
                case "Between":
                
                  sourceData?.forEach((source) => {
                    // let key =keyData[alphabetPosition(source)];
                    let compareText = obj[source]
                    if (categoryMasterByid[obj[source]] != undefined) {
                      compareText = categoryMasterByid[obj[source]];
                    }
                    if (rulesDataDetail.data_type == "Date") {
                      const fromtoValues = JSON.parse(rulesDataDetail.value)
                      if (fromtoValues.from == "system_date")
                      {
                        
                        const fromDate = new Date();
                        const toDate = new Date(fromtoValues.to);
                        if (!(new Date(compareText) < toDate && new Date(compareText) > fromDate))
                        {
                          errorflag = 1;
                          ruleSource = source;
                        }else{
                          temp=obj;
                        }
                      }
                      else if(fromtoValues.from == "dependency_column"){
                        const fromDate = new Date();
                        const toDate = new Date(fromtoValues.to);
                        if ((new Date(compareText) < toDate && new Date(compareText) > fromDate))
                        {
                          errorflag = 1;
                          ruleSource = source;
                        }
                      }
                      else{
                        const fromDate = new Date(fromtoValues.from)
                        const toDate = new Date(fromtoValues.to)
                        if (!(new Date(compareText) < toDate && new Date(compareText) > fromDate)){
                            errorflag = 1;
                            ruleSource = source;
                        }else{
                            temp = obj
                        }
                      }
                    }else if (rulesDataDetail.data_type == "Number"){
                      if (!isNaN(Number(compareText)) && (Number(compareText) < data.to && Number(compareText) > data.from)) {
                        temp = obj;
                      } else {
                        errorflag = 1;
                        ruleSource = source;
                      }
                    }else{
                      errorflag = 1;
                      ruleSource ="Invalid field rules applied";
                    }
                  });
                  break;
                case "<=":
                  sourceData?.forEach((source) => {
                    let compareText = obj[source]
                    if (categoryMasterByid[obj[source]] != undefined) {
                      compareText = categoryMasterByid[obj[source]];
                    }
                    if (rulesDataDetail.data_type == "Date") {
                      let sheetDate = new Date(compareText);
                      if(rulesDataDetail.value=="system_date"){
                        let dbDate=new Date();
                        if(sheetDate>dbDate){
                          errorflag = 1;
                          ruleSource = source;
                        }else{
                          temp=obj;
                        }
                      }else{

                        let dbDate = new Date(rulesDataDetail.value);
                        if (sheetDate > dbDate) {
                          errorflag = 1;
                          ruleSource = source;
                        } else {
                          temp = obj;
                        }
                      }
                    } else if (rulesDataDetail.data_type == "Number") {
                      if (!isNaN(Number(compareText)) && Number(compareText) <= Number(rulesDataDetail.value)) {
                          temp = obj;
                        } else {
                          errorflag = 1;
                          ruleSource = source;
                        }
                    }else{
                      errorflag = 1;
                      ruleSource = "Invalid rules applied in this field";
                    }

                  });
                  break;
                case ">=":
                  sourceData?.forEach((source) => {
                    let compareText = obj[source]
                    if (categoryMasterByid[obj[source]] != undefined) {
                      compareText = categoryMasterByid[obj[source]];
                    }
                    if (rulesDataDetail.data_type == "Date") {
                      let sheetDate = new Date(compareText);
                      if(rulesDataDetail.value=="system_date"){
                        let dbDate=new Date();
                        if(sheetDate<dbDate){
                          errorflag = 1;
                          ruleSource = source;
                        }else{
                          temp=obj;
                        }
                      }else{

                        let dbDate = new Date(rulesDataDetail.value);
        
                        if (sheetDate < dbDate) {
                          errorflag = 1;
                          ruleSource = source;
                        } else {
                          temp = obj;
                        }
                      }
                    } else if (rulesDataDetail.data_type == "Number") {
                      if (!isNaN(Number(compareText)) && Number(compareText) >= Number(rulesDataDetail.value)) {
                          temp = obj;
                        } else {
                          errorflag = 1;
                          ruleSource = source;
                        }
                    }else{
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
      // }
    }

    // console.log("errorflag",errorflag)

    let finalData = {
      filterData: temp,
      errorFlag: errorflag,
      source: ruleSource,
      isRule: isRule,
      archiveStatus:archive
    };
    return finalData;

  }catch(err){
    console.log(err);
  }

};

// function alphabetPosition(text) {
//     return [... text].map(a => parseInt(a, 36) - 10).filter(a => a >= 0);
// }

module.exports = checkValidation;
