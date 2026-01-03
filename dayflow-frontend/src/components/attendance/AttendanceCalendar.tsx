"use client";

import { useState, useEffect } from 'react';
import { attendanceService, Attendance } from '@/services/attendanceService';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export function AttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [currentDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const response = await attendanceService.getAttendance({
        ordering: '-date'
      });
      
      // Filter for current month
      const monthlyData = (response.results || []).filter((record: Attendance) => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentDate.getMonth() && 
               recordDate.getFullYear() === currentDate.getFullYear();
      });
      
      setAttendance(monthlyData);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getAttendanceForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendance.find(a => a.date === dateStr);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-500';
      case 'ABSENT':
        return 'bg-red-500';
      case 'HALF_DAY':
        return 'bg-yellow-500';
      case 'ON_LEAVE':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth();
  const firstDay = getFirstDayOfMonth();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-dayflow-card p-6 rounded-2xl border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-dayflow-primary/20 rounded-full flex items-center justify-center">
            <Calendar className="text-dayflow-primary" size={20} />
          </div>
          <h3 className="text-xl font-bold">{monthName}</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-400">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-400">Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-gray-400">Half Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-400">On Leave</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-dayflow-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}

          {/* Calendar days */}
          {days.map(day => {
            const attendanceRecord = getAttendanceForDate(day);
            const isToday = 
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg border transition-colors relative ${
                  isToday
                    ? 'border-dayflow-primary bg-dayflow-primary/10'
                    : 'border-white/5 bg-white/5'
                } ${attendanceRecord ? 'hover:bg-white/10' : ''}`}
              >
                <span className={`text-sm font-medium ${isToday ? 'text-dayflow-primary' : 'text-white'}`}>
                  {day}
                </span>
                {attendanceRecord && (
                  <div className={`absolute bottom-1 w-2 h-2 rounded-full ${getStatusColor(attendanceRecord.status)}`}></div>
                )}
                {attendanceRecord && attendanceRecord.check_in && (
                  <span className="text-[10px] text-gray-400 mt-1">
                    {attendanceRecord.check_in.substring(0, 5)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}