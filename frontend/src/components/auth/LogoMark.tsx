import { CheckCircle2 } from "lucide-react";
import { cn } from "../../utils/cn";

export const LogoMark = ({ compact = false, inverted = false }: { compact?: boolean; inverted?: boolean }) => {
  return (
    <div className="inline-flex items-center gap-2.5">
      <div
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-soft",
          inverted ? "border-white/70 bg-white/10 text-white" : "border-violet-border bg-brand text-white"
        )}
      >
        <CheckCircle2 size={22} />
      </div>
      {!compact ? (
        <span className={cn("heading-font text-[26px] font-bold tracking-tight", inverted ? "text-white" : "text-text-main")}>
          TaskFlow Pro
        </span>
      ) : null}
    </div>
  );
};
