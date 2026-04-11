import type { ClaimListItem } from "./types";

export type ClaimListRow = {
  claim_request_id: number | string;
  company_id: number | string;
  company_name: string;
  user_id: string;
  claimant_name: string;
  claimant_email: string;
  status_name: string | null;
  status_code: string | null;
  submitted_at: Date | string;
  reviewed_at: Date | string | null;
  reviewed_by_name: string | null;
  notes: string | null;
  evidence_url: string | null;
  has_verification_request: boolean | null;
};

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toIsoString(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export function mapClaimListRow(row: ClaimListRow): ClaimListItem {
  return {
    claimRequestId: toNumber(row.claim_request_id),
    companyId: toNumber(row.company_id),
    companyName: row.company_name,
    userId: row.user_id,
    claimantName: row.claimant_name,
    claimantEmail: row.claimant_email,
    statusName: row.status_name ?? "Sin estado",
    statusCode: (row.status_code ?? "unknown").toLowerCase(),
    submittedAt: toIsoString(row.submitted_at) ?? new Date(0).toISOString(),
    reviewedAt: toIsoString(row.reviewed_at),
    reviewedByName: row.reviewed_by_name,
    notes: row.notes,
    evidenceUrl: row.evidence_url,
    hasVerificationRequest: Boolean(row.has_verification_request),
  };
}