const ctrl= require('../controller/moodMapperController');
const express = require('express');

const router = express.Router();

// Admin Apis
router.post('/edit-mapper', ctrl.editMoodMapper);

module.exports = router;