import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Enterprise-grade React Error Boundary component
 * Captures lifecycle and rendering exceptions, isolates faults, and enables clean state recovery.
 */
export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-3xl border border-rose-500/20 bg-rose-50/50 p-8 text-center backdrop-blur-md dark:border-rose-500/30 dark:bg-rose-950/20"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="font-serif text-xl font-bold text-brand-text">
            {this.props.fallbackTitle || 'Something went wrong in this module'}
          </h2>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-brand-text-secondary">
            {this.state.error?.message || 'An unexpected rendering error occurred. Your celebration data remains secure.'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-primary/20 transition-all hover:bg-brand-primary-hover active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reload Module</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
