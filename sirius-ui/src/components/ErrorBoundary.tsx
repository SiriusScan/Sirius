import React, { Component, ErrorInfo, ReactNode } from "react";

export interface ErrorBoundaryFallbackProps {
  error: Error;
  /** Clears the error and renders the children again. */
  reset: () => void;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /**
   * Renders a section-level fallback with the caught error and a reset
   * callback. Takes precedence over `fallback`. Without either prop the
   * boundary keeps its full-page "Something went wrong" screen.
   */
  renderFallback?: (props: ErrorBoundaryFallbackProps) => ReactNode;
  /** Called after the boundary catches an error (logging stays as it was). */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError && this.props.renderFallback) {
      return this.props.renderFallback({
        error: this.state.error ?? new Error("Unknown error"),
        reset: this.reset,
      });
    }

    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="mb-4 rounded-lg bg-red-500/10 p-6">
                <svg
                  className="mx-auto h-12 w-12 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-white">
                Something went wrong
              </h2>
              <p className="mb-4 text-gray-400">
                An error occurred while loading this page.
              </p>
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                className="rounded-md bg-violet-600 px-4 py-2 text-white transition-colors hover:bg-violet-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
