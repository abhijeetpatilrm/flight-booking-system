const prisma = require("../config/prisma");

async function applySurgePricing(flightId) {
  try {
    const flight = await prisma.flight.findUnique({
      where: { flightId },
      select: {
        id: true,
        flightId: true,
        basePrice: true,
        currentPrice: true,
        updatedAt: true,
      },
    });

    if (!flight) {
      throw new Error(`Flight ${flightId} not found`);
    }

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    // Surge window expired: reset to base price after 10 minutes
    if (
      flight.updatedAt < tenMinutesAgo &&
      flight.currentPrice > flight.basePrice
    ) {
      const updatedFlight = await prisma.flight.update({
        where: { flightId },
        data: { currentPrice: flight.basePrice },
      });

      return {
        action: "price_reset",
        message: "Price reset to base price (surge window expired)",
        flight: {
          flightId: updatedFlight.flightId,
          basePrice: updatedFlight.basePrice,
          currentPrice: updatedFlight.currentPrice,
        },
      };
    }

    // Prevent re-application: surge is already active
    if (flight.currentPrice > flight.basePrice) {
      return {
        action: "no_change",
        message: "Surge pricing already applied",
        flight: {
          flightId: flight.flightId,
          basePrice: flight.basePrice,
          currentPrice: flight.currentPrice,
        },
      };
    }

    const recentBookingsCount = await prisma.booking.count({
      where: {
        flightId,
        bookingTime: {
          gte: fiveMinutesAgo,
        },
      },
    });

    // Surge trigger: 3+ bookings in 5 minutes, always calculate from basePrice
    if (recentBookingsCount >= 3 && flight.currentPrice === flight.basePrice) {
      const surgeIncrease = Math.floor(flight.basePrice * 0.1);
      const newPrice = flight.basePrice + surgeIncrease;

      const updatedFlight = await prisma.flight.update({
        where: { flightId },
        data: { currentPrice: newPrice },
      });

      return {
        action: "surge_applied",
        message: `Surge pricing applied: +10% (${recentBookingsCount} bookings in 5 min)`,
        flight: {
          flightId: updatedFlight.flightId,
          basePrice: updatedFlight.basePrice,
          currentPrice: updatedFlight.currentPrice,
          increase: surgeIncrease,
        },
      };
    }

    return {
      action: "no_change",
      message: "No surge pricing conditions met",
      flight: {
        flightId: flight.flightId,
        basePrice: flight.basePrice,
        currentPrice: flight.currentPrice,
      },
      recentBookingsCount,
    };
  } catch (error) {
    console.error("Error applying surge pricing:", error);
    throw error;
  }
}

module.exports = {
  applySurgePricing,
};
