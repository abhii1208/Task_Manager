import { cn } from "../../utils/cn";

export const Skeleton = ({ className }: { className?: string }) => {
  return <div className={cn("animate-pulse rounded-xl bg-[#ece9f8]", className)} />;
};
