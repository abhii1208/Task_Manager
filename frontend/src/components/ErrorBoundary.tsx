import { Component, ErrorInfo, ReactNode } from "react";

import { Button } from "./ui/Button";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error(error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-page-bg px-4">
          <div className="w-full max-w-md rounded-2xl border border-violet-border bg-white p-6 text-center shadow-sm">
            <h1 className="text-xl font-bold text-text-main">Something went wrong.</h1>
            <p className="mt-2 text-sm text-text-secondary">Try reloading the app or signing in again.</p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button variant="secondary" onClick={() => window.history.go(0)}>
                Reload app
              </Button>
              <a
                href="/#/login"
                className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
