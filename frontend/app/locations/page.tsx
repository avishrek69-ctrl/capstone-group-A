"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, AlertCircle, MapPin, Trash2,
  LayoutDashboard, CalendarDays, Star,
} from "lucide-react";

import { useAuthStore }  from "@/lib/stores/authStore";
import { useAppStore }   from "@/lib/stores/appStore";
import api               from "@/lib/api";
import LocationSearch    from "@/components/features/LocationSearch";
import { Button }        from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

//  Types 

interface FavouriteLocation {
  id:        string;
  name:      string;
  suburb:    string | null;
  latitude:  number;
  longitude: number;
}

//  Page 

export default function LocationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();

  const selectedLocation    = useAppStore((s) => s.selectedLocation);
  const setSelectedLocation = useAppStore((s) => s.setSelectedLocation);

  const [favourites,   setFavourites]   = useState<FavouriteLocation[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [deleting,     setDeleting]     = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<FavouriteLocation | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?from=/locations");
  }, [authLoading, user, router]);

  const loadFavourites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ favourites: FavouriteLocation[] }>("/locations/favourites");
      setFavourites(data.favourites);
    } catch {
      setError("Failed to load favourite locations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadFavourites();
  }, [user, loadFavourites]);

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    const { id } = confirmDelete;
    setDeleting(id);
    setConfirmDelete(null);
    try {
      await api.delete(`/locations/favourites/${id}`);
      setFavourites((prev) => prev.filter((f) => f.id !== id));
    } catch {
      setError("Failed to remove favourite. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const goToDashboard = (fav: FavouriteLocation) => {
    setSelectedLocation({
      display_name: fav.name,
      suburb:       fav.suburb,
      latitude:     fav.latitude,
      longitude:    fav.longitude,
    });
    router.push("/dashboard");
  };

  const goToPlanner = (fav: FavouriteLocation) => {
    setSelectedLocation({
      display_name: fav.name,
      suburb:       fav.suburb,
      latitude:     fav.latitude,
      longitude:    fav.longitude,
    });
    router.push("/planner");
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Favourite Locations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Save locations from the dashboard or planner, then jump straight to conditions here.
        </p>
      </div>

      {/* Add new — reuse LocationSearch + SaveFavouriteButton flow */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="mb-3 text-sm font-medium">Add a new favourite</p>
        <div className="flex gap-2">
          <LocationSearch className="flex-1" />
          <AddFromSearchButton key={`${selectedLocation?.latitude},${selectedLocation?.longitude}`} onAdded={loadFavourites} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading favourites…
        </div>
      )}

      {/* Empty state */}
      {!loading && favourites.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
          <Star className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-lg font-medium">No favourite locations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Search for a location above, or use the{" "}
            <span className="font-medium text-foreground">Save as Favourite</span> button on the
            dashboard or planner.
          </p>
        </div>
      )}

      {/* List */}
      {!loading && favourites.length > 0 && (
        <div className="space-y-3">
          {favourites.map((fav) => (
            <div
              key={fav.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              {/* Info */}
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{fav.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {fav.latitude.toFixed(4)}, {fav.longitude.toFixed(4)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToDashboard(fav)}
                  className="hidden gap-1.5 sm:flex"
                  title="Check today's conditions"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Conditions
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToPlanner(fav)}
                  className="hidden gap-1.5 sm:flex"
                  title="Open in planner"
                >
                  <CalendarDays className="h-4 w-4" />
                  Planner
                </Button>

                {/* Mobile icon-only buttons */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => goToDashboard(fav)}
                  className="sm:hidden"
                  title="Conditions"
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => goToPlanner(fav)}
                  className="sm:hidden"
                  title="Planner"
                >
                  <CalendarDays className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmDelete(fav)}
                  disabled={deleting === fav.id}
                  title="Remove favourite"
                >
                  {deleting === fav.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Trash2 className="h-4 w-4 text-red-500" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Favourite?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{confirmDelete?.name}</span> will be
              removed from your favourites. You can always add it back later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirmed}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function AddFromSearchButton({ onAdded }: { onAdded: () => void }) {
  const selectedLocation = useAppStore((s) => s.selectedLocation);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");


  const handleAdd = async () => {
    if (!selectedLocation || state === "saving" || state === "saved") return;
    setState("saving");
    try {
      await api.post("/locations/favourites", {
        name:      selectedLocation.suburb ?? selectedLocation.display_name.split(",")[0],
        latitude:  selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        suburb:    selectedLocation.suburb,
      });
      setState("saved");
      onAdded();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setState(status === 409 ? "saved" : "error");
      if (status !== 409) setTimeout(() => setState("idle"), 2500);
    }
  };

  return (
    <Button
      onClick={handleAdd}
      disabled={!selectedLocation || state === "saving" || state === "saved"}
      variant={state === "saved" ? "default" : "outline"}
      className="shrink-0"
    >
      {state === "saving" && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
      {state === "saving" ? "Saving…"
        : state === "saved"  ? "Saved ✓"
        : state === "error"  ? "Failed — retry"
        : "Save Location"}
    </Button>
  );
}
