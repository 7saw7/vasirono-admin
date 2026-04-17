import type {
  ReviewReportDecisionResult,
  ReviewReportDetail,
  ReviewReportListItem,
} from "./types";

export type ReviewReportRow = {
  report_id: number | string;
  review_id: number | string;
  company_id: number | string;
  company_name: string;
  branch_name: string;
  reporter_user_id: string;
  reporter_name: string;
  status_name: string | null;
  status_code: string | null;
  reason: string | null;
  details: string | null;
  created_at: Date | string;
  reviewed_at: Date | string | null;
  reviewed_by_name: string | null;
};

export type ReviewReportDetailRow = ReviewReportRow & {
  review_comment: string | null;
  review_rating: number | string;
  review_created_at: Date | string;
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
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function mapReviewReportRow(row: ReviewReportRow): ReviewReportListItem {
  return {
    reportId: toNumber(row.report_id),
    reviewId: toNumber(row.review_id),
    companyId: toNumber(row.company_id),
    companyName: row.company_name,
    branchName: row.branch_name,
    reporterUserId: row.reporter_user_id,
    reporterName: row.reporter_name,
    statusName: row.status_name ?? "Sin estado",
    statusCode: (row.status_code ?? "unknown").toLowerCase(),
    reason: row.reason,
    details: row.details,
    createdAt: toIsoString(row.created_at) ?? new Date(0).toISOString(),
    reviewedAt: toIsoString(row.reviewed_at),
    reviewedByName: row.reviewed_by_name,
  };
}

export function mapReviewReportDetailRow(
  row: ReviewReportDetailRow
): ReviewReportDetail {
  const base = mapReviewReportRow(row);

  return {
    ...base,
    reviewComment: row.review_comment,
    reviewRating: toNumber(row.review_rating),
    reviewCreatedAt:
      toIsoString(row.review_created_at) ?? new Date(0).toISOString(),
  };
}

export function mapReviewReportDecisionResult(input: {
  reportId: number;
  statusName: string;
}): ReviewReportDecisionResult {
  return input;
}