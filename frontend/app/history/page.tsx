"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Booking {
  pnr: string;
  passengerName: string;
  flightId: string;
  airline: string;
  route: string;
  finalPrice: number;
  bookingTime: string;
}

export default function HistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/bookings/history");

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(data.data || []);
    } catch (err) {
      setError("Failed to load booking history. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = (pnr: string) => {
    window.open(`http://localhost:5000/api/tickets/${pnr}`, "_blank");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + ", " + date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Flight Booking</h1>
            <nav className="flex gap-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Search Flights
              </Link>
              <Link href="/history" className="text-blue-600 font-medium">
                Booking History
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Booking History
          </h2>
          <p className="text-gray-600">
            View all your past bookings and download tickets
          </p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 mb-8">
            <CardContent className="pt-6">
              <p className="text-red-600 text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600 text-center py-12">
                Loading your bookings...
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && bookings.length === 0 && !error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-2">No bookings yet</p>
                <p className="text-gray-500 mb-6">
                  Start by searching and booking a flight
                </p>
                <Link href="/">
                  <Button>Search Flights</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && bookings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>All Bookings ({bookings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PNR</TableHead>
                      <TableHead>Passenger</TableHead>
                      <TableHead>Flight</TableHead>
                      <TableHead>Airline</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Booking Date</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.pnr}>
                        <TableCell className="font-medium">
                          {booking.pnr}
                        </TableCell>
                        <TableCell>{booking.passengerName}</TableCell>
                        <TableCell>{booking.flightId}</TableCell>
                        <TableCell>{booking.airline}</TableCell>
                        <TableCell>{booking.route}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{booking.finalPrice.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(booking.bookingTime)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            onClick={() => handleDownloadTicket(booking.pnr)}
                          >
                            Download Ticket
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
