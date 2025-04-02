let checkEnterPrisePrecedence = (obj, precedence, enterpriseRecord, precedenceJsonList, keyMapWithPrecedenceName)=>{
    
    let tempRowError = []
    let errorflag = 0
    let errorRecord = 0

    for (let key in obj) {
          const precendenceKey = key + "_precedence";
          const firstKey = precendenceKey.split(".")[0];
          const lastKey = precendenceKey.split(".")[1];
          // console.log(dataJSON, "data JSON isss")
          // console.log(objectFildsBeforeMapping,Object.keys(obj).length)
          if (enterpriseRecord != null) {
            const precendenceValue = enterpriseRecord[firstKey][lastKey];
            const precedenceOrder =
              precedenceJsonList[keyMapWithPrecedenceName[key]].precedence;
            const currentPrecendenceOrder = precedenceOrder.indexOf(precedence);
            const previousPrecendenceOrder =
              precedenceOrder.indexOf(precendenceValue);
            // console.log(currentPrecendenceOrder, "currentPrecendenceOrder", previousPrecendenceOrder, "previousPrecendenceOrder")

            if (currentPrecendenceOrder == -1) {
              //generate error
              errorflag = 1;
              errorRecord += 1;
              tempRowError.push("Precedence Not Assingned");
            } else if (currentPrecendenceOrder > previousPrecendenceOrder) {
              //generate error
              errorflag = 1;
              errorRecord += 1;
              tempRowError.push("Invalid Precedence");
              delete obj[key];
            } 
            // else {
            //   let historyData = await Enterprise.aggregate([
            //     {
            //       $match: match,
            //     },
            //     {
            //       $addFields: {
            //         enterprise_id: "$_id",
            //       },
            //     },
            //     {
            //       $project: {
            //         _id: 0,
            //       },
            //     },
            //   ]);
            //   //update data
            //   // console.log(obj)
            //   let updatedEnterpriseRecords = await Enterprise.findOneAndUpdate(
            //     match,
            //     obj,
            //     { upsert: true }
            //   );

            //   try {
            //     if (updatedEnterpriseRecords) {
            //       let obj = historyData[0];
            //       let historyEnterprise = new EnterPriseHistory(obj);
            //       await historyEnterprise.save();
            //     }
            //   } catch (error) {
            //     console.log(error);
            //   }

            //   importRecord += 1;
            // }
        }
        return {tempRowError,errorflag, errorRecord, obj }
    }
}

module.exports = {checkEnterPrisePrecedence}