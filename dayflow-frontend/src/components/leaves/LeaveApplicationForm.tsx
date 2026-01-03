"use client";

import { useState } from 'react';
import { leaveService, CreateLeaveRequest } from '@/services/leaveService';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Calendar, FileText, X, Upload } from 'lucide-react';

interface Props {
  onSuccess: () => void;
  onCancel?: () => void;
}

export function LeaveApplicationForm({ onSuccess, onCancel }: Props) {
  const [formData, setFormData] = useState<CreateLeaveRequest>({
    leave_type: 'PAID',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.reason.length < 10) {
      setError('Reason must be at least 10 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = { ...formData };
      if (attachment) {
        submitData.attachment = attachment;
      }

      await leaveService.applyLeave(submitData);
      onSuccess();
      
      // Reset form
      setFormData({
        leave_type: 'PAID',
        start_date: '',
        end_date: '',
        reason: '',
      });
      setAttachment(null);
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      setAttachment(file);
      setError('');
    }
  };

  const calculateDays = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return days > 0 ? days : 0;
    }
    return 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Leave Type *
        </label>
        <select
          value={formData.leave_type}
          onChange={(e) => setFormData({...formData, leave_type: e.target.value as any})}
          className="w-full px-4 py-3 bg-dayflow-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-dayflow-primary transition-colors"
          required
        >
          <option value="PAID">Paid Leave</option>
          <option value="SICK">Sick Leave</option>
          <option value="UNPAID">Unpaid Leave</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          value={formData.start_date}
          onChange={(e) => setFormData({...formData, start_date: e.target.value})}
          required
          min={new Date().toISOString().split('T')[0]}
        />
        
        <Input
          label="End Date"
          type="date"
          value={formData.end_date}
          onChange={(e) => setFormData({...formData, end_date: e.target.value})}
          required
          min={formData.start_date || new Date().toISOString().split('T')[0]}
        />
      </div>

      {formData.start_date && formData.end_date && (
        <div className="bg-dayflow-primary/10 border border-dayflow-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-dayflow-primary" size={20} />
            <span className="text-sm text-gray-300">
              Duration: <span className="font-bold text-dayflow-primary">{calculateDays()} days</span>
            </span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Reason for Leave * (minimum 10 characters)
        </label>
        <textarea
          value={formData.reason}
          onChange={(e) => setFormData({...formData, reason: e.target.value})}
          className="w-full px-4 py-3 bg-dayflow-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-dayflow-primary transition-colors resize-none"
          rows={4}
          required
          minLength={10}
          placeholder="Please provide a detailed reason for your leave request..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.reason.length}/10 characters minimum
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Attachment (Optional)
        </label>
        <div className="relative">
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="leave-attachment"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <label
            htmlFor="leave-attachment"
            className="flex items-center gap-3 px-4 py-3 bg-dayflow-bg border border-white/10 rounded-lg cursor-pointer hover:border-dayflow-primary transition-colors"
          >
            <Upload size={20} className="text-gray-400" />
            <span className="text-sm text-gray-400">
              {attachment ? attachment.name : 'Upload supporting document (Max 5MB)'}
            </span>
          </label>
          {attachment && (
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-dayflow-danger/10 border border-dayflow-danger/20 rounded-lg p-3">
          <p className="text-sm text-dayflow-danger">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          isLoading={loading}
          className="flex-1"
        >
          Submit Leave Request
        </Button>
      </div>
    </form>
  );
}