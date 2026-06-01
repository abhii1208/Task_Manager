import { HTMLAttributes } from "react";

import { cn } from "../../utils/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
};

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-violet-100 text-violet-700"
};

export const Badge = ({ tone = "neutral", className, ...props }: BadgeProps) => {
  return (
    <span
      className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.05em]", toneClasses[tone], className)}
      {...props}
    />
  );
};
