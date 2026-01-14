const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const flights = [
  {
    flightId: 'AI101',
    airline: 'Air India',
    departureCity: 'Delhi',
    arrivalCity: 'Mumbai',
    basePrice: 2500,
    currentPrice: 2500,
  },
  {
    flightId: 'IND203',
    airline: 'IndiGo',
    departureCity: 'Mumbai',
    arrivalCity: 'Bangalore',
    basePrice: 2200,
    currentPrice: 2200,
  },
  {
    flightId: 'SG305',
    airline: 'SpiceJet',
    departureCity: 'Bangalore',
    arrivalCity: 'Hyderabad',
    basePrice: 2100,
    currentPrice: 2100,
  },
  {
    flightId: 'AI407',
    airline: 'Air India',
    departureCity: 'Delhi',
    arrivalCity: 'Kolkata',
    basePrice: 2800,
    currentPrice: 2800,
  },
  {
    flightId: 'IND512',
    airline: 'IndiGo',
    departureCity: 'Kolkata',
    arrivalCity: 'Chennai',
    basePrice: 2700,
    currentPrice: 2700,
  },
  {
    flightId: 'VA621',
    airline: 'Vistara',
    departureCity: 'Chennai',
    arrivalCity: 'Delhi',
    basePrice: 2900,
    currentPrice: 2900,
  },
  {
    flightId: 'SG730',
    airline: 'SpiceJet',
    departureCity: 'Mumbai',
    arrivalCity: 'Goa',
    basePrice: 2000,
    currentPrice: 2000,
  },
  {
    flightId: 'AI845',
    airline: 'Air India',
    departureCity: 'Bangalore',
    arrivalCity: 'Pune',
    basePrice: 2300,
    currentPrice: 2300,
  },
  {
    flightId: 'IND956',
    airline: 'IndiGo',
    departureCity: 'Pune',
    arrivalCity: 'Ahmedabad',
    basePrice: 2400,
    currentPrice: 2400,
  },
  {
    flightId: 'VA102',
    airline: 'Vistara',
    departureCity: 'Ahmedabad',
    arrivalCity: 'Jaipur',
    basePrice: 2600,
    currentPrice: 2600,
  },
  {
    flightId: 'SG214',
    airline: 'SpiceJet',
    departureCity: 'Jaipur',
    arrivalCity: 'Mumbai',
    basePrice: 2750,
    currentPrice: 2750,
  },
  {
    flightId: 'AI326',
    airline: 'Air India',
    departureCity: 'Hyderabad',
    arrivalCity: 'Kochi',
    basePrice: 2850,
    currentPrice: 2850,
  },
  {
    flightId: 'IND438',
    airline: 'IndiGo',
    departureCity: 'Kochi',
    arrivalCity: 'Bangalore',
    basePrice: 2350,
    currentPrice: 2350,
  },
  {
    flightId: 'VA549',
    airline: 'Vistara',
    departureCity: 'Delhi',
    arrivalCity: 'Chandigarh',
    basePrice: 2050,
    currentPrice: 2050,
  },
  {
    flightId: 'SG651',
    airline: 'SpiceJet',
    departureCity: 'Chandigarh',
    arrivalCity: 'Delhi',
    basePrice: 2100,
    currentPrice: 2100,
  },
];

async function main() {
  console.log('🌱 Starting database seeding...');

  for (const flight of flights) {
    await prisma.flight.upsert({
      where: { flightId: flight.flightId },
      update: {},
      create: flight,
    });
  }

  console.log(`✅ Successfully seeded ${flights.length} flights into the database`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
