import type { DateRange, PaginationState, SortState } from "./types";

export type BaseListFilters = {
  search?: string;
  status?: string;
  dateRange?: DateRange;
  sort?: SortState;
  page?: number;
  pageSize?: number;
};

export function createDefaultPagination(
  partial?: Partial<PaginationState>
): PaginationState {
  return {
    page: partial?.page ?? 1,
    pageSize: partial?.pageSize ?? 10,
    total: partial?.total ?? 0,
  };
}

export function toQueryString(filters: BaseListFilters): string {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.dateRange?.from) params.set("from", filters.dateRange.from);
  if (filters.dateRange?.to) params.set("to", filters.dateRange.to);
  if (filters.sort?.field) params.set("sortField", filters.sort.field);
  if (filters.sort?.direction) params.set("sortDirection", filters.sort.direction);
  if (typeof filters.page === "number") params.set("page", String(filters.page));
  if (typeof filters.pageSize === "number") {
    params.set("pageSize", String(filters.pageSize));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}