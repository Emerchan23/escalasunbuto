const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

router.get('/', historyController.getAllHistoryRecords);
router.post('/', historyController.saveHistoryRecord);
router.delete('/:id', historyController.deleteHistoryRecord);

module.exports = router;
