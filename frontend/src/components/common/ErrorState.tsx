import { AlertTriangle } from "lucide-react";

import { Button } from "../ui/Button";

type ErrorStateProps = {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const ErrorState = ({
  title = "Something went wrong",
  message,
  actionLabel = "Try again",
  onAction
}: ErrorStateProps) => {
  const isBackendUnavailable =
    /network|failed to fetch|timeout|ECONNREFUSED|backend/i.test(message);

  const resolvedTitle = isBackendUnavailable ? "Backend unavailable" : title;
  const resolvedMessage = isBackendUnavailable
    ? "We could not connect to the backend right now. Please try again in a few seconds."
    : message;

  return (
    <div className="rounded-2xl border border-violet-border bg-white p-6 text-center shadow-sm">
      <AlertTriangle className="mx-auto mb-3 text-rose-500" />
      <h3 className="text-base font-bold text-text-main">{resolvedTitle}</h3>
      <p className="mt-1 text-sm text-text-secondary">{resolvedMessage}</p>
      {onAction ? (
        <Button className="mt-5" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};
