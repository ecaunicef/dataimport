const ctrl = require('../controller/UploadedFileInfoController');
const express = require('express');

const router = express.Router();

// Admin Apis
router.post('/delete', ctrl.delete)

module.exports = router;