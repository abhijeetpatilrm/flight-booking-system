const express = require('express');
const { createBooking } = require('../controllers/booking.controller');
const { getBookingHistory } = require('../controllers/bookingHistory.controller');

const router = express.Router();

router.get('/history', getBookingHistory);
router.post('/', createBooking);

module.exports = router;
