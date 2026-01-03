import { apiService } from './api';

export interface Attendance {
  id: number;
  employee: number;
  employee_name: string;
  employee_username: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  work_hours: string | null;
  extra_hours: string | null;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE';
}

export interface AttendanceSummary {
  month: number;
  year: number;
  total_days: number;
  present: number;
  absent: number;
  half_day: number;
}

export interface CheckInResponse {
  status: string;
  time: string;
  date: string;
}

export interface CheckOutResponse {
  status: string;
  check_in: string;
  check_out: string;
  work_hours: string;
  extra_hours: string;
}

export const attendanceService = {
  // Check in for today
  async checkIn(): Promise<CheckInResponse> {
    try {
      const response = await apiService.post<CheckInResponse>('/attendance/check_in/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check out for today
  async checkOut(): Promise<CheckOutResponse> {
    try {
      const response = await apiService.post<CheckOutResponse>('/attendance/check_out/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get attendance records
  async getAttendance(params?: {
    date?: string;
    status?: string;
    employee?: number;
    employee_id?: number;
    ordering?: string;
  }) {
    try {
      const response = await apiService.get('/attendance/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get monthly summary
  async getMonthlySummary(month?: number, year?: number, employeeId?: number): Promise<AttendanceSummary> {
    try {
      const params: any = {};
      if (month) params.month = month;
      if (year) params.year = year;
      if (employeeId) params.employee_id = employeeId;

      const response = await apiService.get<AttendanceSummary>(
        '/attendance/monthly_summary/',
        { params }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create attendance record (admin only)
  async createAttendance(data: {
    employee: number;
    date: string;
    check_in?: string;
    check_out?: string;
    status: string;
  }): Promise<Attendance> {
    try {
      const response = await apiService.post<Attendance>('/attendance/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update attendance record
  async updateAttendance(id: number, data: Partial<Attendance>): Promise<Attendance> {
    try {
      const response = await apiService.patch<Attendance>(`/attendance/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete attendance record
  async deleteAttendance(id: number): Promise<void> {
    try {
      await apiService.delete(`/attendance/${id}/`);
    } catch (error) {
      throw error;
    }
  }
};