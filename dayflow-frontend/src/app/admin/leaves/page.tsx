"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, User } from "@/services/authService";
import { leaveService, LeaveRequest } from "@/services/leaveService";
import { Users, LogOut, LayoutGrid, Calendar, Clock, Wallet } from "lucide-react";
import { LeaveRequestCard } from "@/components/leaves/LeaveRequestCard";
import { LeaveApprovalButtons } from "@/components/leaves/LeaveApprovalButtons";

export default function AdminLeavesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

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

    if (currentUser.role !== "ADMIN") {
      router.push("/employee/dashboard");
      return;
    }

    setUser(currentUser);
    await fetchLeaves();
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getLeaves({ ordering: '-start_date' });
      
      console.log('Admin leaves response:', response); // Debug log
      
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

  const pendingCount = leaves.filter(l => l.status === 'PENDING').length;
  const approvedCount = leaves.filter(l => l.status === 'APPROVED').length;
  const rejectedCount = leaves.filter(l => l.status === 'REJECTED').length;

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
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-3 p-3 text-gray-400 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
          >
            <LayoutGrid size={20} />
            <span className="font-medium">Dashboard</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-dayflow-primary/10 text-dayflow-primary rounded-xl cursor-pointer">
            <Calendar size={20} />
            <span className="font-medium">Leave Management</span>
          </div>
          <div
            onClick={() => router.push('/admin/payroll')}
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
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leave Management</h1>
          <p className="text-gray-400">Approve or reject employee leave requests</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-dayflow-card p-6 rounded-2xl border border-white/10">
            <h3 className="text-sm text-gray-400 mb-2">Total Requests</h3>
            <p className="text-3xl font-bold">{leaves.length}</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-2xl">
            <h3 className="text-sm text-gray-400 mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-500">{pendingCount}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl">
            <h3 className="text-sm text-gray-400 mb-2">Approved</h3>
            <p className="text-3xl font-bold text-green-500">{approvedCount}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl">
            <h3 className="text-sm text-gray-400 mb-2">Rejected</h3>
            <p className="text-3xl font-bold text-red-500">{rejectedCount}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          {[
            { value: 'PENDING', label: 'Pending', count: pendingCount },
            { value: 'all', label: 'All', count: leaves.length },
            { value: 'APPROVED', label: 'Approved', count: approvedCount },
            { value: 'REJECTED', label: 'Rejected', count: rejectedCount },
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => setFilter(status.value as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status.value
                  ? 'bg-dayflow-primary text-white'
                  : 'bg-dayflow-card text-gray-400 hover:bg-white/5'
              }`}
            >
              {status.label} ({status.count})
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
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredLeaves.map((leave) => (
              <LeaveRequestCard
                key={leave.id}
                leave={leave}
                showEmployee={true}
                actions={
                  leave.status === 'PENDING' ? (
                    <LeaveApprovalButtons leaveId={leave.id} onSuccess={fetchLeaves} />
                  ) : null
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}