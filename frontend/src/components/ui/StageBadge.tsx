import { STAGE_LABELS } from "../../utils/constants";
import { TaskStage } from "../../types/task";

type StageBadgeProps = {
  stage: TaskStage;
};

const stageClassMap: Record<TaskStage, string> = {
  TODO: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  DONE: "bg-green-100 text-green-700"
};

export const StageBadge = ({ stage }: StageBadgeProps) => {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${stageClassMap[stage]}`}>
      {STAGE_LABELS[stage]}
    </span>
  );
};
