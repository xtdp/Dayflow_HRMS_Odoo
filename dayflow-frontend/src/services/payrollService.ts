import { apiService } from './api';

export interface Payroll {
  id: number;
  employee: number;
  employee_name: string;
  employee_username: string;
  month: string; // YYYY-MM-DD format
  basic_salary: string;
  hra: string;
  standard_allowance: string;
  other_allowances: string;
  gross_salary: number;
  pf: string;
  professional_tax: string;
  total_deductions: number;
  net_salary: string;
}

export interface CreatePayroll {
  employee: number;
  month: string;
  basic_salary: number;
  hra: number;
  standard_allowance: number;
  other_allowances: number;
  pf: number;
  professional_tax: number;
}

export const payrollService = {
  // Get all payroll records
  async getPayrolls(params?: {
    employee?: number;
    month?: string;
    ordering?: string;
  }) {
    try {
      const response = await apiService.get('/payroll/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single payroll record
  async getPayroll(id: number): Promise<Payroll> {
    try {
      const response = await apiService.get<Payroll>(`/payroll/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create payroll record (admin only)
  async createPayroll(data: CreatePayroll): Promise<Payroll> {
    try {
      const response = await apiService.post<Payroll>('/payroll/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update payroll record (admin only)
  async updatePayroll(id: number, data: Partial<CreatePayroll>): Promise<Payroll> {
    try {
      const response = await apiService.patch<Payroll>(`/payroll/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete payroll record (admin only)
  async deletePayroll(id: number): Promise<void> {
    try {
      await apiService.delete(`/payroll/${id}/`);
    } catch (error) {
      throw error;
    }
  },

  // Get payroll for specific month and employee
  async getMonthlyPayroll(employeeId: number, month: string): Promise<Payroll | null> {
    try {
      const response = await apiService.get('/payroll/', {
        params: {
          employee: employeeId,
          month: month
        }
      });
      
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }
};