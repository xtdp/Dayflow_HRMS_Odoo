"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, User } from "@/services/authService";
import { Clock, Calendar, LogOut, LayoutGrid, Briefcase, Wallet } from "lucide-react";
import { CheckInOutCard } from "@/components/attendance/CheckInOutCard";
import { AttendanceCalendar } from "@/components/attendance/AttendanceCalendar";
import { AttendanceSummaryCard } from "@/components/attendance/AttendanceSummary";

export default function EmployeeAttendancePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      setLoading(false);
    };

    initPage();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dayflow-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-dayflow-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

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
          <div className="flex items-center gap-3 p-3 bg-dayflow-primary/10 text-dayflow-primary rounded-xl cursor-pointer">
            <Clock size={20} />
            <span className="font-medium">Attendance</span>
          </div>
          <div
            onClick={() => router.push('/employee/leaves')}
            className="flex items-center gap-3 p-3 text-gray-400 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
          >
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
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Attendance Management</h1>
          <p className="text-gray-400">Track your daily attendance and view history</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CheckInOutCard />
          <AttendanceSummaryCard />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <AttendanceCalendar />
        </div>
      </main>
    </div>
  );
}