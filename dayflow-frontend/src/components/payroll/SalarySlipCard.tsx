"use client";

import { Payroll } from '@/services/payrollService';
import { Wallet, TrendingUp, TrendingDown, Download } from 'lucide-react';

interface Props {
  payroll: Payroll;
  showEmployee?: boolean;
}

export function SalarySlipCard({ payroll, showEmployee = false }: Props) {
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formatMonth = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-dayflow-card p-6 rounded-2xl border border-white/10">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold mb-1">Salary Slip</h3>
          <p className="text-sm text-gray-400">{formatMonth(payroll.month)}</p>
          {showEmployee && (
            <p className="text-sm text-dayflow-primary mt-1">{payroll.employee_name}</p>
          )}
        </div>
        <Wallet className="text-dayflow-primary" size={24} />
      </div>

      {/* Net Salary Highlight */}
      <div className="bg-dayflow-primary/10 border border-dayflow-primary/20 rounded-xl p-6 mb-6">
        <p className="text-sm text-gray-400 mb-2">Net Salary</p>
        <p className="text-4xl font-bold text-dayflow-primary">
          {formatCurrency(payroll.net_salary)}
        </p>
      </div>

      {/* Earnings */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-green-500" size={20} />
          <h4 className="font-bold text-green-500">Earnings</h4>
        </div>
        <div className="space-y-3 pl-7">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Basic Salary</span>
            <span className="font-medium">{formatCurrency(payroll.basic_salary)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">HRA</span>
            <span className="font-medium">{formatCurrency(payroll.hra)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Standard Allowance</span>
            <span className="font-medium">{formatCurrency(payroll.standard_allowance)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Other Allowances</span>
            <span className="font-medium">{formatCurrency(payroll.other_allowances)}</span>
          </div>
          <div className="flex justify-between text-sm pt-3 border-t border-white/5">
            <span className="font-bold text-green-500">Gross Salary</span>
            <span className="font-bold text-green-500">
              {formatCurrency(payroll.gross_salary)}
            </span>
          </div>
        </div>
      </div>

      {/* Deductions */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="text-red-500" size={20} />
          <h4 className="font-bold text-red-500">Deductions</h4>
        </div>
        <div className="space-y-3 pl-7">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Provident Fund (PF)</span>
            <span className="font-medium">{formatCurrency(payroll.pf)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Professional Tax</span>
            <span className="font-medium">{formatCurrency(payroll.professional_tax)}</span>
          </div>
          <div className="flex justify-between text-sm pt-3 border-t border-white/5">
            <span className="font-bold text-red-500">Total Deductions</span>
            <span className="font-bold text-red-500">
              {formatCurrency(payroll.total_deductions)}
            </span>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium">
        <Download size={16} />
        Download Salary Slip
      </button>
    </div>
  );
}