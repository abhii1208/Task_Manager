type FullPageLoaderProps = {
  message?: string;
};

export const FullPageLoader = ({ message = "Loading TaskFlow Pro..." }: FullPageLoaderProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page-bg px-4">
      <div className="rounded-2xl border border-violet-border bg-white px-6 py-6 text-center shadow-sm">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-brand" />
        <p className="text-sm text-text-secondary">{message}</p>
      </div>
    </div>
  );
};
