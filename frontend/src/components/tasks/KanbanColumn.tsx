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
    <section className="w-[90vw] shrink-0 sm:w-[360px] lg:w-auto">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Circle size={11} fill="currentColor" className={dotClassMap[stage]} />
          <h3 className="text-[20px] font-bold tracking-tight text-text-main">{STAGE_LABELS[stage]}</h3>
          <span className="inline-flex min-w-7 justify-center rounded-md bg-brand-soft px-2 py-0.5 text-xs font-semibold text-text-secondary">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition hover:bg-brand-soft-bg hover:text-brand"
          onClick={() => onCreateTask?.(stage)}
          aria-label={`Add ${STAGE_LABELS[stage]} task`}
        >
          <Plus size={20} />
        </button>
      </div>

      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[260px] space-y-4 rounded-2xl p-1 transition ${snapshot.isDraggingOver ? "bg-[#f1edff]" : "bg-transparent"}`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} draggable isBusy={isTaskBusy?.(task.id)} onEdit={onEdit} onDelete={onDelete} />
            ))}
            {provided.placeholder}

            <button
              type="button"
              className="flex min-h-[74px] w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-border bg-white text-base font-semibold text-text-secondary transition hover:bg-brand-soft-bg hover:text-brand"
              onClick={() => onCreateTask?.(stage)}
            >
              <Plus size={20} />
              Add Task
            </button>
          </div>
        )}
      </Droppable>
    </section>
  );
};
