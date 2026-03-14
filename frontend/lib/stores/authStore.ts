import { create } from "zustand";
import api from "../api";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,

  hydrate: async () => {
    try {
      const { data } = await api.get<{ user: AuthUser }>("/auth/me");
      set({ user: data.user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post<{ user: AuthUser }>("/auth/login", {
      email,
      password,
    });
    set({ user: data.user });
  },

  register: async (name, email, password) => {
    const { data } = await api.post<{ user: AuthUser }>("/auth/register", {
      name,
      email,
      password,
    });
    set({ user: data.user });
  },

  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null });
  },

  clearUser: () => set({ user: null, isLoading: false }),
}));
