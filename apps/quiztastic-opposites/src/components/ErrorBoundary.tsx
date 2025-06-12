import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Squircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI when an error occurs
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      const isDarkMode = document.documentElement.classList.contains('dark');

      return (
        <div className={`p-6 rounded-xl border ${
          isDarkMode
            ? 'bg-red-900 bg-opacity-20 border-red-800 text-red-200'
            : 'bg-red-50 border-red-200 text-red-800'
        } text-center`}>
          <Squircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Oops, something went wrong!</h3>
          <p className="mb-4">The game encountered an unexpected error.</p>
          <button
            onClick={this.handleReset}
            className={`${
              isDarkMode
                ? 'bg-red-700 hover:bg-red-600 text-white'
                : 'bg-red-100 hover:bg-red-200 text-red-700'
            } px-4 py-2 rounded-lg flex items-center mx-auto`}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
