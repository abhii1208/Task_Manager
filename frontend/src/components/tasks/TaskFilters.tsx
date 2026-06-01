import { ListFilter } from "lucide-react";

import { TaskPriority, TaskSortBy, TaskSortOrder, TaskStage } from "../../types/task";
import { PRIORITIES, PRIORITY_LABELS, SORT_OPTIONS, STAGES, STAGE_LABELS } from "../../utils/constants";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";

type TaskFiltersProps = {
  stage: TaskStage | "ALL";
  priority: TaskPriority | "ALL";
  sortBy: TaskSortBy;
  sortOrder: TaskSortOrder;
  onStageChange: (value: TaskStage | "ALL") => void;
  onPriorityChange: (value: TaskPriority | "ALL") => void;
  onSortChange: (sortBy: TaskSortBy, sortOrder: TaskSortOrder) => void;
  onReset: () => void;
  showSort?: boolean;
};

export const TaskFilters = ({
  stage,
  priority,
  sortBy,
  sortOrder,
  onStageChange,
  onPriorityChange,
  onSortChange,
  onReset,
  showSort = false
}: TaskFiltersProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-t-2xl border-b border-violet-border bg-white px-3 py-3 sm:px-5">
      <Button variant="secondary" className="gap-2">
        <ListFilter size={16} />
        Filter
      </Button>

      <div className="hidden h-8 w-px bg-violet-border sm:block" />

      <Select
        value={stage}
        className="h-11 min-w-[170px] rounded-lg border-violet-border bg-white px-3 text-sm font-semibold"
        onChange={(event) => onStageChange(event.target.value as TaskStage | "ALL")}
      >
        <option value="ALL">Stage: All</option>
        {STAGES.map((item) => (
          <option key={item} value={item}>
            Stage: {STAGE_LABELS[item]}
          </option>
        ))}
      </Select>

      <Select
        value={priority}
        className="h-11 min-w-[170px] rounded-lg border-violet-border bg-white px-3 text-sm font-semibold"
        onChange={(event) => onPriorityChange(event.target.value as TaskPriority | "ALL")}
      >
        <option value="ALL">Priority: All</option>
        {PRIORITIES.map((item) => (
          <option key={item} value={item}>
            Priority: {PRIORITY_LABELS[item]}
          </option>
        ))}
      </Select>

      {showSort ? (
        <Select
          value={`${sortBy}:${sortOrder}`}
          className="h-11 min-w-[170px] rounded-lg border-violet-border bg-white px-3 text-sm font-semibold"
          onChange={(event) => {
            const [nextSortBy, nextSortOrder] = event.target.value.split(":") as [TaskSortBy, TaskSortOrder];
            onSortChange(nextSortBy, nextSortOrder);
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </Select>
      ) : null}

      <Button variant="ghost" className="ml-auto" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
};
