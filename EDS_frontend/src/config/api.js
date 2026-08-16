// Centralized API Configuration
// All API URLs should be imported from this file

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  API_URL: `${API_BASE_URL}/api`,
};

// Log current environment
console.log("Environment:", import.meta.env.MODE);
console.log("API Base URL:", API_CONFIG.BASE_URL);
console.log("API URL:", API_CONFIG.API_URL);

export default API_CONFIG;
