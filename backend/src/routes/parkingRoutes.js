const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

router.get('/parking/overview', parkingController.getOverview);
router.get('/floors', parkingController.getFloors);
router.get('/floors/:floorId/slots', parkingController.getSlotsByFloor);
router.post('/simulation/slot-status', parkingController.simulateStatus);
router.get('/events/latest', parkingController.getEvents);

module.exports = router;
