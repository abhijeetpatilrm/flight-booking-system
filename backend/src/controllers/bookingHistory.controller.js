const prisma = require('../config/prisma');

const getBookingHistory = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      select: {
        pnr: true,
        passengerName: true,
        flightId: true,
        airline: true,
        route: true,
        finalPrice: true,
        bookingTime: true,
      },
      orderBy: {
        bookingTime: 'desc',
      },
    });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
      message: 'To download ticket, use: GET /api/tickets/:pnr',
    });
  } catch (error) {
    console.error('Error fetching booking history:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while fetching booking history. Please try again.',
    });
  }
};

module.exports = {
  getBookingHistory,
};
