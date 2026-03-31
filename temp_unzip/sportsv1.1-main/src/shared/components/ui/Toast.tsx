import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info, Bell } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'message';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    title?: string;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type, title }]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 min-w-[320px] max-w-md">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
                            relative flex items-start gap-4 p-4 rounded-2xl shadow-2xl border backdrop-blur-md
                            animate-in slide-in-from-right-full duration-300
                            ${toast.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-900' :
                                toast.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-900' :
                                    toast.type === 'message' ? 'bg-blue-50/90 border-blue-200 text-blue-900' :
                                        'bg-white/90 border-slate-200 text-slate-900'}
                        `}
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                            {toast.type === 'message' && <Bell className="w-5 h-5 text-blue-600" />}
                            {toast.type === 'info' && <Info className="w-5 h-5 text-slate-600" />}
                        </div>
                        <div className="flex-1 space-y-1">
                            {toast.title && <h4 className="text-sm font-bold">{toast.title}</h4>}
                            <p className="text-sm font-medium leading-tight">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors"
                        >
                            <X className="w-4 h-4 opacity-50" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
