const express = require('express');
const router = express.Router();
const redisClient = require('../model/redis.js');

router.route('/get_import_progress/:filename')
    .get(async function (req, res, next) {
        var importProgressPath = req.params.filename.replace('.txt', '');
        let line = {};

        const totalNo = await redisClient.get(importProgressPath + '_total_no');
        line["Total record"] = totalNo;

        const importNo = await redisClient.get(importProgressPath + '_import_no');
        line["Import Record"] = importNo;

        const failedNo = await redisClient.get(importProgressPath + '_failed_no');
        line["Error Record"] = failedNo;


        const updateNo = await redisClient.get(importProgressPath + '_update_no');
        line["Update Record"] = updateNo;


        const completeNo = await redisClient.get(importProgressPath + '_complete_status');
        line["Complete Record"] = completeNo;

        res.send(line);

    });



module.exports = router;
