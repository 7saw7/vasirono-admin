import {
  branchDetailSchema,
  branchListFiltersSchema,
  branchListResultSchema,
} from "./schema";
import type { BranchListFilters } from "./types";
import { callBackofficeService } from "@/lib/microservices/backoffice-client";

function unwrapList(raw: any) {
  const payload = raw?.items ? raw : raw?.data?.items ? raw.data : raw;
  if (!payload) return payload;
  const total = Number(payload.total ?? payload.pagination?.total ?? 0);
  const page = Number(payload.page ?? payload.pagination?.page ?? 1);
  const pageSize = Number(
    payload.pageSize ?? payload.pagination?.pageSize ?? 20,
  );
  return {
    ...payload,
    page,
    pageSize,
    total,
    totalPages: Number(
      payload.totalPages ??
        payload.pagination?.totalPages ??
        Math.ceil(total / Math.max(pageSize, 1)),
    ),
  };
}

function unwrapDetail(raw: any) {
  return raw?.data ?? raw;
}

export async function getBranchesList(input: BranchListFilters) {
  const filters = branchListFiltersSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "branches",
    "/api/backoffice/branches",
    {
      query: filters,
    },
  );
  return branchListResultSchema.parse(unwrapList(raw));
}

export async function getBranchDetail(branchId: number) {
  const raw = await callBackofficeService<unknown>(
    "branches",
    `/api/backoffice/branches/${branchId}`,
  );
  const payload = unwrapDetail(raw);
  if (!payload) return null;
  return branchDetailSchema.parse(payload);
}
