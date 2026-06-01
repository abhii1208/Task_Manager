import { Skeleton } from "../ui/Skeleton";

export const ListSkeleton = () => {
  return (
    <div className="space-y-3">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  );
};
