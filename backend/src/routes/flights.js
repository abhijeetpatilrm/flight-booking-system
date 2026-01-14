const express = require('express');
const { getFlights } = require('../controllers/flights.controller');

const router = express.Router();

router.get('/', getFlights);

module.exports = router;
