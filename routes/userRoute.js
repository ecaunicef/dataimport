const ctrl= require('../controller/UserController.js');
const express = require('express');

const router = express.Router();

router.post('/create', ctrl.createUser);
router.post('/update',ctrl.updateUser);

router.post('/update-profile', ctrl.updateProfile);


// Mobile Apis
router.post('/refresh-device-token', ctrl.refreshDeviceToken);
router.post('/delete', ctrl.deleteUser);


module.exports = router;