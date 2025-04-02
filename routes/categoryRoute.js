const ctrl= require('../controller/CategoryController');
const express = require('express');

const router = express.Router();

router.post('/add-category', ctrl.addCategory);
router.post('/update-category', ctrl.updateCategory);
router.post('/delete-category', ctrl.deleteCategory);

module.exports = router;