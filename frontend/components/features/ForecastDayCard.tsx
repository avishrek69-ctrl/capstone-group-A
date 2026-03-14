"use client";

import { Thermometer, Wind, CloudRain, Sunrise } from "lucide-react";
import { cn } from "@/lib/utils";
import ScoreBadge from "./ScoreBadge";

export interface ForecastDay {
  date:                          string;
  condition:                     string;
  temp_max:                      number;
  temp_min:                      number;
  precipitation_probability_max: number;
  wind_speed_max:                number;
  sunrise:                       string;
  sunset:                        string;
  score:                         number;
  rating:                        string;
  colour:                        string;
}

interface ForecastDayCardProps {
  day:        ForecastDay;
  isSelected: boolean;
  onClick:    () => void;
}

const RING_RADIUS = 28;
const RING_CIRC   = 2 * Math.PI * RING_RADIUS;

const ringColour: Record<string, string> = {
  green:  "stroke-green-500",
  blue:   "stroke-blue-500",
  amber:  "stroke-amber-500",
  orange: "stroke-orange-500",
  red:    "stroke-red-500",
};

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return iso;
  }
}

function fmtDate(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return {
    day:     d.toLocaleDateString("en", { weekday: "short" }),
    date:    d.toLocaleDateString("en", { day: "numeric", month: "short" }),
    isToday: dateStr === new Date().toISOString().split("T")[0],
  };
}

export default function ForecastDayCard({ day, isSelected, onClick }: ForecastDayCardProps) {
  const { day: weekday, date, isToday } = fmtDate(day.date);
  const dashOffset = RING_CIRC - (Math.min(100, Math.max(0, day.score)) / 100) * RING_CIRC;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col items-center gap-3 rounded-2xl border p-4 text-left transition-all",
        isSelected
          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary"
          : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
      )}
    >
      {/* Date header */}
      <div className="text-center">
        <p className={cn("text-xs font-semibold uppercase tracking-wider", isToday ? "text-primary" : "text-muted-foreground")}>
          {isToday ? "Today" : weekday}
        </p>
        <p className="text-sm font-medium">{date}</p>
      </div>

      {/* Score ring */}
      <div className="relative flex items-center justify-center">
        <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
          <circle cx="36" cy="36" r={RING_RADIUS} fill="none" strokeWidth="6" className="stroke-muted" />
          <circle
            cx="36" cy="36" r={RING_RADIUS} fill="none" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={RING_CIRC}
            strokeDashoffset={dashOffset}
            className={cn("transition-all duration-500", ringColour[day.colour] ?? ringColour.red)}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-lg font-bold tabular-nums leading-none">{day.score}</span>
        </div>
      </div>

      {/* Rating badge */}
      <ScoreBadge rating={day.rating} colour={day.colour} size="sm" />

      {/* Condition */}
      <p className="text-center text-xs text-muted-foreground line-clamp-1">{day.condition}</p>

      {/* Stats */}
      <div className="w-full space-y-1.5 border-t border-border pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Thermometer className="h-3 w-3" /> Temp
          </span>
          <span className="font-medium">{day.temp_min}–{day.temp_max}°C</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Wind className="h-3 w-3" /> Wind
          </span>
          <span className="font-medium">{day.wind_speed_max} km/h</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <CloudRain className="h-3 w-3" /> Rain
          </span>
          <span className="font-medium">{day.precipitation_probability_max}%</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Sunrise className="h-3 w-3" /> Sunrise
          </span>
          <span className="font-medium">{fmt(day.sunrise)}</span>
        </div>
      </div>
    </button>
  );
}
