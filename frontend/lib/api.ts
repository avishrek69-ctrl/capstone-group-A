import axios from "axios";

const FALLBACK_API_URL = "https://capstone-group-a-1.onrender.com/api";
const resolvedApiUrl = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? FALLBACK_API_URL : "http://localhost:8000/api")
).replace(/\/$/, "");

const api = axios.create({
  baseURL: resolvedApiUrl,
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
