import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";

import { PaginationMeta } from "../../types/api";
import { Task } from "../../types/task";
import { formatDate } from "../../utils/date";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { PriorityBadge } from "./PriorityBadge";
import { StageBadge } from "./StageBadge";

type TaskListProps = {
  tasks: Task[];
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export const TaskList = ({ tasks, meta, onPageChange, onEdit, onDelete }: TaskListProps) => {
  if (!tasks.length) {
    return <EmptyState title="No tasks found" message="No tasks found. Create your first task." />;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-violet-border bg-white shadow-sm">
        <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_120px] gap-3 border-b border-violet-border bg-brand-soft-bg px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted md:grid">
          <p>Task</p>
          <p>Stage</p>
          <p>Priority</p>
          <p>Due Date</p>
          <p className="text-right">Actions</p>
        </div>

        <div className="divide-y divide-outline">
          {tasks.map((task) => (
            <div key={task.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_120px] md:items-center">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-main">{task.title}</p>
                <p className="mt-1 text-[13px] text-text-secondary">{task.description || "No description"}</p>
                {task.tags.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {task.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-brand-soft-bg px-2 py-0.5 text-[11px] font-medium text-violet-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-slate-400 md:hidden">Stage</p>
                <StageBadge stage={task.stage} />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-slate-400 md:hidden">Priority</p>
                <PriorityBadge priority={task.priority} />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-slate-400 md:hidden">Due Date</p>
                <p className="text-[13px] text-text-secondary">{formatDate(task.dueDate)}</p>
              </div>

              <div className="flex justify-start gap-1 md:justify-end">
                <Button variant="ghost" className="h-8 w-8 px-0" onClick={() => onEdit(task)} aria-label="Edit task">
                  <Pencil size={14} />
                </Button>
                <Button variant="danger" className="h-8 w-8 px-0" onClick={() => onDelete(task)} aria-label="Delete task">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-border bg-white p-3 shadow-sm">
        <p className="text-[13px] text-text-secondary">
          Page {meta.page} of {meta.totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)} className="h-9 px-3">
            <ChevronLeft size={16} />
          </Button>
          <Button variant="secondary" disabled={meta.page >= meta.totalPages} onClick={() => onPageChange(meta.page + 1)} className="h-9 px-3">
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
