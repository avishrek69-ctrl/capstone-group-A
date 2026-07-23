"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, Camera, Loader2, MapPin, Users } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/authStore";

interface PhotographerBooking {
  id: string;
  location_name: string;
  shoot_date: string;
  session_type: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function PhotographerDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [bookings, setBookings] = useState<PhotographerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        ?? "Failed to load dashboard bookings.";
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

  const metrics = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const uniqueCustomers = new Set(bookings.map((booking) => booking.user.id)).size;
    const upcoming = bookings.filter((booking) => booking.shoot_date.slice(0, 10) >= todayKey);
    const nextBooking = upcoming[0] ?? null;

    return {
      totalBookings: bookings.length,
      uniqueCustomers,
      upcomingCount: upcoming.length,
      nextBooking,
    };
  }, [bookings]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !user.isPhotographer) return null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500">Photographer Portal</p>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track customer bookings and upcoming sessions at a glance.
          </p>
        </div>
        <Button asChild>
          <Link href="/photographer/bookings" className="flex items-center gap-2">
            View all booked sessions
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading dashboard…
        </div>
      )}

      {!loading && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
                <Camera className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">Total bookings</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{metrics.totalBookings}</p>
            </article>

            <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">Unique customers</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{metrics.uniqueCustomers}</p>
            </article>

            <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
                <CalendarDays className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">Upcoming sessions</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{metrics.upcomingCount}</p>
            </article>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Latest bookings</h2>
                  <p className="text-sm text-muted-foreground">Most recent customer session requests.</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/photographer/bookings">Open list</Link>
                </Button>
              </div>

              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{booking.location_name}</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{booking.session_type}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{booking.user.name} · {booking.user.email}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{new Date(`${booking.shoot_date.slice(0, 10)}T12:00:00Z`).toLocaleDateString()}</p>
                  </div>
                ))}

                {bookings.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground">No bookings available yet.</p>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Next session</h2>
              <p className="mt-1 text-sm text-muted-foreground">Your nearest upcoming customer booking.</p>

              {metrics.nextBooking ? (
                <div className="mt-5 rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-lg font-semibold">{metrics.nextBooking.location_name}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{metrics.nextBooking.user.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{metrics.nextBooking.user.email}</p>
                  <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 text-amber-500" />
                    {new Date(`${metrics.nextBooking.shoot_date.slice(0, 10)}T12:00:00Z`).toLocaleDateString([], {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-amber-500" /> {metrics.nextBooking.session_type}
                  </p>
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                  No upcoming sessions yet.
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </main>
  );
}
