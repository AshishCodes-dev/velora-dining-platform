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
          <div className="max-w-md w-full nocturne-surface rounded-2xl p-8 border border-border text-center space-y-6 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-danger/15 border border-danger/30 flex items-center justify-center mx-auto text-danger">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif-display text-2xl font-semibold text-text">
                Something went wrong
              </h2>
              <p className="text-xs text-text-soft leading-relaxed">
                An unexpected error occurred while rendering this view. Our kitchen telemetry has logged the issue.
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-3 rounded-lg bg-black/40 border border-border font-mono-tabular text-[11px] text-danger text-left overflow-x-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow hover:bg-yellow-hover text-black text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:border-yellow text-text text-xs font-semibold transition-colors"
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
