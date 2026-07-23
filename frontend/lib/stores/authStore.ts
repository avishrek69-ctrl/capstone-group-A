import { create } from "zustand";
import api from "../api";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
  isPhotographer: boolean;
}

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  registerPhotographer: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearUser: () => void;
}

const TOKEN_KEY = "auth_token";

// Set Authorization header if token exists in localStorage
const applyStoredToken = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,

  hydrate: async () => {
    applyStoredToken();
    try {
      const { data } = await api.get<{ user: AuthUser }>("/auth/me");
      set({ user: data.user, isLoading: false });
    } catch (err) {
      // Only clear user if we got a 401 (unauthorized)
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        set({ user: null, isLoading: false });
        localStorage.removeItem(TOKEN_KEY);
      } else {
        set((state) => ({ ...state, isLoading: false }));
      }
    }
  },

  login: async (email, password) => {
    const { data } = await api.post<{ user: AuthUser; token: string }>("/auth/login", {
      email,
      password,
    });
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    }
    set({ user: data.user, isLoading: false });
  },

  register: async (name, email, password) => {
    const { data } = await api.post<{ user: AuthUser; token: string }>("/auth/register", {
      name,
      email,
      password,
    });
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    }
    set({ user: data.user, isLoading: false });
  },

  registerPhotographer: async (name, email, password) => {
    const { data } = await api.post<{ user: AuthUser; token: string }>("/auth/register/photographer", {
      name,
      email,
      password,
    });
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    }
    set({ user: data.user, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout errors
    }
    set({ user: null });
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common["Authorization"];
  },

  clearUser: () => {
    set({ user: null, isLoading: false });
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common["Authorization"];
  },
}));

// Apply stored token on module load
applyStoredToken();
