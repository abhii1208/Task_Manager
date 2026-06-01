import { Draggable } from "@hello-pangea/dnd";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import { Task } from "../../types/task";
import { cn } from "../../utils/cn";
import { formatDate, isOverdue } from "../../utils/date";
import { Button } from "../ui/Button";
import { PriorityBadge } from "./PriorityBadge";

type TaskCardProps = {
  task: Task;
  index?: number;
  draggable?: boolean;
  isBusy?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

const progressByStage: Record<Task["stage"], number> = {
  TODO: 15,
  IN_PROGRESS: 65,
  DONE: 100
};

const getInitial = (title: string): string => {
  const [first, second] = title.trim().split(" ");
  return `${first?.[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase() || "TM";
};

const TaskCardBody = ({ task, onEdit, onDelete, isBusy = false }: Omit<TaskCardProps, "index" | "draggable">) => {
  const progress = progressByStage[task.stage];
  const hasOverdueDate = isOverdue(task.dueDate) && task.stage !== "DONE";

  return (
    <article className={cn("rounded-xl border border-outline bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-[1px] hover:shadow-soft", isBusy ? "opacity-70" : "")}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <PriorityBadge priority={task.priority} />

        <div className="flex items-center gap-1">
          <Button variant="ghost" className="h-7 w-7 px-0 text-text-muted hover:text-brand" onClick={() => onEdit(task)} disabled={isBusy} aria-label="Edit task">
            <Pencil size={14} />
          </Button>
          <Button variant="danger" className="h-7 w-7 px-0" onClick={() => onDelete(task)} disabled={isBusy} aria-label="Delete task">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <h4 className="text-[15px] font-semibold text-text-main">{task.title}</h4>
      <p className="mt-2 text-[13px] text-text-secondary">{task.description || "No description provided."}</p>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[13px] font-medium text-text-secondary">Progress</span>
          <span className="text-[13px] font-semibold text-text-secondary">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200/80">
          <div
            className={cn("h-2 rounded-full transition-all", task.stage === "DONE" ? "bg-success" : "bg-brand")}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className={cn("inline-flex items-center gap-1.5 text-[13px]", hasOverdueDate ? "font-semibold text-danger" : "text-text-secondary")}>
          <CalendarDays size={13} />
          {task.stage === "DONE" ? `Completed ${formatDate(task.updatedAt)}` : formatDate(task.dueDate)}
        </div>

        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-brand">
          {getInitial(task.title)}
        </span>
      </div>
    </article>
  );
};

export const TaskCard = ({ task, index = 0, draggable = false, isBusy = false, onEdit, onDelete }: TaskCardProps) => {
  if (!draggable) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
        <TaskCardBody task={task} onEdit={onEdit} onDelete={onDelete} isBusy={isBusy} />
      </motion.div>
    );
  }

  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={isBusy}>
      {(provided, snapshot) => (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={cn("rounded-xl", snapshot.isDragging ? "shadow-[0_16px_35px_rgba(15,23,42,0.2)]" : "", isBusy ? "cursor-not-allowed" : "")}
          >
            <TaskCardBody task={task} onEdit={onEdit} onDelete={onDelete} isBusy={isBusy} />
          </div>
        </motion.div>
      )}
    </Draggable>
  );
};
