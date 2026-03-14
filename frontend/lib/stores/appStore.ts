import { create } from "zustand";

export interface SelectedLocation {
  display_name: string;
  suburb:       string | null;
  latitude:     number;
  longitude:    number;
}

export interface PendingShoot {
  location_name:     string;
  latitude:          number;
  longitude:         number;
  shoot_date:        string; // YYYY-MM-DD
  suitability_score?: number;
}

interface AppStore {
  selectedLocation: SelectedLocation | null;
  setSelectedLocation: (location: SelectedLocation | null) => void;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  pendingShoot: PendingShoot | null;
  setPendingShoot: (shoot: PendingShoot | null) => void;
}

const today = () => new Date().toISOString().split("T")[0];

export const useAppStore = create<AppStore>((set) => ({
  selectedLocation: null,
  setSelectedLocation: (location) => set({ selectedLocation: location }),

  selectedDate: today(),
  setSelectedDate: (date) => set({ selectedDate: date }),

  pendingShoot: null,
  setPendingShoot: (shoot) => set({ pendingShoot: shoot }),
}));
