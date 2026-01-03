"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, LogOut, LayoutGrid, FileText } from "lucide-react";
import { authService, User } from "@/services/authService";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      router.push("/");
    } else {
      setUser(currentUser);
    }
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-dayflow-dark flex text-white">
      <aside className="w-64 bg-dayflow-card border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold tracking-tight">Dayflow<span className="text-dayflow-primary">.HR</span></h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div className="flex items-center gap-3 p-3 bg-dayflow-primary/10 text-dayflow-primary rounded-xl cursor-pointer">
            <LayoutGrid size={20} />
            <span className="font-medium">Dashboard</span>
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

      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>
            <p className="text-gray-400 text-sm">Welcome back, {user.username}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-dayflow-primary flex items-center justify-center font-bold ring-4 ring-dayflow-card">
            {user.username.charAt(0).toUpperCase()}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dayflow-card p-6 rounded-2xl border border-white/10">
            <h3 className="text-gray-400 text-sm font-medium">Total Employees</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          
          <button className="bg-dayflow-primary hover:bg-purple-600 rounded-2xl p-6 flex flex-col items-center justify-center transition-all shadow-lg hover:shadow-dayflow-primary/25 group">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <span className="font-bold">+ Add New Employee</span>
          </button>
        </div>
      </main>
    </div>
  );
}