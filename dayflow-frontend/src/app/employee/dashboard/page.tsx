"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, User } from "@/services/authService";

export default function EmployeeDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== "EMPLOYEE") {
      router.push("/");
    } else {
      setUser(currentUser);
    }
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-dayflow-dark flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Employee Portal</h1>
        <p className="text-gray-400 mt-2">Welcome, {user.username}</p>
        <button onClick={() => authService.logout()} className="mt-6 px-6 py-2 bg-dayflow-danger rounded-lg hover:bg-red-600">Logout</button>
      </div>
    </div>
  );
}