import { Activity, CalendarClock, CheckCircle2, Clock3, ListTodo, Loader2, PlusCircle, TimerReset } from "lucide-react";
import { ReactNode, useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ErrorState } from "../components/common/ErrorState";
import { PageTransition } from "../components/common/PageTransition";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { TaskModal } from "../components/tasks/TaskModal";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";
import { useTasks } from "../hooks/useTasks";
import { AppLayout } from "../layouts/AppLayout";
import { Task, TaskPayload } from "../types/task";
import { formatDate, formatDateTime } from "../utils/date";

const cardBaseClass = "rounded-2xl border border-violet-border bg-white p-5 shadow-soft";

const StatCard = ({
  label,
  value,
  icon,
  isLoading
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  isLoading?: boolean;
}) => (
  <div className={cardBaseClass}>
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold uppercase tracking-[0.06em] text-text-secondary">{label}</span>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">{icon}</span>
    </div>
    {isLoading ? <Skeleton className="mt-3 h-9 w-24" /> : <p className="mt-3 text-3xl font-extrabold text-text-main">{value}</p>}
  </div>
);

export const DashboardPage = () => {
  const {
    tasks,
    summary,
    recentActivity,
    upcomingDeadlines,
    isLoading,
    isMutating,
    isSummaryLoading,
    isActivityLoading,
    error,
    refreshAll,
    createTask,
    updateTask,
    deleteTask
  } = useTasks({
    initialQuery: {
      page: 1,
      limit: 20,
      sortBy: "dueDate",
      sortOrder: "asc"
    },
    withInsights: true
  });

  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const openCreateTask = useCallback(() => {
    setEditingTask(null);
    setTaskModalOpen(true);
  }, []);

  useKeyboardShortcut({
    key: "n",
    enabled: true,
    onTrigger: openCreateTask
  });

  const handleSaveTask = async (payload: TaskPayload): Promise<void> => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, payload);
        toast.success("Task updated");
      } else {
        await createTask(payload);
        toast.success("Task created");
      }

      setTaskModalOpen(false);
      setEditingTask(null);
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to save task");
    }
  };

  const handleDeleteTask = async (): Promise<void> => {
    if (!deletingTask) {
      return;
    }

    try {
      await deleteTask(deletingTask.id);
      toast.success("Task deleted");
      setDeletingTask(null);
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : "Unable to delete task");
    }
  };

  const completionRateLabel = useMemo(() => `${summary?.completionRate ?? 0}%`, [summary?.completionRate]);

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Track progress, deadlines, and delivery health."
      onCreateTask={openCreateTask}
      createButtonLabel="Create Task"
      searchPlaceholder="Search tasks..."
    >
      <PageTransition>
        {error ? <ErrorState message={error} onAction={() => void refreshAll()} /> : null}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Tasks" value={summary?.totalTasks ?? 0} icon={<ListTodo size={16} />} isLoading={isSummaryLoading} />
          <StatCard label="Todo" value={summary?.todoCount ?? 0} icon={<TimerReset size={16} />} isLoading={isSummaryLoading} />
          <StatCard label="In Progress" value={summary?.inProgressCount ?? 0} icon={<Loader2 size={16} />} isLoading={isSummaryLoading} />
          <StatCard label="Done" value={summary?.doneCount ?? 0} icon={<CheckCircle2 size={16} />} isLoading={isSummaryLoading} />
          <StatCard label="Completion Rate" value={completionRateLabel} icon={<Activity size={16} />} isLoading={isSummaryLoading} />
          <StatCard label="Overdue Tasks" value={summary?.overdueTasks ?? 0} icon={<CalendarClock size={16} />} isLoading={isSummaryLoading} />
          <StatCard label="Upcoming Deadlines" value={summary?.upcomingTasks ?? 0} icon={<Clock3 size={16} />} isLoading={isSummaryLoading} />

          <div className={cardBaseClass}>
            <p className="text-sm font-semibold uppercase tracking-[0.06em] text-text-secondary">Quick Action</p>
            <button
              type="button"
              onClick={openCreateTask}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-success px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98]"
            >
              <PlusCircle size={16} />
              Create Task (N)
            </button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className={cardBaseClass}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-main">Recent Activity</h2>
              <p className="text-sm font-medium text-text-muted">Latest changes</p>
            </div>

            {isActivityLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : recentActivity.length ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 6).map((item) => (
                  <div key={item.id} className="rounded-xl border border-violet-border bg-white p-3">
                    <p className="text-sm font-semibold text-text-main">{item.message}</p>
                    <p className="mt-1 text-sm text-text-muted">{formatDateTime(item.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">No activity yet.</p>
            )}
          </div>

          <div className="space-y-4">
            <div className={cardBaseClass}>
              <h2 className="text-xl font-bold text-text-main">Upcoming Deadlines</h2>
              <div className="mt-3 space-y-2">
                {isLoading ? (
                  <>
                    <Skeleton className="h-14" />
                    <Skeleton className="h-14" />
                  </>
                ) : upcomingDeadlines.length ? (
                  upcomingDeadlines.map((task) => (
                    <button
                      key={task.id}
                      className="w-full rounded-xl border border-violet-border bg-white p-3 text-left transition hover:shadow-sm"
                      onClick={() => {
                        setEditingTask(task);
                        setTaskModalOpen(true);
                      }}
                    >
                      <p className="truncate text-sm font-semibold text-text-main">{task.title}</p>
                      <p className="mt-1 text-sm text-text-secondary">{formatDate(task.dueDate)}</p>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-text-secondary">No upcoming deadlines.</p>
                )}
              </div>
            </div>

            <div className={cardBaseClass}>
              <h2 className="text-xl font-bold text-text-main">Progress</h2>
              <p className="mt-2 text-sm text-text-secondary">
                {summary?.doneCount ?? 0} of {summary?.totalTasks ?? 0} tasks completed
              </p>
              <div className="mt-3 h-3 w-full rounded-full bg-slate-200">
                <div className="h-3 rounded-full bg-brand transition-all" style={{ width: `${summary?.completionRate ?? 0}%` }} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-2xl font-extrabold text-text-main">Recent Tasks</h2>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className={cardBaseClass}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-text-main">{task.title}</p>
                    <p className="text-sm text-text-secondary">Due {formatDate(task.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => { setEditingTask(task); setTaskModalOpen(true); }}>
                      Edit
                    </Button>
                    <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setDeletingTask(task)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </PageTransition>

      <TaskModal
        open={isTaskModalOpen}
        task={editingTask}
        isSubmitting={isMutating}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
      />

      <ConfirmDialog
        open={Boolean(deletingTask)}
        title="Delete task"
        description={`Delete "${deletingTask?.title ?? "this task"}" permanently?`}
        isLoading={isMutating}
        onConfirm={handleDeleteTask}
        onCancel={() => setDeletingTask(null)}
      />
    </AppLayout>
  );
};
