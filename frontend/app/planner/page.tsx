"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CalendarDays } from "lucide-react";

import { useAuthStore }   from "@/lib/stores/authStore";
import { useAppStore }    from "@/lib/stores/appStore";
import api                from "@/lib/api";

import LocationSearch        from "@/components/features/LocationSearch";
import ForecastDayCard, { ForecastDay } from "@/components/features/ForecastDayCard";
import SuitabilityScoreCard  from "@/components/features/SuitabilityScoreCard";
import WeatherSummaryPanel   from "@/components/features/WeatherSummaryPanel";
import GoldenHourPanel       from "@/components/features/GoldenHourPanel";
import ConditionExplainer    from "@/components/features/ConditionExplainer";
import SaveFavouriteButton   from "@/components/features/SaveFavouriteButton";
import { Button }            from "@/components/ui/button";
import { Label }             from "@/components/ui/label";

//  Types 

interface ForecastResponse {
  location: { latitude: number; longitude: number };
  forecast: ForecastDay[];
}

interface FactorDetail { raw: number; weighted: number; label: string }

interface DayDetail {
  date:    string;
  score:   number;
  rating:  string;
  colour:  string;
  factors: Record<string, FactorDetail>;
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

const DAY_OPTIONS = [7, 10, 14];

// Component

export default function PlannerPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();

  const selectedLocation  = useAppStore((s) => s.selectedLocation);
  const setPendingShoot   = useAppStore((s) => s.setPendingShoot);

  const [days,         setDays]         = useState(7);
  const [forecast,     setForecast]     = useState<ForecastDay[]>([]);
  const [selectedDay,  setSelectedDay]  = useState<ForecastDay | null>(null);
  const [dayDetail,    setDayDetail]    = useState<DayDetail | null>(null);
  const [fetching,     setFetching]     = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?from=/planner");
  }, [authLoading, user, router]);

  // Fetch forecast
  const fetchForecast = useCallback(async () => {
    if (!selectedLocation) return;
    setFetching(true);
    setError(null);
    setForecast([]);
    setSelectedDay(null);
    setDayDetail(null);
    try {
      const { data } = await api.get<ForecastResponse>("/forecast", {
        params: {
          lat:  selectedLocation.latitude,
          lng:  selectedLocation.longitude,
          days,
        },
      });
      setForecast(data.forecast);
      // Auto-select the best day
      const best = [...data.forecast].sort((a, b) => b.score - a.score)[0];
      if (best) setSelectedDay(best);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch forecast.");
    } finally {
      setFetching(false);
    }
  }, [selectedLocation, days]);

  useEffect(() => {
    if (selectedLocation) fetchForecast();
  }, [selectedLocation, days, fetchForecast]);

  // Fetch full detail for selected day
  useEffect(() => {
    if (!selectedDay || !selectedLocation) return;
    const controller = new AbortController();

    (async () => {
      setDetailLoading(true);
      setDayDetail(null);
      try {
        const { data } = await api.get<DayDetail>("/conditions", {
          params: {
            lat:  selectedLocation.latitude,
            lng:  selectedLocation.longitude,
            date: selectedDay.date,
          },
          signal: controller.signal,
        });
        setDayDetail(data);
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== "CanceledError") {
          console.error("Failed to load day detail:", err);
        }
      } finally {
        setDetailLoading(false);
      }
    })();

    return () => controller.abort();
  }, [selectedDay, selectedLocation]);

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
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Shoot Planner</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare suitability across multiple days to find your best window.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label>Location</Label>
          <LocationSearch />
        </div>

        <div className="space-y-1.5">
          <Label>Forecast range</Label>
          <div className="flex gap-2">
            {DAY_OPTIONS.map((d) => (
              <Button
                key={d}
                variant={days === d ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(d)}
                className="w-16"
              >
                {d} days
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={fetchForecast} disabled={!selectedLocation || fetching} className="sm:self-end">
          {fetching ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </span>
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      {/* Empty state */}
      {!selectedLocation && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
          <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-lg font-medium">Search for a location to see the forecast</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Compare up to 14 days of photography conditions at once.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Could not load forecast</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Forecast grid */}
      {fetching && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Loader2 className="h-4 w-4 animate-spin" /> Fetching forecast…
        </div>
      )}

      {forecast.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7 mb-8">
            {forecast.map((day) => (
              <ForecastDayCard
                key={day.date}
                day={day}
                isSelected={selectedDay?.date === day.date}
                onClick={() => setSelectedDay(day)}
              />
            ))}
          </div>

          {/* Selected day detail */}
          {selectedDay && (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold">
                  Detail for{" "}
                  <span className="text-primary">
                    {new Date(`${selectedDay.date}T12:00:00Z`).toLocaleDateString("en", {
                      weekday: "long",
                      day:     "numeric",
                      month:   "long",
                    })}
                  </span>
                </h2>

                <div className="flex gap-2">
                  {selectedLocation && (
                    <SaveFavouriteButton location={selectedLocation} variant="outline" />
                  )}
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      if (!selectedLocation) return;
                      setPendingShoot({
                        location_name:     selectedLocation.suburb ?? selectedLocation.display_name.split(",")[0],
                        latitude:          selectedLocation.latitude,
                        longitude:         selectedLocation.longitude,
                        shoot_date:        selectedDay.date,
                        suitability_score: dayDetail?.score ?? selectedDay.score,
                      });
                      router.push("/shoots");
                    }}
                  >
                    Book this Shoot
                  </Button>
                </div>
              </div>

              {detailLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading detail…
                </div>
              )}

              {dayDetail && !detailLoading && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-stretch sm:col-span-1">
                    <SuitabilityScoreCard
                      score={dayDetail.score}
                      rating={dayDetail.rating}
                      colour={dayDetail.colour}
                      className="w-full"
                    />
                  </div>

                  <div className="sm:col-span-1 lg:col-span-2">
                    <WeatherSummaryPanel
                      temperature={Math.round((dayDetail.weather.temp_max + dayDetail.weather.temp_min) / 2)}
                      windSpeed={dayDetail.weather.wind_speed_max}
                      precipitationProb={dayDetail.weather.precipitation_probability_max}
                      cloudCover={dayDetail.weather.cloud_cover_avg ?? 0}
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-1">
                    <GoldenHourPanel sunInfo={dayDetail.sun} className="h-full" />
                  </div>

                  <div className="sm:col-span-2">
                    <ConditionExplainer factors={factorsToArray(dayDetail.factors)} />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
