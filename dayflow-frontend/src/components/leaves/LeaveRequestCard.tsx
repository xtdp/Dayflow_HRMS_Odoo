"use client";

import { LeaveRequest } from '@/services/leaveService';
import { Calendar, Clock, FileText, MessageSquare } from 'lucide-react';

interface Props {
  leave: LeaveRequest;
  showEmployee?: boolean;
  actions?: React.ReactNode;
}

export function LeaveRequestCard({ leave, showEmployee = false, actions }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'PAID':
        return 'text-blue-400';
      case 'SICK':
        return 'text-orange-400';
      case 'UNPAID':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-dayflow-card p-6 rounded-2xl border border-white/10 hover:border-dayflow-primary/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {showEmployee && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-dayflow-primary/20 flex items-center justify-center text-dayflow-primary font-bold">
                {leave.employee_name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{leave.employee_name}</p>
                <p className="text-xs text-gray-400">@{leave.employee_username}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <span className={`font-bold ${getLeaveTypeColor(leave.leave_type)}`}>
              {leave.leave_type.replace('_', ' ')}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-sm text-gray-400">{leave.days_count} days</span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(leave.status)}`}>
          {leave.status}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="text-gray-400" size={16} />
          <span className="text-gray-300">
            {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
          </span>
        </div>

        <div className="flex items-start gap-3 text-sm">
          <FileText className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-gray-300 line-clamp-2">{leave.reason}</p>
        </div>

        {leave.attachment && (
          <div className="flex items-center gap-3 text-sm">
            <FileText className="text-gray-400" size={16} />
            <a
              href={leave.attachment}
              target="_blank"
              rel="noopener noreferrer"
              className="text-dayflow-primary hover:underline"
            >
              View Attachment
            </a>
          </div>
        )}

        {leave.admin_comment && (
          <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="text-gray-400" size={16} />
              <span className="text-xs font-medium text-gray-400">Admin Comment</span>
            </div>
            <p className="text-sm text-gray-300">{leave.admin_comment}</p>
          </div>
        )}
      </div>

      {actions && (
        <div className="pt-4 border-t border-white/5">
          {actions}
        </div>
      )}
    </div>
  );
}