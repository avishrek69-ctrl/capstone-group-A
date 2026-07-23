import axios from "axios";

const getApiBaseUrl = () => {
  // First: check environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }

  // Default to Render backend
  return "https://capstone-group-a-1.onrender.com/api";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // sends HttpOnly cookie on every request
  headers: { "Content-Type": "application/json" },
});

// Override baseURL on first request to ensure it's set from browser context
api.interceptors.request.use((config) => {
  if (!config.baseURL || config.baseURL === "undefined") {
    config.baseURL = "https://capstone-group-a-1.onrender.com/api";
  }
  return config;
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
