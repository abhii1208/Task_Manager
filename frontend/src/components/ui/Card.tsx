import { HTMLAttributes } from "react";

import { cn } from "../../utils/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: CardProps) => {
  return <div className={cn("rounded-2xl border border-violet-border bg-white p-5 shadow-sm", className)} {...props} />;
};

type CardSectionProps = HTMLAttributes<HTMLDivElement>;

export const CardHeader = ({ className, ...props }: CardSectionProps) => {
  return <div className={cn("mb-4", className)} {...props} />;
};

export const CardContent = ({ className, ...props }: CardSectionProps) => {
  return <div className={cn("space-y-3", className)} {...props} />;
};

export const CardFooter = ({ className, ...props }: CardSectionProps) => {
  return <div className={cn("mt-4 border-t border-violet-border pt-4", className)} {...props} />;
};
