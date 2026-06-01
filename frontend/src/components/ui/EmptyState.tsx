import { ClipboardList } from "lucide-react";

import { Button } from "./Button";

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({ title, message, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <div className="rounded-2xl border border-violet-border bg-white p-8 text-center shadow-soft">
      <ClipboardList className="mx-auto mb-4 text-brand" size={34} />
      <h3 className="text-base font-bold text-text-main">{title}</h3>
      <p className="mt-1 text-sm text-text-secondary">{message}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};
