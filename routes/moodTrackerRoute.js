const ctrl = require('../controller/MoodTrackerController');
const express = require('express');

const router = express.Router();

// Admin Apis
router.post('/delete', ctrl.deleteMoodTracker)

// Mobile App APIs
router.post('/create', ctrl.createMoodTracker);

module.exports = router;