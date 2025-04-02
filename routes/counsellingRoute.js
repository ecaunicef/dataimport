const ctrl= require('../controller/CounsellingController');
const express = require('express');

const router = express.Router();

// Admin Apis
router.post('/delete-counselling', ctrl.deleteCounselling);
router.post('/update-status-comment', ctrl.updateStatusCommentCounselling)

// Mobile App APIs
router.post('/new/save', ctrl.saveCounselling);

module.exports = router;