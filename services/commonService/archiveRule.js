let mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const ManageRule = require("../../model/manage_rule.js");
const { RootNodesUnavailableError } = require("redis");
let mappingRulesData = [];
let checkDependencyRules = require("./dependency.js")

let checkValidation = async (mapping_data, model, obj,categoryMasterByid,categoryAssociateData) => {
// console.log("🚀 ~  file: archiveRule.js:9 ~  mapping_data:", JSON.stringify(mapping_data));
// console.log("🚀 ~  file: archiveRule.js:9 ~  categoryMasterByid:", categoryMasterByid);
// console.log("🚀 ~  file: archiveRule.js:9 ~  obj:", obj);

  // console.log( "mapping_data----- ",mapping_data);
  // return
  try{
    // let keyData = Object.keys(obj);
    let sourceData = [];
    let errorflag = 0;
    let flagAnyConditionTrue = 0;
    let temp = {};
    let ruleSource = "";
    let isRule = false;
    let rulesExist=false;
    let archive = false

    let allRules = []


    for (let u = 0; u < mapping_data.length; u++) {
      let element = mapping_data[u];
      
      if(element.archive_rules!=undefined && element.archive_rules.length>0){
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
        archiveStatus:flagAnyConditionTrue,
        status:1
      };
      
      return finalData;
    }
   
    for (let u = 0; u < mapping_data.length; u++) {
      let element = mapping_data[u];
      let ruleArray = element?.archive_rules;
      // let ruleDependency = element?.dependency
      let checkRule = 0;

      // console.log('element--- ',element);
      // console.log('ruleArray--- ',ruleArray);

      mappingRulesData = [];
  
      sourceData = [];
      // if(errorflag==1){
      //   break;
      // }

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
              
              

              if (checkEnterPriseDependencyRules.errorFlag == 0) {
                obj = checkEnterPriseDependencyRules.filterData;
                
              } 
            }
            

            if(dependencyExists==true) {
            
              if(dependencyStatus){
                checkRule = 0;
              }
              else if(!dependencyStatus){
              // console.log("dependency--- ",dependencyStatus);
                
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
            //  console.log("rulesDataDetail---",rulesDataDetail);

              // if(errorflag==1){
              //   break;
              // }
              
              // console.log("rulesDataDetail-operator---",rulesDataDetail);
              
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
                  sourceData?.forEach((source) => {
                    let compareText = obj[source]
                    
                    // if (categoryMasterByid[obj[source]] != undefined) {
                    //   compareText = categoryMasterByid[obj[source]];
                    // }
                    if (rulesDataDetail.data_type == "Text") {

                      let existDataFlag = 0;
                      // console.log('check data match  -- ',categoryAssociateData[obj[source]]['key'],"==",rulesDataDetail.classification_type);
                      let ruleClassificationList = JSON.parse(rulesDataDetail.value);


                      if(categoryAssociateData[obj[source]]['key']==rulesDataDetail.classification_type){
                        // console.log('check data match  -- ',compareText.toString().toLowerCase().includes(rulesDataDetail.value.toLowerCase()));
                        // if (compareText.toString().toLowerCase().includes(rulesDataDetail.value.toLowerCase())) {
                        if (ruleClassificationList.indexOf(compareText.toString())!=-1) {

                          temp = obj;
                          existDataFlag = 1;
                        } else {
                          errorflag = 1;
                          ruleSource = source;
                        }
                      }else{  

                       
                          if(categoryAssociateData[compareText] != undefined 
                            && categoryAssociateData[compareText].associate != undefined
                            && categoryAssociateData[compareText].associate.length > 0
                          ){
                            let associateDataTocheck = [];
                            

                            //setting array of associated classification of import row value 
                            for(let b_count=0; b_count< categoryAssociateData[compareText].associate.length; b_count++) {
                              associateDataTocheck.push(categoryAssociateData[compareText]['associate'][b_count].classificationId);
                            }

                         
                            //checking  selected rule classifications are existing in row associated classifications
                            for(let a_count=0; a_count<ruleClassificationList.length; a_count++) {
                              let ruleClassificationId = ruleClassificationList[a_count];
                             
                              
                              if(associateDataTocheck.indexOf(ruleClassificationId) > -1) {
                                temp = obj;
                                existDataFlag = 1; 
                                break;
                              }
                              
                            }
                            
                                                       
                          }

                      }
                      
                      if(existDataFlag==1){// this will check the condition for main error to return
                        errorflag = 1;
                        ruleSource = source;
                      }

                      // console.log('existDataFlag---- ',existDataFlag);
                    } else {
                      errorflag = 1;
                      ruleSource = "Invalid rules applied in this  field";
                    }
                  });
                  break;
                case "In":

                  sourceData?.forEach((source) => {
                    let compareText = obj[source]

                  // console.log(categoryAssociateData[obj[source]]['key'],'objobjobjobjobjobjobjobj');
                  // console.log('rulesDataDetail---- >> ',rulesDataDetail);
                  // console.log('compareText---- >> ',compareText);

                    
                    // if (categoryMasterByid[obj[source]] != undefined) {
                    //   compareText = categoryMasterByid[obj[source]];
                    // }
                    if (rulesDataDetail.data_type == "Text") {

                      let existDataFlag = 0;
                      // console.log('check data match   -- ','   >>>>> ',categoryAssociateData[obj[source]]['key'],"==",rulesDataDetail.classification_type);

                      let ruleClassificationList = JSON.parse(rulesDataDetail.value);


                      if(categoryAssociateData[obj[source]]['key']==rulesDataDetail.classification_type){
                        // console.log('check data match 222 -- ',compareText.toString(),' === ',typeof rulesDataDetail.value,' .....',compareText.toString().toLowerCase().includes(rulesDataDetail.value.toLowerCase()));
                        // if (compareText.toString().toLowerCase().includes(rulesDataDetail.value.toLowerCase())) {
                        if (ruleClassificationList.indexOf(compareText.toString())!=-1) {
                          temp = obj;
                          existDataFlag = 1;
                        } else {
                          errorflag = 1;
                          ruleSource = source;
                        }
                      }else{                     

                        // for(let a_count=0; a_count<ruleClassificationList.length; a_count++) {
                        //   let ruleClassificationId = ruleClassificationList[a_count];
                          // console.log(' eeeeeee==dddddd ',compareText,categoryAssociateData[compareText])

                          if(categoryAssociateData[compareText] != undefined 
                            && categoryAssociateData[compareText].associate != undefined
                            && categoryAssociateData[compareText].associate.length > 0
                          ){
                            let associateDataTocheck = [];
                            

                            //setting array of associated classification of import row value 
                            for(let b_count=0; b_count< categoryAssociateData[compareText].associate.length; b_count++) {
                              associateDataTocheck.push(categoryAssociateData[compareText]['associate'][b_count].classificationId);
                            }

                            // console.log('qqqqqqqqqqq111-----------',ruleClassificationList)
                            // console.log('qqqqqqqqqqq222-----------',associateDataTocheck)

                            //checking  selected rule classifications are existing in row associated classifications
                            for(let a_count=0; a_count<ruleClassificationList.length; a_count++) {
                              let ruleClassificationId = ruleClassificationList[a_count];
                              // console.log('qqqqqqqqqqq-----------',ruleClassificationId)
                              // console.log(associateDataTocheck)
                              if(associateDataTocheck.indexOf(ruleClassificationId) > -1) {
                                temp = obj;
                                existDataFlag = 1; 
                                // break;
                              }
                              
                            }
                            // console.log('here-----compare ---',compareText.toString(),' ==', associateDataTocheck[b_count].classificationId)
                            // if(compareText.toString() == associateDataTocheck[b_count].classificationId){
                            //   temp = obj;
                            //   existDataFlag = 1;
                            // }

                            // if(existDataFlag==1)
                            //   break;



                            
                                                       
                          }

                          // if(existDataFlag==1)
                          //   break;
                        // }
                      }
                      
                      if(existDataFlag==0){// this will check the condition for main error to return
                        errorflag = 1;
                        ruleSource = source;
                      }

                      // console.log('existDataFlag---- ',existDataFlag);
                    } else {
                      errorflag = 1;
                      ruleSource = "Invalid rules applied in this  field";
                    }
                  });

                  // console.log("Rule errorflag-- ",errorflag)
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
                        // console.log(">>>>>>>>>>>>>>>>>", source, dependencyTarget);

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
                  // console.log("🚀 ~  file: archiveRule.js:428 ~  sourceData?.forEach ~  sourceData:", sourceData)
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
                        // console.log("<<<<<<<<<<<<<<<<<<<")
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


                      if (!isNaN(+compareText) && (+compareText < +rulesDataDetail.value)){
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
    if(Object.keys(temp).length>0){
      flagAnyConditionTrue=1
    }

    let finalData = {
      filterData: temp,
      errorFlag: errorflag,
      source: ruleSource,
      isRule: isRule,
      archiveStatus:flagAnyConditionTrue,
      status:2
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
