import { apiService } from './api';
import { User } from './authService';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateUserData {
  username: string;
  password: string;
  password_confirm: string;
  email: string;
  first_name?: string;
  last_name?: string;
  employee_id?: string;
  department?: string;
  designation?: string;
  phone?: string;
  address?: string;
  location?: string;
  role?: 'ADMIN' | 'EMPLOYEE';
  joining_date?: string;
}

export const userService = {
  // Get all employees with optional filters
  async getEmployees(params?: {
    role?: string;
    department?: string;
    is_active?: boolean;
    search?: string;
    page?: number;
  }): Promise<PaginatedResponse<User>> {
    try {
      const response = await apiService.get<PaginatedResponse<User>>('/users/', { 
        params 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single employee by ID
  async getEmployee(id: number): Promise<User> {
    try {
      const response = await apiService.get<User>(`/users/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new employee
  async createEmployee(data: CreateUserData): Promise<User> {
    try {
      const response = await apiService.post<User>('/users/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update employee
  async updateEmployee(id: number, data: Partial<User>): Promise<User> {
    try {
      const response = await apiService.patch<User>(`/users/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete employee
  async deleteEmployee(id: number): Promise<void> {
    try {
      await apiService.delete(`/users/${id}/`);
    } catch (error) {
      throw error;
    }
  }
};