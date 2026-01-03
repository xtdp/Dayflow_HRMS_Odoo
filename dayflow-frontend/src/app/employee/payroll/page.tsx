"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, User } from "@/services/authService";
import { payrollService, Payroll } from "@/services/payrollService";
import { Clock, Calendar, LogOut, LayoutGrid, Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import { SalarySlipCard } from "@/components/payroll/SalarySlipCard";

export default function EmployeePayrollPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(true);

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
    await fetchPayrolls();
  };

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const response = await payrollService.getPayrolls({ ordering: '-month' });
      
      console.log('Employee payrolls response:', response); // Debug log
      
      // Handle both array and paginated response
      let payrollList = [];
      if (Array.isArray(response)) {
        payrollList = response;
      } else if (response.results && Array.isArray(response.results)) {
        payrollList = response.results;
      }
      
      setPayrolls(payrollList);
      
      // Select most recent payroll
      if (payrollList.length > 0) {
        setSelectedPayroll(payrollList[0]);
      }
    } catch (err) {
      console.error('Failed to fetch payrolls:', err);
      setPayrolls([]);
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
          <div
            onClick={() => router.push('/employee/leaves')}
            className="flex items-center gap-3 p-3 text-gray-400 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
          >
            <Calendar size={20} />
            <span className="font-medium">Leave Requests</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-dayflow-primary/10 text-dayflow-primary rounded-xl cursor-pointer">
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
          <h1 className="text-3xl font-bold mb-2">Payroll & Salary</h1>
          <p className="text-gray-400">View your salary details and payment history</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-dayflow-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : payrolls.length === 0 ? (
          <div className="text-center py-12 bg-dayflow-card rounded-2xl border border-white/10">
            <Wallet className="mx-auto text-gray-500 mb-4" size={48} />
            <p className="text-gray-400">No payroll records found</p>
            <p className="text-sm text-gray-500 mt-2">Contact HR for more information</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Month Selector */}
            <div className="lg:col-span-1">
              <div className="bg-dayflow-card p-6 rounded-2xl border border-white/10 sticky top-8">
                <h3 className="text-lg font-bold mb-4">Payment History</h3>
                <div className="space-y-2">
                  {payrolls.map((payroll) => {
                    const monthName = new Date(payroll.month).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    });
                    const isSelected = selectedPayroll?.id === payroll.id;

                    return (
                      <button
                        key={payroll.id}
                        onClick={() => setSelectedPayroll(payroll)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-dayflow-primary text-white'
                            : 'bg-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        <p className="font-medium">{monthName}</p>
                        <p className="text-sm opacity-75">
                          ₹{Number(payroll.net_salary).toLocaleString('en-IN')}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Salary Slip */}
            <div className="lg:col-span-2">
              {selectedPayroll && <SalarySlipCard payroll={selectedPayroll} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}