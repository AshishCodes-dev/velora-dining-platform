import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full nocturne-surface rounded-2xl p-8 border border-white/10 text-center space-y-6 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center mx-auto text-[#EF4444]">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
                Something went wrong
              </h2>
              <p className="text-xs text-[#B8AFC9] leading-relaxed">
                An unexpected error occurred while rendering this view. Our kitchen telemetry has logged the issue.
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-3 rounded-lg bg-black/40 border border-white/5 font-mono-tabular text-[11px] text-[#EF4444] text-left overflow-x-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 hover:border-white/30 text-[#F5F2FA] text-xs font-semibold transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
