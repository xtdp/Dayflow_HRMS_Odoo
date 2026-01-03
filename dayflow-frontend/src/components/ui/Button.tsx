import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({ isLoading, children, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-[0.98] 
        ${isLoading 
          ? 'bg-gray-700 cursor-wait' 
          : 'bg-gradient-to-r from-dayflow-primary to-purple-600 hover:shadow-lg hover:shadow-dayflow-primary/25'
        } ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}