import { forwardRef, TextareaHTMLAttributes, useId } from "react";

import { cn } from "../../utils/cn";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const autoId = useId();
    const areaId = id ?? autoId;

    return (
      <div>
        {label ? <label className="label-base" htmlFor={areaId}>{label}</label> : null}
        <textarea ref={ref} id={areaId} className={cn("input-base min-h-24 resize-y py-2", className)} {...props} />
        {error ? <p className="mt-1 text-[13px] font-medium text-danger">{error}</p> : hint ? <p className="mt-1 text-[13px] text-text-muted">{hint}</p> : null}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
