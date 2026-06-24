import {
  branchDetailSchema,
  branchListFiltersSchema,
  branchListResultSchema,
} from "./schema";
import type { BranchListFilters } from "./types";
import { callBackofficeService } from "@/lib/microservices/backoffice-client";

function unwrapList(raw: any) {
  return raw?.items ? raw : raw?.data?.items ? raw.data : raw;
}

export async function getBranchesList(input: BranchListFilters) {
  const filters = branchListFiltersSchema.parse(input);
  const raw = await callBackofficeService<unknown>("branches", "/api/backoffice/branches", {
    query: filters,
  });
  return branchListResultSchema.parse(unwrapList(raw));
}

export async function getBranchDetail(branchId: number) {
  const raw = await callBackofficeService<unknown>("branches", `/api/backoffice/branches/${branchId}`);
  if (!raw) return null;
  return branchDetailSchema.parse(raw);
}
