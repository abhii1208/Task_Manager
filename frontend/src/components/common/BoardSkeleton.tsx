import { Skeleton } from "../ui/Skeleton";

export const BoardSkeleton = () => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-1">
      <Skeleton className="h-[400px] w-[90vw] shrink-0 sm:w-[340px] lg:w-full" />
      <Skeleton className="h-[400px] w-[90vw] shrink-0 sm:w-[340px] lg:w-full" />
      <Skeleton className="h-[400px] w-[90vw] shrink-0 sm:w-[340px] lg:w-full" />
    </div>
  );
};
