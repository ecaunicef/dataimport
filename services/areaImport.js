const db = require('../model/db');
const redis = require('redis');
const fetch = require("node-fetch");
const env = require('../config/env');
const redisClient = require('../model/redis.js');
const Area = require('../model/area.js');
const { Sequelize } = require('sequelize');

var express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'), //parses information from POST
  methodOverride = require('method-override'); //used to manipulate POST
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method
    delete req.body._method
    return method
  }
}))
var parse = require("csv-parse");
const UploadedFileInfoSchema = require('../model/uploaded_file_info');
var fs = require('fs')
  , es = require('event-stream');



const results = [];
const columnIndex = {'areaid':0,'areaname':0,'arealevel':0,'areaparentid':0};

var validAreaCode = [];
var errorlogArray = [];
var importRecord=0;
var errorRecord=0;
var updateRecord=0;
var interval;
var areaDetailsCount = [];
var totalRecord = 0;
let uploadedFileInforId;
var file_data_set = [];
var fileHeader;
let startImportTime = ''

let areaImport = {

    startImport: async function (importId,importType) {
      try{
        uploadedFileInforId = importId
        importRecord=0;
        errorRecord=0;
        updateRecord=0;
        var indexNo = 0;
        var data = [];
        errorlogArray = [];
        let tempArea = await areaImport.getAllArea()
        tempArea.forEach(elem => {
            validAreaCode.push(elem.area_code)
        });

        
        
        var fileInfo = await UploadedFileInfoSchema.findOne({
          where: {
            id: parseInt(importId), type: parseInt(importType)
          }
        });
        var filePath = env.uploadFilePath + fileInfo.file_name;
        var importProgressPath = 'progress_' + importId;
        fileBuffer =  fs.readFileSync(filePath);
        to_string = fileBuffer.toString();
        split_lines = to_string.split("\n");
         totalRecord=split_lines.length-2;

        //set total record
        redisClient.set(importProgressPath+'_total_no', totalRecord);
        redisClient.set(importProgressPath+'_import_no', importRecord);
        redisClient.set(importProgressPath+'_failed_no', errorRecord);
        redisClient.set(importProgressPath+'_update_no', updateRecord);
        redisClient.set(importProgressPath+'_complete_status', 0);


        var s = fs.createReadStream(filePath)
             .pipe(parse())
             .pipe(es.mapSync(function(row){
              if(indexNo == 0) {
                fileHeader =  row;
              } else {

                let result = {};
                for (let i = 0; i < fileHeader.length; i++) {
                  result[fileHeader[i]?.toLowerCase()] = row[i];
                }
                file_data_set.push(result);
              }
              indexNo++;
            })
            .on('error', function(err){
                console.log('Error while reading file.', err);
            })
            .on('end',async function(){

              file_data_set = await file_data_set.sort((a, b) => (a.arealevel > b.arealevel ? 1 : -1))              
              for (let i = 0; i < file_data_set.length; i++) {

              
                  await areaImport.createJsonData(file_data_set[i],importProgressPath,totalRecord);
              }

              let processRow = importRecord+errorRecord+updateRecord;

              if(processRow >= totalRecord) {
                

                areaImport.createLog(fileInfo.file_name,importType,totalRecord,importId,importProgressPath);
                return true;
              }
           
                
            })
        );

      } catch (error) {
        console.log(error);
        process.send({ status: false });
        return    
      }
    },

    getAllArea: async function (){
      return await Area.findAll({
        attributes: ['area_code'] 
      }); 
    },

    assignColumnIndex: async function(line) {
        let columns = line.split(",");
        for(let [index,column] of columns.entries()) {

            column = column.toLowerCase();
            column = column.replace(/['"]+/g, '');
            column = column.replace(/"([^"]+(?="))"/g, '$1');

            switch(column) {

                case 'areaid':
                    columnIndex.areaid = index;
                    break;
                case 'areaname':
                    columnIndex.areaname = index;
                    break;
                case 'arealevel':
                    columnIndex.arealevel = index;
                    break;
                case 'areaparentid':
                    columnIndex.areaparentid = index;
                    break;     
                default:
                    console.log('invalid column '+column)
                    break;    
                        
            }
        }
        return;
    },

    // create json data
    createJsonData: async function(line,importProgressPath,totalRecord) {
      let columns = [];
      let content = '';
      let dataJSON = {}
      columns = line;
     let areaid = columns['areaid'],
      areaname = columns['areaname'],
      arealevel = Number(columns['arealevel']),
      areaparentid = columns['areaparentid'];
      try {
        if(arealevel >1 && areaparentid == ''){
          dataJSON.area_code = areaid;
          dataJSON.areaname = areaname,
          dataJSON.arealevel = arealevel,
          dataJSON.areaparentid = areaparentid,
          dataJSON.reason = "AreaParentID is Empty"
          errorRecord+=1;
          redisClient.set(importProgressPath+'_failed_no', errorRecord);
          return;
        }else if(arealevel >1 && areaparentid != ''){
          let parent_exist = await Area.findAll({
            where:{
              'area_code':areaparentid
            }
          });

          if(parent_exist?.length<=0){
            dataJSON.area_code = areaid;
            dataJSON.areaname = areaname,
            dataJSON.arealevel = arealevel,
            dataJSON.areaparentid = areaparentid,
            dataJSON.reason = "AreaParentID not exist",
              errorlogArray.push(dataJSON);
            errorRecord+=1;
            redisClient.set(importProgressPath+'_failed_no', errorRecord);
            return;
          } else if (parent_exist[0]['level']!=arealevel-1){
              dataJSON.area_code = areaid;
              dataJSON.areaname = areaname,
              dataJSON.arealevel = arealevel,
              dataJSON.areaparentid = areaparentid,
              dataJSON.reason = "Invalid AreaLevel"
              errorlogArray.push(dataJSON);
              errorRecord+=1;
              redisClient.set(importProgressPath+'_failed_no', errorRecord);
              return;
          }

          
        }

        if(areaid == '' ){
            dataJSON.area_code = areaid;
            dataJSON.areaname = areaname,
            dataJSON.arealevel = arealevel,
            dataJSON.areaparentid = areaparentid,
            dataJSON.reason = "AreaID is Empty"
            // await insertLogs({uploadedFileInforId,dataJSON});
            errorRecord+=1;
            errorlogArray.push(dataJSON);
            redisClient.set(importProgressPath+'_failed_no', errorRecord);
            return;
        }

        if(areaname == ''){
            dataJSON.area_code = areaid;
            dataJSON.areaname = areaname,
            dataJSON.arealevel = arealevel,
            dataJSON.areaparentid = areaparentid,
            dataJSON.reason = "Area name is empty"
            errorRecord+=1;
            redisClient.set(importProgressPath+'_failed_no', errorRecord);
            return;
        }
        if(arealevel == null){
            dataJSON.area_code = areaid;
            dataJSON.areaname = areaname,
            dataJSON.arealevel = arealevel,
            dataJSON.areaparentid = areaparentid,
            dataJSON.reason = "area level is empty"
            errorRecord+=1;
            errorlogArray.push(dataJSON);
            redisClient.set(importProgressPath+'_failed_no', errorRecord);
            return;
        }
    
        
    let jsonObject = {
        "name": areaname ,
        level: arealevel,
        area_code: areaid.toUpperCase(),
        parent_area_code: areaparentid,
        status: 1,
        chat:0
    };    
    const isRecordExist = await Area.findOne({
      where:{area_code: areaid.toUpperCase()}

    });

    if(!isRecordExist) {

      jsonObject['name_nl'] = "#"+areaname;
      jsonObject['name_fr'] = "#"+areaname;
      jsonObject['name_es'] = "#" + areaname;
    }

        const [area, created] = await Area.findOrCreate({
          where: { area_code: areaid.toUpperCase() },
          defaults: jsonObject
        });

        if (!created) {
          // Update record if it already exists
          await area.update(jsonObject);
          updateRecord += 1;
          redisClient.set(`${importProgressPath}_update_no`, updateRecord);
        } else {
          // Record was created
          importRecord += 1;
          redisClient.set(`${importProgressPath}_import_no`, importRecord);
        }

        // Track unique area names
        if (!areaDetailsCount.includes(areaname)) {
          areaDetailsCount.push(areaname);
        }
      return
    } catch (error) {
      console.log(error);
      dataJSON.area_code = areaid;
      dataJSON.areaname = areaname;
      dataJSON.arealevel = arealevel;
      dataJSON.areaparentid = areaparentid;
      dataJSON.reason = error.message
      // await insertLogs({uploadedFileInforId,dataJSON});
      errorRecord += 1;
        errorlogArray.push(dataJSON);
      redisClient.set(importProgressPath + "_failed_no", errorRecord);
    }

    },

    //generate log
  createLog: async function (importFileName, type, t_record, import_id, importProgressPath, user_id) {
    try{
        var date = new Date();
        var start_time_period = date.getFullYear() + '-' +
          (date.getMonth() + 1) + '-' +
          date.getDate() + ' ' +
          date.getHours() + ':' +
          date.getMinutes() + ':' +
          date.getSeconds()
          ;



        var error_file_name = 'Geographical_area_log' + Date.now() + '.csv';

        const csvWriter = createCsvWriter({
          path: env.logFilePath + error_file_name,
          header: [
            { id: 'area_code', title: 'AreaID' },
            { id: 'areaname', title: 'AreaName' },
            { id: 'arealevel', title: 'AreaLevel' },
            { id: 'areaparentid', title: 'AreaParentID' },
            { id: 'reason', title: 'Reason' },
          ]
        });

        csvWriter
          .writeRecords(errorlogArray)
          .then(() => console.log('csv log file Generated successfully'));
        end_time_period = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

        var conditions = { id: parseInt(import_id) };
        let updateSubgroup = {
            'total_records': t_record, 'imported_records': importRecord, 'error': errorRecord,
            'updated_records': updateRecord, '_complete_status': 1,
            'imported_count': importRecord
          
        }
        redisClient.set(importProgressPath + '_complete_status', 1);

        // console.log("conditions", conditions)
        // console.log(error_file_name)

        let updateRecord2 = await UploadedFileInfoSchema.update({
          file_detail: updateSubgroup,
          error_file: error_file_name
        },
        {where: conditions})

        if(updateRecord2[0] > 0) {
          redisClient.set(importProgressPath + '_complete_status', 1);
        }

        // console.log(updateRecord2)

        // UploadedFileInfoSchema.findOne({
        //   where: conditions
        // }).then(doc => {
        //   if (doc) {
        //     doc.update()
        //       .then(() => {
        //         redisClient.set(importProgressPath + '_complete_status', 1);
        //       })
        //       .catch(err => {
        //         console.error('Error updating record:', err);
        //       });
        //   } else {
        //     console.log("eee")
        //   }
        // }).catch(err => {
        //   console.error('Error finding record:', err);
        // });


    }catch(err){
      console.log(err);
      process.send({ status: false });
    }
  }

}; //end of controller


// receive message from master process
process.on('message', async (message) => {
  console.log(message);
  let res = await areaImport.startImport(message.importId, message.importType, message.user_id);
  process.send({ status: true });

});








const insertLogs = async (rowDetails) => {

  try {
      const { uploadedFileInforId, dataJSON } = rowDetails;

      const insertedLogDetails = await TempImportErrorLog.create(
          { file_id: uploadedFileInforId, row:JSON.stringify(dataJSON) }
      );
  } catch (error) {
      console.error("Error inserting logs:", error);
      throw error; // Re-throw the error after logging it
  }
};









