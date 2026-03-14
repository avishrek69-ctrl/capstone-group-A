"use client";

import { cn } from "@/lib/utils";

interface Factor {
  name:   string;
  score:  number;
  weight: number;
  label?: string;
}

interface ConditionExplainerProps {
  factors:    Factor[];
  className?: string;
}

const FACTOR_ICONS: Record<string, string> = {
  golden_hour: "🌅",
  cloud_cover:           "☁️",
  precipitation:         "🌧",
  wind_speed:            "💨",
  temperature:           "🌡",
};

const FACTOR_LABELS: Record<string, string> = {
  golden_hour: "Golden Hour Alignment",
  cloud_cover:           "Cloud Cover",
  precipitation:         "Precipitation",
  wind_speed:            "Wind Speed",
  temperature:           "Temperature",
};

function barColour(score: number) {
  if (score >= 85) return "bg-green-500";
  if (score >= 65) return "bg-blue-500";
  if (score >= 45) return "bg-amber-500";
  if (score >= 25) return "bg-orange-500";
  return "bg-red-500";
}

export default function ConditionExplainer({ factors, className }: ConditionExplainerProps) {
   console.log(factors);
   console.log(className);
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-sm", className)}>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Score Breakdown
      </h3>

      <div className="space-y-4">
        {factors && factors.map((factor) => {
          const key   = factor.name.toLowerCase().replace(/ /g, "_");
          const icon  = FACTOR_ICONS[key] ?? "📊";
          const label = FACTOR_LABELS[key] ?? factor.name;
          const pct   = Math.round(Math.min(100, Math.max(0, factor.score)));
          const weightLabel = `${Math.round(factor.weight * 100)}% weight`;

          return (
            <div key={factor.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium">
                  <span>{icon}</span>
                  {label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{weightLabel}</span>
                  <span className="w-8 text-right tabular-nums font-semibold">{pct}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    barColour(pct)
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {factor.label && (
                <p className="text-xs text-muted-foreground">{factor.label}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
