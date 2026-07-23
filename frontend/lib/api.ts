import axios from "axios";

const FALLBACK_API_BASE_URL = "https://capstone-group-a-1.onrender.com/api";

const isLocalAddress = (value: string) =>
  /(^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$))|(^localhost(:\d+)?(\/|$))|(^127\.0\.0\.1(:\d+)?(\/|$))/i.test(value);

const isBrowserRunningLocally = () => {
  if (typeof window === "undefined") return true;
  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
};

const normalizeApiBaseUrl = (rawUrl?: string) => {
  const trimmed = (rawUrl || "").trim().replace(/\/$/, "");
  if (!trimmed) return FALLBACK_API_BASE_URL;

  // Prevent deployed frontend builds from trying to call localhost APIs.
  if (isLocalAddress(trimmed) && !isBrowserRunningLocally()) {
    return FALLBACK_API_BASE_URL;
  }

  // Guard against common misconfiguration where env is set to host without /api.
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const apiBaseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // sends HttpOnly cookie on every request
  headers: { "Content-Type": "application/json" },
});

const PUBLIC_PATHS = ["/", "/login", "/register", "/photographer/login", "/photographer/register"];

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
        window.location.href = window.location.pathname.startsWith("/photographer")
          ? "/photographer/login"
          : "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
