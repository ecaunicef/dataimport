const ctrl= require('../controller/CountryController');
const express = require('express');

const router = express.Router();

router.post('/add-country', ctrl.addCountry);
router.post('/update-area',ctrl.updateArea);
router.post('/delete-country', ctrl.deleteCountry);

module.exports = router;