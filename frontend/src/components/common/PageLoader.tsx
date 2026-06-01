export const PageLoader = ({ label = "Loading..." }: { label?: string }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page-bg px-4">
      <div className="rounded-2xl border border-violet-border bg-white px-8 py-7 text-center shadow-soft">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-brand" />
        <p className="text-sm text-text-secondary">{label}</p>
      </div>
    </div>
  );
};
