import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined });
        window.location.reload();
    };

    private handleGoHome = () => {
        this.setState({ hasError: false, error: undefined });
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
                    <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Something went wrong</h1>
                            <p className="text-slate-500 dark:text-slate-400">
                                We've encountered an unexpected error. Don't worry, your data is safe.
                            </p>
                            {this.state.error && (
                                <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg text-left overflow-auto max-h-32">
                                    <code className="text-xs text-red-500 font-mono">
                                        {this.state.error.message}
                                    </code>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <Button onClick={this.handleReset} className="w-full gap-2 py-6 text-lg">
                                <RefreshCcw className="w-5 h-5" />
                                Reload Page
                            </Button>
                            <Button onClick={this.handleGoHome} variant="outline" className="w-full gap-2 py-6 text-lg border-slate-200">
                                <Home className="w-5 h-5" />
                                Go to Homepage
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
