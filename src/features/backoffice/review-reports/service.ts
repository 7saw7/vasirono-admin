import {
  reviewReportDecisionResultSchema,
  reviewReportDecisionSchema,
  reviewReportDetailSchema,
  reviewReportListFiltersSchema,
  reviewReportListResultSchema,
} from "./schema";
import type {
  ReviewReportDecisionInput,
  ReviewReportListFilters,
} from "./types";
import { callBackofficeService } from "@/lib/microservices/backoffice-client";

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" ? (value as Record<string, any>) : {};
}

function unwrapData(raw: unknown): unknown {
  const payload = asRecord(raw);
  if ("data" in payload) return payload.data;
  return raw;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toIsoString(value: unknown): string {
  const date = value instanceof Date ? value : new Date(String(value ?? ""));
  return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
}

function toNullableIsoString(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeReport(raw: unknown) {
  const item = asRecord(raw);
  return {
    reportId: toNumber(item.reportId ?? item.report_id),
    reviewId: toNumber(item.reviewId ?? item.review_id),
    companyId: toNumber(item.companyId ?? item.company_id),
    companyName: String(item.companyName ?? item.company_name ?? "Sin empresa"),
    branchName: String(item.branchName ?? item.branch_name ?? "Sin sucursal"),
    reporterUserId: String(item.reporterUserId ?? item.reporter_user_id ?? item.userId ?? item.user_id ?? ""),
    reporterName: String(item.reporterName ?? item.reporter_name ?? item.userName ?? item.user_name ?? "Usuario"),
    statusName: String(item.statusName ?? item.status_name ?? item.status ?? "Sin estado"),
    statusCode: String(item.statusCode ?? item.status_code ?? item.status ?? "unknown").toLowerCase(),
    reason: item.reason ?? null,
    details: item.details ?? null,
    createdAt: toIsoString(item.createdAt ?? item.created_at),
    reviewedAt: toNullableIsoString(item.reviewedAt ?? item.reviewed_at),
    reviewedByName: item.reviewedByName ?? item.reviewed_by_name ?? null,
  };
}

function normalizeList(raw: unknown) {
  const payload = asRecord(unwrapData(raw));
  const meta = asRecord(payload.meta ?? payload.pagination);
  const items = Array.isArray(payload.items) ? payload.items : [];
  const page = toNumber(payload.page ?? meta.page, 1);
  const pageSize = toNumber(payload.pageSize ?? meta.pageSize, 10);
  const total = toNumber(payload.total ?? meta.total, items.length);
  return {
    items: items.map(normalizeReport),
    page,
    pageSize,
    total,
  };
}

function normalizeDetail(raw: unknown) {
  const payload = asRecord(unwrapData(raw));
  const base = normalizeReport(payload.report ?? payload);
  return {
    ...base,
    reviewComment: payload.reviewComment ?? payload.review_comment ?? payload.comment ?? null,
    reviewRating: toNumber(payload.reviewRating ?? payload.review_rating ?? payload.rating),
    reviewCreatedAt: toIsoString(payload.reviewCreatedAt ?? payload.review_created_at ?? payload.createdAt ?? payload.created_at),
  };
}

function normalizeDecision(raw: unknown) {
  const payload = asRecord(unwrapData(raw));
  return {
    reportId: toNumber(payload.reportId ?? payload.report_id),
    statusName: String(payload.statusName ?? payload.status_name ?? payload.statusCode ?? payload.status_code ?? "Resolved"),
  };
}

export async function getReviewReportsList(input: ReviewReportListFilters) {
  const filters = reviewReportListFiltersSchema.parse(input);
  const raw = await callBackofficeService<unknown>("reviewReports", "/api/reviews/admin/review-reports", {
    query: filters,
  });
  return reviewReportListResultSchema.parse(normalizeList(raw));
}

export async function getReviewReportDetail(reportId: number) {
  const raw = await callBackofficeService<unknown>("reviewReports", `/api/reviews/admin/review-reports/${reportId}`);
  const payload = unwrapData(raw);
  if (!payload) return null;
  return reviewReportDetailSchema.parse(normalizeDetail(payload));
}

export async function resolveReviewReport(
  reportId: number,
  _actorUserId: string,
  input: ReviewReportDecisionInput
) {
  const parsed = reviewReportDecisionSchema.parse(input);
  const raw = await callBackofficeService<unknown>("reviewReports", `/api/reviews/admin/review-reports/${reportId}/resolve`, {
    method: "POST",
    body: {
      resolution: parsed.status,
      notes: parsed.resolutionNotes ?? null,
      hideReason: parsed.status === "hidden" ? parsed.resolutionNotes ?? null : null,
    },
  });
  return reviewReportDecisionResultSchema.parse(normalizeDecision(raw));
}
