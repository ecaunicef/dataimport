const express = require('express');
const ctrl = require('../controller/CredentialController.js');
const { route } = require('./index.js');
const auth=require('../middleware/auth.js');
const router = express.Router();


router.post('/add', [auth],ctrl.createCredentials);
router.post('/update',ctrl.updateCredentials);
router.post('/delete',ctrl.deleteCredentials);
router.post('/approve', ctrl.approveCredentials);
router.post('/save', ctrl.addAdminUser);
router.post('/status', ctrl.updateStatus);
router.post('/forget-password', ctrl.forgetPassword);
router.post('/user-reset-password',ctrl.resetPassword);



module.exports =router;
