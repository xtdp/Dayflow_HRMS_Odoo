"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, User } from "@/services/authService";
import { payrollService, Payroll } from "@/services/payrollService";
import { userService } from "@/services/userService";
import { Wallet, LogOut, LayoutGrid, Calendar, Plus, X } from "lucide-react";
import { SalarySlipCard } from "@/components/payroll/SalarySlipCard";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AdminPayrollPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

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
    await Promise.all([fetchPayrolls(), fetchEmployees()]);
  };

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const response = await payrollService.getPayrolls({ ordering: '-month' });
      
      console.log('Payrolls response:', response); // Debug log
      
      // Handle both array and paginated response
      let payrollList = [];
      if (Array.isArray(response)) {
        payrollList = response;
      } else if (response.results && Array.isArray(response.results)) {
        payrollList = response.results;
      }
      
      setPayrolls(payrollList);
    } catch (err) {
      console.error('Failed to fetch payrolls:', err);
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await userService.getEmployees();
      
      console.log('Employees response:', response); // Debug log
      
      // Handle both array and paginated response
      let employeeList = [];
      if (Array.isArray(response)) {
        employeeList = response;
      } else if (response.results && Array.isArray(response.results)) {
        employeeList = response.results;
      }
      
      setEmployees(employeeList);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setEmployees([]);
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
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-3 p-3 text-gray-400 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
          >
            <LayoutGrid size={20} />
            <span className="font-medium">Dashboard</span>
          </div>
          <div
            onClick={() => router.push('/admin/leaves')}
            className="flex items-center gap-3 p-3 text-gray-400 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
          >
            <Calendar size={20} />
            <span className="font-medium">Leave Management</span>
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
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Payroll Management</h1>
            <p className="text-gray-400">Manage employee salaries and payment records</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? <X size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
            {showCreateForm ? 'Close' : 'Create Payroll'}
          </Button>
        </header>

        {/* Debug Info */}
        {employees.length === 0 && !loading && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-500">
              No employees found. Employees count: {employees.length}
            </p>
          </div>
        )}

        {/* Create Payroll Form */}
        {showCreateForm && (
          <CreatePayrollForm
            employees={employees}
            onSuccess={() => {
              setShowCreateForm(false);
              fetchPayrolls();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Payroll List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-dayflow-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : payrolls.length === 0 ? (
          <div className="text-center py-12 bg-dayflow-card rounded-2xl border border-white/10">
            <Wallet className="mx-auto text-gray-500 mb-4" size={48} />
            <p className="text-gray-400">No payroll records found</p>
            <p className="text-sm text-gray-500 mt-2">Click "Create Payroll" to add one</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {payrolls.map((payroll) => (
              <SalarySlipCard key={payroll.id} payroll={payroll} showEmployee={true} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Create Payroll Form Component
function CreatePayrollForm({ employees, onSuccess, onCancel }: {
  employees: User[];
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    employee: '',
    month: '',
    basic_salary: '',
    hra: '',
    standard_allowance: '',
    other_allowances: '',
    pf: '',
    professional_tax: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await payrollService.createPayroll({
        employee: Number(formData.employee),
        month: formData.month,
        basic_salary: Number(formData.basic_salary),
        hra: Number(formData.hra),
        standard_allowance: Number(formData.standard_allowance || 0),
        other_allowances: Number(formData.other_allowances || 0),
        pf: Number(formData.pf),
        professional_tax: Number(formData.professional_tax)
      });
      onSuccess();
    } catch (err: any) {
      console.error('Create payroll error:', err);
      setError(typeof err === 'string' ? err : 'Failed to create payroll record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dayflow-card p-6 rounded-2xl border border-white/10 mb-8">
      <h3 className="text-xl font-bold mb-6">Create Payroll Record</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Employee * ({employees.length} available)
            </label>
            <select
              value={formData.employee}
              onChange={(e) => setFormData({...formData, employee: e.target.value})}
              className="w-full px-4 py-3 bg-dayflow-bg border border-white/10 rounded-lg text-white"
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name && emp.last_name 
                    ? `${emp.first_name} ${emp.last_name} (${emp.employee_id})`
                    : `${emp.username} (${emp.employee_id})`
                  }
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Month *"
            type="month"
            value={formData.month.substring(0, 7)}
            onChange={(e) => setFormData({...formData, month: e.target.value + '-01'})}
            required
          />
        </div>

        <div className="border-t border-white/5 pt-4">
          <h4 className="font-medium text-green-500 mb-4">Earnings</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Basic Salary *"
              type="number"
              value={formData.basic_salary}
              onChange={(e) => setFormData({...formData, basic_salary: e.target.value})}
              required
              min="0"
            />
            <Input
              label="HRA *"
              type="number"
              value={formData.hra}
              onChange={(e) => setFormData({...formData, hra: e.target.value})}
              required
              min="0"
            />
            <Input
              label="Standard Allowance"
              type="number"
              value={formData.standard_allowance}
              onChange={(e) => setFormData({...formData, standard_allowance: e.target.value})}
              min="0"
            />
            <Input
              label="Other Allowances"
              type="number"
              value={formData.other_allowances}
              onChange={(e) => setFormData({...formData, other_allowances: e.target.value})}
              min="0"
            />
          </div>
        </div>

        <div className="border-t border-white/5 pt-4">
          <h4 className="font-medium text-red-500 mb-4">Deductions</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Provident Fund (PF) *"
              type="number"
              value={formData.pf}
              onChange={(e) => setFormData({...formData, pf: e.target.value})}
              required
              min="0"
            />
            <Input
              label="Professional Tax *"
              type="number"
              value={formData.professional_tax}
              onChange={(e) => setFormData({...formData, professional_tax: e.target.value})}
              required
              min="0"
            />
          </div>
        </div>

        {error && (
          <div className="bg-dayflow-danger/10 border border-dayflow-danger/20 rounded-lg p-3">
            <p className="text-sm text-dayflow-danger">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} className="flex-1">
            Create Payroll
          </Button>
        </div>
      </form>
    </div>
  );
}