import { Droppable } from "@hello-pangea/dnd";
import { Circle, Plus } from "lucide-react";

import { Task, TaskStage } from "../../types/task";
import { STAGE_LABELS } from "../../utils/constants";
import { TaskCard } from "./TaskCard";

type KanbanColumnProps = {
  stage: TaskStage;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onCreateTask?: (stage: TaskStage) => void;
  isTaskBusy?: (taskId: string) => boolean;
};

const dotClassMap: Record<TaskStage, string> = {
  TODO: "text-slate-500",
  IN_PROGRESS: "text-brand",
  DONE: "text-success"
};

export const KanbanColumn = ({ stage, tasks, onEdit, onDelete, onCreateTask, isTaskBusy }: KanbanColumnProps) => {
  return (
    <section className="w-[90vw] shrink-0 sm:w-[340px] lg:w-auto">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Circle size={11} fill="currentColor" className={dotClassMap[stage]} />
          <h3 className="text-[16px] font-bold tracking-tight text-text-main">{STAGE_LABELS[stage]}</h3>
          <span className="inline-flex min-w-6 justify-center rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-violet-border text-text-secondary transition hover:bg-brand-soft-bg hover:text-brand"
          onClick={() => onCreateTask?.(stage)}
          aria-label={`Add ${STAGE_LABELS[stage]} task`}
        >
          <Plus size={17} />
        </button>
      </div>

      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[240px] space-y-4 rounded-2xl border border-violet-border bg-white p-3 transition ${snapshot.isDraggingOver ? "bg-[#f3efff]" : ""}`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} draggable isBusy={isTaskBusy?.(task.id)} onEdit={onEdit} onDelete={onDelete} />
            ))}
            {provided.placeholder}

            <button
              type="button"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-success px-4 text-sm font-semibold text-white transition hover:bg-success-hover"
              onClick={() => onCreateTask?.(stage)}
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        )}
      </Droppable>
    </section>
  );
};
