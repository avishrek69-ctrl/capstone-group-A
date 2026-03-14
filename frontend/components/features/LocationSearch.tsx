"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useAppStore, SelectedLocation } from "@/lib/stores/appStore";

interface LocationResult {
  display_name: string;
  suburb: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
}

interface LocationSearchProps {
  placeholder?: string;
  className?: string;
}

export default function LocationSearch({
  placeholder = "Search suburb, postcode or location…",
  className,
}: LocationSearchProps) {
  const setSelectedLocation = useAppStore((s) => s.setSelectedLocation);
  const selectedLocation    = useAppStore((s) => s.selectedLocation);

  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get<{ results: LocationResult[] }>(
        "/locations/search",
        { params: { q } }
      );
      setResults(data.results);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (result: LocationResult) => {
    const location: SelectedLocation = {
      display_name: result.display_name,
      suburb:       result.suburb,
      latitude:     result.latitude,
      longitude:    result.longitude,
    };
    setSelectedLocation(location);
    setQuery(result.suburb ?? result.city ?? result.display_name.split(",")[0]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={selectedLocation ? selectedLocation.display_name.split(",")[0] : placeholder}
          className="pl-9 pr-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md">
          <ul className="max-h-60 overflow-y-auto py-1">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => handleSelect(r)}
                  className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-muted"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium leading-snug">
                      {r.suburb ?? r.city ?? r.display_name.split(",")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {r.display_name}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && !loading && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover px-3 py-3 text-sm text-muted-foreground shadow-md">
          No locations found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
