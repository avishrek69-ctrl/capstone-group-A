"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus, Pencil, Trash2, Loader2, AlertCircle,
  Camera, MapPin, CalendarDays, Clock, StickyNote, X,
} from "lucide-react";

import { useAuthStore }   from "@/lib/stores/authStore";
import { useAppStore }    from "@/lib/stores/appStore";
import api                from "@/lib/api";
import ScoreBadge         from "@/components/features/ScoreBadge";
import { Button }         from "@/components/ui/button";
import { Input }          from "@/components/ui/input";
import { Label }          from "@/components/ui/label";

// Constants

const SESSION_TYPES = [
  "Maternity", "Newborn", "Birth", "Family",
  "Portrait",  "Engagement", "Wedding", "Other",
];

const SCORE_THRESHOLDS = [
  { min: 85, rating: "Excellent", colour: "green"  },
  { min: 65, rating: "Good",      colour: "blue"   },
  { min: 45, rating: "Acceptable",colour: "amber"  },
  { min: 25, rating: "Poor",      colour: "orange" },
  { min: 0,  rating: "Unsuitable",colour: "red"    },
];

function getRating(score: number | null) {
  if (score === null || score === undefined) return null;
  return SCORE_THRESHOLDS.find((t) => score >= t.min) ?? SCORE_THRESHOLDS[SCORE_THRESHOLDS.length - 1];
}

// Types

interface ShootSession {
  id:                string;
  location_name:     string;
  latitude:          number;
  longitude:         number;
  shoot_date:        string;
  shoot_time:        string | null;
  session_type:      string;
  suitability_score: number | null;
  notes:             string | null;
  created_at:        string;
}

// Form schema

const schema = z.object({
  location_name: z.string().min(1, "Location name is required"),
  latitude:      z.number({ message: "Required" }).finite(),
  longitude:     z.number({ message: "Required" }).finite(),
  shoot_date:    z.string().min(1, "Date is required"),
  shoot_time:    z.string().optional(),
  session_type:  z.string().min(1, "Session type is required"),
  notes:         z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

// Shoot Form Modal

type ModalState = Partial<FormValues> & { id?: string; suitability_score?: number };

function ShootFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial:  ModalState;
  onClose:  () => void;
  onSaved:  (shoot: ShootSession) => void;
}) {
  const isEdit = Boolean(initial.id);
  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      location_name: initial.location_name ?? "",
      latitude:      initial.latitude,
      longitude:     initial.longitude,
      shoot_date:    initial.shoot_date ?? new Date().toISOString().split("T")[0],
      shoot_time:    initial.shoot_time ?? "",
      session_type:  initial.session_type ?? "",
      notes:         initial.notes ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      shoot_time:        values.shoot_time || null,
      notes:             values.notes      || null,
      suitability_score: initial.suitability_score ?? null,
    };
    if (isEdit) {
      const { data } = await api.put<{ shoot: ShootSession }>(`/shoots/${initial.id}`, payload);
      onSaved(data.shoot);
    } else {
      const { data } = await api.post<{ shoot: ShootSession }>("/shoots", payload);
      onSaved(data.shoot);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-semibold">{isEdit ? "Edit Shoot" : "Book a Shoot"}</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          {/* Location name */}
          <div className="space-y-1.5">
            <Label htmlFor="location_name">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="location_name" {...register("location_name")} className="pl-9" placeholder="e.g. Bondi Beach" />
            </div>
            {errors.location_name && <p className="text-xs text-red-500">{errors.location_name.message}</p>}
          </div>

          {/* Lat / Lng */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="latitude">Latitude</Label>
              <Input id="latitude" type="number" step="any" {...register("latitude", { valueAsNumber: true })} placeholder="-33.8688" />
              {errors.latitude && <p className="text-xs text-red-500">{errors.latitude.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="longitude">Longitude</Label>
              <Input id="longitude" type="number" step="any" {...register("longitude", { valueAsNumber: true })} placeholder="151.2093" />
              {errors.longitude && <p className="text-xs text-red-500">{errors.longitude.message}</p>}
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="shoot_date">Date</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="shoot_date" type="date" {...register("shoot_date")} className="pl-9" />
              </div>
              {errors.shoot_date && <p className="text-xs text-red-500">{errors.shoot_date.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shoot_time">
                Time <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="shoot_time" type="time" {...register("shoot_time")} className="pl-9" />
              </div>
            </div>
          </div>

          {/* Session type */}
          <div className="space-y-1.5">
            <Label htmlFor="session_type">Session Type</Label>
            <div className="relative">
              <Camera className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                id="session_type"
                {...register("session_type")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select type…</option>
                {SESSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {errors.session_type && <p className="text-xs text-red-500">{errors.session_type.message}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">
              Notes <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </Label>
            <div className="relative">
              <StickyNote className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <textarea
                id="notes"
                {...register("notes")}
                rows={3}
                placeholder="Any notes about this shoot…"
                className="flex w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Save Changes" : "Book Shoot"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Shoots Page ───────────────────────────────────────────────────────────────

export default function ShootsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const pendingShoot    = useAppStore((s) => s.pendingShoot);
  const setPendingShoot = useAppStore((s) => s.setPendingShoot);

  const [shoots,      setShoots]      = useState<ShootSession[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [modal,       setModal]       = useState<ModalState | null>(null);
  const [deleting,    setDeleting]    = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?from=/shoots");
  }, [authLoading, user, router]);

  const loadShoots = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ shoots: ShootSession[] }>("/shoots");
      setShoots(data.shoots);
    } catch {
      setError("Failed to load shoots.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user) loadShoots(); }, [user, loadShoots]);

  // Open modal pre-filled from pendingShoot (set by "Book this shoot" on planner)
  useEffect(() => {
    if (pendingShoot && user) {
      setModal({
        location_name:     pendingShoot.location_name,
        latitude:          pendingShoot.latitude,
        longitude:         pendingShoot.longitude,
        shoot_date:        pendingShoot.shoot_date,
        suitability_score: pendingShoot.suitability_score,
      });
      setPendingShoot(null);
    }
  }, [pendingShoot, user, setPendingShoot]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this shoot session?")) return;
    setDeleting(id);
    try {
      await api.delete(`/shoots/${id}`);
      setShoots((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Failed to delete shoot.");
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = (shoot: ShootSession) => {
    setShoots((prev) => {
      const idx = prev.findIndex((s) => s.id === shoot.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = shoot; return next; }
      return [shoot, ...prev];
    });
    setModal(null);
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
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shoot Sessions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your planned and past photography shoots.
          </p>
        </div>
        <Button onClick={() => setModal({})} className="gap-1.5">
          <Plus className="h-4 w-4" /> New Shoot
        </Button>
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
          <Loader2 className="h-4 w-4 animate-spin" /> Loading shoots…
        </div>
      )}

      {/* Empty state */}
      {!loading && shoots.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
          <Camera className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-lg font-medium">No shoots booked yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the Planner to find the best day, then book it here.
          </p>
          <Button onClick={() => setModal({})} className="mt-4 gap-1.5">
            <Plus className="h-4 w-4" /> Book your first shoot
          </Button>
        </div>
      )}

      {/* Shoots list */}
      {!loading && shoots.length > 0 && (
        <div className="space-y-3">
          {shoots.map((shoot) => {
            const ratingInfo = getRating(shoot.suitability_score);
            const dateLabel  = new Date(`${shoot.shoot_date.split("T")[0]}T12:00:00Z`).toLocaleDateString([], {
              weekday: "short", day: "numeric", month: "short", year: "numeric",
            });

            return (
              <div
                key={shoot.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold truncate">{shoot.location_name}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {shoot.session_type}
                    </span>
                    {ratingInfo && (
                      <ScoreBadge rating={ratingInfo.rating} colour={ratingInfo.colour} size="sm" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" /> {dateLabel}
                    </span>
                    {shoot.shoot_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {shoot.shoot_time}
                      </span>
                    )}
                    {shoot.suitability_score !== null && (
                      <span className="flex items-center gap-1">
                        Score: <strong>{shoot.suitability_score}</strong>
                      </span>
                    )}
                  </div>
                  {shoot.notes && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{shoot.notes}</p>
                  )}
                </div>

                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => setModal({
                      id:            shoot.id,
                      location_name: shoot.location_name,
                      latitude:      shoot.latitude,
                      longitude:     shoot.longitude,
                      shoot_date:    shoot.shoot_date.split("T")[0],
                      shoot_time:    shoot.shoot_time ?? "",
                      session_type:  shoot.session_type,
                      notes:         shoot.notes ?? "",
                      suitability_score: shoot.suitability_score ?? undefined,
                    })}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => handleDelete(shoot.id)}
                    disabled={deleting === shoot.id}
                  >
                    {deleting === shoot.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Trash2 className="h-4 w-4 text-red-500" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ShootFormModal
          initial={modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </main>
  );
}
