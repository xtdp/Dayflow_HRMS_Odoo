// src/components/ui/Input.tsx
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
}

export default function Input({ label, icon: Icon, ...props }: InputProps) {
  return (
    <div className="space-y-1.5 group">
      {label && <label className="text-sm font-medium text-gray-400">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-500 group-focus-within:text-dayflow-primary transition-colors" />
          </div>
        )}
        <input
          {...props}
          className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 ${
            Icon ? 'pl-11' : 'px-4'
          } pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-dayflow-primary/50 focus:border-dayflow-primary transition-all`}
        />
      </div>
    </div>
  );
}