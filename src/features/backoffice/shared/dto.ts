import type { PaginatedResult } from "./types";

export type ApiSuccessResponse<T> = {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  ok: false;
  error: string;
  details?: Record<string, unknown>;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type ListResponse<T> = ApiSuccessResponse<PaginatedResult<T>>;

export function successResponse<T>(
  data: T,
  meta?: Record<string, unknown>
): ApiSuccessResponse<T> {
  return {
    ok: true,
    data,
    meta,
  };
}

export function errorResponse(
  error: string,
  details?: Record<string, unknown>
): ApiErrorResponse {
  return {
    ok: false,
    error,
    details,
  };
}