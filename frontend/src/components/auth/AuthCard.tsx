import { ReactNode } from "react";

export const AuthCard = ({ children }: { children: ReactNode }) => {
  return (
    <div className="rounded-2xl border border-violet-border bg-white p-6 shadow-soft sm:p-8">
      {children}
    </div>
  );
};
