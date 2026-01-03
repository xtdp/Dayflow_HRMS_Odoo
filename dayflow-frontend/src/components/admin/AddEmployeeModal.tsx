"use client";

import { useState } from 'react';
import { userService, CreateUserData } from '@/services/userService';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function AddEmployeeModal({ isOpen, onClose, onRefresh }: Props) {
  const [formData, setFormData] = useState<CreateUserData>({
    username: '',
    password: '',
    password_confirm: '',
    email: '',
    first_name: '',
    last_name: '',
    employee_id: '',
    department: '',
    designation: '',
    role: 'EMPLOYEE',
    phone: '',
    joining_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 10) {
      setError("Password must be at least 10 characters long");
      setLoading(false);
      return;
    }

    try {
      await userService.createEmployee(formData);
      onRefresh();
      onClose();
      // Reset form
      setFormData({
        username: '',
        password: '',
        password_confirm: '',
        email: '',
        first_name: '',
        last_name: '',
        employee_id: '',
        department: '',
        designation: '',
        role: 'EMPLOYEE',
        phone: '',
        joining_date: ''
      });
    } catch (err: any) {
      console.error("Create employee error:", err);
      setError(
        typeof err === 'string' 
          ? err 
          : "Failed to create employee. Please check all fields."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-dayflow-card border border-white/10 p-8 rounded-2xl w-full max-w-2xl shadow-2xl relative my-8">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          type="button"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-6">Add New Employee</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="First Name" 
              name="first_name"
              required 
              value={formData.first_name} 
              onChange={handleChange}
              placeholder="John"
            />
            <Input 
              label="Last Name" 
              name="last_name"
              required 
              value={formData.last_name} 
              onChange={handleChange}
              placeholder="Doe"
            />
          </div>

          {/* Credentials */}
          <Input 
            label="Username" 
            name="username"
            required 
            value={formData.username} 
            onChange={handleChange}
            placeholder="johndoe"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Password" 
              name="password"
              type="password" 
              required 
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 10 characters"
            />
            <Input 
              label="Confirm Password" 
              name="password_confirm"
              type="password" 
              required 
              value={formData.password_confirm}
              onChange={handleChange}
              placeholder="Re-enter password"
            />
          </div>

          <Input 
            label="Email Address" 
            name="email"
            type="email" 
            required 
            value={formData.email}
            onChange={handleChange}
            placeholder="john@company.com"
          />

          {/* Employment Details */}
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Employee ID" 
              name="employee_id"
              placeholder="EMP001" 
              value={formData.employee_id}
              onChange={handleChange}
            />
            <Input 
              label="Phone" 
              name="phone"
              type="tel"
              placeholder="1234567890" 
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Department" 
              name="department"
              placeholder="Engineering" 
              value={formData.department}
              onChange={handleChange}
            />
            <Input 
              label="Designation" 
              name="designation"
              placeholder="Software Engineer" 
              value={formData.designation}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dayflow-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-dayflow-primary transition-colors"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <Input 
              label="Joining Date" 
              name="joining_date"
              type="date"
              value={formData.joining_date}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="text-dayflow-danger text-sm font-medium bg-dayflow-danger/10 p-3 rounded-lg border border-dayflow-danger/20">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
            <Button 
              variant="secondary" 
              onClick={onClose} 
              type="button" 
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={loading} 
              className="flex-1"
              disabled={loading}
            >
              Create Employee
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}