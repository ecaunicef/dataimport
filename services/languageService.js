const db = require('../model/db');
const redis = require('redis');
const fetch = require("node-fetch");
const env = require('../config/env')
const redisClient = require('../model/redis.js');
var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST
const uuidv1 = require('uuid/v1');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const classification=require('../model/classification.js');


router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method
        delete req.body._method
        return method
    }
}))
var parse = require("csv-parse"),
    Area = require('../model/area.js');
const UploadedFileInfoSchema = require('../model/uploaded_file_info');
var fs = require('fs')
    , es = require('event-stream');

const results = [];
const columnIndex = { "name": { "nl": "", "fr": "es" } };
var errorlogArray = [];
var totalContent = [];
var importRecord = 0;
var errorRecord = 0;
var updateRecord = 0;
var interval;
var areaDetailsCount = [];
var data_import = 0;

var file_data_set = [];
var fileHeader;
let languageType='';

let areaImport = {

    startImport: async function (importId, importType, user_id) {
        importRecord = 0;
        errorRecord = 0;
        updateRecord = 0;
        var indexNo = 0;
        var data = [];
        errorlogArray = [];
        let start_time_period = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        let end_time_period;
        var fileInfo = await UploadedFileInfoSchema.findOne({
            where:{
                id: parseInt(importId), type: parseInt(importType)
            }
        });

        var filePath = env.uploadFilePath + fileInfo.file_name;
        languageType = fileInfo.language_type;
        var importProgressPath = 'progress_' + importId;
        fileBuffer = fs.readFileSync(filePath);
        to_string = fileBuffer.toString();
        split_lines = to_string.split("\n");
        var totalRecord = split_lines.length - 2;



        //set total record
        redisClient.set(importProgressPath + '_total_no', totalRecord);
        redisClient.set(importProgressPath + '_import_no', importRecord);
        redisClient.set(importProgressPath + '_failed_no', errorRecord);
        redisClient.set(importProgressPath + '_update_no', updateRecord);
        redisClient.set(importProgressPath + '_complete_status', 0);

        var s = fs.createReadStream(filePath)
            .pipe(parse())
            .pipe(es.mapSync(function (row) {
                if (indexNo == 0) {
                    fileHeader = row;
                } else {

                    let result = {};
                    for (let i = 0; i < fileHeader.length; i++) {
                        result[fileHeader[i].toLowerCase()] = row[i];
                    }
                    file_data_set.push(result);
                }

                indexNo++;
            })
                .on('error', function (err) {
                    console.log('Error while reading file.', err);
                })
                .on('end', async function () {
                    for (let i = 0; i < file_data_set.length; i++) {
                        await areaImport.createJsonData(file_data_set[i], importProgressPath, totalRecord, languageType);
                    }

                    let processRow = importRecord + errorRecord + updateRecord;
                    console.log(processRow, "000", totalRecord);
                    if (processRow >= totalRecord) {
                        areaImport.createLog(fileInfo.file_name, importType, totalRecord, importId, importProgressPath, user_id);
                        return true;
                    }
                    // interval = setInterval(function () {
                    // }, 1000);

                })
            );
    },

    // create json data
    createJsonData: async function (line, importProgressPath, totalRecord, languageType) {
        try{
            
            let columns ={};
            let dataJSON = {}
            columns = line;
            let areaName_en = columns['english']?.trim(),
                areaName_nl = columns['dutch']?.trim(),
                areaName_fr = columns['french']?.trim(),
                areaName_es = columns['spanish']?.trim();


            if (areaName_en && areaName_en == '') {
                dataJSON.name= areaName_en;
                dataJSON.name_nl = areaName_nl;
                dataJSON.name_fr = areaName_fr;
                dataJSON.name_es = areaName_es;
                dataJSON.reason = "Name is Empty"
                errorlogArray.push(dataJSON);
                errorRecord += 1;
                redisClient.set(importProgressPath + '_failed_no', errorRecord);

                return;
            }
    
    


            if (languageType =='Geographical Area'){
                let jsonObject = {
                    "name_fr": areaName_fr,
                    "name_es": areaName_es,
                    "name_nl": areaName_nl,

                };
                const conditions = { "name": areaName_en }
                const updatedRecord = await Area.update(jsonObject, {
                    where: conditions,
                });
        
                if (updatedRecord && updatedRecord[0] > 0) { // Check if rows were updated
                    updateRecord += 1;
                    redisClient.set(importProgressPath + '_update_no', updateRecord);
                }else{
                    errorRecord +=1;
                    dataJSON.name = areaName_en;
                    dataJSON.name_nl= areaName_nl;
                    dataJSON.name_fr = areaName_fr;
                    dataJSON.name_es = areaName_es;
                    dataJSON.reason = "English translation empty";
                    errorlogArray.push(dataJSON);
                    redisClient.set(importProgressPath + '_failed_no', errorRecord);
                }
            }else{
                let jsonObject = {
                    "classification_name_fr": areaName_fr,
                    "classification_name_es": areaName_es,
                    "classification_name_nl": areaName_nl,

                };

                const conditions = { "classification_name": areaName_en };
                const updatedRecord = await classification.update(jsonObject, {
                    where: conditions,
                });
    
                if (updatedRecord && updatedRecord[0] > 0) { // Check if rows were updated
                    updateRecord += 1;
                    redisClient.set(importProgressPath + '_update_no', updateRecord);
                } else {
                    dataJSON.name = areaName_en;
                    dataJSON.name_nl = areaName_nl;
                    dataJSON.name_fr = areaName_fr;
                    dataJSON.name_es = areaName_es;
                    dataJSON.reason = "English translation empty";
                    errorlogArray.push(dataJSON);
                    errorRecord += 1;
                    redisClient.set(importProgressPath + '_failed_no', errorRecord);
                }

            }

        }catch(err){
            console.log(err);
            dataJSON.name = '';
            dataJSON.name_nl = '';
            dataJSON.name_fr = areaName_fr;
            dataJSON.name_es = areaName_es;
            dataJSON.reason = "English translation empty";
            errorlogArray.push(dataJSON);
            errorRecord += 1;
            redisClient.set(importProgressPath + '_failed_no', errorRecord);
            // return res.send({
            //     message: "Something went wrong"
            // })
        }
    },

    //generate log
    createLog: async function (importFileName, type, t_record, import_id, importProgressPath, user_id) {

        // clearInterval(interval);
        var date = new Date();
        var start_time_period = date.getFullYear() + '-' +
            (date.getMonth() + 1) + '-' +
            date.getDate() + ' ' +
            date.getHours() + ':' +
            date.getMinutes() + ':' +
            date.getSeconds()
            ;



        var error_file_name = 'Language_Log' + Date.now() + '.csv';

        const csvWriter = createCsvWriter({
            path: env.logFilePath + error_file_name,
            header: [
                { id: 'name', title: 'English' },
                {id: 'name_nl', title: 'Dutch'},
                { id: 'name_fr', title: 'French' },
                { id: 'name_es', title: 'Spanish' },
                { id: 'reason', title: 'Reason' },
            ]
        });

        csvWriter
            .writeRecords(errorlogArray)
            .then(() => console.log('csv log file Generated successfully'));
        end_time_period = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

        var conditions = {id: parseInt(import_id) };
        let updateSubgroup = {
                'total_records': t_record, 'imported_records': importRecord, 'error': errorRecord,
                'updated_records': updateRecord, '_complete_status': 1,
                'imported_count': data_import
            
        }
        redisClient.set(importProgressPath + '_complete_status',1);

        let updateRecord2 = await UploadedFileInfoSchema.update({
            file_detail: updateSubgroup,
            error_file: error_file_name
          },
          {where: conditions})
  
          if(updateRecord2[0] > 0) {
            redisClient.set(importProgressPath + '_complete_status', 1);
          }

        // UploadedFileInfoSchema.findOne({
        //     where: conditions
        // }).then(doc => {
        //     if (doc) {
        //         doc.update(updateSubgroup)
        //             .then(() => {
        //                 redisClient.set(importProgressPath + '_complete_status', 1);
        //             })
        //             .catch(err => {
        //                 console.error('Error updating record:', err);
        //             });
        //     }
        // }).catch(err => {
        //     console.error('Error finding record:', err);
        // });

       
    }

}; //end of controller


// receive message from master process
process.on('message', async (message) => {
    console.log(message);
    let res = await areaImport.startImport(message.importId, message.importType, message.user_id);
    process.send({ status: true });

});










