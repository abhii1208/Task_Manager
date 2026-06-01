import { TaskPriority } from "../../types/task";
import { PRIORITY_LABELS } from "../../utils/constants";
import { Badge } from "../ui/Badge";

const classMap: Record<TaskPriority, string> = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-red-100 text-red-700"
};

export const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  return (
    <Badge tone="neutral" className={classMap[priority]}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
};
