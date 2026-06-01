import { STAGE_LABELS } from "../../utils/constants";
import { TaskStage } from "../../types/task";

type StageBadgeProps = {
  stage: TaskStage;
};

const stageClassMap: Record<TaskStage, string> = {
  TODO: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  DONE: "bg-emerald-100 text-emerald-700"
};

export const StageBadge = ({ stage }: StageBadgeProps) => {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${stageClassMap[stage]}`}>
      {STAGE_LABELS[stage]}
    </span>
  );
};
