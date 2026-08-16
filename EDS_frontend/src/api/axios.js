import axios from "axios";
import { refreshToken } from "../services/authService";

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

console.log("API Base URL:", API_BASE_URL);

export const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const protectedApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});
protectedApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

protectedApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      console.log("Access token expired. Attempting to refresh...");
      try {
        const newAccessToken = await refreshToken();
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        console.log("Token refreshed. Retrying original request...");
        return protectedApiClient(originalRequest);
      } catch (refreshError) {
        console.log("Could not refresh token. Redirecting to login.");
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default protectedApiClient;
