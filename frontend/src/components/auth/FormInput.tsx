import { forwardRef, InputHTMLAttributes } from "react";

import { Input } from "../ui/Input";

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({ label, error, hint, ...props }, ref) => {
  return <Input ref={ref} label={label} error={error} hint={hint} {...props} />;
});

FormInput.displayName = "FormInput";
