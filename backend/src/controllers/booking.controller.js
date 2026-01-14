const prisma = require('../config/prisma');
const { applySurgePricing } = require('../utils/surgePricing');
const { generatePNR } = require('../utils/pnrGenerator');

const createBooking = async (req, res, next) => {
  const MAX_PNR_RETRIES = 3;

  try {
    const { passengerName, flightId } = req.body;

    if (!passengerName || !flightId) {
      return res.status(400).json({
        success: false,
        error: 'passengerName and flightId are required',
      });
    }

    const surgePricingResult = await applySurgePricing(flightId);
    console.log('Surge pricing result:', surgePricingResult);

    const flight = await prisma.flight.findUnique({
      where: { flightId },
      select: {
        flightId: true,
        airline: true,
        departureCity: true,
        arrivalCity: true,
        currentPrice: true,
      },
    });

    if (!flight) {
      return res.status(404).json({
        success: false,
        error: `Flight ${flightId} not found`,
      });
    }

    const finalPrice = flight.currentPrice;
    const route = `${flight.departureCity} → ${flight.arrivalCity}`;

    // Retry logic for PNR unique constraint collisions
    let lastError = null;
    for (let attempt = 1; attempt <= MAX_PNR_RETRIES; attempt++) {
      try {
        // Atomic transaction: wallet deduction + booking creation
        const result = await prisma.$transaction(async (tx) => {
          let wallet = await tx.wallet.findFirst();

          if (!wallet) {
            console.log('Wallet not found, creating with default balance ₹50,000');
            wallet = await tx.wallet.create({
              data: {
                balance: 50000,
              },
            });
          }

          if (wallet.balance < finalPrice) {
            throw new Error(
              `Insufficient balance. Required: ₹${finalPrice}, Available: ₹${wallet.balance}`
            );
          }

          const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              balance: wallet.balance - finalPrice,
            },
          });

          const pnr = generatePNR();

          const booking = await tx.booking.create({
            data: {
              passengerName,
              flightId,
              airline: flight.airline,
              route,
              finalPrice,
              bookingTime: new Date(),
              pnr,
            },
          });

          return {
            booking,
            wallet: updatedWallet,
            previousBalance: wallet.balance,
          };
        });

        return res.status(201).json({
          success: true,
          message: 'Booking created successfully',
          data: {
            booking: {
              pnr: result.booking.pnr,
              passengerName: result.booking.passengerName,
              flightId: result.booking.flightId,
              airline: result.booking.airline,
              route: result.booking.route,
              finalPrice: result.booking.finalPrice,
              bookingTime: result.booking.bookingTime,
            },
            wallet: {
              previousBalance: result.previousBalance,
              currentBalance: result.wallet.balance,
              deducted: finalPrice,
            },
          },
        });
      } catch (error) {
        // PNR collision: retry with new PNR
        if (error.code === 'P2002' && error.meta?.target?.includes('pnr')) {
          console.log(`PNR collision detected, retry attempt ${attempt}/${MAX_PNR_RETRIES}`);
          lastError = error;
          continue;
        }

        throw error;
      }
    }

    console.error('PNR generation failed after max retries:', lastError);
    return res.status(500).json({
      success: false,
      error: 'Unable to generate unique booking reference. Please try again.',
    });

  } catch (error) {
    console.error('Error creating booking:', error);

    // Handle insufficient balance error
    if (error.message.includes('Insufficient balance')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Handle flight-related errors
    if (error.message.includes('Flight') && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    // Generic error - don't leak internals
    return res.status(500).json({
      success: false,
      error: 'An error occurred while processing your booking. Please try again.',
    });
  }
};

module.exports = {
  createBooking,
};
