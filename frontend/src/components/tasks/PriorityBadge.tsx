import { TaskPriority } from "../../types/task";
import { PRIORITY_LABELS } from "../../utils/constants";
import { Badge } from "../ui/Badge";

const classMap: Record<TaskPriority, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-red-100 text-red-700"
};

export const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  return (
    <Badge tone="neutral" className={classMap[priority]}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
};
