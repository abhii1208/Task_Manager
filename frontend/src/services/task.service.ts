import { apiClient } from "./api";
import { ApiResponse, PaginationMeta } from "../types/api";
import {
  ActivityLog,
  Task,
  TaskListResponse,
  TaskPayload,
  TaskQueryParams,
  TaskSummary,
  TaskUpdatePayload
} from "../types/task";

const normalizeTaskQuery = (query: TaskQueryParams = {}): Record<string, string | number> => {
  const normalized: Record<string, string | number> = {};

  if (query.search) {
    normalized.search = query.search;
  }

  if (query.stage && query.stage !== "ALL") {
    normalized.stage = query.stage;
  }

  if (query.priority && query.priority !== "ALL") {
    normalized.priority = query.priority;
  }

  if (query.sortBy) {
    normalized.sortBy = query.sortBy;
  }

  if (query.sortOrder) {
    normalized.sortOrder = query.sortOrder;
  }

  if (query.page) {
    normalized.page = query.page;
  }

  if (query.limit) {
    normalized.limit = query.limit;
  }

  return normalized;
};

export const taskService = {
  async getTasks(query?: TaskQueryParams): Promise<TaskListResponse> {
    const response = await apiClient.get<ApiResponse<Task[], PaginationMeta>>("/tasks", {
      params: normalizeTaskQuery(query)
    });

    return {
      tasks: response.data.data,
      meta: response.data.meta ?? {
        page: 1,
        limit: query?.limit ?? 10,
        total: response.data.data.length,
        totalPages: 1
      }
    };
  },

  async getTask(taskId: string): Promise<Task> {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${taskId}`);
    return response.data.data;
  },

  async create(payload: TaskPayload): Promise<Task> {
    const response = await apiClient.post<ApiResponse<Task>>("/tasks", payload);
    return response.data.data;
  },

  async update(taskId: string, payload: TaskUpdatePayload): Promise<Task> {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}`, payload);
    return response.data.data;
  },

  async delete(taskId: string): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}`);
  },

  async updateStage(taskId: string, stage: Task["stage"]): Promise<Task> {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}/stage`, { stage });
    return response.data.data;
  },

  async getSummary(): Promise<TaskSummary> {
    const response = await apiClient.get<ApiResponse<TaskSummary>>("/tasks/stats/summary");
    return response.data.data;
  },

  async getRecentActivity(limit = 10): Promise<ActivityLog[]> {
    const response = await apiClient.get<ApiResponse<ActivityLog[]>>("/tasks/activity/recent", {
      params: { limit }
    });
    return response.data.data;
  }
};