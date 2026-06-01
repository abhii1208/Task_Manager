import { Badge } from "../ui/Badge";
import { TaskStage } from "../../types/task";
import { STAGE_LABELS } from "../../utils/constants";

const toneMap: Record<TaskStage, "neutral" | "info" | "success"> = {
  TODO: "neutral",
  IN_PROGRESS: "info",
  DONE: "success"
};

export const StageBadge = ({ stage }: { stage: TaskStage }) => {
  return <Badge tone={toneMap[stage]} className="normal-case tracking-normal">{STAGE_LABELS[stage]}</Badge>;
};
