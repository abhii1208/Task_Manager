import { forwardRef, InputHTMLAttributes, useId } from "react";

import { cn } from "../../utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <div>
        {label ? <label className="label-base" htmlFor={inputId}>{label}</label> : null}
        <input ref={ref} id={inputId} className={cn("input-base", className)} {...props} />
        {error ? <p className="mt-1 text-[13px] font-medium text-danger">{error}</p> : hint ? <p className="mt-1 text-[13px] text-text-muted">{hint}</p> : null}
      </div>
    );
  }
);

Input.displayName = "Input";
