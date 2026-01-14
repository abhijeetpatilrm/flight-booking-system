const express = require('express');
const { downloadTicket } = require('../controllers/ticket.controller');

const router = express.Router();

router.get('/:pnr', downloadTicket);

module.exports = router;
