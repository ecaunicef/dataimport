const ctrl = require('../controller/mentalHealthChatlineController');
const express = require('express');

const router = express.Router();

// Admin Apis
router.post('/save', ctrl.createChatline);
router.post('/update', ctrl.updateChatline);
router.post('/delete', ctrl.deleteChatline);
router.post('/change-status', ctrl.changeStatusChatline);

module.exports = router;