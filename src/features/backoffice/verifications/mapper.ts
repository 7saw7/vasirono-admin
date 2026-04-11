import type {
  VerificationListItem,
  VerificationQueueSummary,
} from "./types";

export type VerificationListRow = {
  verification_request_id: number | string;
  company_id: number | string;
  company_name: string;
  claim_request_id: number | string | null;
  requested_by_id: string;
  requested_by_name: string;
  requested_by_email: string;
  status_id: number | string | null;
  status_name: string | null;
  status_code: string | null;
  verification_level: string | null;
  assigned_reviewer_id: string | null;
  assigned_reviewer_name: string | null;
  started_at: Date | string;
  submitted_at: Date | string | null;
  reviewed_at: Date | string | null;
  expires_at: Date | string | null;
  completed_at: Date | string | null;
};

export type VerificationSummaryRow = {
  total_count: number | string;
  pending_count: number | string;
  in_review_count: number | string;
  approved_count: number | string;
  rejected_count: number | string;
};

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toNullableNumber(
  value: number | string | null | undefined
): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toIsoString(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export function mapVerificationListRow(
  row: VerificationListRow
): VerificationListItem {
  return {
    verificationRequestId: toNumber(row.verification_request_id),
    companyId: toNumber(row.company_id),
    companyName: row.company_name,
    claimRequestId: toNullableNumber(row.claim_request_id),
    requestedById: row.requested_by_id,
    requestedByName: row.requested_by_name,
    requestedByEmail: row.requested_by_email,
    statusId: toNullableNumber(row.status_id),
    statusName: row.status_name ?? "Sin estado",
    statusCode: (row.status_code ?? "unknown").toLowerCase(),
    verificationLevel: row.verification_level,
    assignedReviewerId: row.assigned_reviewer_id,
    assignedReviewerName: row.assigned_reviewer_name,
    startedAt: toIsoString(row.started_at) ?? new Date(0).toISOString(),
    submittedAt: toIsoString(row.submitted_at),
    reviewedAt: toIsoString(row.reviewed_at),
    expiresAt: toIsoString(row.expires_at),
    completedAt: toIsoString(row.completed_at),
  };
}

export function mapVerificationSummaryRow(
  row: VerificationSummaryRow | undefined
): VerificationQueueSummary {
  return {
    total: toNumber(row?.total_count),
    pending: toNumber(row?.pending_count),
    inReview: toNumber(row?.in_review_count),
    approved: toNumber(row?.approved_count),
    rejected: toNumber(row?.rejected_count),
  };
}