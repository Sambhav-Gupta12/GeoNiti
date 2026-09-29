import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { IconButton } from './IconButton';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => removeToast(id), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-start p-4 bg-white rounded-lg shadow-lg border border-neutral-200 pointer-events-auto animate-in slide-in-from-right-full"
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500 mr-3 mt-0.5 shrink-0" />}
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-neutral-900">{toast.title}</h4>
              {toast.message && <p className="text-sm text-neutral-500 mt-1">{toast.message}</p>}
            </div>
            <IconButton icon={X} size="sm" variant="ghost" onClick={() => removeToast(toast.id)} className="ml-4 -mt-1 -mr-1" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
