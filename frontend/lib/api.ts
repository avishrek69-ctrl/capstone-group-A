import axios from "axios";

// Determine API URL - prioritize env var, but default to Render backend
let apiBaseUrl = "https://capstone-group-a-1.onrender.com/api";
if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) {
  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
}

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
