import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { HashRouter } from "react-router-dom";

import App from "./App";
import { AppErrorBoundary } from "./components/ErrorBoundary";
import { FullPageLoader } from "./components/ui/FullPageLoader";
import { ToastProvider } from "./components/ui/ToastProvider";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1
    },
    mutations: {
      retry: 0
    }
  }
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <AppErrorBoundary>
              <Suspense fallback={<FullPageLoader message="Loading workspace..." />}>
                <App />
              </Suspense>
              <ToastProvider />
            </AppErrorBoundary>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HashRouter>
  </React.StrictMode>
);
