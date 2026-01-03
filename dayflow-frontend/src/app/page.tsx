import { Lock } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-dayflow-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dayflow-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-8 text-center border-b border-white/5 bg-white/5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dayflow-primary/20 text-dayflow-primary mb-4 ring-2 ring-dayflow-primary/50">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dayflow HRMS</h1>
          <p className="text-gray-400 text-sm mt-2">Secure Employee Portal</p>
        </div>
        <div className="p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}