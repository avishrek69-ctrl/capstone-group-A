"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, Loader2, Mail, MapPin, Search, UserRound } from "lucide-react";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/stores/authStore";

interface PhotographerBooking {
  id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  shoot_date: string;
  shoot_time: string | null;
  session_type: string;
  suitability_score: number | null;
  notes: string | null;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function PhotographerBookingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [bookings, setBookings] = useState<PhotographerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionTypeFilter, setSessionTypeFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/photographer/login");
    }

    if (!authLoading && user && !user.isPhotographer) {
      router.replace("/dashboard");
    }
  }, [authLoading, router, user]);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ shoots: PhotographerBooking[] }>("/shoots/photographer/bookings");
      setBookings(data.shoots);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to load booked sessions.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.isPhotographer) {
      loadBookings();
    }
  }, [loadBookings, user]);

  const sessionTypes = useMemo(
    () => Array.from(new Set(bookings.map((booking) => booking.session_type))).sort(),
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesQuery = !query || [
        booking.location_name,
        booking.user.name,
        booking.user.email,
        booking.notes ?? "",
      ].some((value) => value.toLowerCase().includes(query));

      const matchesSessionType = sessionTypeFilter === "all" || booking.session_type === sessionTypeFilter;

      return matchesQuery && matchesSessionType;
    });
  }, [bookings, searchTerm, sessionTypeFilter]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !user.isPhotographer) return null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500">Photographer Portal</p>
        <h1 className="text-3xl font-semibold tracking-tight">Booked Customer Sessions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review every customer booking in one place.
        </p>
      </div>

      <section className="mb-6 grid gap-4 rounded-2xl border border-border bg-card p-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
        <div className="space-y-1.5">
          <label htmlFor="booking-search" className="text-sm font-medium">Search bookings</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="booking-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by customer, email, location, or notes"
              className="h-10 pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="session-type-filter" className="text-sm font-medium">Session type</label>
          <select
            id="session-type-filter"
            value={sessionTypeFilter}
            onChange={(event) => setSessionTypeFilter(event.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="all">All session types</option>
            {sessionTypes.map((sessionType) => (
              <option key={sessionType} value={sessionType}>{sessionType}</option>
            ))}
          </select>
        </div>
      </section>

      {error && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading booked sessions…
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <h2 className="text-lg font-medium">No customer sessions booked yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            New customer bookings will appear here as soon as they are created.
          </p>
        </div>
      )}

      {!loading && bookings.length > 0 && filteredBookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <h2 className="text-lg font-medium">No bookings match those filters</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different search term or reset the session type filter.
          </p>
        </div>
      )}

      {!loading && filteredBookings.length > 0 && (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const dateLabel = new Date(`${booking.shoot_date.split("T")[0]}T12:00:00Z`).toLocaleDateString([], {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <section key={booking.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">{booking.location_name}</h2>
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                          {booking.session_type}
                        </span>
                        {booking.suitability_score !== null && (
                          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                            Score {booking.suitability_score}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" /> {dateLabel}
                        </span>
                        {booking.shoot_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" /> {booking.shoot_time}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {booking.latitude.toFixed(4)}, {booking.longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="max-w-3xl text-sm text-muted-foreground">{booking.notes}</p>
                    )}
                  </div>

                  <aside className="min-w-72 rounded-xl border border-border bg-muted/30 p-4">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      Customer
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 font-medium">
                        <UserRound className="h-4 w-4 text-amber-500" /> {booking.user.name}
                      </p>
                      <p className="flex items-center gap-2 text-muted-foreground break-all">
                        <Mail className="h-4 w-4 text-amber-500" /> {booking.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Booked on {new Date(booking.created_at).toLocaleString()}
                      </p>
                    </div>
                  </aside>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}