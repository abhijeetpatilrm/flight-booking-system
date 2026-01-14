# Flight Booking System - Frontend

Modern Next.js frontend for the flight booking system.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **TailwindCSS v4**
- **shadcn/ui**

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on `http://localhost:5000`

### Development

```bash
npm run dev
```

Frontend runs on: `http://localhost:3000`

### Available Pages

- **/** - Flight Search (empty shell)
- **/history** - Booking History (empty shell)

## Backend API Integration

The frontend will consume these backend endpoints:

- `GET /api/flights` - Search flights
- `POST /api/bookings` - Create booking
- `GET /api/bookings/history` - Get booking history
- `GET /api/tickets/:pnr` - Download ticket PDF

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx          # Flight Search
│   ├── history/
│   │   └── page.tsx      # Booking History
│   ├── layout.tsx
│   └── globals.css
├── components/           # shadcn/ui components
├── lib/
│   └── utils.ts
└── package.json
```

## Next Steps

1. Implement flight search form with filters
2. Connect to backend API
3. Implement booking flow
4. Add booking history table with ticket download
5. Add shadcn/ui components (Button, Card, Input, Table)
6. Add loading states and error handling

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
