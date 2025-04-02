const express = require('express');
const { createClassification, updateClassification, deleteClassification, getAssociatedCategory } = require('../controller/classificationController.js');

const router = express.Router();

router.post('/create', createClassification);
router.post('/update', updateClassification);
router.post('/delete-classification', deleteClassification);
router.get('/associated-classification/:id', getAssociatedCategory);

module.exports = router;
