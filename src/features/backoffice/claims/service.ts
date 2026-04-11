import {
  claimDecisionResultSchema,
  claimDecisionSchema,
  claimDetailSchema,
  claimListFiltersSchema,
  claimListResultSchema,
} from "./schema";
import {
  mapClaimDecisionResult,
  mapClaimDetailRow,
  mapClaimListRow,
} from "./mapper";
import type { ClaimDecisionInput, ClaimListFilters } from "./types";
import {
  approveClaimQuery,
  getClaimDetailQuery,
  listClaimsQuery,
  rejectClaimQuery,
} from "@/lib/db/queries/backoffice/claims";

export async function getClaimsList(input: ClaimListFilters) {
  const filters = claimListFiltersSchema.parse(input);

  const result = await listClaimsQuery(filters);

  const mapped = {
    items: result.rows.map(mapClaimListRow),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  };

  return claimListResultSchema.parse(mapped);
}

export async function getClaimDetail(claimRequestId: number) {
  const row = await getClaimDetailQuery(claimRequestId);

  if (!row) return null;

  return claimDetailSchema.parse(mapClaimDetailRow(row));
}

export async function approveClaim(
  claimRequestId: number,
  reviewerUserId: string,
  input: ClaimDecisionInput
) {
  const parsed = claimDecisionSchema.parse(input);

  const result = await approveClaimQuery({
    claimRequestId,
    reviewerUserId,
    notes: parsed.notes,
  });

  return claimDecisionResultSchema.parse(mapClaimDecisionResult(result));
}

export async function rejectClaim(
  claimRequestId: number,
  reviewerUserId: string,
  input: ClaimDecisionInput
) {
  const parsed = claimDecisionSchema.parse(input);

  const result = await rejectClaimQuery({
    claimRequestId,
    reviewerUserId,
    notes: parsed.notes,
  });

  return claimDecisionResultSchema.parse(mapClaimDecisionResult(result));
}