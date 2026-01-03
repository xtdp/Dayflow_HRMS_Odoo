import { LucideIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
}

export function Input({ label, icon: Icon, ...props }: InputProps) {
  return (
    <div className="space-y-2 group">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-dayflow-primary transition-colors">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-500 group-focus-within:text-dayflow-primary transition-colors" />
        </div>
        <input
          {...props}
          className="w-full bg-dayflow-dark/50 border border-gray-700 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-dayflow-primary focus:ring-1 focus:ring-dayflow-primary transition-all placeholder:text-gray-600"
        />
      </div>
    </div>
  );
}