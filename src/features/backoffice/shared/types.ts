import type { BackofficePermission } from "@/lib/auth/permissions";
import type { AppRole } from "@/lib/constants/roles";

export type Id = string | number;

export type Nullable<T> = T | null;

export type Option<T extends string | number = string> = {
  label: string;
  value: T;
};

export type DateRange = {
  from?: string;
  to?: string;
};

export type SortDirection = "asc" | "desc";

export type SortState = {
  field: string;
  direction: SortDirection;
};

export type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type StatusTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

export type TableColumn<T> = {
  key: string;
  title: string;
  className?: string;
  headerClassName?: string;
  render?: (row: T) => React.ReactNode;
};

export type BackofficeActor = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  permissions: BackofficePermission[];
};