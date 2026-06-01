import { ButtonHTMLAttributes } from "react";

import { cn } from "../../utils/cn";

type ButtonVariant = "create" | "primary" | "secondary" | "ghost" | "danger" | "brand" | "success" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
};

const variantClassMap: Record<ButtonVariant, string> = {
  create: "border border-transparent bg-success text-white shadow-sm hover:bg-success-hover",
  primary: "border border-transparent bg-primary text-white shadow-sm hover:bg-primary-hover",
  brand: "border border-transparent bg-primary text-white shadow-sm hover:bg-primary-hover",
  success: "border border-transparent bg-success text-white shadow-sm hover:bg-success-hover",
  secondary: "border border-violet-border bg-white text-text-secondary hover:bg-brand-soft-bg",
  ghost: "border border-transparent bg-transparent text-text-secondary hover:bg-brand-soft-bg",
  outline: "border border-violet-border bg-white text-primary hover:bg-brand-soft-bg",
  danger: "border border-transparent bg-danger text-white shadow-sm hover:bg-red-700"
};

const sizeClassMap: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-10 px-5 text-sm"
};

export const Button = ({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  loadingText = "Saving...",
  children,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 ease-premium active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-55",
        variantClassMap[variant],
        sizeClassMap[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? loadingText : children}
    </button>
  );
};
