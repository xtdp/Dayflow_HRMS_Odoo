import { CheckCircle2, AlertCircle } from "lucide-react";

interface StatusMessageProps {
  type: 'success' | 'error' | 'idle' | 'loading';
  message: string;
}

export function StatusMessage({ type, message }: StatusMessageProps) {
  if (type === 'idle' || type === 'loading') return null;

  const isError = type === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;
  const colorClass = isError 
    ? "bg-dayflow-danger/10 border-dayflow-danger/20 text-dayflow-danger" 
    : "bg-dayflow-success/10 border-dayflow-success/20 text-dayflow-success";

  return (
    <div className={`p-3 border rounded-lg flex items-center gap-3 text-sm animate-fade-in ${colorClass}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      {message}
    </div>
  );
}