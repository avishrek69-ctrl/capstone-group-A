"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";

export default function AppInitializer() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    // Only hydrate if we don't have a user yet (initial load or logged out)
    // Skip if we're already loading (hydrate in progress)
    if (!user && !isLoading) {
      hydrate();
    }
  }, [hydrate, user, isLoading]);

  return null;
}
