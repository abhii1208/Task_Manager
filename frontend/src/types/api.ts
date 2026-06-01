export interface ApiResponse<T, M = unknown> {
  success: boolean;
  message?: string;
  data: T;
  meta?: M;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}