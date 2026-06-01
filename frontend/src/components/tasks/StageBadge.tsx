import { Badge } from "../ui/Badge";
import { TaskStage } from "../../types/task";
import { STAGE_LABELS } from "../../utils/constants";

const toneMap: Record<TaskStage, "neutral" | "info" | "success"> = {
  TODO: "neutral",
  IN_PROGRESS: "info",
  DONE: "success"
};

export const StageBadge = ({ stage }: { stage: TaskStage }) => {
  const classMap: Record<TaskStage, string> = {
    TODO: "bg-slate-100 text-slate-600",
    IN_PROGRESS: "bg-violet-100 text-violet-700",
    DONE: "bg-green-100 text-green-700"
  };

  return (
    <Badge tone={toneMap[stage]} className={`normal-case tracking-normal ${classMap[stage]}`}>
      {STAGE_LABELS[stage]}
    </Badge>
  );
};
