const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

router.get('/', scheduleController.getAllScheduleEntries);
router.post('/', scheduleController.createOrUpdateScheduleEntry); // Used for both create and update
router.delete('/:date', scheduleController.deleteScheduleEntry);
router.post('/clear-month', scheduleController.clearMonthSchedule);

module.exports = router;
