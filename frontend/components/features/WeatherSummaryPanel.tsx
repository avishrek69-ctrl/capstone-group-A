"use client";

import { Thermometer, Wind, CloudRain, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherSummaryPanelProps {
  temperature:          number;   // °C
  windSpeed:            number;   // km/h
  precipitationProb:    number;   // %
  cloudCover:           number;   // %
  className?: string;
}

interface StatTileProps {
  icon:    React.ReactNode;
  label:   string;
  value:   string;
  sub?:    string;
  accent?: string;
}

function StatTile({ icon, label, value, sub, accent }: StatTileProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", accent)}>
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums leading-none">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function getWindLabel(kmh: number) {
  if (kmh <= 15) return "Calm — ideal";
  if (kmh <= 25) return "Light — tolerable";
  if (kmh <= 40) return "Moderate — tricky";
  return "Strong — difficult";
}

function getRainLabel(prob: number) {
  if (prob <= 10) return "Very unlikely";
  if (prob <= 30) return "Slight chance";
  if (prob <= 60) return "Possible";
  return "Likely — plan backup";
}

function getCloudLabel(pct: number) {
  if (pct < 20) return "Clear — harsh light";
  if (pct <= 60) return "Partial — great for portraits";
  if (pct <= 85) return "Overcast — soft light";
  return "Heavy overcast";
}

export default function WeatherSummaryPanel({
  temperature,
  windSpeed,
  precipitationProb,
  cloudCover,
  className,
}: WeatherSummaryPanelProps) {
  return (
    <div className={cn("", className)}>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Weather Summary
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <StatTile
          icon={<Thermometer className="h-4 w-4" />}
          label="Temperature"
          value={`${temperature}°C`}
          sub={
            temperature >= 18 && temperature <= 28
              ? "Comfortable range"
              : temperature < 18
              ? "Cool — dress warm"
              : "Hot — hydrate well"
          }
        />
        <StatTile
          icon={<Wind className="h-4 w-4" />}
          label="Wind Speed"
          value={`${windSpeed} km/h`}
          sub={getWindLabel(windSpeed)}
          accent={windSpeed > 40 ? "text-orange-500" : undefined}
        />
        <StatTile
          icon={<CloudRain className="h-4 w-4" />}
          label="Rain Chance"
          value={`${precipitationProb}%`}
          sub={getRainLabel(precipitationProb)}
          accent={precipitationProb > 60 ? "text-red-500" : undefined}
        />
        <StatTile
          icon={<Cloud className="h-4 w-4" />}
          label="Cloud Cover"
          value={`${cloudCover}%`}
          sub={getCloudLabel(cloudCover)}
        />
      </div>
    </div>
  );
}
