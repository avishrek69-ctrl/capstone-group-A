import axios from "axios";

const getApiBaseUrl = () => {
  // First: check environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Second: detect at runtime if we're in production
  if (typeof window !== "undefined") {
    // If running in a browser, check the hostname
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      // Production: use Render backend
      return "https://capstone-group-a-1.onrender.com/api";
    }
  }

  // Default fallback
  return "https://capstone-group-a-1.onrender.com/api";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
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
