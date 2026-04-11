import { branchDetailSchema, branchListFiltersSchema, branchListResultSchema } from "./schema";
import { mapBranchDetailRow, mapBranchListRow } from "./mapper";
import type { BranchListFilters } from "./types";
import { getBranchDetailQuery, listBranchesQuery } from "@/lib/db/queries/backoffice/branches";

export async function getBranchesList(input: BranchListFilters) {
  const filters = branchListFiltersSchema.parse(input);

  const result = await listBranchesQuery(filters);

  const mapped = {
    items: result.rows.map(mapBranchListRow),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  };

  return branchListResultSchema.parse(mapped);
}

export async function getBranchDetail(branchId: number) {
  const detail = await getBranchDetailQuery(branchId);

  if (!detail) {
    return null;
  }

  const mapped = mapBranchDetailRow(detail.branch, {
    contacts: detail.contacts,
    schedules: detail.schedules,
    services: detail.services,
    media: detail.media,
    analytics: detail.analytics,
    aforo: detail.aforo,
  });

  return branchDetailSchema.parse(mapped);
}