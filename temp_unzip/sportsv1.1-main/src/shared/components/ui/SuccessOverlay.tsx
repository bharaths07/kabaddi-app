import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessOverlayProps {
    isVisible: boolean;
    message: string;
    autoCloseDelay?: number;
    onClose?: () => void;
}

export const SuccessOverlay: React.FC<SuccessOverlayProps> = ({
    isVisible,
    message,
    autoCloseDelay = 2000,
    onClose
}) => {
    useEffect(() => {
        if (isVisible && onClose && autoCloseDelay > 0) {
            const timer = setTimeout(onClose, autoCloseDelay);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose, autoCloseDelay]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-2xl border border-white/20 text-center space-y-6 max-w-sm mx-4 animate-in zoom-in-95 duration-300">
                <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-bounce">
                        <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Success!</h2>
                    <p className="text-xl font-medium text-slate-600 dark:text-slate-300">
                        {message}
                    </p>
                </div>

                <div className="pt-4 flex justify-center">
                    <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 animate-[progress_2s_ease-in-out_infinite]"
                            style={{ animationDuration: `${autoCloseDelay}ms` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
