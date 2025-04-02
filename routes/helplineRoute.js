const ctrl = require('../controller/HelpLIneController.js');
const express = require('express');

const router = express.Router();

router.post('/add', ctrl.createHelpline);
router.post('/update', ctrl.updateHelpline);
router.post('/delete', ctrl.deleteHelpline)

module.exports = router;