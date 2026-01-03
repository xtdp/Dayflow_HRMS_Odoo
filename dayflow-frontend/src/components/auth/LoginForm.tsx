"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import Input from "../ui/Input";
import { Button } from "../ui/Button";
import { StatusMessage } from "../ui/StatusMessage";
import { authService } from "@/services/authService";

export function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [status, setStatus] = useState<{ 
    type: 'idle' | 'loading' | 'success' | 'error'; 
    message: string 
  }>({ type: 'idle', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.type === 'error') setStatus({ type: 'idle', message: '' });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username || !formData.password) {
      setStatus({ type: 'error', message: 'Please enter both username and password' });
      return;
    }

    setStatus({ type: 'loading', message: '' });

    try {
      const data = await authService.login(formData);
      
      setStatus({ 
        type: 'success', 
        message: `Welcome back, ${data.user.first_name || data.user.username}! Redirecting...` 
      });

      // Role-Based Routing
      setTimeout(() => {
        const role = data.user.role;
        router.push(role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard");
      }, 1000); 

    } catch (errorMessage: any) {
      console.error("Login Failed:", errorMessage);
      setStatus({ 
        type: 'error', 
        message: typeof errorMessage === 'string' 
          ? errorMessage 
          : 'Login failed. Please check your credentials.' 
      });
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <Input 
        label="Login ID" 
        name="username" 
        icon={User} 
        value={formData.username} 
        onChange={handleChange} 
        placeholder="e.g. admin"
        required
        disabled={status.type === 'loading' || status.type === 'success'}
      />
      <Input 
        label="Password" 
        name="password" 
        type="password" 
        icon={Lock} 
        value={formData.password} 
        onChange={handleChange} 
        placeholder="••••••••"
        required
        disabled={status.type === 'loading' || status.type === 'success'}
      />
      <StatusMessage type={status.type} message={status.message} />
      <Button 
        type="submit" 
        isLoading={status.type === 'loading' || status.type === 'success'}
        disabled={status.type === 'loading' || status.type === 'success'}
      >
        SIGN IN
      </Button>
      <div className="text-center pt-2">
        <p className="text-gray-500 text-xs">
          Don't have an account? <span className="text-dayflow-primary cursor-pointer hover:text-purple-400 transition-colors">Contact HR Admin</span>
        </p>
      </div>
    </form>
  );
}