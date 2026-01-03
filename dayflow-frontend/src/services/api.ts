import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/core",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardizing error messages for the UI
    const message = error.response?.data?.error || "Server connection failed. Please check your internet.";
    return Promise.reject(message);
  }
);

export default api;