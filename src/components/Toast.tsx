import React, { useEffect } from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose, duration = 3500 }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-emerald-950/90 text-emerald-100 border-emerald-700/50 shadow-emerald-950/40',
    error: 'bg-rose-950/90 text-rose-100 border-rose-700/50 shadow-rose-950/40',
    info: 'bg-slate-900/95 text-slate-100 border-slate-700/60 shadow-slate-950/40',
  }[toast.type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[toast.type];

  return (
    <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md max-w-md ${bgStyles}`}
      >
        <Icon className="w-5 h-5 shrink-0 opacity-90" />
        <p className="text-sm font-medium pr-2 leading-snug">{toast.text}</p>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors ml-auto text-white/70 hover:text-white"
          title="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
