import { QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { PaginationMeta } from "../types/api";
import { ActivityLog, Task, TaskPayload, TaskQueryParams, TaskSummary, TaskUpdatePayload } from "../types/task";
import { taskService } from "../services/task.service";

type UseTasksOptions = {
  initialQuery?: TaskQueryParams;
  autoFetch?: boolean;
  withInsights?: boolean;
};

const DEFAULT_QUERY: Required<Pick<TaskQueryParams, "page" | "limit" | "sortBy" | "sortOrder">> &
  Pick<TaskQueryParams, "search" | "stage" | "priority"> = {
  search: "",
  stage: "ALL",
  priority: "ALL",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: 10
};

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
};

const TASK_LISTS_QUERY_KEY = ["tasks", "list"] as const;
const TASK_SUMMARY_QUERY_KEY = ["tasks", "summary"] as const;
const TASK_ACTIVITY_QUERY_KEY = ["tasks", "activity"] as const;
const RECENT_ACTIVITY_LIMIT = 10;

type TaskListCache = {
  tasks: Task[];
  meta: PaginationMeta;
};

type StageMutationVariables = {
  taskId: string;
  stage: Task["stage"];
};

type StageMutationRollback = {
  previousLists: Array<[QueryKey, TaskListCache | undefined]>;
};

const buildListQueryKey = (query: TaskQueryParams): QueryKey => [...TASK_LISTS_QUERY_KEY, query];

const invalidateTaskQueries = async (queryClient: ReturnType<typeof useQueryClient>): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: TASK_LISTS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: TASK_SUMMARY_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: TASK_ACTIVITY_QUERY_KEY })
  ]);
};

export const useTasks = ({ initialQuery, autoFetch = true, withInsights = false }: UseTasksOptions = {}) => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<TaskQueryParams>({ ...DEFAULT_QUERY, ...initialQuery });
  const [activeStageUpdates, setActiveStageUpdates] = useState<Record<string, boolean>>({});

  const tasksQuery = useQuery({
    queryKey: buildListQueryKey(query),
    queryFn: () => taskService.getTasks(query),
    enabled: autoFetch
  });

  const summaryQuery = useQuery({
    queryKey: TASK_SUMMARY_QUERY_KEY,
    queryFn: () => taskService.getSummary(),
    enabled: autoFetch && withInsights
  });

  const activityQuery = useQuery({
    queryKey: [...TASK_ACTIVITY_QUERY_KEY, RECENT_ACTIVITY_LIMIT],
    queryFn: () => taskService.getRecentActivity(RECENT_ACTIVITY_LIMIT),
    enabled: autoFetch && withInsights
  });

  const fetchTasks = useCallback(
    async (nextQuery?: TaskQueryParams) => {
      const activeQuery = nextQuery ?? query;
      const response = await queryClient.fetchQuery({
        queryKey: buildListQueryKey(activeQuery),
        queryFn: () => taskService.getTasks(activeQuery)
      });

      return response;
    },
    [query, queryClient]
  );

  const fetchSummary = useCallback(async () => {
    const response = await summaryQuery.refetch();
    return response.data ?? null;
  }, [summaryQuery]);

  const fetchRecentActivity = useCallback(async (limit = 10) => {
    const response = await queryClient.fetchQuery({
      queryKey: [...TASK_ACTIVITY_QUERY_KEY, limit],
      queryFn: () => taskService.getRecentActivity(limit)
    });

    return response;
  }, [queryClient]);

  const refreshMetaData = useCallback(async () => {
    await Promise.all([fetchSummary(), fetchRecentActivity()]);
  }, [fetchSummary, fetchRecentActivity]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: TASK_LISTS_QUERY_KEY }),
      refreshMetaData()
    ]);
  }, [queryClient, refreshMetaData]);

  const updateQuery = useCallback((patch: Partial<TaskQueryParams>, resetPage = true) => {
    setQuery((current) => {
      const shouldResetPage = resetPage && (patch.search !== undefined || patch.stage !== undefined || patch.priority !== undefined || patch.sortBy !== undefined || patch.sortOrder !== undefined || patch.limit !== undefined);

      return {
        ...current,
        ...patch,
        page: shouldResetPage ? 1 : (patch.page ?? current.page)
      };
    });
  }, []);

  const resetQuery = useCallback(() => {
    setQuery({ ...DEFAULT_QUERY, ...initialQuery });
  }, [initialQuery]);

  const createTaskMutation = useMutation({
    mutationFn: (payload: TaskPayload) => taskService.create(payload),
    onSuccess: async () => {
      await invalidateTaskQueries(queryClient);
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: TaskUpdatePayload }) => taskService.update(taskId, payload),
    onSuccess: async () => {
      await invalidateTaskQueries(queryClient);
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.delete(taskId),
    onSuccess: async () => {
      await invalidateTaskQueries(queryClient);
    }
  });

  const updateTaskStageMutation = useMutation<Task, Error, StageMutationVariables, StageMutationRollback>({
    mutationFn: ({ taskId, stage }) => taskService.updateStage(taskId, stage),
    onMutate: async ({ taskId, stage }) => {
      setActiveStageUpdates((current) => ({ ...current, [taskId]: true }));
      await queryClient.cancelQueries({ queryKey: TASK_LISTS_QUERY_KEY });

      const previousLists = queryClient.getQueriesData<TaskListCache>({ queryKey: TASK_LISTS_QUERY_KEY });

      queryClient.setQueriesData<TaskListCache>({ queryKey: TASK_LISTS_QUERY_KEY }, (current) => {
        if (!current) {
          return current;
        }

        let hasUpdatedTask = false;
        const nextTasks = current.tasks.map((task) => {
          if (task.id !== taskId) {
            return task;
          }

          hasUpdatedTask = true;
          return {
            ...task,
            stage,
            updatedAt: new Date().toISOString()
          };
        });

        if (!hasUpdatedTask) {
          return current;
        }

        return {
          ...current,
          tasks: nextTasks
        };
      });

      return { previousLists };
    },
    onError: (_error, variables, context) => {
      context?.previousLists.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      setActiveStageUpdates((current) => {
        const next = { ...current };
        delete next[variables.taskId];
        return next;
      });
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueriesData<TaskListCache>({ queryKey: TASK_LISTS_QUERY_KEY }, (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          tasks: current.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
        };
      });
    },
    onSettled: async (_data, _error, variables) => {
      setActiveStageUpdates((current) => {
        const next = { ...current };
        delete next[variables.taskId];
        return next;
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: TASK_LISTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: TASK_SUMMARY_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: TASK_ACTIVITY_QUERY_KEY })
      ]);
    }
  });

  const createTask = useCallback(async (payload: TaskPayload) => {
    return createTaskMutation.mutateAsync(payload);
  }, [createTaskMutation]);

  const updateTask = useCallback(async (taskId: string, payload: TaskUpdatePayload) => {
    return updateTaskMutation.mutateAsync({ taskId, payload });
  }, [updateTaskMutation]);

  const deleteTask = useCallback(async (taskId: string) => {
    return deleteTaskMutation.mutateAsync(taskId);
  }, [deleteTaskMutation]);

  const updateTaskStage = useCallback(async (taskId: string, stage: Task["stage"]) => {
    return updateTaskStageMutation.mutateAsync({ taskId, stage });
  }, [updateTaskStageMutation]);

  const tasks = tasksQuery.data?.tasks ?? [];
  const meta = tasksQuery.data?.meta ?? { ...DEFAULT_META, limit: initialQuery?.limit ?? 10 };
  const summary = summaryQuery.data ?? null;
  const recentActivity = activityQuery.data ?? [];
  const isLoading = tasksQuery.isLoading || (tasksQuery.isFetching && !tasksQuery.data);
  const isMutating =
    createTaskMutation.isPending ||
    updateTaskMutation.isPending ||
    deleteTaskMutation.isPending ||
    updateTaskStageMutation.isPending;
  const isSummaryLoading = summaryQuery.isFetching;
  const isActivityLoading = activityQuery.isFetching;
  const error = tasksQuery.error instanceof Error ? tasksQuery.error.message : null;

  const upcomingDeadlines = useMemo(() => {
    return tasks
      .filter((task) => task.dueDate && task.stage !== "DONE")
      .sort((a, b) => new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime())
      .slice(0, 5);
  }, [tasks]);

  return {
    tasks,
    meta,
    query,
    summary,
    recentActivity,
    upcomingDeadlines,
    isLoading,
    isMutating,
    isSummaryLoading,
    isActivityLoading,
    error,
    fetchTasks,
    fetchSummary,
    fetchRecentActivity,
    refreshAll,
    refreshMetaData,
    updateQuery,
    resetQuery,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStage,
    isTaskStageUpdating: (taskId: string) => Boolean(activeStageUpdates[taskId])
  };
};
