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
  return (
    <div className="rounded-2xl border border-violet-border bg-white p-6 text-center shadow-soft">
      <AlertTriangle className="mx-auto mb-3 text-rose-500" />
      <h3 className="text-base font-bold text-text-main">{title}</h3>
      <p className="mt-1 text-sm text-text-secondary">{message}</p>
      {onAction ? (
        <Button className="mt-5" variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};
