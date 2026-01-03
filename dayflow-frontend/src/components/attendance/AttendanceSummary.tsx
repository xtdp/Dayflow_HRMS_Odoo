"use client";

import { useState, useEffect } from 'react';
import { attendanceService, AttendanceSummary } from '@/services/attendanceService';
import { TrendingUp, Calendar, Clock } from 'lucide-react';

export function AttendanceSummaryCard() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      
      const data = await attendanceService.getMonthlySummary(month, year);
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-dayflow-card p-8 rounded-2xl border border-white/10">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-dayflow-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-dayflow-card p-8 rounded-2xl border border-white/10">
        <p className="text-gray-400 text-center">No attendance data available</p>
      </div>
    );
  }

  const attendanceRate = summary.total_days > 0 
    ? ((summary.present / summary.total_days) * 100).toFixed(1)
    : '0';

  const monthName = new Date(summary.year, summary.month - 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="bg-dayflow-card p-8 rounded-2xl border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-dayflow-primary/20 rounded-full flex items-center justify-center">
          <TrendingUp className="text-dayflow-primary" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold">Monthly Summary</h3>
          <p className="text-sm text-gray-400">{monthName}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Attendance Rate */}
        <div className="bg-dayflow-primary/10 border border-dayflow-primary/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Attendance Rate</span>
            <span className="text-2xl font-bold text-dayflow-primary">{attendanceRate}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2">
            <div
              className="bg-dayflow-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${attendanceRate}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-400">Present</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{summary.present}</p>
            <p className="text-xs text-gray-500">days</p>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-400">Absent</span>
            </div>
            <p className="text-2xl font-bold text-red-500">{summary.absent}</p>
            <p className="text-xs text-gray-500">days</p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-400">Half Day</span>
            </div>
            <p className="text-2xl font-bold text-yellow-500">{summary.half_day}</p>
            <p className="text-xs text-gray-500">days</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="text-blue-500" size={12} />
              <span className="text-xs text-gray-400">Total Days</span>
            </div>
            <p className="text-2xl font-bold text-blue-500">{summary.total_days}</p>
            <p className="text-xs text-gray-500">working</p>
          </div>
        </div>
      </div>
    </div>
  );
}