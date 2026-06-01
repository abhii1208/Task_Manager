import { Skeleton } from "../ui/Skeleton";

export const PageSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-44" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-48" />
    </div>
  );
};
