const ctrl = require('../controller/areaController');
const express = require('express');
const UploadedFileInfoSchema = require('../model/uploaded_file_info');
const router = express.Router();
const env = require('../config/env');
var fs = require('fs'),
    es = require('event-stream');
const { fork } = require('child_process');



// Admin Apis
router.post('/save', ctrl.createArea);
router.get('/delete/:id', ctrl.deleteArea);
router.post('/update', ctrl.updateArea);
router.post('/status',ctrl.updateStatus);
router.get('/associate-user/:id', ctrl.associatedUser);

router.route('/import/data/filevalidation/:importtype/:importid/:userid').get(async function (req, res) {
    try {
        var fileInfo = await UploadedFileInfoSchema.findOne({
            where: {
                id: parseInt(req.params.importid),
                user_id: parseInt(req.params.userid),
                type: parseInt(req.params.importtype)
            }
        });


        var filePath = env.uploadFilePath + fileInfo?.file_name;
        var firstLine = 1;
        var s = fs.createReadStream(filePath)
            .on('error', err => {
                console.log("Error ==> ", err)
                res.send({ 'status': 400, 'msg': 'Error in reading file. File not found.' });
                return;
            })
            .pipe(es.split())
            .pipe(es.mapSync(function (line) {

                if (firstLine) {
                    firstLine++;

                    let validHeadings = ['AreaID', 'AreaName', 'AreaLevel', 'AreaParentID'];

                    let isValid = 1;
                    let columns = line.split(",");

                    let count_check = 0;

                    //assign column index to columnIndex json object
                    for (let [index, column] of columns.entries()) {

                        column = column.toLowerCase();
                        column = column.replace(/['"]+/g, '');
                        column = column.replace(/"([^"]+(?="))"/g, '$1');

                        count_check++;
                    }
                    res.send({
                        'status': 200,
                        'msg': ''
                    });
                    return;
                }

            })
                .on('error', function (err) {

                })
                .on('end', function () {

                })
            );
    } catch (err) {
        console.log(err);
        return res.send({
            status: false,
            message: "Something went wrong"
        })
    }


})

router.route('/import/data/:importtype/:importid/:userId').get(async function (req, res) {
    const process = fork('./services/areaImport.js');
    process.send({ 'type': 'dataimport', 'importId': req.params.importid, 'importType': req.params.importtype, 'userId': req.params.userId });
    process.on('message', () => {
        console.log('completed');
    });

    return res.json({ status: true, sent: true });
});



module.exports = router;