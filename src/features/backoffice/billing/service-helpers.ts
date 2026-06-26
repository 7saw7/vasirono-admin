import { callBackofficeService } from "@/lib/microservices/backoffice-client";
import type { BillingListFilters } from "./types";

export const BILLING_ADMIN_BASE_PATH = "/api/billing/admin/billing";

export function unwrapPayload<T = unknown>(raw: unknown): T {
  if (raw && typeof raw === "object" && "data" in raw) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

export function paginatedPayload(raw: unknown) {
  const payload = unwrapPayload<Record<string, unknown>>(raw) ?? {};
  const pagination =
    typeof payload.pagination === "object" && payload.pagination !== null
      ? (payload.pagination as Record<string, unknown>)
      : typeof payload.meta === "object" && payload.meta !== null
      ? (payload.meta as Record<string, unknown>)
      : {};
  const items = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.rows)
    ? payload.rows
    : [];
  const page = Number(payload.page ?? pagination.page ?? 1);
  const pageSize = Number(payload.pageSize ?? pagination.pageSize ?? 10);
  const total = Number(payload.total ?? pagination.total ?? items.length);
  const totalPages = Number(
    payload.totalPages ?? pagination.totalPages ?? Math.max(1, Math.ceil(total / Math.max(pageSize, 1)))
  );
  return { payload, items, page, pageSize, total, totalPages };
}

export async function callBilling<T>(path: string, options: { query?: Record<string, unknown>; body?: unknown; method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" } = {}) {
  return callBackofficeService<T>("billing", `${BILLING_ADMIN_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`, options);
}

export function filtersQuery(filters: BillingListFilters): Record<string, unknown> {
  return {
    search: filters.search,
    statusId: filters.statusId,
    paymentMethodId: filters.paymentMethodId,
    companyId: filters.companyId,
    planId: filters.planId,
    active: filters.active,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export function optionFromName(id: unknown, name: unknown) {
  const value = Number(id);
  const label = String(name ?? "").trim();
  if (!Number.isInteger(value) || value <= 0 || !label) return null;
  return { value, label };
}
