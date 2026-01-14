"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Flight {
  flightId: string;
  airline: string;
  departureCity: string;
  arrivalCity: string;
  currentPrice: number;
}

interface BookingResponse {
  success: boolean;
  message: string;
  data?: {
    booking: {
      pnr: string;
      passengerName: string;
      flightId: string;
      airline: string;
      route: string;
      finalPrice: number;
    };
    wallet: {
      currentBalance: number;
      deducted: number;
    };
  };
  error?: string;
}

export default function Home() {
  const [departureCity, setDepartureCity] = useState("");
  const [arrivalCity, setArrivalCity] = useState("");
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // Booking dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [passengerName, setPassengerName] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<BookingResponse["data"] | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const params = new URLSearchParams();
      if (departureCity) params.append("departureCity", departureCity);
      if (arrivalCity) params.append("arrivalCity", arrivalCity);

      const response = await fetch(
        `http://localhost:5000/api/flights?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch flights");
      }

      const data = await response.json();
      setFlights(data.data || []);
    } catch (err) {
      setError("Failed to load flights. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openBookingDialog = (flight: Flight) => {
    setSelectedFlight(flight);
    setIsDialogOpen(true);
    setBookingError("");
    setBookingSuccess(null);
    setPassengerName("");
  };

  const handleBooking = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFlight || !passengerName.trim()) {
      setBookingError("Please enter passenger name");
      return;
    }

    setBookingLoading(true);
    setBookingError("");

    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          passengerName: passengerName.trim(),
          flightId: selectedFlight.flightId,
        }),
      });

      const data: BookingResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Booking failed");
      }

      setBookingSuccess(data.data || null);
    } catch (err: any) {
      setBookingError(err.message || "Failed to create booking. Please try again.");
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleDownloadTicket = (pnr: string) => {
    window.open(`http://localhost:5000/api/tickets/${pnr}`, "_blank");
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedFlight(null);
    setPassengerName("");
    setBookingError("");
    setBookingSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Flight Booking</h1>
            <nav className="flex gap-6">
              <Link href="/" className="text-blue-600 font-medium">
                Search Flights
              </Link>
              <Link href="/history" className="text-gray-600 hover:text-gray-900">
                Booking History
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            Find Your Next Flight
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search and book flights with real-time pricing
          </p>
        </div>

        <Card className="max-w-3xl mx-auto mb-16 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Search Flights</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="departure" className="text-sm font-semibold text-gray-700">
                    Departure City
                  </label>
                  <Input
                    id="departure"
                    placeholder="e.g., Delhi"
                    value={departureCity}
                    onChange={(e) => setDepartureCity(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="arrival" className="text-sm font-semibold text-gray-700">
                    Arrival City
                  </label>
                  <Input
                    id="arrival"
                    placeholder="e.g., Mumbai"
                    value={arrivalCity}
                    onChange={(e) => setArrivalCity(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Searching...
                  </span>
                ) : (
                  "Search Flights"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="max-w-3xl mx-auto mb-12">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600 text-center font-medium">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-3 text-gray-600">
              <span className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
              <span className="text-base">Loading flights...</span>
            </div>
          </div>
        )}

        {!loading && searched && flights.length === 0 && !error && (
          <div className="text-center py-16">
            <p className="text-gray-900 text-xl font-semibold mb-2">No flights found</p>
            <p className="text-gray-500 text-base">
              Try adjusting your search criteria
            </p>
          </div>
        )}

        {!loading && flights.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-gray-900">
                Available Flights
              </h3>
              <p className="text-gray-600 mt-1">{flights.length} flights found</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flights.map((flight) => (
                <Card key={flight.flightId} className="hover:shadow-xl transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">{flight.airline}</CardTitle>
                    <p className="text-sm text-gray-500 font-medium">
                      Flight {flight.flightId}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">
                        Route
                      </p>
                      <p className="font-semibold text-gray-900">
                        {flight.departureCity} → {flight.arrivalCity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">
                        Price
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-blue-600">
                          ₹{flight.currentPrice.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4">
                    <Button 
                      className="w-full h-11" 
                      onClick={() => openBookingDialog(flight)}
                    >
                      Book Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Booking Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bookingSuccess ? "Booking Confirmed!" : "Book Flight"}
            </DialogTitle>
            <DialogDescription>
              {bookingSuccess
                ? "Your flight has been successfully booked"
                : "Enter your details to complete the booking"}
            </DialogDescription>
          </DialogHeader>

          {!bookingSuccess ? (
            <form onSubmit={handleBooking} className="space-y-4">
              {selectedFlight && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Flight</span>
                    <span className="font-medium">{selectedFlight.flightId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Airline</span>
                    <span className="font-medium">{selectedFlight.airline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Route</span>
                    <span className="font-medium">
                      {selectedFlight.departureCity} → {selectedFlight.arrivalCity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price</span>
                    <span className="font-bold text-blue-600">
                      ₹{selectedFlight.currentPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="passengerName" className="text-sm font-medium">
                  Passenger Name *
                </label>
                <Input
                  id="passengerName"
                  placeholder="Enter full name"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  disabled={bookingLoading}
                  required
                />
              </div>


              {bookingError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{bookingError}</p>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                  disabled={bookingLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={bookingLoading}>
                  {bookingLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Booking...
                    </span>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">PNR</span>
                  <span className="font-bold text-lg">{bookingSuccess.booking.pnr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Passenger</span>
                  <span className="font-medium">{bookingSuccess.booking.passengerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Flight</span>
                  <span className="font-medium">{bookingSuccess.booking.flightId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount Paid</span>
                  <span className="font-bold text-green-600">
                    ₹{bookingSuccess.booking.finalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Wallet Balance</span>
                  <span className="font-medium">
                    ₹{bookingSuccess.wallet.currentBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-col gap-2">
                <Button
                  onClick={() => handleDownloadTicket(bookingSuccess.booking.pnr)}
                  className="w-full"
                >
                  Download Ticket
                </Button>
                <Button
                  variant="outline"
                  onClick={closeDialog}
                  className="w-full"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

