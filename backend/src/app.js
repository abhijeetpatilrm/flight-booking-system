const express = require('express');
const cors = require('cors');
const healthRoute = require('./routes/health');
const flightsRoute = require('./routes/flights');
const bookingRoute = require('./routes/booking');
const ticketRoute = require('./routes/ticket');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/health', healthRoute);
app.use('/api/flights', flightsRoute);
app.use('/api/bookings', bookingRoute);
app.use('/api/tickets', ticketRoute);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
