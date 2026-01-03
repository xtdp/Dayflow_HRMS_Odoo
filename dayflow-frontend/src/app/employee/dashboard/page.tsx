// ============================================
// app/admin/dashboard/page.tsx - Fixed Admin Dashboard
// ============================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, LogOut, LayoutGrid, Trash2, Edit } from "lucide-react";
import { authService, User } from "@/services/authService";
import { userService } from "@/services/userService";
import AddEmployeeModal from "@/components/admin/AddEmployeeModal";
import { Button } from "@/components/ui/Button";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await userService.getEmployees();
      
      // Handle paginated response
      if (data.results) {
        setEmployees(data.results);
      } else if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error("Fetch employees failed:", err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: number, username: string) => {
    if (!confirm(`Are you sure you want to delete employee "${username}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await userService.deleteEmployee(id);
      await fetchEmployees(); // Refresh the list
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete employee. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const initDashboard = async () => {
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        router.push("/");
        return;
      }

      // Get current user
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        authService.logout();
        return;
      }

      if (currentUser.role !== "ADMIN") {
        router.push("/employee/dashboard");
        return;
      }

      setUser(currentUser);
      fetchEmployees();
    };

    initDashboard();
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-dayflow-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const activeEmployees = employees.filter(emp => emp.is_active !== false);
  const totalDepartments = new Set(employees.map(emp => emp.department).filter(Boolean)).size;

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
          <div className="flex items-center gap-3 p-3 bg-dayflow-primary/10 text-dayflow-primary rounded-xl cursor-pointer">
            <LayoutGrid size={20} />
            <span className="font-medium">Dashboard</span>
          </div>
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
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>
            <p className="text-gray-400 text-sm">
              Welcome back, {user.first_name || user.username}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-3">
              <p className="text-sm font-medium">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-dayflow-primary flex items-center justify-center font-bold text-lg ring-4 ring-dayflow-card">
              {(user.first_name?.[0] || user.username[0]).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-dayflow-card p-6 rounded-2xl border border-white/10">
            <h3 className="text-gray-400 text-sm font-medium">Total Employees</h3>
            <p className="text-3xl font-bold mt-2">{activeEmployees.length}</p>
            <p className="text-xs text-gray-500 mt-1">Active accounts</p>
          </div>

          <div className="bg-dayflow-card p-6 rounded-2xl border border-white/10">
            <h3 className="text-gray-400 text-sm font-medium">Departments</h3>
            <p className="text-3xl font-bold mt-2">{totalDepartments}</p>
            <p className="text-xs text-gray-500 mt-1">Active departments</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-dayflow-primary hover:bg-purple-600 rounded-2xl p-6 flex flex-col items-center justify-center transition-all shadow-lg hover:shadow-dayflow-primary/25 group text-white col-span-1 md:col-span-2"
          >
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <span className="font-bold">+ Add New Employee</span>
          </button>
        </div>

        {/* Employee Directory */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Employee Directory</h2>
          <p className="text-sm text-gray-400">
            {activeEmployees.length} {activeEmployees.length === 1 ? 'employee' : 'employees'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-dayflow-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading employees...</p>
              </div>
            </div>
          ) : employees.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-dayflow-card rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-gray-500" />
              </div>
              <p className="text-gray-400 mb-2">No employees found</p>
              <p className="text-sm text-gray-500">Click "Add New Employee" to get started</p>
            </div>
          ) : (
            employees.map((emp) => (
              <div 
                key={emp.id} 
                className="bg-dayflow-card p-6 rounded-2xl border border-white/10 hover:border-dayflow-primary/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-dayflow-primary/20 flex items-center justify-center text-dayflow-primary font-bold text-lg flex-shrink-0">
                      {(emp.first_name?.[0] || emp.username[0]).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">
                        {emp.first_name && emp.last_name 
                          ? `${emp.first_name} ${emp.last_name}`
                          : emp.username
                        }
                      </h3>
                      <p className="text-dayflow-primary text-sm font-medium">
                        {emp.designation || 'Employee'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  {emp.is_active === false && (
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-20">Email:</span>
                    <span className="text-gray-300 truncate">
                      {emp.email || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-20">Emp ID:</span>
                    <span className="text-gray-300">
                      {emp.employee_id || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-20">Dept:</span>
                    <span className="text-gray-300 truncate">
                      {emp.department || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-20">Role:</span>
                    <span className={`font-medium ${emp.role === 'ADMIN' ? 'text-dayflow-primary' : 'text-gray-300'}`}>
                      {emp.role}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-white/5 flex gap-2">
                  <button
                    onClick={() => handleDeleteEmployee(emp.id, emp.username)}
                    disabled={deletingId === emp.id || emp.id === user.id}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-dayflow-danger/10 text-dayflow-danger hover:bg-dayflow-danger/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === emp.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-dayflow-danger border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        {emp.id === user.id ? "You" : "Delete"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add Employee Modal */}
      <AddEmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchEmployees} 
      />
    </div>
  );
}


// ============================================
// app/employee/dashboard/page.tsx - Fixed Employee Dashboard
// ============================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        router.push("/");
        return;
      }

      // Get current user from API
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
          <div className="flex items-center gap-3 p-3 bg-dayflow-primary/10 text-dayflow-primary rounded-xl cursor-pointer">
            <LayoutGrid size={20} />
            <span className="font-medium">Dashboard</span>
          </div>
          <div className="flex items-center gap-3 p-3 text-gray-400 hover:bg-white/5 rounded-xl cursor-pointer transition-colors opacity-50">
            <Clock size={20} />
            <span className="font-medium">Attendance</span>
          </div>
          <div className="flex items-center gap-3 p-3 text-gray-400 hover:bg-white/5 rounded-xl cursor-pointer transition-colors opacity-50">
            <Calendar size={20} />
            <span className="font-medium">Leave Requests</span>
          </div>
          <div className="flex items-center gap-3 p-3 text-gray-400 hover:bg-white/5 rounded-xl cursor-pointer transition-colors opacity-50">
            <Wallet size={20} />
            <span className="font-medium">Payroll</span>
          </div>
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

        {/* Coming Soon Notice */}
        <div className="mt-8 bg-dayflow-primary/10 border border-dayflow-primary/20 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-bold text-dayflow-primary mb-2">
            More Features Coming Soon!
          </h3>
          <p className="text-gray-400 text-sm">
            Attendance tracking, leave management, and payroll features will be available shortly.
          </p>
        </div>
      </main>
    </div>
    );
}