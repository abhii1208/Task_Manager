import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-violet-border bg-white p-8 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-text-muted">404</p>
        <h1 className="mt-2 text-2xl font-bold text-text-main">Page not found</h1>
        <p className="mt-2 text-sm text-text-secondary">The page you requested does not exist.</p>
        <Link to="/" className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
};
