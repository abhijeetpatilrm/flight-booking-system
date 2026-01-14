# Flight Booking System

A full-stack flight booking application built with Node.js, Express, PostgreSQL, and Next.js. This project demonstrates real-world booking workflows, including dynamic surge pricing, wallet-based payments, and atomic transaction handling.

## Project Overview

This system simulates a flight booking platform where users can search for flights, book tickets using a wallet balance, and download PDF receipts. The focus is on **database-driven logic** rather than relying on external APIs or mock data.

The design prioritizes:
- **Transaction safety** – bookings and wallet deductions happen atomically
- **Idempotent surge pricing** – prevents price compounding on repeated calls
- **Realistic edge cases** – handles PNR collisions, insufficient balance, and concurrent bookings

This isn't a production-ready airline system, but it reflects how you'd approach booking logic, pricing rules, and data consistency in a real backend.

## Key Features

### Flight Search
- Query flights by departure and arrival city
- All flight data stored in PostgreSQL (15 seeded flights across Indian cities)
- No pagination yet, but designed with scaling in mind

### Dynamic Surge Pricing
- **Time-based trigger**: If 3+ bookings occur within 5 minutes for a flight, price increases by 10%
- **Automatic reset**: After 10 minutes of inactivity, price returns to base
- **Idempotent**: Surge is calculated from `basePrice`, not compounded from `currentPrice`
- Designed to prevent race conditions and price manipulation

### Wallet System
- Each user starts with ₹50,000 (auto-initialized on first booking)
- Balance validation before booking confirmation
- Atomic deduction inside Prisma transaction

### Atomic Booking Transaction
- Uses `prisma.$transaction()` to ensure:
  - Wallet balance is checked and deducted
  - Booking record is created
  - PNR uniqueness is guaranteed (with retry logic)
- If any step fails, the entire operation rolls back

### PDF Ticket Generation
- Generates professional airline-style tickets using `pdfkit`
- Streams PDF directly to response (no temporary files)
- Includes PNR, passenger details, flight info, and payment confirmation

### Booking History
- View all past bookings sorted by latest first
- Re-download tickets using PNR
- Clean table-based UI

## Architecture & Design Decisions

### Why PostgreSQL + Prisma?
- **Relational data**: Flights, bookings, and wallets have clear relationships
- **Type safety**: Prisma's generated client provides full TypeScript support
- **Migration workflow**: Schema changes are versioned and reproducible
- **Transaction support**: Critical for wallet deductions and booking creation

### Why Transactions for Booking?
Without transactions, a user could:
1. Pass the balance check
2. Have their booking created
3. But fail to deduct wallet balance due to a race condition

Using `$transaction`, we guarantee **all-or-nothing** behavior. If the wallet update fails, the booking never gets created.

### How Surge Pricing Works Safely
The surge pricing engine checks:
1. How many bookings were made in the last 5 minutes
2. Whether surge is already applied (`currentPrice > basePrice`)
3. Whether the surge window expired (10 minutes since last update)

This prevents:
- **Compounding**: Surge is always `basePrice + 10%`, never stacked
- **Stuck prices**: Prices reset after 10 minutes of no activity
- **Double application**: Once surge is active, it won't re-apply

Here's the core logic:

```javascript
// Surge trigger: 3+ bookings in 5 minutes, always calculate from basePrice
if (recentBookingsCount >= 3 && flight.currentPrice === flight.basePrice) {
  const surgeIncrease = Math.floor(flight.basePrice * 0.1);
  const newPrice = flight.basePrice + surgeIncrease;

  const updatedFlight = await prisma.flight.update({
    where: { flightId },
    data: { currentPrice: newPrice },
  });

  return { action: "surge_applied", flight: updatedFlight };
}
```

**Why this approach?**  
Rather than calculate surge on every read, we update the price in the database when conditions are met. This keeps the pricing layer stateless and allows the frontend to always show the current price without extra logic.

### Separation of Backend and Frontend
The backend and frontend are completely independent:
- Backend runs on `localhost:5000` (Express API)
- Frontend runs on `localhost:3000` (Next.js App Router)
- CORS is enabled for local development

This allows:
- Independent deployment (backend could be deployed separately)
- Frontend can be rebuilt without touching backend logic
- API could serve mobile apps or other clients in the future

## Frontend Approach

The UI is built with **Next.js 15 (App Router)** and **TailwindCSS v4**, using shadcn/ui components for consistency.

Design philosophy:
- **Minimal, not noisy**: Focus on clarity over visual effects
- **Modal-based booking**: Instead of a multi-page flow, the booking happens in a dialog
- **Real-time feedback**: Loading spinners, error messages, and success states are immediate
- **Direct backend integration**: Fetch calls directly to Express API (no GraphQL, no tRPC)

The search page shows a grid of flights. Clicking "Book Now" opens a modal where you:
1. See flight details and current price
2. Enter passenger name
3. Confirm booking (wallet is deducted)
4. Download PDF ticket immediately

No complex state management library needed – React's `useState` handles everything cleanly.

## Optional Enhancements Implemented

These weren't in the original spec, but improve the user experience:

- **Clean booking modal**: Single-step confirmation instead of multi-page flow
- **Ticket re-download**: Booking history lets you re-download tickets anytime
- **Loading states**: Spinners on search and booking actions
- **Polished typography**: Larger titles, better spacing, semibold labels
- **Hover states**: Cards lift slightly on hover for better feedback

None of these are over-engineered. They're small touches that make the app feel intentional.

## Future Improvements

This project covers core booking logic, but there's room to grow:

### Authentication & User Management
- Right now, there's a single shared wallet
- Add user accounts with individual wallets
- JWT-based authentication for API routes

### Pagination & Advanced Filters
- Currently loads all flights
- Add pagination, price range filters, date selection
- Implement server-side search with query optimizations

### Admin Dashboard
- Manage flights (add, edit, delete)
- View booking analytics
- Adjust surge pricing rules dynamically

### Performance Optimizations
- Cache flight data with Redis
- Add database indexes on frequently queried fields
- Optimize Prisma queries with `select` and `include`

### Deployment
- Dockerize backend and frontend
- Deploy backend to Railway/Render
- Deploy frontend to Vercel
- Use managed PostgreSQL (Supabase, Neon, etc.)

## Screenshots

### Flight Search
*Search flights by city and view real-time pricing*

![Flight Search](./screenshots/flight-search.png)

### Booking Modal
*Enter passenger details and confirm booking in one step*

![Booking Modal](./screenshots/booking-modal.png)

![Booking Modal Success](./screenshots/booking-modal-2.png)

### Booking History
*View all past bookings and re-download tickets*

![Booking History](./screenshots/booking-history.png)

### PDF Ticket
*Professional airline-style ticket with PNR and booking details*

![PDF Ticket](./screenshots/pdf-ticket.png)

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ running locally or remotely

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/flight_booking"
   PORT=5000
   NODE_ENV=development
   ```

4. Run Prisma migrations and seed the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

Backend will run on `http://localhost:5000`.

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

Frontend will run on `http://localhost:3000`.

### Verify Setup
- Visit `http://localhost:3000` to search flights
- Book a flight and check the booking history
- Download a PDF ticket to confirm everything works

## Closing Note

This project was built to explore **realistic backend patterns** for booking systems—particularly around transaction safety, dynamic pricing, and data consistency.

The goal wasn't to build a feature-complete airline platform, but to understand how pricing logic, wallet systems, and booking workflows behave when designed with real constraints in mind.

If you're learning full-stack development, focus on the **why** behind each decision: Why use transactions? Why reset surge pricing? Why validate balance before booking? These patterns apply far beyond flight booking.

