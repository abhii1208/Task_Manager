import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { PageTransition } from "../components/common/PageTransition";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ErrorState } from "../components/common/ErrorState";
import { Skeleton } from "../components/ui/Skeleton";
import { TaskFilters } from "../components/tasks/TaskFilters";
import { TaskList } from "../components/tasks/TaskList";
import { TaskModal } from "../components/tasks/TaskModal";
import { useDebounce } from "../hooks/useDebounce";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";
import { useTasks } from "../hooks/useTasks";
import { AppLayout } from "../layouts/AppLayout";
import { Task, TaskPayload, TaskPriority, TaskSortBy, TaskSortOrder, TaskStage } from "../types/task";

export const ListViewPage = () => {
  const {
    tasks,
    meta,
    query,
    error,
    isLoading,
    isMutating,
    refreshAll,
    updateQuery,
    resetQuery,
    createTask,
    updateTask,
    deleteTask
  } = useTasks({
    initialQuery: {
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc"
    }
  });

  const [searchInput, setSearchInput] = useState(query.search ?? "");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 350);

  useEffect(() => {
    updateQuery({ search: debouncedSearch });
  }, [debouncedSearch, updateQuery]);

  const openCreateTask = () => {
    setEditingTask(null);
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

  return (
    <AppLayout
      title="List View"
      subtitle="Search, filter, and paginate through all tasks. Press N to create."
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
            sortBy={(query.sortBy as TaskSortBy) ?? "createdAt"}
            sortOrder={(query.sortOrder as TaskSortOrder) ?? "desc"}
            onStageChange={(value) => updateQuery({ stage: value })}
            onPriorityChange={(value) => updateQuery({ priority: value })}
            onSortChange={(sortBy, sortOrder) => updateQuery({ sortBy, sortOrder })}
            onReset={() => {
              setSearchInput("");
              resetQuery();
            }}
            showSort
          />

          {error ? <div className="px-4 pb-2 pt-4"><ErrorState message={error} onAction={() => void refreshAll()} /></div> : null}

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                meta={meta}
                onPageChange={(page) => updateQuery({ page }, false)}
                onEdit={(task) => {
                  setEditingTask(task);
                  setTaskModalOpen(true);
                }}
                onDelete={(task) => setDeletingTask(task)}
              />
            )}
          </div>
        </div>
      </PageTransition>

      <TaskModal
        open={isTaskModalOpen}
        task={editingTask}
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
