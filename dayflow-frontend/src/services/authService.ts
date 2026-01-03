import api from "./api";

export interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'EMPLOYEE';
  email?: string;
  profile_picture?: string;
}

export const authService = {
  async login(credentials: { username: string; password: string }) {
    const response = await api.post("/users/login/", credentials);
    
    if (response.data?.user) {
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  },

  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }
};