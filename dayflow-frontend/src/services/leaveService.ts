import { apiService } from './api';

export interface LeaveRequest {
  id: number;
  employee: number;
  employee_name: string;
  employee_username: string;
  leave_type: 'PAID' | 'SICK' | 'UNPAID';
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  attachment: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  admin_comment: string | null;
}

export interface CreateLeaveRequest {
  leave_type: 'PAID' | 'SICK' | 'UNPAID';
  start_date: string;
  end_date: string;
  reason: string;
  attachment?: File;
}

export const leaveService = {
  // Get all leave requests
  async getLeaves(params?: {
    status?: string;
    leave_type?: string;
    ordering?: string;
  }) {
    try {
      const response = await apiService.get('/leaves/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single leave request
  async getLeave(id: number): Promise<LeaveRequest> {
    try {
      const response = await apiService.get<LeaveRequest>(`/leaves/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Apply for leave
  async applyLeave(data: CreateLeaveRequest): Promise<LeaveRequest> {
    try {
      const formData = new FormData();
      formData.append('leave_type', data.leave_type);
      formData.append('start_date', data.start_date);
      formData.append('end_date', data.end_date);
      formData.append('reason', data.reason);
      
      if (data.attachment) {
        formData.append('attachment', data.attachment);
      }

      const response = await apiService.post<LeaveRequest>('/leaves/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update leave request
  async updateLeave(id: number, data: Partial<CreateLeaveRequest>): Promise<LeaveRequest> {
    try {
      const formData = new FormData();
      
      if (data.leave_type) formData.append('leave_type', data.leave_type);
      if (data.start_date) formData.append('start_date', data.start_date);
      if (data.end_date) formData.append('end_date', data.end_date);
      if (data.reason) formData.append('reason', data.reason);
      if (data.attachment) formData.append('attachment', data.attachment);

      const response = await apiService.patch<LeaveRequest>(`/leaves/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Approve leave (admin only)
  async approveLeave(id: number, comment?: string): Promise<LeaveRequest> {
    try {
      const response = await apiService.post<LeaveRequest>(
        `/leaves/${id}/approve/`,
        { comment: comment || '' }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reject leave (admin only)
  async rejectLeave(id: number, comment?: string): Promise<LeaveRequest> {
    try {
      const response = await apiService.post<LeaveRequest>(
        `/leaves/${id}/reject/`,
        { comment: comment || '' }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete leave request
  async deleteLeave(id: number): Promise<void> {
    try {
      await apiService.delete(`/leaves/${id}/`);
    } catch (error) {
      throw error;
    }
  }
};