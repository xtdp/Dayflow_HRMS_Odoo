"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LogOut, 
  LayoutGrid, 
  Clock, 
  Calendar, 
  Wallet,
  User as UserIcon,
  MapPin,
  Briefcase,
  Mail,
  Phone
} from "lucide-react";
import { authService, User } from "@/services/authService";

export default function EmployeeDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initDashboard = async () => {
      if (!authService.isAuthenticated()) {
        router.push("/");
        return;
      }

      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        authService.logout();
        return;
      }

      if (currentUser.role !== "EMPLOYEE") {
        router.push("/admin/dashboard");
        return;
      }

      setUser(currentUser);
      setLoading(false);
    };

    initDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dayflow-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dayflow-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  };

  return (
    <div className="min-h-screen bg-dayflow-dark flex text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-dayflow-card border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold tracking-tight">
            Dayflow<span className="text-dayflow-primary">.HR</span>
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/employee/dashboard">
            <div className="flex items-center gap-3 p-3 bg-dayflow-primary/10 text-dayflow-primary rounded-xl cursor-pointer">
              <LayoutGrid size={20} />
              <span className="font-medium">Dashboard</span>
            </div>
          </Link>
          <Link href="/employee/attendance">
            <div className="flex items-center gap-3 p-3 text-gray-400 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
              <Clock size={20} />
              <span className="font-medium">Attendance</span>
            </div>
          </Link>
          <Link href="/employee/leaves">
            <div className="flex items-center gap-3 p-3 text-gray-400 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
              <Calendar size={20} />
              <span className="font-medium">Leave Requests</span>
            </div>
          </Link>
          <Link href="/employee/payroll">
            <div className="flex items-center gap-3 p-3 text-gray-400 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
              <Wallet size={20} />
              <span className="font-medium">Payroll</span>
            </div>
          </Link>
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="mb-4 p-3 bg-dayflow-card rounded-xl border border-white/5">
            <p className="text-xs text-gray-400 mb-1">Signed in as</p>
            <p className="font-medium text-sm">{user.username}</p>
            <p className="text-xs text-dayflow-primary">{user.email}</p>
          </div>
          <button 
            onClick={() => authService.logout()} 
            className="flex items-center gap-3 w-full p-3 text-dayflow-danger hover:bg-dayflow-danger/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome Back!</h1>
            <p className="text-gray-400 text-sm">
              Have a productive day, {user.first_name || user.username}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-3">
              <p className="text-sm font-medium">{getDisplayName()}</p>
              <p className="text-xs text-gray-400">{user.designation || 'Employee'}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-dayflow-primary flex items-center justify-center font-bold text-lg ring-4 ring-dayflow-card">
              {getInitials()}
            </div>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-dayflow-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Paid Leave Balance</h3>
              <Calendar className="text-dayflow-primary" size={20} />
            </div>
            <p className="text-3xl font-bold">{user.paid_leave_balance ?? 24}</p>
            <p className="text-xs text-gray-500 mt-1">days remaining</p>
          </div>

          <div className="bg-dayflow-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Sick Leave Balance</h3>
              <Calendar className="text-green-500" size={20} />
            </div>
            <p className="text-3xl font-bold">{user.sick_leave_balance ?? 7}</p>
            <p className="text-xs text-gray-500 mt-1">days remaining</p>
          </div>

          <div className="bg-dayflow-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Employee ID</h3>
              <UserIcon className="text-purple-400" size={20} />
            </div>
            <p className="text-2xl font-bold">{user.employee_id || 'Not Assigned'}</p>
            <p className="text-xs text-gray-500 mt-1">identification</p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-dayflow-card p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <UserIcon size={20} className="text-dayflow-primary" />
              Personal Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Email Address</p>
                  <p className="font-medium">{user.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Phone Number</p>
                  <p className="font-medium">{user.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="font-medium">{user.location || 'Not provided'}</p>
                </div>
              </div>
              {user.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-400">Address</p>
                    <p className="font-medium">{user.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-dayflow-card p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-dayflow-primary" />
              Employment Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Briefcase size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Department</p>
                  <p className="font-medium">{user.department || 'Not assigned'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserIcon size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Designation</p>
                  <p className="font-medium">{user.designation || 'Not assigned'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Joining Date</p>
                  <p className="font-medium">
                    {user.joining_date 
                      ? new Date(user.joining_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Not recorded'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Last Login</p>
                  <p className="font-medium">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'First time login'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/employee/attendance">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-transform">
              <Clock className="text-blue-400 mb-3" size={32} />
              <h3 className="text-lg font-bold mb-2">Mark Attendance</h3>
              <p className="text-sm text-gray-400">Check-in for today</p>
            </div>
          </Link>
          
          <Link href="/employee/leaves">
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-transform">
              <Calendar className="text-green-400 mb-3" size={32} />
              <h3 className="text-lg font-bold mb-2">Apply for Leave</h3>
              <p className="text-sm text-gray-400">Request time off</p>
            </div>
          </Link>
          
          <Link href="/employee/payroll">
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-transform">
              <Wallet className="text-purple-400 mb-3" size={32} />
              <h3 className="text-lg font-bold mb-2">View Payroll</h3>
              <p className="text-sm text-gray-400">Salary slips</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}