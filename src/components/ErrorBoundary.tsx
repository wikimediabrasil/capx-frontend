"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update the state to show the alternative UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 m-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <details className="whitespace-pre-wrap">
              <summary>Show error details</summary>
              <p className="mt-2 font-mono text-sm overflow-auto max-h-96">
                {this.state.error?.toString()}
                <br />
                {this.state.error?.stack}
              </p>
            </details>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
