const prisma = require('../config/prisma');

const getFlights = async (req, res, next) => {
  try {
    const { departureCity, arrivalCity } = req.query;

    const where = {};
    if (departureCity) {
      where.departureCity = departureCity;
    }
    if (arrivalCity) {
      where.arrivalCity = arrivalCity;
    }

    const flights = await prisma.flight.findMany({
      where,
      select: {
        flightId: true,
        airline: true,
        departureCity: true,
        arrivalCity: true,
        currentPrice: true,
      },
      take: 10,
    });

    res.json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    console.error('Error fetching flights:', error);
    next(error);
  }
};

module.exports = {
  getFlights,
};
