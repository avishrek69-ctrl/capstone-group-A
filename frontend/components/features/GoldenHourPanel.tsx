"use client";

import { Sunrise, Sunset, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en", {
      hour:   "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

interface SunTimes {
  sunrise:             string;
  sunset:              string;
  golden_hour_morning: { start: string; end: string } | null;
  golden_hour_evening: { start: string; end: string } | null;
  blue_hour_morning:   { start: string; end: string } | null;
  blue_hour_evening:   { start: string; end: string } | null;
}

interface GoldenHourPanelProps {
  sunInfo:    SunTimes;
  className?: string;
}

function TimeRow({
  icon,
  label,
  time,
  accent,
}: {
  icon:    React.ReactNode;
  label:   string;
  time:    string;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className={cn("flex items-center gap-2 text-sm", accent)}>
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-medium tabular-nums text-sm">{time}</span>
    </div>
  );
}

function WindowRow({
  icon,
  label,
  window,
  accent,
}: {
  icon:   React.ReactNode;
  label:  string;
  window: { start: string; end: string } | null;
  accent?: string;
}) {
  if (!window) return null;
  return (
    <div className="flex items-center justify-between">
      <div className={cn("flex items-center gap-2 text-sm", accent)}>
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-medium tabular-nums text-sm">
        {fmt(window.start)} – {fmt(window.end)}
      </span>
    </div>
  );
}

export default function GoldenHourPanel({ sunInfo, className }: GoldenHourPanelProps) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-sm", className)}>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Sun &amp; Golden Hour
      </h3>

      <div className="space-y-3">
        {/* Sunrise / Sunset */}
        <TimeRow
          icon={<Sunrise className="h-4 w-4 text-amber-500" />}
          label="Sunrise"
          time={fmt(sunInfo.sunrise)}
          accent="text-amber-600 dark:text-amber-400"
        />
        <TimeRow
          icon={<Sunset className="h-4 w-4 text-orange-500" />}
          label="Sunset"
          time={fmt(sunInfo.sunset)}
          accent="text-orange-600 dark:text-orange-400"
        />

        <div className="my-1 border-t border-border" />

        {/* Morning windows */}
        <WindowRow
          icon={<Sun className="h-4 w-4 text-yellow-400" />}
          label="Golden Hour (morning)"
          window={sunInfo.golden_hour_morning}
          accent="text-yellow-600 dark:text-yellow-400"
        />
        <WindowRow
          icon={<Sun className="h-4 w-4 text-sky-400" />}
          label="Blue Hour (morning)"
          window={sunInfo.blue_hour_morning}
          accent="text-sky-600 dark:text-sky-400"
        />

        {/* Evening windows */}
        <WindowRow
          icon={<Sun className="h-4 w-4 text-yellow-400" />}
          label="Golden Hour (evening)"
          window={sunInfo.golden_hour_evening}
          accent="text-yellow-600 dark:text-yellow-400"
        />
        <WindowRow
          icon={<Sun className="h-4 w-4 text-sky-400" />}
          label="Blue Hour (evening)"
          window={sunInfo.blue_hour_evening}
          accent="text-sky-600 dark:text-sky-400"
        />
      </div>
    </div>
  );
}
