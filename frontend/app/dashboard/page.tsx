"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, Loader2, AlertCircle } from "lucide-react";

import { useAuthStore } from "@/lib/stores/authStore";
import { useAppStore }  from "@/lib/stores/appStore";
import api              from "@/lib/api";

import LocationSearch        from "@/components/features/LocationSearch";
import SuitabilityScoreCard  from "@/components/features/SuitabilityScoreCard";
import WeatherSummaryPanel   from "@/components/features/WeatherSummaryPanel";
import GoldenHourPanel       from "@/components/features/GoldenHourPanel";
import ConditionExplainer    from "@/components/features/ConditionExplainer";
import SaveFavouriteButton   from "@/components/features/SaveFavouriteButton";
import { Button }            from "@/components/ui/button";
import { Input }             from "@/components/ui/input";
import { Label }             from "@/components/ui/label";

// Types 

interface FactorDetail {
  raw:      number;
  weighted: number;
  label:    string;
}

interface ConditionsResponse {
  date:     string;
  location: { latitude: number; longitude: number };
  score:    number;
  rating:   string;
  colour:   string;
  factors:  Record<string, FactorDetail>;
  weather: {
    temp_max:                      number;
    temp_min:                      number;
    precipitation_probability_max: number;
    wind_speed_max:                number;
    cloud_cover_avg:               number | null;
  };
  sun: {
    sunrise:             string;
    sunset:              string;
    golden_hour_morning: { start: string; end: string } | null;
    golden_hour_evening: { start: string; end: string } | null;
    blue_hour_morning:   { start: string; end: string } | null;
    blue_hour_evening:   { start: string; end: string } | null;
  };
}

const FACTOR_WEIGHTS: Record<string, number> = {
  golden_hour:   0.25,
  cloud_cover:   0.20,
  precipitation: 0.25,
  wind_speed:    0.15,
  temperature:   0.15,
};

function factorsToArray(factors: Record<string, FactorDetail>) {
  return Object.entries(factors).map(([name, detail]) => ({
    name,
    score:  detail.raw,
    weight: FACTOR_WEIGHTS[name] ?? 0,
    label:  detail.label,
  }));
}

export default function DashboardPage() {
  const router       = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();

  const selectedLocation = useAppStore((s) => s.selectedLocation);
  const selectedDate     = useAppStore((s) => s.selectedDate);
  const setSelectedDate  = useAppStore((s) => s.setSelectedDate);

  const [shootTime,  setShootTime]  = useState("");
  const [conditions, setConditions] = useState<ConditionsResponse | null>(null);
  const [fetching,   setFetching]   = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // Auth guard: redirect to /login if not authenticated once hydration is done
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?from=/dashboard");
    }
  }, [authLoading, user, router]);

  const fetchConditions = useCallback(async () => {
    if (!selectedLocation) return;
    setFetching(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        lat:  String(selectedLocation.latitude),
        lng:  String(selectedLocation.longitude),
        date: selectedDate,
      };
      if (shootTime) params.time = shootTime;

      const { data } = await api.get<ConditionsResponse>("/conditions", { params });
      setConditions(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to fetch conditions. Please try again.";
      setError(msg);
    } finally {
      setFetching(false);
    }
  }, [selectedLocation, selectedDate, shootTime]);

  // Auto-fetch whenever location, date, or shoot time changes
  useEffect(() => {
    if (selectedLocation) {
      fetchConditions();
    }
  }, [selectedLocation, selectedDate, shootTime, fetchConditions]);

  // Loading skeleton while auth hydrates
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null; 

  // Render

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Photography Planner</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, <span className="font-medium text-foreground">{user.name}</span>. Check
          conditions for your next shoot.
        </p>
      </div>

      {/* Controls row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label>Location</Label>
          <div className="flex gap-2">
            <LocationSearch className="flex-1" />
            {selectedLocation && (
              <SaveFavouriteButton location={selectedLocation} className="shrink-0 sm:self-end" />
            )}
          </div>
        </div>

        <div className="space-y-1.5 sm:w-44">
          <Label htmlFor="shoot-date">Date</Label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="shoot-date"
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5 sm:w-36">
          <Label htmlFor="shoot-time">
            Shoot Time{" "}
            <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          </Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="shoot-time"
              type="time"
              value={shootTime}
              onChange={(e) => setShootTime(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Button
          onClick={fetchConditions}
          disabled={!selectedLocation || fetching}
          className="sm:self-end"
        >
          {fetching ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking…
            </span>
          ) : (
            "Check Conditions"
          )}
        </Button>
      </div>

      {/* Empty state */}
      {!selectedLocation && !conditions && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
          <p className="text-lg font-medium">Search for a location to get started</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter a suburb, city or postcode above to see photography conditions.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Could not load conditions</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Fetching spinner overlay for subsequent fetches */}
      {fetching && conditions && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Updating conditions…
        </div>
      )}

      {/* Results grid */}
      {conditions && !fetching && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Score card — full width on mobile, 1 col on lg */}
          <div className="flex items-stretch sm:col-span-1">
            <SuitabilityScoreCard
              score={conditions.score}
              rating={conditions.rating}
              colour={conditions.colour}
              className="w-full"
            />
          </div>

          {/* Weather panel — spans 2 cols on lg */}
          <div className="sm:col-span-1 lg:col-span-2">
            <WeatherSummaryPanel
              temperature={Math.round((conditions.weather.temp_max + conditions.weather.temp_min) / 2)}
              windSpeed={conditions.weather.wind_speed_max}
              precipitationProb={conditions.weather.precipitation_probability_max}
              cloudCover={conditions.weather.cloud_cover_avg ?? 0}
            />
          </div>

          {/* Golden hour — full row on sm, half on lg */}
          <div className="sm:col-span-2 lg:col-span-1">
            <GoldenHourPanel sunInfo={conditions.sun} className="h-full" />
          </div>

          {/* Score breakdown — takes remaining space */}
          <div className="sm:col-span-2">
            <ConditionExplainer factors={factorsToArray(conditions.factors)} />
          </div>
        </div>
      )}
    </main>
  );
}
