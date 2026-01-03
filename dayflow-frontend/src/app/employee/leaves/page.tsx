"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, User } from "@/services/authService";
import { leaveService, LeaveRequest } from "@/services/leaveService";
import { Clock, Calendar, LogOut, LayoutGrid, Wallet, Plus } from "lucide-react";
import { LeaveApplicationForm } from "@/components/leaves/LeaveApplicationForm";
import { LeaveRequestCard } from "@/components/leaves/LeaveRequestCard";
import { Button } from "@/components/ui/Button";

export default function EmployeeLeavesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');

  useEffect(() => {
    initPage();
  }, []);

  const initPage = async () => {
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
    await fetchLeaves();
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getLeaves({ ordering: '-start_date' });
      
      console.log('Leaves response:', response); // Debug log
      
      // Handle both array and paginated response
      let leaveList = [];
      if (Array.isArray(response)) {
        leaveList = response;
      } else if (response.results && Array.isArray(response.results)) {
        leaveList = response.results;
      }
      
      setLeaves(leaveList);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    fetchLeaves();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dayflow-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-dayflow-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredLeaves = filter === 'all' 
    ? leaves 
    : leaves.filter(leave => leave.status === filter);

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
          <div
            onClick={() => router.push('/employee/dashboard')}
            className="flex items-center gap-3 p-3 text-gray-400 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
          >
            <LayoutGrid size={20} />
            <span className="font-medium">Dashboard</span>
          </div>
          <div
            onClick={() => router.push('/employee/attendance')}
            className="flex items-center gap-3 p-3 text-gray-400 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
          >
            <Clock size={20} />
            <span className="font-medium">Attendance</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-dayflow-primary/10 text-dayflow-primary rounded-xl cursor-pointer">
            <Calendar size={20} />
            <span className="font-medium">Leave Requests</span>
          </div>
          <div
            onClick={() => router.push('/employee/payroll')}
            className="flex items-center gap-3 p-3 text-gray-400 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
          >
            <Wallet size={20} />
            <span className="font-medium">Payroll</span>
          </div>
        </nav>
        <div className="p-4 border-t border-white/10">
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
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Leave Management</h1>
            <p className="text-gray-400">Apply for leave and track your requests</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={20} className="mr-2" />
            {showForm ? 'Close Form' : 'Apply for Leave'}
          </Button>
        </header>

        {/* Leave Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-dayflow-card p-6 rounded-2xl border border-white/10">
            <h3 className="text-sm text-gray-400 mb-2">Paid Leave Balance</h3>
            <p className="text-4xl font-bold text-dayflow-primary">{user.paid_leave_balance ?? 24}</p>
            <p className="text-xs text-gray-500 mt-1">days remaining</p>
          </div>
          <div className="bg-dayflow-card p-6 rounded-2xl border border-white/10">
            <h3 className="text-sm text-gray-400 mb-2">Sick Leave Balance</h3>
            <p className="text-4xl font-bold text-green-500">{user.sick_leave_balance ?? 7}</p>
            <p className="text-xs text-gray-500 mt-1">days remaining</p>
          </div>
        </div>

        {/* Application Form */}
        {showForm && (
          <div className="bg-dayflow-card p-6 rounded-2xl border border-white/10 mb-8">
            <h3 className="text-xl font-bold mb-6">Apply for Leave</h3>
            <LeaveApplicationForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          {['all', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-dayflow-primary text-white'
                  : 'bg-dayflow-card text-gray-400 hover:bg-white/5'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>

        {/* Leave Requests List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-dayflow-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="text-center py-12 bg-dayflow-card rounded-2xl border border-white/10">
            <Calendar className="mx-auto text-gray-500 mb-4" size={48} />
            <p className="text-gray-400">No leave requests found</p>
            <p className="text-sm text-gray-500 mt-2">Click "Apply for Leave" to create one</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredLeaves.map((leave) => (
              <LeaveRequestCard key={leave.id} leave={leave} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}