const prisma = require('../config/prisma');
const { generateTicketPDF } = require('../utils/pdfGenerator');

const downloadTicket = async (req, res, next) => {
  try {
    const { pnr } = req.params;

    if (!pnr) {
      return res.status(400).json({
        success: false,
        error: 'PNR is required',
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { pnr },
      select: {
        id: true,
        pnr: true,
        passengerName: true,
        flightId: true,
        airline: true,
        route: true,
        finalPrice: true,
        bookingTime: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: `Booking with PNR ${pnr} not found`,
      });
    }

    generateTicketPDF(booking, res);
  } catch (error) {
    console.error('Error downloading ticket:', error);

    // Prevent sending response if PDF stream already started
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: 'An error occurred while generating the ticket. Please try again.',
      });
    }
  }
};

module.exports = {
  downloadTicket,
};
