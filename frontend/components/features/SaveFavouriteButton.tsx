"use client";

import { useState } from "react";
import { Heart, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface SaveFavouriteButtonProps {
  location: {
    display_name: string;
    suburb:       string | null;
    latitude:     number;
    longitude:    number;
  };
  className?: string;
  variant?:   "default" | "outline" | "ghost";
}

type State = "idle" | "saving" | "saved" | "error";

export default function SaveFavouriteButton({
  location,
  className,
  variant = "outline",
}: SaveFavouriteButtonProps) {
  const [state, setState] = useState<State>("idle");

  const handleSave = async () => {
    if (state === "saving" || state === "saved") return;
    setState("saving");
    try {
      await api.post("/locations/favourites", {
        name:      location.suburb ?? location.display_name.split(",")[0],
        latitude:  location.latitude,
        longitude: location.longitude,
        suburb:    location.suburb,
      });
      setState("saved");
    } catch (err: unknown) {
      // 409 = already a favourite
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setState("saved");
      } else {
        setState("error");
        setTimeout(() => setState("idle"), 2500);
      }
    }
  };

  return (
    <Button
      variant={state === "saved" ? "default" : variant}
      size="sm"
      onClick={handleSave}
      disabled={state === "saving" || state === "saved"}
      className={cn("gap-1.5", className)}
    >
      {state === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
      {state === "saved"  && <Check  className="h-4 w-4" />}
      {(state === "idle" || state === "error") && (
        <Heart className={cn("h-4 w-4", state === "error" && "text-red-500")} />
      )}
      {state === "saving" && "Saving…"}
      {state === "saved"  && "Saved"}
      {state === "idle"   && "Save as Favourite"}
      {state === "error"  && "Failed — retry"}
    </Button>
  );
}
