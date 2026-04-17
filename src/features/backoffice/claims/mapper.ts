import type {
  ClaimDecisionResult,
  ClaimDetail,
  ClaimListItem,
} from "./types";

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

export type ClaimDetailRow = {
  claim_request_id: number | string;
  company_id: number | string;
  company_name: string;
  user_id: string;
  claimant_name: string;
  claimant_email: string;
  status_id: number | string | null;
  status_name: string | null;
  status_code: string | null;
  submitted_at: Date | string;
  reviewed_at: Date | string | null;
  reviewed_by_id: string | null;
  reviewed_by_name: string | null;
  notes: string | null;
  evidence_url: string | null;
  verification_request_id: number | string | null;
  verification_status_name: string | null;
};

export type ClaimDecisionResultRow = {
  claimRequestId: number;
  statusName: string;
  verificationRequestId: number | null;
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
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
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

export function mapClaimDetailRow(row: ClaimDetailRow): ClaimDetail {
  return {
    claimRequestId: toNumber(row.claim_request_id),
    companyId: toNumber(row.company_id),
    companyName: row.company_name,
    userId: row.user_id,
    claimantName: row.claimant_name,
    claimantEmail: row.claimant_email,
    statusId: toNullableNumber(row.status_id),
    statusName: row.status_name ?? "Sin estado",
    statusCode: (row.status_code ?? "unknown").toLowerCase(),
    submittedAt: toIsoString(row.submitted_at) ?? new Date(0).toISOString(),
    reviewedAt: toIsoString(row.reviewed_at),
    reviewedById: row.reviewed_by_id,
    reviewedByName: row.reviewed_by_name,
    notes: row.notes,
    evidenceUrl: row.evidence_url,
    verificationRequestId: toNullableNumber(row.verification_request_id),
    verificationStatusName: row.verification_status_name,
  };
}

export function mapClaimDecisionResult(
  row: ClaimDecisionResultRow
): ClaimDecisionResult {
  return {
    claimRequestId: row.claimRequestId,
    statusName: row.statusName,
    verificationRequestId: row.verificationRequestId,
  };
}