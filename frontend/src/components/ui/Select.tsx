import { forwardRef, SelectHTMLAttributes, useId } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "../../utils/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className, children, id, ...props }, ref) => {
    const autoId = useId();
    const selectId = id ?? autoId;

    return (
      <div>
        {label ? <label className="label-base" htmlFor={selectId}>{label}</label> : null}
        <div className="relative">
          <select ref={ref} id={selectId} className={cn("input-base appearance-none pr-10", className)} {...props}>
            {children}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
        {error ? <p className="mt-1 text-xs font-semibold text-danger">{error}</p> : hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
      </div>
    );
  }
);

Select.displayName = "Select";
