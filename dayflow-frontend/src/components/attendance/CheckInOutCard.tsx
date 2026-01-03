"use client";

import { useState, useEffect } from 'react';
import { attendanceService } from '@/services/attendanceService';
import { Button } from '@/components/ui/Button';
import { Clock, CheckCircle, LogOut as LogOutIcon, Calendar } from 'lucide-react';

export function CheckInOutCard() {
  const [status, setStatus] = useState<'loading' | 'idle' | 'checkedIn' | 'checkedOut'>('loading');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [workHours, setWorkHours] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkTodayStatus();
  }, []);

  const checkTodayStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await attendanceService.getAttendance({ date: today });
      
      console.log('Attendance response:', response); // Debug log
      
      // Handle both array and paginated response
      let records = [];
      if (Array.isArray(response)) {
        records = response;
      } else if (response.results && Array.isArray(response.results)) {
        records = response.results;
      }
      
      if (records.length > 0) {
        const todayRecord = records[0];
        console.log('Today record:', todayRecord); // Debug log
        
        setCheckInTime(todayRecord.check_in || '');
        setCheckOutTime(todayRecord.check_out || '');
        setWorkHours(todayRecord.work_hours || '');
        
        if (todayRecord.check_out) {
          setStatus('checkedOut');
        } else if (todayRecord.check_in) {
          setStatus('checkedIn');
        } else {
          setStatus('idle');
        }
      } else {
        setStatus('idle');
      }
    } catch (err) {
      console.error('Failed to check status:', err);
      setStatus('idle');
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await attendanceService.checkIn();
      console.log('Check-in response:', response); // Debug log
      setCheckInTime(response.time);
      setStatus('checkedIn');
    } catch (err: any) {
      console.error('Check-in error:', err); // Debug log
      setError(typeof err === 'string' ? err : 'Check-in failed. You may have already checked in today.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await attendanceService.checkOut();
      console.log('Check-out response:', response); // Debug log
      setCheckOutTime(response.check_out);
      setWorkHours(response.work_hours);
      setStatus('checkedOut');
    } catch (err: any) {
      console.error('Check-out error:', err); // Debug log
      setError(typeof err === 'string' ? err : 'Check-out failed. Please check in first.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (status === 'loading') {
    return (
      <div className="bg-dayflow-card p-8 rounded-2xl border border-white/10">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-dayflow-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dayflow-card p-8 rounded-2xl border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-dayflow-primary/20 rounded-full flex items-center justify-center">
          <Clock className="text-dayflow-primary" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold">Today's Attendance</h3>
          <p className="text-sm text-gray-400">{getCurrentDate()}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-dayflow-danger/10 border border-dayflow-danger/20 rounded-lg">
          <p className="text-sm text-dayflow-danger">{error}</p>
        </div>
      )}
      
      {status === 'idle' && (
        <div className="text-center py-6">
          <p className="text-gray-400 mb-6">You haven't checked in yet today</p>
          <Button 
            onClick={handleCheckIn} 
            isLoading={loading}
            className="w-full"
          >
            <CheckCircle size={20} className="mr-2" />
            Check In Now
          </Button>
        </div>
      )}
      
      {status === 'checkedIn' && (
        <div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-green-500" size={24} />
              <p className="text-sm text-gray-400">Checked in at</p>
            </div>
            <p className="text-3xl font-bold text-green-500">{checkInTime}</p>
          </div>
          
          <Button 
            onClick={handleCheckOut} 
            isLoading={loading}
            variant="secondary"
            className="w-full"
          >
            <LogOutIcon size={20} className="mr-2" />
            Check Out
          </Button>
        </div>
      )}
      
      {status === 'checkedOut' && (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-500" size={20} />
              <p className="text-sm text-gray-400">Check In</p>
            </div>
            <p className="text-xl font-bold">{checkInTime}</p>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <LogOutIcon className="text-blue-500" size={20} />
              <p className="text-sm text-gray-400">Check Out</p>
            </div>
            <p className="text-xl font-bold">{checkOutTime}</p>
          </div>
          
          <div className="bg-dayflow-primary/10 border border-dayflow-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-dayflow-primary" size={20} />
              <p className="text-sm text-gray-400">Work Hours</p>
            </div>
            <p className="text-xl font-bold text-dayflow-primary">{workHours} hours</p>
          </div>
          
          <div className="text-center pt-4">
            <div className="inline-flex items-center gap-2 text-green-500">
              <CheckCircle size={20} />
              <span className="font-medium">Attendance Recorded</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}