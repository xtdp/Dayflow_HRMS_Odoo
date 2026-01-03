import axios, { AxiosError } from "axios";

export const apiService = axios.create({
  baseURL: "http://127.0.0.1:8000/core", // Changed from /core to /api
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiService.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        
        if (!refreshToken) {
          // No refresh token, logout user
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          window.location.href = "/";
          return Promise.reject(error);
        }

        // Try to refresh the token
        const response = await axios.post(
          "http://127.0.0.1:8000/core/auth/token/refresh/",
          { refresh: refreshToken }
        );

        const { access, refresh } = response.data;

        // Store new tokens
        localStorage.setItem("access_token", access);
        if (refresh) {
          localStorage.setItem("refresh_token", refresh);
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiService(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.data) {
      const errorData = error.response.data as any;
      
      // Extract error message
      if (errorData.error) {
        return Promise.reject(errorData.error);
      } else if (errorData.detail) {
        return Promise.reject(errorData.detail);
      } else if (typeof errorData === 'object') {
        // Handle validation errors
        const firstError = Object.values(errorData)[0];
        if (Array.isArray(firstError)) {
          return Promise.reject(firstError[0]);
        }
        return Promise.reject(JSON.stringify(errorData));
      }
    }

    return Promise.reject(error.message || "An error occurred");
  }
);