import { ReactNode } from "react";

export const AuthCard = ({ children }: { children: ReactNode }) => {
  return (
    <div className="rounded-2xl border border-violet-border bg-white p-5 shadow-sm sm:p-6">
      {children}
    </div>
  );
};
