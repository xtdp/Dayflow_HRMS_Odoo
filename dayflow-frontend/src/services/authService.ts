import { apiService } from "./api";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'ADMIN' | 'EMPLOYEE';
  employee_id: string;
  department?: string;
  designation?: string;
  phone?: string;
  address?: string;
  location?: string;
  profile_picture?: string;
  resume?: string;
  joining_date?: string;
  paid_leave_balance?: number;
  sick_leave_balance?: number;
  is_active?: boolean;
  date_joined?: string;
  last_login?: string;
}

interface LoginResponse {
  message: string;
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export const authService = {
  async login(credentials: { username: string; password: string }): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>(
        "/auth/login/", 
        credentials
      );
      
      if (response.data?.tokens && response.data?.user) {
        // Store tokens
        localStorage.setItem("access_token", response.data.tokens.access);
        localStorage.setItem("refresh_token", response.data.tokens.refresh);
        
        // Store user data
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      // Try to get from localStorage first
      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          return JSON.parse(userStr);
        }
      }

      // If not in localStorage, fetch from API
      const response = await apiService.get<User>("/auth/me/");
      
      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await apiService.patch<User>("/auth/profile/", data);
      
      // Update localStorage
      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  async verifyToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return false;

      await apiService.post("/auth/token/verify/", { token });
      return true;
    } catch (error) {
      return false;
    }
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  },

  getStoredUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      try {
        return userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      return !!token;
    }
    return false;
  }
};