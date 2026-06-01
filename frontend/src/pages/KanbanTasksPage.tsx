import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { PageTransition } from "../components/common/PageTransition";
import { BoardSkeleton } from "../components/common/BoardSkeleton";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { KanbanBoard } from "../components/tasks/KanbanBoard";
import { TaskFilters } from "../components/tasks/TaskFilters";
import { TaskModal } from "../components/tasks/TaskModal";
import { useDebounce } from "../hooks/useDebounce";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";
import { useTasks } from "../hooks/useTasks";
import { AppLayout } from "../layouts/AppLayout";
import { Task, TaskPayload, TaskPriority, TaskSortBy, TaskSortOrder, TaskStage } from "../types/task";
import { STAGE_LABELS } from "../utils/constants";

export const KanbanTasksPage = () => {
  const {
    tasks,
    query,
    error,
    isLoading,
    isMutating,
    refreshAll,
    updateQuery,
    resetQuery,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStage,
    isTaskStageUpdating
  } = useTasks({
    initialQuery: {
      page: 1,
      limit: 100,
      sortBy: "updatedAt",
      sortOrder: "desc"
    }
  });

  const [searchInput, setSearchInput] = useState(query.search ?? "");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [createStage, setCreateStage] = useState<TaskStage>("TODO");

  const debouncedSearch = useDebounce(searchInput, 350);

  useEffect(() => {
    updateQuery({ search: debouncedSearch });
  }, [debouncedSearch, updateQuery]);

  const openCreateTask = (stage: TaskStage = "TODO") => {
    setEditingTask(null);
    setCreateStage(stage);
    setTaskModalOpen(true);
  };

  useKeyboardShortcut({
    key: "n",
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

      setEditingTask(null);
      setTaskModalOpen(false);
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

  const handleMoveTask = async (task: Task, nextStage: TaskStage): Promise<void> => {
    if (task.stage === nextStage) {
      return;
    }

    if (isTaskStageUpdating(task.id)) {
      return;
    }

    try {
      await updateTaskStage(task.id, nextStage);
      toast.success(`Moved to ${STAGE_LABELS[nextStage]}`);
    } catch (moveError) {
      toast.error(
        moveError instanceof Error && moveError.message
          ? moveError.message
          : "Unable to update task stage. Reverting change."
      );
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (query.search) {
      count += 1;
    }

    if (query.stage && query.stage !== "ALL") {
      count += 1;
    }

    if (query.priority && query.priority !== "ALL") {
      count += 1;
    }

    return count;
  }, [query.priority, query.search, query.stage]);

  return (
    <AppLayout
      title="Board"
      subtitle="Drag tasks across stages. Press N to create task quickly."
      onCreateTask={openCreateTask}
      createButtonLabel="Create Task"
      searchValue={searchInput}
      onSearchChange={setSearchInput}
      searchPlaceholder="Search tasks..."
    >
      <PageTransition>
        <div className="overflow-hidden rounded-2xl border border-violet-border bg-[#f8f5ff] shadow-sm">
          <TaskFilters
            stage={(query.stage as TaskStage | "ALL") ?? "ALL"}
            priority={(query.priority as TaskPriority | "ALL") ?? "ALL"}
            sortBy={(query.sortBy as TaskSortBy) ?? "updatedAt"}
            sortOrder={(query.sortOrder as TaskSortOrder) ?? "desc"}
            onStageChange={(value) => updateQuery({ stage: value })}
            onPriorityChange={(value) => updateQuery({ priority: value })}
            onSortChange={(sortBy, sortOrder) => updateQuery({ sortBy, sortOrder })}
            onReset={() => {
              setSearchInput("");
              resetQuery();
            }}
          />

          <div className="border-b border-violet-border bg-white/70 px-4 py-2 text-[13px] text-text-secondary sm:px-6">
            {tasks.length} tasks shown | {activeFilterCount} active filters
          </div>

          {error ? <div className="px-4 pb-4 pt-3"><ErrorState message={error} onAction={() => void refreshAll()} /></div> : null}

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <BoardSkeleton />
            ) : tasks.length ? (
              <KanbanBoard
                tasks={tasks}
                onMoveTask={(task, nextStage) => {
                  void handleMoveTask(task, nextStage);
                }}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setTaskModalOpen(true);
                }}
                onDeleteTask={(task) => setDeletingTask(task)}
                onCreateTask={() => {
                  openCreateTask("TODO");
                }}
                isTaskStageUpdating={isTaskStageUpdating}
              />
            ) : (
              <EmptyState
                title="No tasks found"
                message="Create a task or clear filters to populate your board."
                actionLabel="Create Task"
                onAction={openCreateTask}
              />
            )}
          </div>
        </div>
      </PageTransition>

      <TaskModal
        open={isTaskModalOpen}
        task={editingTask}
        defaultStage={createStage}
        isSubmitting={isMutating}
        onClose={() => {
          setEditingTask(null);
          setTaskModalOpen(false);
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

