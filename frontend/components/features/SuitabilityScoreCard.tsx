"use client";

import { cn } from "@/lib/utils";
import ScoreBadge from "./ScoreBadge";

interface SuitabilityScoreCardProps {
  score: number;
  rating: string;
  colour: string;
  className?: string;
}

function getRingColour(colour: string) {
  const map: Record<string, string> = {
    green:  "stroke-green-500",
    blue:   "stroke-blue-500",
    amber:  "stroke-amber-500",
    orange: "stroke-orange-500",
    red:    "stroke-red-500",
  };
  return map[colour] ?? map.red;
}

function getGlowColour(colour: string) {
  const map: Record<string, string> = {
    green:  "drop-shadow-[0_0_12px_rgba(34,197,94,0.45)]",
    blue:   "drop-shadow-[0_0_12px_rgba(59,130,246,0.45)]",
    amber:  "drop-shadow-[0_0_12px_rgba(245,158,11,0.45)]",
    orange: "drop-shadow-[0_0_12px_rgba(249,115,22,0.45)]",
    red:    "drop-shadow-[0_0_12px_rgba(239,68,68,0.45)]",
  };
  return map[colour] ?? map.red;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function SuitabilityScoreCard({
  score,
  rating,
  colour,
  className,
}: SuitabilityScoreCardProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const dashOffset   = CIRCUMFERENCE - (clampedScore / 100) * CIRCUMFERENCE;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 shadow-sm",
        className
      )}
    >
      <p className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Suitability Score
      </p>

      {/* Circular progress ring */}
      <div className="relative flex items-center justify-center">
        <svg
          width="144"
          height="144"
          viewBox="0 0 144 144"
          className={cn("rotate-[-90deg]", getGlowColour(colour))}
        >
          {/* Track */}
          <circle
            cx="72"
            cy="72"
            r={RADIUS}
            fill="none"
            strokeWidth="10"
            className="stroke-muted"
          />
          {/* Progress */}
          <circle
            cx="72"
            cy="72"
            r={RADIUS}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className={cn("transition-all duration-700", getRingColour(colour))}
          />
        </svg>

        {/* Score number in the centre */}
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-bold tabular-nums leading-none">
            {clampedScore}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">/100</span>
        </div>
      </div>

      <div className="mt-4">
        <ScoreBadge rating={rating} colour={colour} size="lg" />
      </div>
    </div>
  );
}
