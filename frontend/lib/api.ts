import axios from "axios";

const FALLBACK_API_BASE_URL = "https://capstone-group-a-1.onrender.com/api";

const normalizeApiBaseUrl = (rawUrl?: string) => {
  const trimmed = (rawUrl || "").trim().replace(/\/$/, "");
  if (!trimmed) return FALLBACK_API_BASE_URL;

  // Guard against common misconfiguration where env is set to host without /api.
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const apiBaseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // sends HttpOnly cookie on every request
  headers: { "Content-Type": "application/json" },
});

const PUBLIC_PATHS = ["/", "/login", "/register"];

// On 401, clear auth state and redirect to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { useAuthStore } = await import("@/lib/stores/authStore");
      useAuthStore.getState().clearUser();

      if (
        typeof window !== "undefined" &&
        !PUBLIC_PATHS.includes(window.location.pathname)
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
