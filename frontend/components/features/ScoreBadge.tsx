import { cn } from "@/lib/utils";

export interface ScoreBadgeProps {
  rating: string;
  colour: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colourMap: Record<string, string> = {
  green:  "bg-green-100  text-green-800  border-green-200  dark:bg-green-950/40  dark:text-green-300  dark:border-green-800",
  blue:   "bg-blue-100   text-blue-800   border-blue-200   dark:bg-blue-950/40   dark:text-blue-300   dark:border-blue-800",
  amber:  "bg-amber-100  text-amber-800  border-amber-200  dark:bg-amber-950/40  dark:text-amber-300  dark:border-amber-800",
  orange: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
  red:    "bg-red-100    text-red-800    border-red-200    dark:bg-red-950/40    dark:text-red-300    dark:border-red-800",
};

const dotMap: Record<string, string> = {
  green:  "bg-green-500",
  blue:   "bg-blue-500",
  amber:  "bg-amber-500",
  orange: "bg-orange-500",
  red:    "bg-red-500",
};

const sizeMap = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-2.5 py-1 text-sm gap-1.5",
  lg: "px-3 py-1.5 text-base gap-2",
};

const dotSizeMap = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
};

export default function ScoreBadge({
  rating,
  colour,
  size = "md",
  className,
}: ScoreBadgeProps) {
  const colourClass = colourMap[colour] ?? colourMap.red;
  const dotClass   = dotMap[colour]    ?? dotMap.red;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        colourClass,
        sizeMap[size],
        className
      )}
    >
      <span className={cn("rounded-full", dotClass, dotSizeMap[size])} />
      {rating}
    </span>
  );
}
