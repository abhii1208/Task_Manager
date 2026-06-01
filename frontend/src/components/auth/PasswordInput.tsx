import { forwardRef, InputHTMLAttributes, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "../../utils/cn";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <div>
        {label ? <label className="label-base" htmlFor={inputId}>{label}</label> : null}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={isVisible ? "text" : "password"}
            className={cn("input-base pr-11", className)}
            {...props}
          />
          <button
            type="button"
            onClick={() => setIsVisible((current) => !current)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-text-muted transition hover:bg-brand-soft"
            aria-label={isVisible ? "Hide password" : "Show password"}
          >
            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error ? <p className="mt-1 text-[13px] font-medium text-danger">{error}</p> : hint ? <p className="mt-1 text-[13px] text-text-muted">{hint}</p> : null}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
